const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { OAuth2Client } = require('google-auth-library');
const prisma = new PrismaClient()
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

async function googleLogin(req, res) {
  try {
    const { credential } = req.body;

    // 1. Verify the Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, sub: googleId } = payload;

    // 2. Upsert the user (Find or Create)
    let user = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (!user) {
      // Create new user without passwordHash
      user = await prisma.user.create({
        data: {
          email: email.trim(),
          googleId: googleId,
        },
      });
    } else if (!user.googleId) {
      // Link Google ID to existing email account if not already linked
      user = await prisma.user.update({
        where: { email: email.trim() },
        data: { googleId: googleId },
      });
    }

    // 3. Generate your app's JWT (Same as your standard login)
    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: '6h' }
    );

    return res.json({ token });
  } catch (err) {
    console.error('Google Auth Error:', err);
    return res.status(400).json({ message: 'Google authentication failed' });
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
  googleLogin,
};

