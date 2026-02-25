import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiTrash2 } from 'react-icons/fi'; // Ensure react-icons is installed
import CreatePlaylistModal from './CreatePlaylistModal';
import './Sidebar.css';

function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { playlistId } = useParams();
    const [playlists, setPlaylists] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);

    // 1. Fetch playlists from Backend
    const fetchPlaylists = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await fetch("http://localhost:4000/playlists", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setPlaylists(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch playlists", err);
        }
    };

    // 2. Delete Playlist
    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevents navigating to the playlist when clicking delete
        if (!window.confirm("Delete this playlist?")) return;
        
        const token = localStorage.getItem("token");
        try {
            await fetch(`http://localhost:4000/playlists/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchPlaylists(); // Refresh list
        } catch (err) {
            alert("Failed to delete playlist");
        }
    };

    useEffect(() => {
        if (isOpen) fetchPlaylists();
    }, [isOpen]);

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />

            <div className={`sidebar-panel ${isOpen ? 'open' : ''}`}>
                <h2 className="sidebar-logo">CineTrack</h2>

                <div className="sidebar-section-header">
                    <span>Your Playlists</span>
                    <button className="add-playlist-btn" onClick={() => setModalOpen(true)}>
                        <FiPlus size={20} />
                    </button>
                </div>

                <div className="playlist-list">
                    {playlists.length > 0 ? (
                        playlists.map((p) => (
                            <div key={p.id} className="playlist-item-container">
                                <button
                                    onClick={() => {
                                        navigate(`/playlist/${p.id}`);
                                        onClose();
                                    }}
                                    className={`sidebar-nav-btn ${String(playlistId) === String(p.id) ? 'active' : ''}`}
                                >
                                    {p.name}
                                </button>
                                <FiTrash2 
                                    className="trash-icon" 
                                    onClick={(e) => handleDelete(e, p.id)} 
                                />
                            </div>
                        ))
                    ) : (
                        <p className="no-playlists">No playlists yet.</p>
                    )}
                </div>
            </div>

            {/* Glass Blur Modal */}
            <CreatePlaylistModal 
                isOpen={isModalOpen} 
                onClose={() => setModalOpen(false)} 
                onSuccess={fetchPlaylists} 
            />
        </>
    );
}

export default Sidebar;
