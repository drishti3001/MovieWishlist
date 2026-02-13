import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 text-center">

      <h1 className="text-5xl font-bold">🎬 MovieVault</h1>
      <p className="text-gray-400">Track movies. Rate them. Never forget what to watch next.</p>

      <div className="flex gap-4">
        <Link
          to="/login"
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
        >
          Login
        </Link>

        <Link
          to="/signup"
          className="px-6 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition"
        >
          Create Account
        </Link>
      </div>

    </main>
  )
}

export default HomePage
