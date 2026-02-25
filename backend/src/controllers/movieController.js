const axios = require('axios');
const https = require('https');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// helps prevent ECONNRESET by reusing connections
const httpsAgent = new https.Agent({ 
  keepAlive: true, 
  timeout: 60000 
});

/**
 * 1. GET /movies
 * Returns the local catalog (original 100 movies)
 */
async function getAllMovies(req, res) {
  try {
    const movies = await prisma.movie.findMany({
      where: {
        id: { lte: 100 } 
      },
      orderBy: { id: 'asc' },
    });
    res.json(movies);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ message: 'Failed to fetch movies' });
  }
}

/**
 * 2. GET /search
 * Proxies requests to TMDB for external movie discovery
 */
async function searchTMDB(req, res) {
  const { query } = req.query;
  const apiKey = process.env.TMDB_TOKEN ? process.env.TMDB_TOKEN.trim() : null;

  if (!query) return res.json([]);

  try {
    const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
      params: {
        api_key: apiKey,
        query: query,
        include_adult: false,
        language: 'en-US',
        page: 1
      },
      httpsAgent,
      timeout: 10000
    });

    res.json(response.data.results || []);
  } catch (err) {
    console.error("TMDB Proxy Error Detail:", err.response?.data || err.message);
    // Return empty array instead of 500 to prevent frontend UI from breaking
    res.status(200).json([]); 
  }
}

/**
 * 3. POST /movies
 * Syncs a TMDB movie to the local database
 * Crucial for the "Add to Playlist" functionality from Search
 */
async function syncMovie(req, res) {
  const { tmdbId, title, description, year, posterUrl } = req.body;
  
  try {
    if (!tmdbId) {
      return res.status(400).json({ message: "tmdbId is required for syncing" });
    }

    // Check if movie already exists locally
    let movie = await prisma.movie.findUnique({ 
      where: { tmdbId: parseInt(tmdbId) } 
    });

    if (!movie) {
      // If it doesn't exist, create it in our local DB
      movie = await prisma.movie.create({
        data: { 
          tmdbId: parseInt(tmdbId), 
          title, 
          description: description || "No description available", 
          year: year ? parseInt(year) : null, 
          posterUrl 
        }
      });
    }
    
    // Return the movie (either found or newly created) so frontend has the local ID
    res.status(200).json(movie);
  } catch (error) {
    console.error("Sync Error:", error);
    res.status(500).json({ message: "Error syncing movie to local database", error: error.message });
  }
}

module.exports = {
  getAllMovies,
  searchTMDB,
  syncMovie,
};