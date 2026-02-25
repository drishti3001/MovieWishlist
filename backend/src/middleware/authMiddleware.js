const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ message: 'Internal server error' });
    }

    const payload = jwt.verify(token, jwtSecret);

    if (!payload || typeof payload.userId === 'undefined') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.userId = payload.userId;
    return next();
  } catch (err) {
    console.error('Error in auth middleware:', err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

// 🟢 CHANGE THIS LINE: Export as an object
module.exports = { authMiddleware };