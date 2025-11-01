import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { Moon, Sun, BookOpen, Video, Users, BarChart, Bot, Award } from 'lucide-react'

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 sm:h-24">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="group flex items-center transition-all duration-500 ease-out hover:scale-105">
                <div className="relative">
                  <img 
                    src="/level up.png" 
                    alt="LevelUp Logo" 
                    className="h-24 sm:h-28 w-auto object-contain transition-all duration-500 ease-out group-hover:rotate-6 group-hover:scale-110"
                    style={{ filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.5))' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-indigo-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-righteous font-semibold whitespace-nowrap -ml-6 transition-all duration-300">
                  <span className="text-black dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">Level</span><span className="text-orange-500 group-hover:text-orange-600 group-hover:drop-shadow-lg transition-all duration-300">Up</span>
                </h1>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="group relative p-2.5 text-sm font-medium text-white/80 hover:text-white rounded-xl transition-colors duration-200"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <span className="relative z-10 flex items-center">
                  <div className="transition-transform duration-500 group-hover:rotate-[360deg]">
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                  </div>
                </span>
              </button>
              <Link
                to="/login"
                className="group px-6 py-3 text-sm font-medium text-white/80 hover:text-white rounded-xl transition-colors duration-300 tracking-wide"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="group relative inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 tracking-wide transform hover:-translate-y-0.5"
              >
                <span>Get Started</span>
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden perspective-1000">
        {/* Advanced Background with Parallax */}
        <div 
          className="absolute inset-0 z-0 transition-transform duration-1000 ease-out parallax-slow" 
          style={{
            backgroundImage: 'url("/src/assets/images/student-learning.jpg")',
            backgroundSize: 'auto 100%',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat',
            minHeight: '100vh',
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
          {/* Animated gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/20 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-blue-900/20 via-transparent to-pink-900/20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 z-5 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Geometric Shapes */}
        <div className="absolute inset-0 z-5 pointer-events-none">
          <div className="absolute top-20 left-20 w-20 h-20 border-2 border-purple-400/30 rotate-45 animate-spin" style={{ animationDuration: '20s' }}></div>
          <div className="absolute top-40 right-32 w-16 h-16 border-2 border-blue-400/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 left-32 w-12 h-12 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rotate-12 animate-bounce"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 border-2 border-indigo-400/30 rounded-full animate-ping"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-3xl mx-auto text-center">
          <div className="backdrop-blur-sm bg-black/20 p-6 sm:p-10 rounded-3xl border border-white/10 hover:bg-black/30 transition-all duration-500 group">
            <h1 className="mb-6 relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-relaxed">
              <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0.1s' }}>Elevate Your</span>
              <span className="block mt-2 sm:mt-3 bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-500 text-transparent bg-clip-text animate-gradient-x hover:animate-pulse transition-all duration-300">
                Learning Journey
              </span>
              {/* Simple floating particles */}
              <div className="absolute -top-4 -right-4 w-3 h-3 bg-purple-400 rounded-full opacity-60 animate-float" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-indigo-400 rounded-full opacity-60 animate-float" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 -right-8 w-1 h-1 bg-blue-400 rounded-full opacity-60 animate-float" style={{ animationDelay: '1.5s' }}></div>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              Embark on a transformative learning experience. Access premium courses crafted by industry experts to elevate your skills and accelerate your career growth.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-6 flex flex-col sm:flex-row items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <Link
                to="/register"
                className="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-base font-medium tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/40 transform hover:-translate-y-1 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center">
                  Start Learning Now
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                to="/courses"
                className="group relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-base font-medium tracking-wider border border-white/30 text-white/80 hover:text-white rounded-xl transform hover:-translate-y-1 transition-all duration-300 hover:bg-white/10 hover:border-white/50"
              >
                <span className="relative z-10 flex items-center">
                  Explore Courses
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden bg-gray-50 dark:bg-gray-900/50 perspective-1000">
        {/* Advanced Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50 dark:from-indigo-900/20 dark:via-transparent dark:to-purple-900/20"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 dark:bg-purple-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-16 h-16 border-2 border-indigo-300/30 rotate-45 animate-spin" style={{ animationDuration: '15s' }}></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 left-40 w-20 h-20 border-2 border-blue-300/30 rounded-full animate-ping"></div>
          <div className="absolute bottom-40 right-40 w-8 h-8 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rotate-12 animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100 animate-zoom-in">
              Why Choose <span className="transition-colors duration-300"><span className="text-black">Level</span><span className="text-orange-500">Up</span></span>?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Experience a comprehensive learning platform designed for your success, packed with features to elevate your skills.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, title: 'Premium Content', description: 'Access carefully curated courses created by industry experts for maximum value.' },
              { icon: Video, title: 'Live Sessions', description: 'Join interactive live sessions with instructors and get real-time feedback.' },
              { icon: BarChart, title: 'Track Progress', description: 'Monitor your learning journey with detailed analytics and set goals.' },
              { icon: Bot, title: 'AI Assistant', description: 'Get instant, personalized guidance with our intelligent assistant, available 24/7.' },
              { icon: Users, title: 'Community', description: 'Join a vibrant community of learners to share knowledge and grow together.' },
              { icon: Award, title: 'Certification', description: 'Earn industry-recognized certificates to boost your professional profile.' },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-gray-700/50 transform hover:-translate-y-2 hover:rotate-0.5 animate-bounce-in magnetic-hover transform-3d"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Glass effect overlay */}
                  <div className="absolute inset-0 rounded-2xl glass-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6 relative overflow-hidden animate-pulse-glow">
                    <Icon className="w-8 h-8 text-white relative z-10 group-hover:animate-spin" style={{ animationDuration: '2s' }} />
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {/* Multiple sparkle effects */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-sparkle"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-sparkle" style={{ animationDelay: '0.3s' }}></div>
                    <div className="absolute top-1/2 -left-2 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-sparkle" style={{ animationDelay: '0.6s' }}></div>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 rounded-2xl animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 transform group-hover:translate-x-1 group-hover:scale-105">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300 transform group-hover:translate-y-1">
                    {feature.description}
                  </p>
                  
                  {/* Advanced hover indicators */}
                  <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 group-hover:w-full transition-all duration-500 rounded-full"></div>
                  <div className="absolute top-0 right-0 w-0 h-1 bg-gradient-to-l from-pink-500 to-purple-500 group-hover:w-full transition-all duration-500 rounded-full" style={{ transitionDelay: '0.1s' }}></div>
                  
                  {/* Magnetic effect particles */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-4 left-4 w-1 h-1 bg-purple-400 rounded-full animate-float"></div>
                    <div className="absolute bottom-4 right-4 w-1 h-1 bg-indigo-400 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute top-1/2 left-2 w-0.5 h-0.5 bg-pink-400 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden bg-white dark:bg-gray-900 perspective-1000">
        {/* Advanced animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50 dark:from-indigo-900/20 dark:via-transparent dark:to-purple-900/20"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-200/30 dark:bg-indigo-800/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-200/30 dark:bg-purple-800/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200/20 dark:bg-pink-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-indigo-400/40 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${4 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 text-center">
            <div className="group p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 transform hover:-translate-y-2 hover:scale-105 hover:rotate-0.5 transition-all duration-500 border border-gray-200 dark:border-gray-700/50 hover:border-indigo-200 dark:hover:border-indigo-700/50 animate-zoom-in magnetic-hover transform-3d" style={{ animationDelay: '0.1s' }}>
              
              <div className="relative">
                <div className="text-5xl sm:text-6xl font-bold text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                  10,000+
                </div>
                {/* Multiple animated counter effects */}
                <div className="absolute inset-0 text-5xl sm:text-6xl font-bold text-indigo-300 dark:text-indigo-500 mb-3 opacity-0 group-hover:opacity-30 group-hover:animate-pulse transition-all duration-300">
                  10,000+
                </div>
                <div className="absolute inset-0 text-5xl sm:text-6xl font-bold text-purple-300 dark:text-purple-500 mb-3 opacity-0 group-hover:opacity-20 group-hover:animate-bounce transition-all duration-300" style={{ animationDelay: '0.2s' }}>
                  10,000+
                </div>
              </div>
              
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 tracking-wider uppercase group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 transform group-hover:translate-y-1">
                Students Enrolled
              </div>
              
              {/* Advanced progress bar with shimmer */}
              <div className="mt-4 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transform origin-left group-hover:scale-x-100 scale-x-0 transition-transform duration-1000 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
              
              {/* Sparkle effects */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 animate-sparkle transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 animate-sparkle transition-opacity duration-300" style={{ animationDelay: '0.3s' }}></div>
            </div>

            <div className="group p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 transform hover:-translate-y-2 hover:scale-105 hover:-rotate-0.5 transition-all duration-500 border border-gray-200 dark:border-gray-700/50 hover:border-indigo-200 dark:hover:border-indigo-700/50 animate-rotate-in magnetic-hover transform-3d" style={{ animationDelay: '0.2s' }}>
              
              <div className="relative">
                <div className="text-5xl sm:text-6xl font-bold text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                  500+
                </div>
                {/* Multiple animated counter effects */}
                <div className="absolute inset-0 text-5xl sm:text-6xl font-bold text-indigo-300 dark:text-indigo-500 mb-3 opacity-0 group-hover:opacity-30 group-hover:animate-pulse transition-all duration-300">
                  500+
                </div>
                <div className="absolute inset-0 text-5xl sm:text-6xl font-bold text-pink-300 dark:text-pink-500 mb-3 opacity-0 group-hover:opacity-20 group-hover:animate-bounce transition-all duration-300" style={{ animationDelay: '0.2s' }}>
                  500+
                </div>
              </div>
              
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 tracking-wider uppercase group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 transform group-hover:translate-y-1">
                Expert-Led Courses
              </div>
              
              {/* Advanced progress bar with shimmer */}
              <div className="mt-4 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transform origin-left group-hover:scale-x-100 scale-x-0 transition-transform duration-1000 relative" style={{ transitionDelay: '0.2s' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
              
              {/* Sparkle effects */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 animate-sparkle transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 animate-sparkle transition-opacity duration-300" style={{ animationDelay: '0.3s' }}></div>
            </div>

            <div className="group p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 transform hover:-translate-y-2 hover:scale-105 hover:rotate-0.5 transition-all duration-500 border border-gray-200 dark:border-gray-700/50 hover:border-indigo-200 dark:hover:border-indigo-700/50 animate-bounce-in magnetic-hover transform-3d" style={{ animationDelay: '0.3s' }}>
              
              <div className="relative">
                <div className="text-5xl sm:text-6xl font-bold text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform duration-300 animate-pulse-glow">
                  95%
                </div>
                {/* Multiple animated counter effects */}
                <div className="absolute inset-0 text-5xl sm:text-6xl font-bold text-indigo-300 dark:text-indigo-500 mb-3 opacity-0 group-hover:opacity-30 group-hover:animate-pulse transition-all duration-300">
                  95%
                </div>
                <div className="absolute inset-0 text-5xl sm:text-6xl font-bold text-green-300 dark:text-green-500 mb-3 opacity-0 group-hover:opacity-20 group-hover:animate-bounce transition-all duration-300" style={{ animationDelay: '0.2s' }}>
                  95%
                </div>
              </div>
              
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 tracking-wider uppercase group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 transform group-hover:translate-y-1">
                Satisfaction Rate
              </div>
              
              {/* Advanced progress bar with shimmer */}
              <div className="mt-4 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transform origin-left group-hover:scale-x-100 scale-x-0 transition-transform duration-1000 relative" style={{ transitionDelay: '0.4s' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
              
              {/* Sparkle effects */}
              <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 animate-sparkle transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 animate-sparkle transition-opacity duration-300" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden perspective-1000">
        {/* Advanced Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50 dark:from-indigo-900/20 dark:via-transparent dark:to-purple-900/20"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 dark:bg-purple-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Floating Course Icons */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-lg rotate-12 animate-float"></div>
          <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-lg -rotate-12 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-40 w-14 h-14 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-lg rotate-45 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-40 right-40 w-10 h-10 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg -rotate-45 animate-float" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100 animate-zoom-in">
              Explore Our <span className="text-indigo-600 dark:text-indigo-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">Featured Courses</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Handpicked courses to help you achieve your career goals.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Course Card 1 */}
            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-0.5 overflow-hidden border border-gray-100 dark:border-gray-700 magnetic-hover transform-3d animate-bounce-in" style={{ animationDelay: '0.1s' }}>
              {/* Glass effect overlay */}
              <div className="absolute inset-0 rounded-2xl glass-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative overflow-hidden">
                <img src="/c.jpg" alt="Course" className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500" />
                {/* Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Course badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow">
                  C++
                </div>
                {/* Sparkle effect */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 animate-sparkle transition-opacity duration-300"></div>
              </div>
              
              <div className="p-6 relative">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300 transform group-hover:translate-x-1">
                  Introduction to C++
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                  Master the fundamentals of C++ and object-oriented programming.
                </p>
                <Link to="/courses" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 flex items-center">
                  Learn More 
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                {/* Progress indicator */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-500 rounded-full"></div>
              </div>
            </div>
            
            {/* Course Card 2 */}
            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:-rotate-0.5 overflow-hidden border border-gray-100 dark:border-gray-700 magnetic-hover transform-3d animate-bounce-in" style={{ animationDelay: '0.2s' }}>
              {/* Glass effect overlay */}
              <div className="absolute inset-0 rounded-2xl glass-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative overflow-hidden">
                <img src="/java.jpg" alt="Course" className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500" />
                {/* Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Course badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-orange-600 text-white text-xs font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow">
                  Java
                </div>
                {/* Sparkle effect */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 animate-sparkle transition-opacity duration-300"></div>
              </div>
              
              <div className="p-6 relative">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300 transform group-hover:translate-x-1">
                  Advanced Java Programming
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                  Deep dive into advanced Java concepts for enterprise-level applications.
                </p>
                <Link to="/courses" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300 flex items-center">
                  Learn More 
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                {/* Progress indicator */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 group-hover:w-full transition-all duration-500 rounded-full"></div>
              </div>
            </div>
            
            {/* Course Card 3 */}
            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:rotate-0.5 overflow-hidden border border-gray-100 dark:border-gray-700 magnetic-hover transform-3d animate-bounce-in" style={{ animationDelay: '0.3s' }}>
              {/* Glass effect overlay */}
              <div className="absolute inset-0 rounded-2xl glass-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative overflow-hidden">
                <img src="/python.jpg" alt="Course" className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500" />
                {/* Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Course badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow">
                  Python
                </div>
                {/* Sparkle effect */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 animate-sparkle transition-opacity duration-300"></div>
              </div>
              
              <div className="p-6 relative">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300 transform group-hover:translate-x-1">
                  Python for Data Science
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                  Learn Python and its powerful libraries for data analysis and visualization.
                </p>
                <Link to="/courses" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300 flex items-center">
                  Learn More 
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                {/* Progress indicator */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-green-500 to-blue-500 group-hover:w-full transition-all duration-500 rounded-full"></div>
              </div>
            </div>
            
            {/* Course Card 4 */}
            <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:-rotate-0.5 overflow-hidden border border-gray-100 dark:border-gray-700 magnetic-hover transform-3d animate-bounce-in" style={{ animationDelay: '0.4s' }}>
              {/* Glass effect overlay */}
              <div className="absolute inset-0 rounded-2xl glass-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative overflow-hidden">
                <img src="/react.jpg" alt="Course" className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500" />
                {/* Image overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Course badge */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-glow">
                  React
                </div>
                {/* Sparkle effect */}
                <div className="absolute top-4 right-4 w-3 h-3 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-sparkle transition-opacity duration-300"></div>
              </div>
              
              <div className="p-6 relative">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 transform group-hover:translate-x-1">
                  Modern Web Development with React
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                  Build dynamic and responsive web applications using React.
                </p>
                <Link to="/courses" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 flex items-center">
                  Learn More 
                  <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                {/* Progress indicator */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 group-hover:w-full transition-all duration-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 relative overflow-hidden bg-white dark:bg-gray-900 perspective-1000">
        {/* Advanced Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-transparent to-purple-50/30 dark:from-indigo-900/10 dark:via-transparent dark:to-purple-900/10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 dark:bg-purple-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Floating Quote Marks */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 text-6xl text-indigo-200/20 dark:text-indigo-800/20 font-serif animate-float">"</div>
          <div className="absolute bottom-20 right-20 text-6xl text-purple-200/20 dark:text-purple-800/20 font-serif animate-float" style={{ animationDelay: '1s' }}>"</div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-gray-100 animate-slide-in-left">
              What Our <span className="text-indigo-600 dark:text-indigo-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">Students Say</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              Real stories from learners who transformed their careers with <span className="text-black">Level</span><span className="text-orange-500">Up</span>.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="group p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-gray-700/50 transform hover:-translate-y-2 hover:rotate-0.5 animate-flip magnetic-hover transform-3d" style={{ animationDelay: '0.1s' }}>
              {/* Glass effect overlay */}
              <div className="absolute inset-0 rounded-2xl glass-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Quote icon */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300 transform group-hover:translate-y-1">
                "<span className="text-black">Level</span><span className="text-orange-500">Up</span>'s courses are top-notch. The content is relevant, up-to-date, and easy to follow. I was able to land a promotion after completing the Advanced Java course."
              </p>
              
              <div className="flex items-center transform group-hover:translate-x-2 transition-transform duration-300">
                <div className="relative">
                  <img className="w-12 h-12 rounded-full object-cover mr-4 group-hover:scale-110 transition-transform duration-300" src="https://randomuser.me/api/portraits/women/44.jpg" alt="Avatar" />
                  {/* Sparkle effect on avatar */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 animate-sparkle transition-opacity duration-300"></div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                    Priya Sharma
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                    Software Engineer, Bangalore
                  </p>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-500 rounded-full"></div>
            </div>

            {/* Testimonial 2 */}
            <div className="group p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-gray-700/50 transform hover:-translate-y-2 hover:-rotate-0.5 animate-flip magnetic-hover transform-3d" style={{ animationDelay: '0.2s' }}>
              {/* Glass effect overlay */}
              <div className="absolute inset-0 rounded-2xl glass-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Quote icon */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300 transform group-hover:translate-y-1">
                "The hands-on projects and quizzes were incredibly helpful in solidifying my understanding of the concepts. The community is also very supportive."
              </p>
              
              <div className="flex items-center transform group-hover:translate-x-2 transition-transform duration-300">
                <div className="relative">
                  <img className="w-12 h-12 rounded-full object-cover mr-4 group-hover:scale-110 transition-transform duration-300" src="https://randomuser.me/api/portraits/men/32.jpg" alt="Avatar" />
                  {/* Sparkle effect on avatar */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 animate-sparkle transition-opacity duration-300"></div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                    Rajesh Kumar
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                    Data Scientist, Mysore
                  </p>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-500 rounded-full"></div>
            </div>

            {/* Testimonial 3 */}
            <div className="group p-8 bg-gray-50 dark:bg-gray-800/50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 dark:border-gray-700/50 transform hover:-translate-y-2 hover:rotate-0.5 animate-flip magnetic-hover transform-3d" style={{ animationDelay: '0.3s' }}>
              {/* Glass effect overlay */}
              <div className="absolute inset-0 rounded-2xl glass-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Quote icon */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                </svg>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300 transform group-hover:translate-y-1">
                "I highly recommend <span className="text-black">Level</span><span className="text-orange-500">Up</span> to anyone looking to upskill. The platform is user-friendly, and the instructors are experts in their fields."
              </p>
              
              <div className="flex items-center transform group-hover:translate-x-2 transition-transform duration-300">
                <div className="relative">
                  <img className="w-12 h-12 rounded-full object-cover mr-4 group-hover:scale-110 transition-transform duration-300" src="https://randomuser.me/api/portraits/women/22.jpg" alt="Avatar" />
                  {/* Sparkle effect on avatar */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 animate-sparkle transition-opacity duration-300"></div>
            </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                    Ananya Reddy
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                    UX Designer, Hubli
                  </p>
          </div>
        </div>
              
              {/* Progress indicator */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-green-500 to-blue-500 group-hover:w-full transition-all duration-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900/50 dark:to-gray-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/30 via-transparent to-purple-100/30 dark:from-indigo-900/20 dark:via-transparent dark:to-purple-900/20"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 dark:bg-purple-800/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight animate-fade-in-up">
            Ready to Transform Your <span className="text-indigo-600 dark:text-indigo-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">Career</span>?
            </h2>
          <p className="text-lg sm:text-xl font-light text-gray-600 dark:text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Join thousands of professionals who have elevated their skills through our platform.
            </p>
          <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Link
            to="/register"
              className="group relative inline-flex items-center px-12 py-4 text-base font-medium tracking-wide text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/40 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 overflow-hidden"
          >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center">
            Begin Now
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
              </span>
              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-xl bg-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-500"></div>
          </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700/50 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1 lg:col-span-1 space-y-6">
              <Link to="/" className="group flex items-center -space-x-1 hover:scale-105 transition-transform duration-300">
                <img 
                  src="/level up.png" 
                  alt="LevelUp Logo" 
                  className="h-16 sm:h-[70px] lg:h-[110px] w-auto object-contain group-hover:rotate-12 transition-transform duration-300"
                />
                <h2 className="text-2xl font-righteous font-medium tracking-wider group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                  <span className="text-black">Level</span><span className="text-orange-500">Up</span>
                </h2>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Transforming education through technology and innovation. Join us in shaping the future of learning.
              </p>
              <div className="flex space-x-5">
                <a href="#" className="group text-gray-400 hover:text-indigo-600 transition-all duration-300 transform hover:-translate-y-1 hover:scale-110">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="group text-gray-400 hover:text-sky-600 transition-all duration-300 transform hover:-translate-y-1 hover:scale-110">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="group text-gray-400 hover:text-gray-900 transition-all duration-300 transform hover:-translate-y-1 hover:scale-110">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 col-span-1 md:col-span-1 lg:col-span-3 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Learning
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/courses" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
                      Browse Courses
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
                      Learning Paths
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
                      Mentorship
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
                      Live Sessions
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Resources
                </h4>
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
                      Success Stories
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
                      Help Center
                    </a>
                  </li>
                </ul>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Stay Updated
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Subscribe to our newsletter for the latest updates and exclusive content.
                </p>
                <form className="space-y-3">
                  <div>
                    <label htmlFor="email-address" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="email-address"
                      type="email"
                      autoComplete="email"
                      required
                      className="w-full px-4 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-300"
                      placeholder="Enter your email"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transform hover:-translate-y-0.5 transition-all duration-300 shadow-sm"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200 dark:border-gray-700/50">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 <span className="text-black">Level</span><span className="text-orange-500">Up</span> L G . All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
                  Terms of Service
                </a>
                <a href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300">
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage