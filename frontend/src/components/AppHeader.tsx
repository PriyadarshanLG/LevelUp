import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import React, { useState } from 'react'
import AIQuizModal from './AIQuizModal'
import { ArrowLeft } from 'lucide-react'


type AppHeaderProps = {
  rightContent?: React.ReactNode
  showBackButton?: boolean
}

const AppHeader: React.FC<AppHeaderProps> = ({ rightContent, showBackButton }) => {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [showQuiz, setShowQuiz] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Determine if back button should be shown
  const shouldShowBack = showBackButton !== undefined 
    ? showBackButton 
    : !['/dashboard', '/', '/landing'].includes(location.pathname)

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Name - Left Side */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {shouldShowBack && (
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <Link to="/" className="group flex items-center transition-all duration-500 ease-out hover:scale-105">
              <div className="relative">
                <img 
                  src="/level up.png" 
                  alt="LevelUp Logo" 
                  className="h-24 sm:h-28 w-auto object-contain transition-all duration-500 ease-out group-hover:rotate-6 group-hover:scale-110"
                  style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-righteous font-semibold whitespace-nowrap -ml-6 transition-all duration-300">
                <span className="text-black dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">Level</span><span className="text-orange-500 group-hover:text-orange-600 group-hover:drop-shadow-lg transition-all duration-300">Up</span>
              </h1>
            </Link>
          </div>

          {/* Right Side Content */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setShowQuiz(true)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md transition-all"
            >
              AI Quiz
            </button>
            {rightContent}
            <button
              onClick={toggleTheme}
              className="group relative p-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-600/30 dark:hover:border-indigo-400/30 hover:shadow-lg hover:shadow-indigo-600/10 dark:hover:shadow-indigo-400/10 transition-all duration-200"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <span className="relative z-10 flex items-center">
                <div className="transition-transform duration-500 group-hover:rotate-[360deg]">
                  {theme === 'light' ? (
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707z"/></svg>
                  )}
                </div>
              </span>
            </button>

            {user && (
              <Link to="/profile" className="flex items-center space-x-2 group">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-0.5 relative transition-transform duration-300 group-hover:scale-110">
                  <div className="w-full h-full rounded-[6px] bg-white dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                  {user.name}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <AIQuizModal isOpen={showQuiz} onClose={() => setShowQuiz(false)} />
    </header>
  )
}

export default AppHeader






