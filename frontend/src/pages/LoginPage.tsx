import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, error, clearError } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear error when user starts typing
    if (error) {
      clearError()
    }
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (error) {
      // Error is handled by AuthContext
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zara-white">
      {/* Header */}
      <header className="border-b border-zara-lightsilver">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-xl font-serif font-normal text-zara-black tracking-wide">
                LEARNHUB
              </h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-zara-black mb-4 tracking-wide">
              SIGN IN
            </h2>
            <p className="text-zara-gray font-light">
              Access your learning dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="border border-red-200 bg-red-50 p-4">
                <div className="text-sm text-red-600 font-light">{error}</div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-0 py-3 text-zara-black bg-transparent border-0 border-b border-zara-lightsilver focus:border-zara-black focus:outline-none placeholder-zara-lightgray transition-colors duration-200"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-0 py-3 text-zara-black bg-transparent border-0 border-b border-zara-lightsilver focus:border-zara-black focus:outline-none placeholder-zara-lightgray transition-colors duration-200"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-8 text-sm font-light tracking-zara uppercase bg-zara-black text-zara-white hover:bg-zara-charcoal transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            <div className="text-center pt-8 space-y-4">
              <p className="text-sm font-light text-zara-gray">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-zara-black hover:text-zara-charcoal border-b border-zara-black pb-0.5 transition-colors duration-200"
                >
                  Create one
                </Link>
              </p>
              
              <Link
                to="/"
                className="inline-block text-sm font-light text-zara-gray hover:text-zara-black transition-colors duration-200"
              >
                ← Back to home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage