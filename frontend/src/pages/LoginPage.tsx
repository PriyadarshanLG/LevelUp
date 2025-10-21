import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Eye, EyeOff, ArrowLeft, Sparkles, Mail, Lock, LogIn, Moon, Sun } from 'lucide-react'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const { login, error, clearError, isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

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
    <div className="min-h-screen flex">
      {/* Dark Mode Toggle - Desktop */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 text-white hover:text-green-400 rounded-xl border border-white/20 hover:border-green-400/30 hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </button>

      {/* Left Panel - Enhanced Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image with Enhanced Effects */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-100 transition-transform duration-3000 hover:scale-105"
          style={{
            backgroundImage: 'url("/login2.jpg")',
            backgroundPosition: 'center center',
            backgroundSize: 'cover'
          }}
        />
        
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 via-transparent to-emerald-900/50"></div>
        
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-white/5"></div>
        
        {/* Animated Light Rays - Enhanced */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-green-300/30 to-transparent transform rotate-12 animate-pulse"></div>
          <div className="absolute top-0 right-1/3 w-0.5 h-full bg-gradient-to-b from-transparent via-emerald-300/25 to-transparent transform -rotate-12 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-0 left-2/3 w-0.5 h-full bg-gradient-to-b from-transparent via-green-200/20 to-transparent transform rotate-6 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Enhanced Floating Particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-gradient-to-br from-green-400/60 to-emerald-400/60 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-gradient-to-br from-emerald-400/70 to-green-400/70 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-1/3 left-1/3 w-2.5 h-2.5 bg-gradient-to-br from-green-300/50 to-emerald-300/50 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
          <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-gradient-to-br from-emerald-400/60 to-green-400/60 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '3s', animationDuration: '3.5s' }}></div>
          <div className="absolute top-2/3 left-1/2 w-2 h-2 bg-gradient-to-br from-green-400/50 to-emerald-400/50 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '4s', animationDuration: '4.5s' }}></div>
        </div>
        
        {/* Enhanced Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200/10 to-transparent animate-pulse" style={{ animationDuration: '4s' }}></div>
        
        {/* Enhanced Corner Accents */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-green-400/20 to-transparent rounded-br-full"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-emerald-400/20 to-transparent rounded-tl-full"></div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center text-white">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 border border-white/30">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
              <p className="text-lg text-white/90">Sign in to continue your learning journey</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Enhanced Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-8 bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6 animate-fade-in text-center">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center text-gray-600 hover:text-green-600 transition-colors duration-200">
              <ArrowLeft size={18} className="mr-2" />
              Back to home
            </Link>
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 hover:text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 transition-all duration-200"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex items-center -space-x-1">
            <img 
              src="/level up.png" 
              alt="LevelUp Logo" 
              className="h-16 sm:h-[70px] lg:h-[110px] w-auto object-contain" 
            />
            <h1 className="text-xl font-bold"><span className="text-black">Level</span><span className="text-orange-500">Up</span></h1>
          </div>
        </div>

        <div className="max-w-sm mx-auto w-full">
          <div className="mb-8 animate-slide-up text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start -space-x-1 mb-4">
              <img 
                src="/level up.png" 
                alt="LevelUp Logo" 
                className="h-16 sm:h-[70px] lg:h-[110px] w-auto object-contain" 
              />
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Welcome back
                </h2>
                <p className="text-sm text-gray-700 font-medium">
                  Please sign in to your account
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 animate-fade-in">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-red-600 font-medium">{error}</div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-400 text-sm bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-900 placeholder-gray-400 text-sm bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500 transition-colors duration-200 p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 font-medium">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-semibold text-green-600 hover:text-green-500 transition-colors duration-200">
                  Forgot your password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] animate-slide-up"
              style={{ 
                backgroundColor: '#6B8E23',
                '--tw-ring-color': '#6B8E23',
                animationDelay: '0.4s'
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5A7A1F';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(107, 142, 35, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#6B8E23';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign in
                </div>
              )}
            </button>

            <div className="text-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-green-600 hover:text-green-500 transition-colors duration-200"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage