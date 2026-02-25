const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ADD/UPDATE TO WATCHLIST (Syncs TMDB movies and links to User)
async function addToWatchlist(req, res) {
  const userId = req.userId;
  const { movieId, tmdbMovie } = req.body;

  try {
    let finalMovieId;

    if (tmdbMovie) {
      // Sync TMDB movie to local database
      let movie = await prisma.movie.findUnique({
        where: { tmdbId: tmdbMovie.id }
      });

      if (!movie) {
        movie = await prisma.movie.create({
          data: {
            tmdbId: tmdbMovie.id,
            title: tmdbMovie.title,
            description: tmdbMovie.overview || "",
            year: tmdbMovie.release_date ? parseInt(tmdbMovie.release_date.split('-')[0]) : null,
            posterUrl: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : null,
          }
        });
      }
      finalMovieId = movie.id;
    } else {
      finalMovieId = Number(movieId || req.params.movieId);
    }

    // Use upsert to prevent duplicate entry errors
    const entry = await prisma.watchlist.upsert({
      where: { userId_movieId: { userId, movieId: finalMovieId } },
      update: { status: 'plan_to_watch' },
      create: { 
        userId, 
        movieId: finalMovieId,
        status: 'plan_to_watch'
      },
    });

    res.json(entry);
  } catch (err) {
    console.error("WATCHLIST ERROR:", err);
    res.status(500).json({ message: 'Failed to add to wishlist' });
  }
}

// GET USER WATCHLIST (The "Diary" list)
async function getWatchlist(req, res) {
  const userId = req.userId;

  try {
    const list = await prisma.watchlist.findMany({
      where: { userId },
      include: { movie: true },
      orderBy: { id: 'desc' }
    });

    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load watchlist' });
  }
}

/**
 * UPDATE STATUS / RATING / REVIEW
 * 🟢 FIXED: Changed from .update() to .upsert()
 * This fixes the P2025 "Record not found" error when editing movies in a playlist.
 */
async function updateWatchlist(req, res) {
  const userId = req.userId;
  const movieId = Number(req.params.movieId);
  const { status, rating, review } = req.body;

  try {
    const updated = await prisma.watchlist.upsert({
      where: {
        userId_movieId: { userId, movieId }
      },
      // If diary entry exists, update these fields
      update: {
        ...(status !== undefined && { status }),
        ...(rating !== undefined && { rating: Math.round(rating) }),
        ...(review !== undefined && { review }),
      },
      // If diary entry doesn't exist, create it with these values
      create: {
        userId,
        movieId,
        status: status || 'plan_to_watch',
        rating: rating !== undefined ? Math.round(rating) : null,
        review: review || "",
      }
    });

    res.json(updated);
  } catch (err) {
    console.error("UPSERT ERROR:", err);
    res.status(500).json({ message: 'Failed to save diary entry' });
  }
}

// REMOVE FROM DIARY
async function removeFromWatchlist(req, res) {
  const userId = req.userId;
  const idToMatch = Number(req.params.movieId);

  try {
    await prisma.watchlist.deleteMany({
      where: {
        userId: userId,
        movie: {
          OR: [
            { id: idToMatch },
            { tmdbId: idToMatch }
          ]
        }
      }
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ message: 'Delete failed' });
  }
}

module.exports = {
  addToWatchlist,
  getWatchlist,
  updateWatchlist,
  removeFromWatchlist
};