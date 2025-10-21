import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import CoursesPage from './pages/CoursesPage'
import CourseDetailPage from './pages/CourseDetailPage'
import CourseLearningPage from './pages/CourseLearningPage'
import ProfilePage from './pages/ProfilePage'
import QuizTaking from './components/QuizTaking'
import './App.css'
import GlobalAINovaButton from './components/GlobalAINovaButton'
import Chatbot from './components/Chatbot'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
  return (
      <div className="min-h-screen bg-zara-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zara-black mx-auto mb-4"></div>
          <p className="text-zara-gray font-light">Loading...</p>
        </div>
      </div>
    )
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zara-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zara-black mx-auto mb-4"></div>
          <p className="text-zara-gray font-light">Loading...</p>
        </div>
      </div>
    )
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>
}

// App Routes Component
const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-zara-white text-zara-charcoal">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/courses" 
          element={
            <ProtectedRoute>
              <CoursesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/course/:courseId" 
          element={
            <ProtectedRoute>
              <CourseDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/course/:courseId/learn" 
          element={
            <ProtectedRoute>
              <CourseLearningPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quiz/:quizId/take" 
          element={
            <ProtectedRoute>
              <QuizTaking />
            </ProtectedRoute>
          } 
        />

        {/* Profile Route */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route - redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppRoutes />
          {/* Global AI Nova trigger and chat widget */}
          <GlobalAINovaButton />
          <Chatbot showLauncher={false} />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App