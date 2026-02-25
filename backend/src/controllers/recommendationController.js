const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getRecommendations(req, res) {
  const userId = req.userId;
  // Fallback to 8000 if the env variable isn't loaded properly
  const mlBaseUrl = process.env.RECOMMENDATION_SERVICE_URL || "http://127.0.0.1:8000";

  try {
    // 🟢 CHANGED: Port 8001 -> 8000 and used mlBaseUrl variable
    const mlResponse = await axios.get(`${mlBaseUrl}/recommend/${userId}`);
    
    const movieIds = Array.isArray(mlResponse.data?.recommendations)
      ? mlResponse.data.recommendations
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id))
      : [];

    if (movieIds.length === 0) return res.json([]);

    const movies = await prisma.movie.findMany({
      where: { id: { in: movieIds } },
    });

    const moviesById = new Map(movies.map((movie) => [movie.id, movie]));
    const orderedMovies = movieIds
      .map((id) => moviesById.get(id))
      .filter(Boolean);

    return res.json(orderedMovies);
  } catch (err) {
    console.error('Recommendation fetch failed:', err.message);
    // Return empty array so UI doesn't crash on connection errors
    return res.status(200).json([]); 
  }
}

module.exports = { getRecommendations };