import React from 'react'
import { Sparkles, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Renders a global top-right header-style button to open AI Nova
const GlobalAINovaButton: React.FC = () => {
  const { isAuthenticated } = useAuth()
  
  const [hidden, setHidden] = React.useState(false)

  const openAINova = () => {
    window.dispatchEvent(new Event('open-ainova'))
  }

  React.useEffect(() => {
    const onOpen = () => setHidden(true)
    const onClose = () => setHidden(false)
    window.addEventListener('ainova-open', onOpen)
    window.addEventListener('ainova-close', onClose)
    return () => {
      window.removeEventListener('ainova-open', onOpen)
      window.removeEventListener('ainova-close', onClose)
    }
  }, [])

  return (
    !hidden && (
    <button
      id="global-ainova-button"
      onClick={openAINova}
      className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[60] h-16 w-16 group overflow-hidden rounded-2xl ${
        isAuthenticated 
          ? 'bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 hover:from-indigo-600 hover:via-fuchsia-600 hover:to-pink-600' 
          : 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 hover:from-gray-500 hover:via-gray-600 hover:to-gray-700'
      } text-white shadow-2xl hover:shadow-[0_12px_35px_rgba(168,85,247,0.45)] transition-all duration-500 flex items-center justify-center px-0 hover:w-48 hover:justify-start hover:px-4 hover:rounded-2xl backdrop-blur-sm border border-white/20 [transform:perspective(800px)_translateZ(0)] hover:[transform:perspective(800px)_translateZ(20px)]`}
      aria-label={isAuthenticated ? "Open AI Nova" : "AI Nova (Login Required)"}
      title={isAuthenticated ? "AI Nova" : "AI Nova - Please log in to use"}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-fuchsia-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

      {/* Pulsing gradient ring */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-400 via-fuchsia-400 to-pink-400 opacity-30 animate-pulse"></div>

      {/* Shimmer sweep */}
      <div className="pointer-events-none absolute inset-0 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-[900ms] ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      
      <div className="relative flex items-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 group-hover:rotate-6 transition-transform duration-500">
          {isAuthenticated ? (
            <Sparkles size={24} className="text-white drop-shadow-sm animate-[spin_6s_linear_infinite]" />
          ) : (
            <Lock size={20} className="text-white drop-shadow-sm" />
          )}
        </div>
        <span className="w-0 overflow-hidden whitespace-nowrap text-sm font-semibold ml-0 opacity-0 scale-95 transition-all duration-500 group-hover:w-auto group-hover:ml-4 group-hover:opacity-100 group-hover:scale-100 drop-shadow-sm" aria-hidden>
          {isAuthenticated ? 'AI Nova' : 'Login Required'}
        </span>
      </div>
    </button>)
  )
}

export default GlobalAINovaButton


