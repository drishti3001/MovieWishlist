import "./auth.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

function SignupPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignup = async () => {
    setError("")
    setLoading(true)

    try {
      const res = await fetch("http://localhost:4000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Signup failed")
        return
      }

      // After signup → go to login
      navigate("/login")

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
        <h1>Create Account</h1>

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
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        {error && <p style={{color:"salmon"}}>{error}</p>}

        <p className="switch">
          Already have an account? <span onClick={()=>navigate("/login")}>Log in</span>
        </p>
      </div>
    </div>
  )
}

export default SignupPage
