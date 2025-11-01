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
import CreateClassroom from './pages/CreateClassroom'
import MyClassrooms from './pages/MyClassrooms'
import JoinClassroom from './pages/JoinClassroom'
import StudentClassrooms from './pages/StudentClassrooms'
import ClassroomDetailPage from './pages/ClassroomDetailPage'
import AssignmentSubmissionsPage from './pages/AssignmentSubmissionsPage'
import AssignmentSubmitPage from './pages/AssignmentSubmitPage'
import ClassroomStatisticsPage from './pages/ClassroomStatisticsPage'
import AdminCreateCourse from './pages/AdminCreateCourse'
import AdminAddVideo from './pages/AdminAddVideo'
import TeacherDashboard from './pages/TeacherDashboard'
import PageTransition from './components/PageTransition'
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
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route 
          path="/login" 
          element={
            <PageTransition>
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PageTransition>
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            </PageTransition>
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/courses" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <CoursesPage />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/course/:courseId" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <CourseDetailPage />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/course/:courseId/learn" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <CourseLearningPage />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/course/:courseId/add-video" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <AdminAddVideo />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/admin/courses/new" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <AdminCreateCourse />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/teacher" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/quiz/:quizId/take" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <QuizTaking />
              </ProtectedRoute>
            </PageTransition>
          } 
        />

        {/* Profile Route */}
        <Route 
          path="/profile" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            </PageTransition>
          } 
        />

        {/* Classroom Routes */}
        <Route 
          path="/create-classroom" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <CreateClassroom />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/my-classrooms" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <MyClassrooms />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/join-classroom" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <JoinClassroom />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/student-classrooms" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <StudentClassrooms />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/classroom/:classroomId" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <ClassroomDetailPage />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/classroom/:classroomId/statistics" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <ClassroomStatisticsPage />
              </ProtectedRoute>
            </PageTransition>
          } 
        />

        {/* Assignment Routes */}
        <Route 
          path="/assignment/:assignmentId/submissions" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <AssignmentSubmissionsPage />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route 
          path="/assignment/:assignmentId/submit" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <AssignmentSubmitPage />
              </ProtectedRoute>
            </PageTransition>
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