import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function WishlistPage() {
  const navigate = useNavigate()
  const [watchlist, setWatchlist] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [hoverRating, setHoverRating] = useState(null)

  // LOAD
  const load = async () => {
    const token = localStorage.getItem("token")
    if (!token) return navigate("/login")

    const res = await fetch("http://localhost:4000/watchlist", {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await res.json()
    setWatchlist(data)
  }

  useEffect(() => { load() }, [])

  // DELETE
  const remove = async (movieId) => {
    const token = localStorage.getItem("token")

    await fetch(`http://localhost:4000/watchlist/${movieId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    load()
  }

  // SAVE UPDATE
  const saveUpdate = async (item) => {
    const token = localStorage.getItem("token")

    await fetch(`http://localhost:4000/watchlist/${item.movieId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: item.status,
        rating: item.rating ? Math.round(item.rating) : null,
        review: item.review || null,
      }),
    })

    setEditingId(null)
    setHoverRating(null)
    load()
  }

  const change = (index, field, value) => {
    setWatchlist(prev => {
      const copy = [...prev]
      copy[index][field] = value
      return copy
    })
  }

  // ⭐ STAR COMPONENT
  const StarRating = ({ item, index }) => {
    const displayRating = hoverRating ?? item.rating ?? 0

    return (
      <div className="flex gap-1 mt-3">
        {[1,2,3,4,5].map(star => {
          const full = displayRating >= star
          const half = displayRating >= star - 0.5 && displayRating < star

          return (
            <div
              key={star}
              className="relative text-3xl cursor-pointer select-none"
              onMouseLeave={() => setHoverRating(null)}
            >
              {/* LEFT HALF */}
              <span
                className="absolute left-0 top-0 w-1/2 h-full z-10"
                onMouseEnter={() => setHoverRating(star - 0.5)}
                onClick={() => change(index,'rating',star)}
              />

              {/* RIGHT HALF */}
              <span
                className="absolute right-0 top-0 w-1/2 h-full z-10"
                onMouseEnter={() => setHoverRating(star)}
                onClick={() => change(index,'rating',star)}
              />

              {/* STAR VISUAL */}
              <span className="text-gray-600">★</span>

              {half && (
                <span className="absolute left-0 top-0 text-yellow-400 overflow-hidden w-1/2">
                  ★
                </span>
              )}

              {full && (
                <span className="absolute left-0 top-0 text-yellow-400">
                  ★
                </span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">

      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <button onClick={() => navigate('/dashboard')} className="bg-blue-600 px-4 py-2 rounded">
          Back
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {watchlist.map((item, i) => (
          <div key={item.id} className="bg-gray-800 p-4 rounded">

            <img src={item.movie.posterUrl} className="w-full h-64 object-cover rounded"/>

            <h2 className="mt-3 font-semibold">{item.movie.title}</h2>

            {/* ---------- NORMAL VIEW ---------- */}
            {editingId !== item.movieId && (
              <>
                <div className="mt-3 space-y-2 text-sm">
                  <p>Status: {item.status}</p>

                  {item.rating && (
                    <div className="flex gap-1 text-yellow-400 text-xl">
                      {[1,2,3,4,5].map(star => (
                        <span key={star}>
                          {star <= item.rating ? "★" : "☆"}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.review && <p>Review: {item.review}</p>}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setEditingId(item.movieId)}
                    className="flex-1 bg-green-600 p-2 rounded"
                  >
                    Update
                  </button>

                  <button
                    onClick={() => remove(item.movieId)}
                    className="flex-1 bg-red-600 p-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}

            {/* ---------- EDIT MODE ---------- */}
            {editingId === item.movieId && (
              <>
                <select
                  value={item.status}
                  onChange={(e)=>change(i,'status',e.target.value)}
                  className="w-full mt-3 bg-gray-700 p-2 rounded"
                >
                  <option value="plan_to_watch">Plan to watch</option>
                  <option value="watching">Watching</option>
                  <option value="watched">Watched</option>
                </select>

                <StarRating item={item} index={i} />

                <textarea
                  value={item.review || ''}
                  onChange={(e)=>change(i,'review',e.target.value)}
                  placeholder="Review"
                  className="w-full mt-3 bg-gray-700 p-2 rounded"
                />

                <button
                  onClick={()=>saveUpdate(item)}
                  className="w-full bg-blue-600 p-2 rounded mt-4"
                >
                  Save
                </button>
              </>
            )}

          </div>
        ))}

      </div>
    </main>
  )
}

export default WishlistPage
