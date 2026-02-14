const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
require('dotenv').config()

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

const TMDB_URL = "https://api.themoviedb.org/3/movie/popular"

async function fetchMovies(page = 1) {
  const res = await fetch(`${TMDB_URL}?language=en-US&page=${page}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${process.env.TMDB_TOKEN}`,
      "accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    },
  })


  const data = await res.json()
  return data.results || []
}

async function main() {
  console.log("Importing movies from TMDB...")

  // clear old movies (safe during dev)
  await prisma.watchlist.deleteMany()
  await prisma.movie.deleteMany()

  // import ~100 movies (5 pages × 20 each)
  for (let page = 1; page <= 5; page++) {
    const movies = await fetchMovies(page)

    for (const m of movies) {
      await prisma.movie.create({
        data: {
          title: m.title,
          description: m.overview || "No description available",
          year: m.release_date ? parseInt(m.release_date.slice(0, 4)) : null,
          genre: "Unknown", // we’ll improve later
          posterUrl: m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : null,
        },
      })
    }

    console.log(`Imported page ${page}`)
  }

  console.log("Movie import completed 🎬")
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
