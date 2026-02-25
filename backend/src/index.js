const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const movieRoutes = require('./routes/movieRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const playlistRoutes = require('./routes/playlistRoutes'); // 1. Import new routes

const app = express();

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running' });
});

app.use(authRoutes);
app.use(protectedRoutes);
app.use(movieRoutes);
app.use(watchlistRoutes);
app.use(recommendationRoutes);
app.use(playlistRoutes); // 2. Use new routes

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});