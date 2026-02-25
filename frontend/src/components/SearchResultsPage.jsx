import { AnimatePresence, motion as Motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { FiPlus, FiX } from "react-icons/fi"

function SearchResultCard({ movie, playlists = [], onToast }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!cardRef.current?.contains(event.target)) setShowDropdown(false)
    }
    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [])

  const handleAddToPlaylist = async (event, playlist) => {
    event.stopPropagation()
    const token = localStorage.getItem("token")
    if (!token) return

    try {
      // 1. Sync TMDB movie to local DB first
      const movieRes = await fetch(`http://localhost:4000/movies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tmdbId: movie.id,
          title: movie.title,
          description: movie.overview || "No description available",
          year: movie.release_date ? parseInt(movie.release_date.split("-")[0]) : null,
          posterUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        }),
      })
      
      const movieData = await movieRes.json()
      if (!movieRes.ok) throw new Error(movieData.message || "Failed to save movie")
      
      const localMovieId = movieData.id;

      // 2. Now add to playlist using local ID
      const res = await fetch(`http://localhost:4000/playlists/${playlist.id}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ movieId: localMovieId }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || "Failed to add movie")
      }

      setShowDropdown(false)
      if (onToast) onToast(`Added to ${playlist.name}`)
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div ref={cardRef} className="movie-card search-card">
      <button className="heart-btn" onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}>
        <FiPlus size={22} />
      </button>

      <AnimatePresence>
        {showDropdown && (
          <Motion.div 
            className="playlist-dropdown" 
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
          >
            {playlists.length > 0 ? (
              playlists.map(p => (
                <button key={p.id} className="playlist-dropdown-item" onClick={(e) => handleAddToPlaylist(e, p)}>
                  {p.name}
                </button>
              ))
            ) : <p className="playlist-dropdown-empty">Create a playlist first</p>}
          </Motion.div>
        )}
      </AnimatePresence>

      <img 
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
        alt={movie.title} 
        style={{ borderRadius: '24px' }} // Rounded posters
      />
    </div>
  )
}

function SearchResultsPage({ query, onClose, playlists = [] }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  useEffect(() => {
    if (!toastMessage) return undefined
    const timer = setTimeout(() => setToastMessage(""), 2500)
    return () => clearTimeout(timer)
  }, [toastMessage])

  useEffect(() => {
    const performSearch = async () => {
      if (!query) return
      setLoading(true)
      const token = localStorage.getItem("token")
      try {
        const res = await fetch(`http://localhost:4000/search?query=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setResults(Array.isArray(data) ? data : [])
      } catch { setResults([]) }
      finally { setLoading(false) }
    }
    performSearch()
  }, [query])

  return (
    <div className="search-results-page-container">
      <div className="search-results-header">
        <h2>Results for: <span className="query-highlight">"{query}"</span></h2>
        <button onClick={onClose} className="search-close-btn"><FiX size={40} /></button>
      </div>

      <div className="movie-grid search-grid">
        {results.filter(m => m.poster_path).map((movie) => (
          <SearchResultCard key={movie.id} movie={movie} playlists={playlists} onToast={setToastMessage} />
        ))}
      </div>

      <AnimatePresence>
        {toastMessage && (
          <Motion.div className="playlist-toast" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
            {toastMessage}
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SearchResultsPage