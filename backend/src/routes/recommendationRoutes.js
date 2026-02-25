const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
// 🟢 FIX: Add curly braces to destructure the function
const { authMiddleware } = require('../middleware/authMiddleware');

// Recommendations require the user to be logged in to pull their taste profile
router.get('/recommendations', authMiddleware, recommendationController.getRecommendations);

module.exports = router;