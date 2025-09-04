import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState('')
  
  const { register, error, clearError } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear errors when user starts typing
    if (error) {
      clearError()
    }
    if (localError) {
      setLocalError('')
    }
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLocalError('')

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      await register(formData.name, formData.email, formData.password)
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

      {/* Registration Form */}
      <div className="flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-zara-black mb-4 tracking-wide">
              CREATE ACCOUNT
            </h2>
            <p className="text-zara-gray font-light">
              Begin your learning journey
            </p>
          </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
          {(error || localError) && (
            <div className="border border-red-200 bg-red-50 p-4">
              <div className="text-sm text-red-600 font-light">{error || localError}</div>
            </div>
          )}

            <div className="space-y-6">
              <div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-0 py-3 text-zara-black bg-transparent border-0 border-b border-zara-lightsilver focus:border-zara-black focus:outline-none placeholder-zara-lightgray transition-colors duration-200"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

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
                  autoComplete="new-password"
                  required
                  className="w-full px-0 py-3 text-zara-black bg-transparent border-0 border-b border-zara-lightsilver focus:border-zara-black focus:outline-none placeholder-zara-lightgray transition-colors duration-200"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-0 py-3 text-zara-black bg-transparent border-0 border-b border-zara-lightsilver focus:border-zara-black focus:outline-none placeholder-zara-lightgray transition-colors duration-200"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
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
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center pt-8 space-y-4">
              <p className="text-sm font-light text-zara-gray">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-zara-black hover:text-zara-charcoal border-b border-zara-black pb-0.5 transition-colors duration-200"
                >
                  Sign in
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

export default RegisterPage