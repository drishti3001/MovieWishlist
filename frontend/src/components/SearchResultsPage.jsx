import { useState, useEffect } from "react"
import { FiX } from "react-icons/fi"

function SearchResultsPage({ query, onClose, watchlistIds, toggleWatchlist }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const performSearch = async () => {
      if (!query) return;
      setLoading(true)
      const token = localStorage.getItem("token")
      try {
        const res = await fetch(`http://localhost:4000/search?query=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setResults(Array.isArray(data) ? data : [])
      } catch { 
        setResults([]) 
      } finally { 
        setLoading(false) 
      }
    }
    performSearch()
  }, [query])

  // We filter the results to only include movies with posters before rendering
  const filteredResults = results.filter(movie => movie.poster_path);

  return (
    <div className="search-results-page-container">
      <div className="search-results-header">
        <h2>Results for: <span className="query-highlight">"{query}"</span></h2>
        <button onClick={onClose} className="search-close-btn">
          <FiX size={40} />
        </button>
      </div>

      {loading ? (
        <div className="search-loading">
          <div className="netflix-spinner"></div>
          <p>Finding movies...</p>
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="movie-grid search-grid">
          {filteredResults.map((movie) => {
            const isAdded = Array.from(watchlistIds).some(id => id === movie.id || id === movie.tmdbId)
            return (
              <div key={movie.id} className="movie-card">
                <button className="heart-btn" onClick={() => toggleWatchlist(null, movie)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isAdded ? "#e50914" : "none"} stroke={isAdded ? "#e50914" : "white"} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
                <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="no-results-container">
          <p>Your search for <span className="no-results-query">"{query}"</span> did not have any matches.</p>
          <div className="no-results-suggestions">
            <p>Suggestions:</p>
            <ul>
              <li>Try different keywords</li>
              <li>Looking for a movie? Try searching for the title</li>
              <li>Try a genre, like comedy, romance, or drama</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchResultsPage