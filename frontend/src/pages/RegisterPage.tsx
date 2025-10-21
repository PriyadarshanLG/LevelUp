import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { UserPlus, Mail, Lock, Eye, EyeOff, ArrowLeft, Moon, Sun } from 'lucide-react'


const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { register, error, clearError } = useAuth()
  const { theme, toggleTheme } = useTheme()
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
    <div className="min-h-screen flex">
      {/* Dark Mode Toggle - Desktop */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 text-white hover:text-blue-300 rounded-xl border border-white/20 hover:border-blue-300/30 hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </button>

      {/* Left Panel - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 ease-in-out hover:scale-105"
          style={{
            backgroundImage: 'url("/register2.jpg")',
            backgroundPosition: 'center center',
            backgroundSize: 'cover'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-indigo-900/50"></div>
        <div className="absolute inset-0 bg-white/5"></div>

        {/* Animated Light Rays */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-blue-300/30 to-transparent transform rotate-12 animate-pulse"></div>
          <div className="absolute top-0 right-1/3 w-0.5 h-full bg-gradient-to-b from-transparent via-indigo-300/25 to-transparent transform -rotate-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-gradient-to-br from-blue-400/60 to-indigo-400/60 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-gradient-to-br from-indigo-400/70 to-blue-400/70 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-gradient-to-br from-blue-300/50 to-indigo-300/50 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        </div>

        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-transparent rounded-br-full"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-indigo-400/20 to-transparent rounded-tl-full"></div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center text-white">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 border border-white/30">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-2">Join <span className="text-black">Level</span><span className="text-orange-500">Up</span></h1>
              <p className="text-lg text-white/90">Create an account to begin your journey</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-8 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6 text-center animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200">
              <ArrowLeft size={18} className="mr-2" />
              Back to home
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex items-center -space-x-1 justify-center">
            <img src="/level up.png" alt="LevelUp Logo" className="h-16 sm:h-[70px] lg:h-[110px] w-auto object-contain" />
            <h1 className="text-xl font-bold"><span className="text-black">Level</span><span className="text-orange-500">Up</span></h1>
          </div>
        </div>

        <div className="max-w-sm mx-auto w-full">
          <div className="mb-8 text-center lg:text-left animate-slide-up">
            <div className="flex items-center justify-center lg:justify-start -space-x-1 mb-4">
              <img src="/level up.png" alt="LevelUp Logo" className="h-16 sm:h-[70px] lg:h-[110px] w-auto object-contain" />
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Create your account</h2>
                <p className="text-sm text-gray-700 font-medium">Join our learning community</p>
              </div>
            </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {(error || localError) && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 animate-fade-in">
                  <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div className="text-sm text-red-700 font-medium">{error || localError}</div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserPlus className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ease-in-out text-gray-900 placeholder-gray-500 text-sm shadow-sm hover:shadow-md transform hover:-translate-y-1"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ease-in-out text-gray-900 placeholder-gray-500 text-sm shadow-sm hover:shadow-md transform hover:-translate-y-1"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ease-in-out text-gray-900 placeholder-gray-500 text-sm shadow-sm hover:shadow-md transform hover:-translate-y-1"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-200 p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 ease-in-out text-gray-900 placeholder-gray-500 text-sm shadow-sm hover:shadow-md transform hover:-translate-y-1"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-200 p-1"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-100 animate-slide-up"
                style={{ animationDelay: '0.5s' }}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create account
                  </div>
                )}
              </button>

            <div className="text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-300 ease-in-out transform hover:scale-105">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage