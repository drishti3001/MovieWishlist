const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
// ADD/UPDATE TO WATCHLIST
async function addToWatchlist(req, res) {
  const userId = req.userId;
  const { movieId, tmdbMovie } = req.body;

  console.log("--- Watchlist Add Attempt ---");
  console.log("User ID:", userId);
  console.log("TMDB Movie Object Received:", tmdbMovie ? "YES" : "NO");

  try {
    let finalMovieId;

    if (tmdbMovie) {
      console.log("Searching for movie in local DB by TMDB ID:", tmdbMovie.id);
      
      let movie = await prisma.movie.findUnique({
        where: { tmdbId: tmdbMovie.id }
      });

      if (!movie) {
        console.log("Movie not found locally. Creating entry for:", tmdbMovie.title);
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

    console.log("Linking Movie ID:", finalMovieId, "to User ID:", userId);

    const entry = await prisma.watchlist.upsert({
      where: { userId_movieId: { userId, movieId: finalMovieId } },
      update: { status: 'plan_to_watch' },
      create: { 
        userId, 
        movieId: finalMovieId,
        status: 'plan_to_watch'
      },
    });

    console.log("Successfully added to watchlist!");
    res.json(entry);
  } catch (err) {
    console.error("WATCHLIST CRITICAL ERROR:", err);
    res.status(500).json({ message: 'Failed to add to wishlist' });
  }
}

// GET USER WATCHLIST
async function getWatchlist(req, res) {
  const userId = req.userId

  try {
    const list = await prisma.watchlist.findMany({
      where: { userId },
      include: { movie: true },
      orderBy: { id: 'desc' }
    })

    res.json(list)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to load watchlist' })
  }
}

// UPDATE STATUS / RATING
async function updateWatchlist(req, res) {
  const userId = req.userId
  const movieId = Number(req.params.movieId)
  const { status, rating, review } = req.body

  try {
    const updated = await prisma.watchlist.update({
      where: { userId_movieId: { userId, movieId } },
      data: {
        ...(status !== undefined && { status }),
        ...(rating !== undefined && { rating }),
        ...(review !== undefined && { review }),
      }
    })

    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Update failed' })
  }
}

// REMOVE
async function removeFromWatchlist(req, res) {
  const userId = req.userId;
  const idToMatch = Number(req.params.movieId);

  console.log(`Attempting delete for User: ${userId}, ID: ${idToMatch}`);

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
}
