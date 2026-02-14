const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

// ADD/UPDATE TO WATCHLIST
async function addToWatchlist(req, res) {
  const userId = req.userId
  const movieId = Number(req.params.movieId)
  const { status, rating, review, watchedBefore } = req.body

  try {
    const entry = await prisma.watchlist.upsert({
      where: { userId_movieId: { userId, movieId } },
      update: { 
        ...(status && { status }),
        ...(rating !== undefined && { rating }),
        ...(review !== undefined && { review }),
        ...(watchedBefore !== undefined && { watchedBefore })
      },
      create: { 
        userId, 
        movieId,
        status: status || 'plan_to_watch',
        ...(rating !== undefined && { rating }),
        ...(review !== undefined && { review }),
        ...(watchedBefore !== undefined && { watchedBefore })
      },
    })

    res.json(entry)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to save to watchlist' })
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
  const userId = req.userId
  const movieId = Number(req.params.movieId)

  try {
    await prisma.watchlist.delete({
      where: { userId_movieId: { userId, movieId } }
    })

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Delete failed' })
  }
}
module.exports = {
  addToWatchlist,
  getWatchlist,
  updateWatchlist,
  removeFromWatchlist
}
