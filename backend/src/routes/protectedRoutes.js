const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/protected', authMiddleware, (req, res) => {
  return res.json({
    message: 'Protected route working',
    userId: req.userId,
  });
});

module.exports = router;

