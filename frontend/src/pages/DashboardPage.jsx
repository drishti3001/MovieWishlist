import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar' // Import Sidebar
import './dashboard.css'

function DashboardPage() {
  const navigate = useNavigate()

  const [movies, setMovies] = useState([])
  const [watchlistIds, setWatchlistIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Sidebar State

  // ---------- AUTH + LOAD ----------
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return navigate('/login')

    const load = async () => {
      try {
        // verify
        await fetch('http://localhost:4000/protected', {
          headers: { Authorization: `Bearer ${token}` }
        })

        // load movies
        const m = await fetch('http://localhost:4000/movies', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const moviesData = await m.json()
        setMovies(moviesData)

        // load watchlist
        const w = await fetch('http://localhost:4000/watchlist', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const watchData = await w.json()
        setWatchlistIds(new Set(watchData.map(item => item.movieId)))

      } catch {
        localStorage.removeItem('token')
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [navigate])

  // ---------- TOGGLE ----------
  const toggleWatchlist = async (movieId) => {
    const token = localStorage.getItem('token')
    const exists = watchlistIds.has(movieId)

    try {
      if (exists) {
        await fetch(`http://localhost:4000/watchlist/${movieId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        setWatchlistIds(prev => {
          const s = new Set(prev)
          s.delete(movieId)
          return s
        })
      } else {
        await fetch(`http://localhost:4000/watchlist/${movieId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({})
        })
        setWatchlistIds(prev => new Set([...prev, movieId]))
      }
    } catch {
      alert('Failed')
    }
  }

  if (loading) return <p className="text-white p-10">Loading...</p>

  return (
    <div className="dashboard-container">

      {/* SIDEBAR INTEGRATION */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* HAMBURGER ICON */}
      <button
        className="hamburger-btn"
        onClick={() => setIsSidebarOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Background & Overlay */}
      <div className="dashboard-bg"></div>
      <div className="dashboard-overlay"></div>

      {/* Header */}
      <header className="dashboard-header">
        <h1>Movie Catalogue</h1>
      </header>

      {/* Movie Grid */}
      <main className="movie-grid">
        {movies.map(movie => (
          <div key={movie.id} className="movie-card">

            {/* FLOATING HEART */}
            <button
              className="heart-btn"
              onClick={(e) => {
                e.stopPropagation() // Prevent card click if we add card definition later
                toggleWatchlist(movie.id)
              }}
              title={watchlistIds.has(movie.id) ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill={watchlistIds.has(movie.id) ? "#e50914" : "none"}
                stroke={watchlistIds.has(movie.id) ? "#e50914" : "white"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: 'all 0.3s ease' }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>

            <img src={movie.posterUrl} alt={movie.title} />

          </div>
        ))}
      </main>

    </div>
  )
}

export default DashboardPage
