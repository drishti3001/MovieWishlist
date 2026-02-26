import React, { useState } from 'react';
import './modal.css';
import { API_ENDPOINTS } from '../api';

function CreatePlaylistModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_ENDPOINTS.PLAYLISTS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      if (res.ok) {
        setName("");
        onSuccess(); // Refresh the sidebar list
        onClose();   // Close the modal
      }
    } catch (err) {
      console.error("Failed to create playlist", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Playlist</h2>
        <input 
          type="text" 
          placeholder="e.g., Weekend Thrillers" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn" onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Save Playlist"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePlaylistModal;