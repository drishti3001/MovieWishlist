const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const { getAllMovies, searchTMDB } = require('../controllers/movieController')

const router = express.Router()

// catalog movies
router.get('/movies', authMiddleware, getAllMovies)

// NEW: Search TMDB Proxy route
router.get('/search', authMiddleware, searchTMDB)

module.exports = router