import "./auth.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

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
      const res = await fetch("http://localhost:4000/login", {
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

  return (
    <div className="auth-page">

      <img src="/hawkins.jpg" alt="background" className="auth-bg" />

      <div className="auth-card">
        <h1>Welcome Back :)</h1>

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
