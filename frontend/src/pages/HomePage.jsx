import { useNavigate } from "react-router-dom"
import "./HomePage.css"

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-container">

      {/* BACKGROUND VIDEO */}
      <video autoPlay muted loop playsInline className="bg-video">
        <source src="/bg.mp4" type="video/mp4" />
      </video>

      {/* DARK OVERLAY */}
      <div className="video-overlay" />

      {/* NAVBAR */}
      <header className="navbar">
        <div className="logo">CineTrack</div>

        <button className="login-btn" onClick={() => navigate("/login")}>
          Sign In
        </button>
      </header>

      {/* HERO CONTENT */}
      <main className="hero">
        <div className="glass-box">
          <h1>Track. Rate. Remember.</h1>
          <p>Your personal cinema diary.</p>

          <button className="cta-btn" onClick={() => navigate("/signup")}>
            Get Started
          </button>
        </div>
      </main>

    </div>
  )
}

export default HomePage
