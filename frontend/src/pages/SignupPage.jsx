import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SignupPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    setErrorMessage('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setErrorMessage(data?.message || 'Signup failed')
        return
      }

      // 🚀 go to login page after account creation
      navigate('/login', { replace: true })

    } catch {
      setErrorMessage('Failed to reach backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <h1>Signup Page</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      {errorMessage && <p>{errorMessage}</p>}
    </main>
  )
}

export default SignupPage
