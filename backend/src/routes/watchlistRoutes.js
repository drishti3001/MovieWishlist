const express = require('express');
// 🟢 FIX: Add curly braces
const { authMiddleware } = require('../middleware/authMiddleware'); 
const {
  addToWatchlist,
  getWatchlist,
  updateWatchlist,
  removeFromWatchlist
} = require('../controllers/watchlistController');

const router = express.Router();

router.post('/watchlist', authMiddleware, addToWatchlist);
router.post('/watchlist/:movieId', authMiddleware, addToWatchlist);
router.get('/watchlist', authMiddleware, getWatchlist);
router.patch('/watchlist/:movieId', authMiddleware, updateWatchlist);
router.delete('/watchlist/:movieId', authMiddleware, removeFromWatchlist);

module.exports = router;