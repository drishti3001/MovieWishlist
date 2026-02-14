import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function DashboardPage() {
  const navigate = useNavigate()

  const [movies, setMovies] = useState([])
  const [watchlistIds, setWatchlistIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

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

        // IMPORTANT FIX
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
    <main className="min-h-screen bg-gray-900 text-white p-8">

      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">Browse Movies</h1>

        <button
          onClick={() => navigate('/wishlist')}
          className="bg-pink-600 px-4 py-2 rounded"
        >
          Go to Wishlist
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {movies.map(movie => (
          <div key={movie.id} className="bg-gray-800 rounded overflow-hidden">

            <img src={movie.posterUrl} className="w-full h-72 object-cover"/>

            <div className="p-3">
              <h2 className="text-sm font-semibold">{movie.title}</h2>

              <button
                onClick={() => toggleWatchlist(movie.id)}
                className={`mt-2 w-full py-2 rounded ${
                  watchlistIds.has(movie.id)
                    ? 'bg-red-600'
                    : 'bg-green-600'
                }`}
              >
                {watchlistIds.has(movie.id)
                  ? 'Remove'
                  : 'Add to Wishlist'}
              </button>

            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default DashboardPage
