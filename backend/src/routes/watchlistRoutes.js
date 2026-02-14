const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const {
  addToWatchlist,
  getWatchlist,
  updateWatchlist,
  removeFromWatchlist
} = require('../controllers/watchlistController')

const router = express.Router()

router.post('/watchlist/:movieId', authMiddleware, addToWatchlist)
router.get('/watchlist', authMiddleware, getWatchlist)
router.patch('/watchlist/:movieId', authMiddleware, updateWatchlist)
router.delete('/watchlist/:movieId', authMiddleware, removeFromWatchlist)

module.exports = router
