const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const { getAllMovies } = require('../controllers/movieController')

const router = express.Router()

// catalog movies
router.get('/movies', authMiddleware, getAllMovies)

module.exports = router
