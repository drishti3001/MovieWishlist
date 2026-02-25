const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// 🟢 MATCH THE NAME: Destructure 'authMiddleware' specifically
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/movies', authMiddleware, movieController.getAllMovies);
router.get('/search', authMiddleware, movieController.searchTMDB);
router.post('/movies', authMiddleware, movieController.syncMovie);

module.exports = router;