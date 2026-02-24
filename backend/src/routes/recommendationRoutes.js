const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const { getRecommendations } = require('../controllers/recommendationController');

const router = express.Router();

router.get('/recommendations', authMiddleware, getRecommendations);

module.exports = router;
