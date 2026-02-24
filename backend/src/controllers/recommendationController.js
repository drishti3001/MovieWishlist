const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getRecommendations(req, res) {
  const userId = req.userId;

  try {
    const mlResponse = await axios.get(`http://127.0.0.1:8001/recommend/${userId}`);
    const movieIds = Array.isArray(mlResponse.data?.recommendations)
      ? mlResponse.data.recommendations
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id))
      : [];

    if (movieIds.length === 0) {
      return res.json([]);
    }

    const movies = await prisma.movie.findMany({
      where: { id: { in: movieIds } },
    });

    const moviesById = new Map(movies.map((movie) => [movie.id, movie]));
    const orderedMovies = movieIds
      .map((id) => moviesById.get(id))
      .filter(Boolean);

    return res.json(orderedMovies);
  } catch (err) {
    console.error('Recommendation fetch failed:', err.response?.data || err.message);
    return res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
}

module.exports = {
  getRecommendations,
};
