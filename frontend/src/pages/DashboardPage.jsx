import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function DashboardPage() {
  const navigate = useNavigate()

  const [checkingAuth, setCheckingAuth] = useState(true)
  const [movies, setMovies] = useState([])
  const [loadingMovies, setLoadingMovies] = useState(true)
  const [error, setError] = useState(null)

  // FORM STATE
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [year, setYear] = useState('')
  const [genre, setGenre] = useState('')
  const [status, setStatus] = useState('plan_to_watch')
  const [rating, setRating] = useState('')
  const [creating, setCreating] = useState(false)

  // VERIFY AUTH
  useEffect(() => {
    const verifyAuth = async () => {
      const token = window.localStorage.getItem('token')

      if (!token) {
        navigate('/login', { replace: true })
        return
      }

      try {
        const response = await fetch('http://localhost:4000/protected', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          window.localStorage.removeItem('token')
          navigate('/login', { replace: true })
          return
        }

        await fetchMovies(token)

      } catch {
        window.localStorage.removeItem('token')
        navigate('/login', { replace: true })
      } finally {
        setCheckingAuth(false)
      }
    }

    verifyAuth()
  }, [navigate])

  // FETCH MOVIES
  const fetchMovies = async (token) => {
    try {
      const response = await fetch('http://localhost:4000/items', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error()

      const data = await response.json()
      setMovies(data)

    } catch {
      setError('Could not load movies')
    } finally {
      setLoadingMovies(false)
    }
  }

  // CREATE MOVIE
  const handleAddMovie = async (e) => {
    e.preventDefault()

    const token = window.localStorage.getItem('token')
    if (!token) return

    setCreating(true)

    try {
      const response = await fetch('http://localhost:4000/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          year: year ? Number(year) : undefined,
          genre,
          status,
          rating: rating ? Number(rating) : undefined,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        alert(err.message || 'Failed to create movie')
        return
      }

      setTitle('')
      setDescription('')
      setYear('')
      setGenre('')
      setStatus('plan_to_watch')
      setRating('')

      await fetchMovies(token)

    } catch {
      alert('Network error')
    } finally {
      setCreating(false)
    }
  }

  // DELETE MOVIE
  const handleDeleteMovie = async (id) => {
    const token = window.localStorage.getItem('token')
    if (!token) return

    if (!window.confirm('Delete this movie?')) return

    try {
      const response = await fetch(`http://localhost:4000/items/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        alert('Failed to delete movie')
        return
      }

      await fetchMovies(token)

    } catch {
      alert('Network error')
    }
  }

  // UI STATES
  if (checkingAuth) return <p>Checking authentication...</p>
  if (loadingMovies) return <p>Loading your watchlist...</p>
  if (error) return <p>{error}</p>

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-8">
          My Watchlist
        </h1>

        {/* ADD MOVIE FORM */}
        <form
          onSubmit={handleAddMovie}
          className="bg-gray-800 p-6 rounded-xl shadow-lg mb-10 space-y-3"
        >
          <h2 className="text-xl font-semibold mb-2">Add Movie</h2>

          <input
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            className="w-full p-2 rounded bg-gray-700 border border-gray-600"
            placeholder="Description / Review"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              className="p-2 rounded bg-gray-700 border border-gray-600"
              placeholder="Year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />

            <input
              className="p-2 rounded bg-gray-700 border border-gray-600"
              placeholder="Genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              className="p-2 rounded bg-gray-700 border border-gray-600"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="plan_to_watch">Plan to Watch</option>
              <option value="watching">Watching</option>
              <option value="watched">Watched</option>
            </select>

            <input
              className="p-2 rounded bg-gray-700 border border-gray-600"
              placeholder="Rating (1-10)"
              type="number"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
          </div>

          <button
            className="w-full bg-blue-600 hover:bg-blue-500 transition p-2 rounded font-semibold"
            disabled={creating}
          >
            {creating ? 'Adding...' : 'Add Movie'}
          </button>
        </form>

        {/* MOVIE LIST */}
        {movies.length === 0 ? (
          <p className="text-center text-gray-400">No movies added yet</p>
        ) : (
          <div className="space-y-6">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="bg-gray-800 p-5 rounded-xl shadow hover:scale-[1.02] transition"
              >
                <h3 className="text-2xl font-semibold">
                  {movie.title} {movie.year ? `(${movie.year})` : ''}
                </h3>

                <p className="text-gray-300 mt-2">{movie.description}</p>

                <div className="mt-3 text-sm space-y-1 text-gray-400">
                  <p>Status: {movie.status}</p>
                  {movie.rating && <p>Rating: {movie.rating}/10</p>}
                </div>

                <button
                  onClick={() => handleDelete(movie.id)}
                  className="mt-4 text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
 )  
}

export default DashboardPage
