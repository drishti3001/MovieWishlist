const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');

// 🟢 FIX: Destructure and rename to match your existing route usage
const { authMiddleware: authenticateToken } = require('../middleware/authMiddleware'); 

// All playlist routes require login
router.post('/playlists', authenticateToken, playlistController.createPlaylist);
router.get('/playlists', authenticateToken, playlistController.getUserPlaylists);
router.post('/playlists/:playlistId/add', authenticateToken, playlistController.addMovieToPlaylist);
router.get('/playlists/:playlistId/movies', authenticateToken, playlistController.getPlaylistMovies);
router.delete('/playlists/:playlistId/movies/:movieId', authenticateToken, playlistController.removeMovieFromPlaylist);
router.delete('/playlists/:playlistId', authenticateToken, playlistController.deletePlaylist);

module.exports = router;