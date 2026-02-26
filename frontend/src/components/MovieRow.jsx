import { AnimatePresence, motion as Motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { FiPlus } from "react-icons/fi"
import { API_ENDPOINTS } from '../api';

function MovieCard({ movie, playlists, onCardClick, onToast }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!cardRef.current?.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [])

  const handleAddToPlaylist = async (event, playlist) => {
    event.stopPropagation()

    const token = localStorage.getItem("token")
    if (!token) return

    try {
      const res = await fetch(API_ENDPOINTS.ADD_TO_PLAYLIST(playlist.id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ movieId: movie.id }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.message || "Failed to add movie to playlist")
      }

      setShowDropdown(false)
      onToast(`Successfully added to ${playlist.name}`)
    } catch (error) {
      alert(error.message || "Failed to add movie to playlist")
    }
  }

  return (
    <div
      ref={cardRef}
      className="movie-card"
      onClick={() => {
        if (onCardClick) onCardClick(movie)
      }}
    >
      <button
        className="heart-btn"
        onClick={(event) => {
          event.stopPropagation()
          setShowDropdown((prev) => !prev)
        }}
        aria-label="Add to playlist"
      >
        <FiPlus size={22} />
      </button>

      <AnimatePresence>
        {showDropdown && (
          <Motion.div
            className="playlist-dropdown"
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {playlists.length > 0 ? (
              playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  className="playlist-dropdown-item"
                  onClick={(event) => handleAddToPlaylist(event, playlist)}
                >
                  {playlist.name}
                </button>
              ))
            ) : (
              <p className="playlist-dropdown-empty">Create a playlist first</p>
            )}
          </Motion.div>
        )}
      </AnimatePresence>

      <img src={movie.posterUrl} alt={movie.title} />
    </div>
  )
}

function MovieRow({ title, movies, playlists = [], onMovieClick }) {
  const rowRef = useRef(null)
  const [toastMessage, setToastMessage] = useState("")

  useEffect(() => {
    if (!toastMessage) return undefined
    const timer = setTimeout(() => setToastMessage(""), 2500)
    return () => clearTimeout(timer)
  }, [toastMessage])

  const scrollLeft = () => {
    rowRef.current?.scrollBy({ left: -600, behavior: "smooth" })
  }

  const scrollRight = () => {
    rowRef.current?.scrollBy({ left: 600, behavior: "smooth" })
  }

  return (
    <div className="movie-section">
      <h2 className="section-title">{title}</h2>

      <div className="movie-row-container">
        <button className="row-arrow left" onClick={scrollLeft}>‹</button>

        <div className="movie-row" ref={rowRef}>
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              playlists={playlists}
              onCardClick={onMovieClick}
              onToast={setToastMessage}
            />
          ))}
        </div>

        <button className="row-arrow right" onClick={scrollRight}>›</button>
      </div>

      <AnimatePresence>
        {toastMessage && (
          <Motion.div
            className="playlist-toast"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {toastMessage}
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MovieRow
