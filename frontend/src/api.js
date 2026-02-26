// This pulls the URL from your .env file
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const API_ENDPOINTS = {
  LOGIN: `${BASE_URL}/login`,
  SIGNUP: `${BASE_URL}/signup`,
  GOOGLE_AUTH: `${BASE_URL}/google`,
  PROTECTED: `${BASE_URL}/protected`,
  MOVIES: `${BASE_URL}/movies`,
  RECOMMENDATIONS: `${BASE_URL}/recommendations`,
  PLAYLISTS: `${BASE_URL}/playlists`,
  SEARCH: (query) => `${BASE_URL}/search?query=${encodeURIComponent(query)}`,
  PLAYLIST_MOVIES: (id) => `${BASE_URL}/playlists/${id}/movies`,
  ADD_TO_PLAYLIST: (id) => `${BASE_URL}/playlists/${id}/add`,
  DELETE_PLAYLIST: (id) => `${BASE_URL}/playlists/${id}`,
  DELETE_MOVIE_FROM_PLAYLIST: (playlistId, movieId) => 
    `${BASE_URL}/playlists/${playlistId}/movies/${movieId}`,
  WATCHLIST_UPDATE: (movieId) => `${BASE_URL}/watchlist/${movieId}`,
};