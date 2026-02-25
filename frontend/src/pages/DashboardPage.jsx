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
  const [playlists, setPlaylists] = useState([])
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

        const r = await fetch('http://localhost:4000/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (r.ok) {
          const recData = await r.json()
          setRecommended(recData)
          console.log("Recommended movies:", recData)
        }

        const p = await fetch('http://localhost:4000/playlists', {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (p.ok) {
          const playlistsData = await p.json()
          setPlaylists(Array.isArray(playlistsData) ? playlistsData : [])
        }
      } catch {
        localStorage.removeItem('token')
        navigate('/login')
      } finally { setLoading(false) }
    }
    load()
  }, [navigate])

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
          playlists={playlists} 
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
                playlists={playlists}
              />
            )}

            <MovieRow
              title="Action"
              movies={actionMovies}
              playlists={playlists}
            />

            <MovieRow
              title="Drama"
              movies={dramaMovies}
              playlists={playlists}
            />

            <MovieRow
              title="Thriller"
              movies={thrillerMovies}
              playlists={playlists}
            />

            <MovieRow
              title="Comedy"
              movies={comedyMovies}
              playlists={playlists}
            />
          </main>
        </>
      )}
    </div>
  )
}

export default DashboardPage
