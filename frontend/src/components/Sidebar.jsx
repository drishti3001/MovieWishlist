import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Sidebar.css'

function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate()

    return (
        <>
            {/* OVERLAY (Click to close) */}
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />

            {/* SLIDING PANEL */}
            <div className={`sidebar-panel ${isOpen ? 'open' : ''}`}>

                {/* Logo or Title inside sidebar (optional but looks nice) */}
                <h2 className="text-2xl font-bold mb-8 text-red-600 tracking-wider">CineTrack</h2>

                {/* Navigation Items */}
                <button
                    onClick={() => {
                        navigate('/wishlist')
                        onClose()
                    }}
                    className="sidebar-nav-btn"
                >
                    Wishlist
                </button>

            </div>
        </>
    )
}

export default Sidebar
