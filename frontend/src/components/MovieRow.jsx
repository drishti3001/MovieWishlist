import { useRef } from "react"

function MovieRow({ title, movies, watchlistIds, toggleWatchlist }) {
  const rowRef = useRef(null)

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
            <div key={movie.id} className="movie-card">
              <button className="heart-btn" onClick={() => toggleWatchlist(movie.id)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill={watchlistIds.has(movie.id) ? "#e50914" : "none"}
                  stroke={watchlistIds.has(movie.id) ? "#e50914" : "white"}
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
              <img src={movie.posterUrl} alt={movie.title} />
            </div>
          ))}
        </div>

        <button className="row-arrow right" onClick={scrollRight}>›</button>
      </div>
    </div>
  )
}

export default MovieRow
