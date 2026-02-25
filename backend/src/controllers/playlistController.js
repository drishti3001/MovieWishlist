const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Create a new playlist
async function createPlaylist(req, res) {
  try {
    const { name } = req.body;
    const userId = req.userId; 

    if (!name) return res.status(400).json({ message: "Playlist name is required" });

    const newPlaylist = await prisma.playlist.create({
      data: {
        name,
        userId
      }
    });

    res.status(201).json(newPlaylist);
  } catch (error) {
    res.status(500).json({ message: "Error creating playlist", error: error.message });
  }
}

// 2. Get all playlists for a user
async function getUserPlaylists(req, res) {
  try {
    const userId = req.userId; 
    const playlists = await prisma.playlist.findMany({
      where: { userId },
      include: {
        _count: { select: { movies: true } }
      }
    });
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: "Error fetching playlists" });
  }
}

// 3. Add movie to a playlist
async function addMovieToPlaylist(req, res) {
  try {
    const { playlistId } = req.params;
    const { movieId } = req.body;

    const entry = await prisma.playlistMovie.create({
      data: {
        playlistId: parseInt(playlistId),
        movieId: parseInt(movieId)
      }
    });

    res.status(201).json({ message: "Movie added to playlist", entry });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Movie already in this playlist" });
    }
    res.status(500).json({ message: "Error adding movie to playlist" });
  }
}

// 4. Get movies in a specific playlist - THE DIARY FIX
async function getPlaylistMovies(req, res) {
  try {
    const { playlistId } = req.params;
    const userId = req.userId;

    const playlist = await prisma.playlist.findUnique({
      where: { id: parseInt(playlistId) },
      include: {
        movies: {
          include: {
            movie: {
              include: {
                // We fetch only the diary entry for the current user
                watchlistedBy: {
                  where: { userId }
                }
              }
            }
          }
        }
      }
    });
    
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    // FLATTEN: Move status/rating/review to the top level for the frontend
    const flattenedMovies = playlist.movies.map((item) => {
      const diaryEntry = item.movie.watchlistedBy?.[0] || {};
      
      // Strip out the internal Prisma array to keep the response clean
      const { watchlistedBy, ...movieDetails } = item.movie;

      return {
        ...item,
        // Ensure valid defaults so the frontend inputs don't become "uncontrolled"
        status: diaryEntry.status || "plan_to_watch",
        rating: diaryEntry.rating ?? 0,
        review: diaryEntry.review ?? "",
        movie: movieDetails
      };
    });

    res.json({
      name: playlist.name,
      movies: flattenedMovies
    });
  } catch (error) {
    console.error("Fetch Playlist Movies Error:", error);
    res.status(500).json({ message: "Error fetching movies" });
  }
}

// 5. Remove movie from playlist
async function removeMovieFromPlaylist(req, res) {
  try {
    const { playlistId, movieId } = req.params;
    const userId = req.userId;

    const playlist = await prisma.playlist.findUnique({
      where: { id: parseInt(playlistId) }
    });

    if (!playlist) return res.status(404).json({ message: "Playlist not found" });
    if (playlist.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized to modify this playlist" });
    }

    await prisma.playlistMovie.deleteMany({
      where: {
        playlistId: parseInt(playlistId),
        movieId: parseInt(movieId)
      }
    });

    res.json({ message: "Movie removed from playlist" });
  } catch (error) {
    res.status(500).json({ message: "Error removing movie from playlist" });
  }
}

// 6. Delete Playlist
async function deletePlaylist(req, res) {
  try {
    const { playlistId } = req.params;
    const userId = req.userId;

    const playlist = await prisma.playlist.findUnique({
      where: { id: parseInt(playlistId) }
    });

    if (!playlist) return res.status(404).json({ message: "Playlist not found" });
    if (playlist.userId !== userId) return res.status(403).json({ message: "Unauthorized to delete" });

    // Clean up join table first
    await prisma.playlistMovie.deleteMany({
      where: { playlistId: parseInt(playlistId) }
    });

    await prisma.playlist.delete({
      where: { id: parseInt(playlistId) }
    });

    res.json({ message: "Playlist deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting playlist" });
  }
}

module.exports = {
  createPlaylist,
  getUserPlaylists,
  addMovieToPlaylist,
  getPlaylistMovies,
  removeMovieFromPlaylist,
  deletePlaylist,
};