import { AnimatePresence, motion as Motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import './dashboard.css';
import { FiEdit2, FiMoreVertical, FiInfo } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi";
import { FaStar } from "react-icons/fa";

function WishlistPage() {
    const navigate = useNavigate();
    const { playlistId } = useParams();

    const [playlistName, setPlaylistName] = useState("Playlist");
    const [watchlist, setWatchlist] = useState([]);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [infoOpenId, setInfoOpenId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [hoverRating, setHoverRating] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const load = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        setIsLoaded(false);
        setOpenMenuId(null);
        setInfoOpenId(null);
        setEditingId(null);

        try {
            const res = await fetch(`http://localhost:4000/playlists/${playlistId}/movies`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                if (res.status === 404) {
                    setPlaylistName("Playlist not found");
                    setWatchlist([]);
                    setIsLoaded(true);
                    return;
                }
                throw new Error("Failed to load playlist");
            }

            const data = await res.json();
            setPlaylistName(data?.name || "Playlist");
            
            // ✅ Fix: Properly mapping flattened diary data from backend
            setWatchlist(
                Array.isArray(data?.movies)
                    ? data.movies.map((item) => ({
                        ...item,
                        status: item.status || "plan_to_watch",
                        rating: item.rating ?? 0,
                        review: item.review ?? "",
                    }))
                    : []
            );
        } catch (error) {
            console.error("Load error:", error);
            setPlaylistName("Playlist");
            setWatchlist([]);
        } finally {
            setIsLoaded(true);
        }
    }, [navigate, playlistId]);

    useEffect(() => {
        if (playlistId) load();
    }, [playlistId, load]);

    useEffect(() => {
        const handlePointerDown = (e) => {
            if (!e.target.closest(".movie-menu") && !e.target.closest(".menu-trigger")) {
                setOpenMenuId(null);
            }
            if (editingId && !e.target.closest(".edit-overlay-panel")) {
                setEditingId(null);
                setHoverRating(null);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [editingId]);

    useEffect(() => {
        if (!toastMessage) return undefined;
        const timer = setTimeout(() => setToastMessage(""), 2500);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    const remove = async (movieId) => {
        setInfoOpenId(null);
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:4000/playlists/${playlistId}/movies/${movieId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        load();
    };

    const change = (index, field, value) => {
        setWatchlist((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            return copy;
        });
    };

    const saveUpdate = async (item) => {
        const token = localStorage.getItem("token");
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
        });

        setEditingId(null);
        setHoverRating(null);
        setToastMessage("Review saved!");
        load();
    };

    const StarRating = ({ item, index }) => (
        <div
            className="star-rating-lg"
            onMouseLeave={() => setHoverRating(null)}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            {[1, 2, 3, 4, 5].map((star) => {
                const isHighlight = hoverRating && star <= hoverRating;
                const isActive = !hoverRating && item.rating && star <= item.rating;

                return (
                    <FaStar
                        key={star}
                        className={`star-icon ${isActive ? 'active' : ''} ${isHighlight ? 'highlight' : ''}`}
                        onMouseEnter={() => setHoverRating(star)}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            change(index, 'rating', star);
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            change(index, 'rating', star);
                        }}
                    />
                );
            })}
        </div>
    );

    return (
        <div className="dashboard-container relative min-h-screen text-white">
            <div className="dashboard-bg"></div>
            <div className="dashboard-overlay"></div>

            <div className="dashboard-header flex justify-between items-center p-8 relative z-10">
                <h1 className="text-4xl font-extrabold tracking-tight">{playlistName}</h1>
                <button onClick={() => navigate("/dashboard")} className="back-btn">
                    Back
                </button>
            </div>

            <AnimatePresence mode="wait">
                <Motion.div
                    key={playlistId}
                    className="playlist-grid-wrapper"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                >
                    {isLoaded && watchlist.length === 0 ? (
                        <div className="playlist-empty-state">
                            <h2>No movies here yet</h2>
                            <button className="browse-movies-btn" onClick={() => navigate("/dashboard")}>
                                Browse Movies
                            </button>
                        </div>
                    ) : (
                        <div className="movie-grid">
                            {watchlist.map((item, index) => (
                                <div key={item.id} className="movie-card group">
                                    <div className="card-3d">
                                        <div className={`card-inner ${infoOpenId === item.movieId ? 'flipped' : ''}`} style={{ borderRadius: '24px' }}>
                                            <div className="front">
                                                <img 
                                                    src={item.movie.posterUrl} 
                                                    alt={item.movie.title} 
                                                    style={{ borderRadius: '24px' }} 
                                                />

                                                <button
                                                    className="menu-trigger"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenMenuId(openMenuId === item.movieId ? null : item.movieId);
                                                    }}
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                >
                                                    <FiMoreVertical size={20} color="white" />
                                                </button>

                                                {openMenuId === item.movieId && (
                                                    <div className="movie-menu" onPointerDown={(e) => e.stopPropagation()}>
                                                        <button onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingId(item.movieId);
                                                            setOpenMenuId(null);
                                                            setInfoOpenId(null);
                                                        }}>
                                                            <FiEdit2 size={16} /> Edit
                                                        </button>
                                                        <button onClick={(e) => {
                                                            e.stopPropagation();
                                                            remove(item.movieId);
                                                            setOpenMenuId(null);
                                                        }}>
                                                            <HiOutlineTrash size={16} /> Delete
                                                        </button>
                                                        <button onClick={(e) => {
                                                            e.stopPropagation();
                                                            setInfoOpenId(infoOpenId === item.movieId ? null : item.movieId);
                                                            setOpenMenuId(null);
                                                        }}>
                                                            <FiInfo size={16} /> Info
                                                        </button>
                                                    </div>
                                                )}

                                                {editingId === item.movieId && (
                                                    <div
                                                        className="edit-overlay-panel"
                                                        onPointerDown={(e) => e.stopPropagation()}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <h3 className="edit-form-title">{item.movie.title}</h3>
                                                        <div className="edit-form-content">
                                                            <select
                                                                value={item.status || "plan_to_watch"}
                                                                onChange={(e) => change(index, 'status', e.target.value)}
                                                                className="edit-select"
                                                            >
                                                                <option value="plan_to_watch">Plan to watch</option>
                                                                <option value="watching">Watching</option>
                                                                <option value="watched">Watched</option>
                                                            </select>

                                                            <StarRating item={item} index={index} />

                                                            <textarea
                                                                value={item.review || ''}
                                                                onChange={(e) => change(index, 'review', e.target.value)}
                                                                placeholder="Your thoughts..."
                                                                className="edit-textarea"
                                                            />
                                                        </div>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                saveUpdate(item);
                                                            }}
                                                            className="save-btn"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* ✅ Back Card logic is fixed to show DIARY data, not TMDB data */}
                                            <div
                                                className="back"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setInfoOpenId(null);
                                                }}
                                            >
                                                <div className="info-section">
                                                    <span className="info-label">My Status</span>
                                                    <span className="info-value">
                                                        {item.status ? item.status.replace(/_/g, ' ') : 'Not set'}
                                                    </span>
                                                </div>

                                                <div className="info-section">
                                                    <span className="info-label">My Rating</span>
                                                    <div className="info-stars-centered">
                                                        {[1, 2, 3, 4, 5].map((star) => (
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
                                                    <span className="info-label">My Review</span>
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
                    )}
                </Motion.div>
            </AnimatePresence>

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
    );
}

export default WishlistPage;