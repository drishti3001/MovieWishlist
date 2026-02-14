const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

// GET /movies → catalog
async function getAllMovies(req, res) {
  try {
    const movies = await prisma.movie.findMany({
      orderBy: { id: 'asc' },
      take: 100,
    })

    res.json(movies)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch movies' })
  }
}

module.exports = {
  getAllMovies,
}
