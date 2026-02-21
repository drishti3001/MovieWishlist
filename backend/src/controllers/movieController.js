const axios = require('axios');
const https = require('https');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

// The httpsAgent helps prevent ECONNRESET by reusing connections
const httpsAgent = new https.Agent({ 
  keepAlive: true, 
  timeout: 60000 
});


// GET /movies → local catalog
async function getAllMovies(req, res) {
  try {
    const movies = await prisma.movie.findMany({
      where: {
        id: { lte: 100 } // Filters only your original 100 movies
      },
      orderBy: { id: 'asc' },
    });
    res.json(movies);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ message: 'Failed to fetch movies' });
  }
}

// Search TMDB Proxy
async function searchTMDB(req, res) {
  const { query } = req.query;
  
  // Ensure this variable matches your .env key (e.g., TMDB_TOKEN=your_32_char_key)
  const apiKey = process.env.TMDB_TOKEN ? process.env.TMDB_TOKEN.trim() : null;

  if (!query) return res.json([]);

  try {
    const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
      params: {
        api_key: apiKey,   // Short key MUST be passed here, not in headers
        query: query,
        include_adult: false,
        language: 'en-US',
        page: 1
      },
      httpsAgent,         // Reuses connection to avoid socket hang-ups
      timeout: 10000      // Gives TMDB enough time to respond
    });

    res.json(response.data.results || []);
  } catch (err) {
    // Log detailed error to debug "Invalid API Key" or "ECONNRESET" issues
    console.error("TMDB Proxy Error Detail:", err.response?.data || err.message);
    
    if (err.code === 'ECONNRESET') {
        console.warn("🔄 Connection Reset. Reusing the httpsAgent should minimize this.");
    }

    // Return an empty array so the frontend doesn't crash on errors
    res.status(200).json([]); 
  }
}

module.exports = {
  getAllMovies,
  searchTMDB,
};