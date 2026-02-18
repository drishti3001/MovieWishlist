import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import './dashboard.css'
import { FiEdit2, FiMoreVertical, FiInfo } from "react-icons/fi"
import { HiOutlineTrash } from "react-icons/hi"
import { FaStar } from "react-icons/fa"

function WishlistPage() {
    const navigate = useNavigate()
    const [watchlist, setWatchlist] = useState([])
    const [editingId, setEditingId] = useState(null)
    const [hoverRating, setHoverRating] = useState(null)
    const [openMenuId, setOpenMenuId] = useState(null)
    const [infoOpenId, setInfoOpenId] = useState(null)
    const editPanelRef = useRef(null)

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

    // ✅ MOBILE SAFE OUTSIDE CLICK
    useEffect(() => {
        const handlePointerDown = (e) => {
            // close menu if click outside menu
            if (!e.target.closest(".movie-menu") && !e.target.closest(".menu-trigger")) {
                setOpenMenuId(null)
            }

            if (!editingId) return

            // ignore taps inside edit panel
            if (editPanelRef.current?.contains(e.target)) return

            setEditingId(null)
        }

        document.addEventListener("pointerdown", handlePointerDown)
        return () => document.removeEventListener("pointerdown", handlePointerDown)
    }, [editingId])

    // DELETE
    const remove = async (movieId) => {
        setInfoOpenId(null)
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

    // ⭐ STAR COMPONENT FIXED: Added stopPropagation to prevent closing
    const StarRating = ({ item, index }) => {
      return(
        <div className="star-rating-lg" onMouseLeave={() => setHoverRating(null)}>
            {[1, 2, 3, 4, 5].map(star => {
                const isHighlight = hoverRating && star <= hoverRating;
                const isActive = !hoverRating && item.rating && star <= item.rating;
                return (
                    <FaStar
                        key={star}
                        className={`star-icon ${isActive ? 'active' : ''} ${isHighlight ? 'highlight' : ''}`}
                        onMouseEnter={() => setHoverRating(star)}
                        onPointerDown={(e) => {
                            // ⭐ THE FIX: Stop the event from reaching the document listener
                            e.stopPropagation(); 
                            e.preventDefault();
                            change(index, 'rating', star);
                        }}
                        onClick={(e) => {
                            e.stopPropagation(); // Double safety for desktop
                            change(index, 'rating', star);
                        }}
                    />
                )
            })}
        </div>
      )
  }

    return (
        <div className="dashboard-container relative min-h-screen text-white">
            <div className="dashboard-bg"></div>
            <div className="dashboard-overlay"></div>

            <div className="dashboard-header flex justify-between items-center p-8 relative z-10">
                <h1 className="text-4xl font-extrabold tracking-tight">My Wishlist</h1>
                <button onClick={() => navigate("/dashboard")} className="back-btn">
                    Back
                </button>
            </div>

            <div className="movie-grid">
                {watchlist.map((item, i) => (
                    <div key={item.id} className={`movie-card group ${editingId === item.movieId ? 'editing-active' : ''}`}>
                        <div className="card-3d">
                            <div className={`card-inner ${infoOpenId === item.movieId ? 'flipped' : ''}`}>

                                <div className="front">
                                    <img src={item.movie.posterUrl} alt={item.movie.title} />

                                    {editingId !== item.movieId && (
                                        <>
                                            <button
                                                className="menu-trigger"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setOpenMenuId(openMenuId === item.movieId ? null : item.movieId)
                                                }}
                                                onPointerDown={(e) => e.stopPropagation()}
                                            >
                                                <FiMoreVertical size={20} color="white" />
                                            </button>

                                            {openMenuId === item.movieId && (
                                                <div
                                                    className="movie-menu"
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setEditingId(item.movieId)
                                                            setOpenMenuId(null)
                                                            setInfoOpenId(null)
                                                        }}
                                                    >
                                                        <FiEdit2 size={16} /> Edit
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            remove(item.movieId)
                                                            setOpenMenuId(null)
                                                        }}
                                                    >
                                                        <HiOutlineTrash size={16} /> Delete
                                                    </button>

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setInfoOpenId(infoOpenId === item.movieId ? null : item.movieId)
                                                            setOpenMenuId(null)
                                                        }}
                                                    >
                                                        <FiInfo size={16} /> Info
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {editingId === item.movieId && (
                                        <div ref={editPanelRef} className="edit-overlay-panel">
                                            <h3 className="edit-form-title">{item.movie.title}</h3>
                                            <div className="space-y-4 flex-grow flex flex-col">
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => change(i, 'status', e.target.value)}
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                    className="edit-select"
                                                >
                                                    <option value="plan_to_watch">Plan to watch</option>
                                                    <option value="watching">Watching</option>
                                                    <option value="watched">Watched</option>
                                                </select>

                                                <div className="text-center">
                                                    <StarRating item={item} index={i} />
                                                </div>

                                                <textarea
                                                    value={item.review || ''}
                                                    onChange={(e) => change(i, 'review', e.target.value)}
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                    placeholder="Write your thoughts..."
                                                    className="edit-textarea"
                                                />
                                            </div>

                                            <button onClick={() => saveUpdate(item)} className="save-btn">
                                                Save Changes
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div
                                    className="back"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setInfoOpenId(null)
                                    }}
                                >
                                    <div className="info-section">
                                        <span className="info-label">Status</span>
                                        <span className="info-value">
                                            {item.status ? item.status.replace(/_/g, ' ') : 'Not set'}
                                        </span>
                                    </div>

                                    <div className="info-section">
                                        <span className="info-label">Rating</span>
                                        <div className="info-stars">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <FaStar
                                                    key={star}
                                                    className="info-star-icon"
                                                    style={{
                                                        color: star <= (item.rating || 0) ? "#e50914" : "#3a3a3a",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="info-section">
                                        <span className="info-label">Review</span>
                                        <p className="review-text">
                                            {item.review || "No review written yet."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WishlistPage