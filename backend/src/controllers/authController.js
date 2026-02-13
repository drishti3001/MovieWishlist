const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function signup(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const trimmedEmail = String(email).trim();
    if (!trimmedEmail) {
      return res.status(400).json({ message: 'Email must not be empty' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
      },
    });

    return res.status(201).json(user);
  } catch (err) {
    console.error('Error in signup handler:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const trimmedEmail = String(email).trim();
    if (!trimmedEmail) {
      return res.status(400).json({ message: 'Email must not be empty' });
    }

    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not set in environment variables');
      return res.status(500).json({ message: 'Internal server error' });
    }

    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: '6h' },
    );

    return res.json({ token });
  } catch (err) {
    console.error('Error in login handler:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  signup,
  login,
};

