import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar' 
import SearchResultsPage from '../components/SearchResultsPage' // Renamed for clarity
import MovieRow from '../components/MovieRow'
import './dashboard.css'

function DashboardPage() {
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])
  const [recommended, setRecommended] = useState([])
  const [watchlistIds, setWatchlistIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) 
  
  // Search UI States
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return navigate('/login')

    const load = async () => {
      try {
        await fetch('http://localhost:4000/protected', { headers: { Authorization: `Bearer ${token}` } })
        const m = await fetch('http://localhost:4000/movies', { headers: { Authorization: `Bearer ${token}` } })
        setMovies(await m.json())

        const w = await fetch('http://localhost:4000/watchlist', { headers: { Authorization: `Bearer ${token}` } })
        const watchData = await w.json()
        const ids = new Set()
        watchData.forEach(item => {
          ids.add(item.movieId)
          if (item.movie?.tmdbId) ids.add(item.movie.tmdbId)
        })
        setWatchlistIds(ids)

        const r = await fetch('http://localhost:4000/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (r.ok) {
          const recData = await r.json()
          setRecommended(recData)
          console.log("Recommended movies:", recData)
        }
      } catch {
        localStorage.removeItem('token')
        navigate('/login')
      } finally { setLoading(false) }
    }
    load()
  }, [navigate])

  const toggleWatchlist = async (movieId, tmdbMovie = null) => {
    const token = localStorage.getItem('token')
    const identifier = tmdbMovie ? tmdbMovie.id : movieId
    const exists = watchlistIds.has(identifier)
    try {
      if (exists) {
        await fetch(`http://localhost:4000/watchlist/${identifier}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
        setWatchlistIds(prev => { const s = new Set(prev); s.delete(identifier); return s; })
      } else {
        const res = await fetch(`http://localhost:4000/watchlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ tmdbMovie, movieId: !tmdbMovie ? movieId : null })
        })
        if (res.ok) setWatchlistIds(prev => new Set([...prev, identifier]))
      }
    } catch { alert('Failed to update wishlist') }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) setIsSearchActive(true)
  }

  const handleCloseSearch = () => {
    setIsSearchActive(false)
    setIsSearchExpanded(false)
    setSearchQuery("")
  }

  // Genre groupings
  const actionMovies = movies.filter(m => m.genre?.includes("Action"))
  const dramaMovies = movies.filter(m => m.genre?.includes("Drama"))
  const thrillerMovies = movies.filter(m => m.genre?.includes("Thriller"))
  const comedyMovies = movies.filter(m => m.genre?.includes("Comedy"))

  console.log("Action:", actionMovies.length)
  console.log("Drama:", dramaMovies.length)
  console.log("Thriller:", thrillerMovies.length)
  console.log("Comedy:", comedyMovies.length)

  if (loading) return <p className="text-white p-10">Loading...</p>

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* FIXED TOP NAV (Search + Hamburger) */}
      <div className="top-nav-controls">
        <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>

        <div className="search-container-netflix">
          <form onSubmit={handleSearchSubmit} className={`search-box ${isSearchExpanded ? 'expanded' : ''}`}>
            <button type="button" className="search-icon-btn" onClick={() => setIsSearchExpanded(!isSearchExpanded)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
            <input type="text" className="search-input-netflix" placeholder="Titles, people, genres" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onBlur={() => { if(!searchQuery) setIsSearchExpanded(false); }} autoFocus={isSearchExpanded} />
          </form>
        </div>
      </div>

      <div className="dashboard-bg"></div>
      <div className="dashboard-overlay"></div>

      {/* CONDITIONAL RENDERING: Results vs Catalogue */}
      {isSearchActive ? (
        <SearchResultsPage 
          query={searchQuery} 
          onClose={handleCloseSearch} 
          watchlistIds={watchlistIds} 
          toggleWatchlist={toggleWatchlist} 
        />
      ) : (
        <>
          <header className="dashboard-header">
            <h1>Movie Catalogue</h1>
          </header>
          <main className="dashboard-content">
            {recommended.length > 0 && (
              <MovieRow
                title="Recommended For You"
                movies={recommended}
                watchlistIds={watchlistIds}
                toggleWatchlist={toggleWatchlist}
              />
            )}

            <MovieRow
              title="Action"
              movies={actionMovies}
              watchlistIds={watchlistIds}
              toggleWatchlist={toggleWatchlist}
            />

            <MovieRow
              title="Drama"
              movies={dramaMovies}
              watchlistIds={watchlistIds}
              toggleWatchlist={toggleWatchlist}
            />

            <MovieRow
              title="Thriller"
              movies={thrillerMovies}
              watchlistIds={watchlistIds}
              toggleWatchlist={toggleWatchlist}
            />

            <MovieRow
              title="Comedy"
              movies={comedyMovies}
              watchlistIds={watchlistIds}
              toggleWatchlist={toggleWatchlist}
            />
          </main>
        </>
      )}
    </div>
  )
}

export default DashboardPage
