import "./auth.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { GoogleLogin } from "@react-oauth/google"
import { API_ENDPOINTS } from '../api';

function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async () => {
    setError("")
    setLoading(true)

    try {
      const res = await fetch(API_ENDPOINTS.LOGIN,{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Login failed")
        return
      }

      // SAVE TOKEN
      localStorage.setItem("token", data.token)

      // GO TO DASHBOARD
      navigate("/dashboard")

    } catch {
      setError("Server error")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("")
    try {
      const res = await fetch(API_ENDPOINTS.GOOGLE_AUTH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ credential: credentialResponse.credential })
      })

      let data = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }

      if (!res.ok) {
        setError(data.message || "Google authentication failed")
        return
      }

      if (!data.token) {
        setError("Google authentication failed")
        return
      }

      localStorage.setItem("token", data.token)
      navigate("/dashboard")
    } catch {
      setError("Google authentication failed")
    }
  }

  return (
    <div className="auth-page">

      <img src="/hawkins.jpg" alt="background" className="auth-bg" />

      <div className="auth-card">
        <h1>Welcome Back :)</h1>

        <div className="social-login-container">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google authentication failed")}
            theme="outline"
            shape="pill"
            width="100%"
          />
        </div>
        <div className="auth-separator">
        </div>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          className="auth-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        {error && <p style={{color:"salmon"}}>{error}</p>}

        <p className="switch">
          Don’t have an account? <span onClick={()=>navigate("/signup")}>Sign up</span>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
