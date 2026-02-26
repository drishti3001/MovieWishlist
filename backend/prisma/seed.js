const path = require('path');

// Load .env from backend root
require('dotenv').config({
  path: path.resolve(process.cwd(), '.env')
});

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const https = require('https');

const prisma = new PrismaClient();

// Stable HTTPS agent to handle keep-alive and connection stability
const httpsAgent = new https.Agent({
  keepAlive: true,
  timeout: 60000, // 1 minute
});

const TMDB_POPULAR_URL = "https://api.themoviedb.org/3/movie/popular";
const TMDB_GENRE_URL = "https://api.themoviedb.org/3/genre/movie/list";

/**
 * Robust fetcher with retries to handle ECONNRESET or network hiccups
 */
async function fetchWithRetry(url, params, retries = 3) {
  try {
    return await axios.get(url, {
      params,
      httpsAgent,
      timeout: 15000, // 15 seconds
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
        'Accept': 'application/json',
      }
    });
  } catch (error) {
    const isNetworkError = error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT';
    if (retries > 0 && isNetworkError) {
      console.warn(`⚠️ Connection issue (${error.code}). Retrying... (${retries} attempts left)`);
      // Wait 1 second before retrying
      await new Promise(res => setTimeout(res, 1000));
      return fetchWithRetry(url, params, retries - 1);
    }
    throw error;
  }
}

async function fetchGenres() {
  const response = await fetchWithRetry(TMDB_GENRE_URL, {
    api_key: process.env.TMDB_TOKEN,
    language: "en-US",
  });

  const genreMap = {};
  if (response.data && response.data.genres) {
    for (const g of response.data.genres) {
      genreMap[g.id] = g.name;
    }
  }
  return genreMap;
}

async function fetchMovies(page = 1) {
  const response = await fetchWithRetry(TMDB_POPULAR_URL, {
    api_key: process.env.TMDB_TOKEN,
    language: "en-US",
    page,
  });

  return response.data.results || [];
}

async function main() {
  console.log("🚀 Starting movie import from TMDB...");
  
  try {
    const genreMap = await fetchGenres();
    console.log("✅ Genres fetched successfully.");

    // Clear old data (be careful in production!)
    console.log("🧹 Cleaning up database...");
    await prisma.watchlist.deleteMany();
    await prisma.movie.deleteMany();

    for (let page = 1; page <= 5; page++) {
      const movies = await fetchMovies(page);
      console.log(`📦 Processing page ${page} (${movies.length} movies)...`);

      // Using Promise.all for faster DB insertion within each page
      await Promise.all(
        movies.map(m => {
          const genreNames = (m.genre_ids || [])
            .map(id => genreMap[id])
            .filter(Boolean)
            .join(", ");

          return prisma.movie.create({
            data: {
              tmdbId: m.id,
              title: m.title,
              description: m.overview || "No description available",
              year: m.release_date ? parseInt(m.release_date.slice(0, 4)) : null,
              genre: genreNames || "Unknown",
              posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
            },
          });
        })
      );

      console.log(`✅ Imported page ${page}`);
    }

    console.log("🎬 Movie import completed successfully!");
  } catch (error) {
    console.error("❌ Fatal Error during seeding:");
    if (error.response) {
      console.error(`Status: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });