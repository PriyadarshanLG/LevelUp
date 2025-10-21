import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { 
  ArrowLeft, Star, Clock, Users, BookOpen, Play, 
  CheckCircle, Lock, FileText, Download, Award, ChevronRight
} from 'lucide-react'
import { courseAPI, certificateAPI, APIError, feedbackAPI } from '../utils/api'
import type { Course, Video, Enrollment, Certificate, Feedback } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

const AccordionItem = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        className="w-full flex justify-between items-center py-4 px-2 text-left text-lg font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <ChevronRight className={`w-5 h-5 transform transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
          {children}
        </div>
      </div>
    </div>
  );
};


const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { theme, toggleTheme } = useTheme()
  
  const [course, setCourse] = useState<Course | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [unenrolling, setUnenrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [generatingCertificate, setGeneratingCertificate] = useState(false)
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([])
  const [myRating, setMyRating] = useState<number>(0)
  const [myComment, setMyComment] = useState<string>('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  // Open shared notes drive (applies to all courses)
  const openNotesDrive = () => {
    const url = 'https://drive.google.com/drive/folders/1Ua8yyBZ8lnk4Vrwg-2jwigq0DwKxSSWY'
    window.open(url, '_blank', 'noopener')
  }

  useEffect(() => {
    if (courseId) {
      loadCourseDetails()
      loadFeedback()
    }
  }, [courseId, isAuthenticated])

  const loadCourseDetails = async () => {
    if (!courseId) return

    try {
      setLoading(true)
      setError(null)

      const response = await courseAPI.getCourse(courseId)
      
      if (response.success) {
        console.log("Full course data from API:", response.data.course);
        setCourse(response.data.course)
        setVideos(response.data.videos)
        setIsEnrolled(response.data.isEnrolled)
        setEnrollment(response.data.enrollment)
      }
    } catch (error) {
      console.error('Failed to load course:', error)
      setError(error instanceof APIError ? error.message : 'Failed to load course')
    } finally {
      setLoading(false)
    }
  }

  const loadFeedback = async () => {
    if (!courseId) return
    try {
      const res = await feedbackAPI.getCourseFeedback(courseId)
      if (res.success) setFeedbackList(res.data.feedback)
    } catch (e) {
      // ignore feedback load errors in UI
    }
  }

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId) return
    if (!isAuthenticated) {
      setError('Please log in to submit feedback')
      return
    }
    if (myRating < 1 || myRating > 5) {
      setError('Please select a rating between 1 and 5')
      return
    }
    try {
      setSubmittingFeedback(true)
      setError(null)
      const res = await feedbackAPI.submitFeedback(courseId, myRating, myComment.trim() || undefined)
      if (res.success) {
        setMyRating(0)
        setMyComment('')
        await loadCourseDetails()
        await loadFeedback()
      }
    } catch (err) {
      setError(err instanceof APIError ? err.message : 'Failed to submit feedback')
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const handleEnroll = async () => {
    if (!courseId || !isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      setEnrolling(true)
      setError(null)

      const response = await courseAPI.enrollCourse(courseId)
      
      if (response.success) {
        setIsEnrolled(true)
        setEnrollment(response.data.enrollment)
        // Reload course to get updated videos
        loadCourseDetails()
      }
    } catch (error) {
      console.error('Enrollment failed:', error)
      setError(error instanceof APIError ? error.message : 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

  const handleUnenroll = async () => {
    if (!courseId || !isAuthenticated) {
      navigate('/login')
      return
    }
    try {
      setUnenrolling(true)
      setError(null)
      const response = await courseAPI.unenrollCourse(courseId)
      if (response.success) {
        setIsEnrolled(false)
        setEnrollment(null)
        // Reload course details to ensure proper video gating
        loadCourseDetails()
      }
    } catch (error) {
      console.error('Unenroll failed:', error)
      setError(error instanceof APIError ? error.message : 'Unenroll failed')
    } finally {
      setUnenrolling(false)
    }
  }

  const handleGenerateCertificate = async () => {
    if (!courseId) return

    if (!isAuthenticated) {
      setError('Please log in to generate a certificate')
      return
    }

    try {
      setGeneratingCertificate(true)
      setError(null)

      console.log('Generating certificate for course:', courseId)
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Certificate generation timeout')), 30000)
      )
      
      const response = await Promise.race([
        certificateAPI.generateCertificate(courseId),
        timeoutPromise
      ])
      
      if (response.success) {
        setCertificate(response.data.certificate)
        // Auto-download the certificate
        handleDownloadCertificate(response.data.certificate._id)
      }
    } catch (error) {
      console.error('Failed to generate certificate:', error)
      setError(error instanceof APIError ? error.message : 'Failed to generate certificate')
    } finally {
      setGeneratingCertificate(false)
    }
  }

  const handleDownloadCertificate = async (certificateId: string) => {
    try {
      const blob = await certificateAPI.downloadCertificate(certificateId)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${course?.title.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download certificate:', error)
      setError('Failed to download certificate')
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatVideoDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free'
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price)
    } catch {
      return `₹${price}`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="relative p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-2xl blur opacity-20"></div>
          <div className="relative text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
              <p className="text-gray-600 dark:text-gray-300 font-light animate-pulse">Loading your course...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-6">
        <div className="relative w-full max-w-md">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:shadow-gray-900 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-400 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-light mb-6">{error || 'Course not found'}</p>
              <Link
                to="/courses"
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-lg hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                Browse Courses
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/courses"
                className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
              >
                <ArrowLeft size={20} className="text-gray-600 group-hover:text-gray-900" />
              </Link>
              <Link to="/dashboard" className="flex-shrink-0 group flex items-center -space-x-1">
                <img src="/level up.png" alt="LevelUp Logo" className="h-16 sm:h-[70px] lg:h-[110px] w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:rotate-3" />
                <span className="hidden sm:block text-xl font-righteous font-semibold"><span className="text-black">Level</span><span className="text-orange-500">Up</span></span>
              </Link>
            </div>
            <nav className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/dashboard"
                className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                Dashboard
              </Link>
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Course Header */}
      <section className="pt-12 sm:pt-16 pb-16 sm:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
        <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl transform translate-x-16 -translate-y-8 sm:translate-x-32 sm:-translate-y-16 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-400/20 to-pink-400/20 rounded-full blur-3xl transform -translate-x-16 translate-y-8 sm:-translate-x-32 sm:translate-y-16 animate-pulse" style={{animationDelay:'1.2s'}}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-3 mb-6 sm:mb-8 animate-slide-up">
                <span className="px-4 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-full ring-1 ring-indigo-600/10 dark:ring-indigo-400/20">
                  {course.category}
                </span>
                <span className="px-4 py-1.5 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-full ring-1 ring-purple-600/10 dark:ring-purple-400/20">
                  {course.level}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 drop-shadow-sm mb-6 sm:mb-8 leading-tight animate-gradient">
                {course.title}
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-10 leading-relaxed max-w-3xl animate-slide-up" style={{animationDelay:'80ms'}}>
                {course.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12">
                <div className="group relative transform hover:-translate-y-1 transition-all duration-300 animate-slide-up">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                  <div className="relative p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl">
                    <div className="flex items-center mb-3">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                        <div className="relative p-3 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-lg">
                          <Clock size={20} className="text-white" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">{formatDuration(course.duration)}</p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</p>
                  </div>
                </div>

                <div className="group relative transform hover:-translate-y-1 transition-all duration-300 animate-slide-up" style={{animationDelay:'60ms'}}>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                  <div className="relative p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl">
                    <div className="flex items-center mb-3">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                        <div className="relative p-3 bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg">
                          <Users size={20} className="text-white" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-400">{course.enrollmentCount}</p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Students</p>
                  </div>
                </div>

                <div className="group relative transform hover:-translate-y-1 transition-all duration-300 animate-slide-up" style={{animationDelay:'120ms'}}>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-300 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                  <div className="relative p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl">
                    <div className="flex items-center mb-3">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                        <div className="relative p-3 bg-gradient-to-r from-amber-500 to-amber-300 rounded-lg">
                          <Star size={20} className="text-white" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-300">
                      {course.rating.average.toFixed(1)}
                    </p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{course.rating.count} Reviews</p>
                  </div>
                </div>

                <div className="group relative transform hover:-translate-y-1 transition-all duration-300 animate-slide-up" style={{animationDelay:'180ms'}}>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-green-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                  <div className="relative p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-2xl">
                    <div className="flex items-center mb-3">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-green-100 dark:bg-green-900/30 rounded-lg transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                        <div className="relative p-3 bg-gradient-to-r from-green-600 to-green-400 rounded-lg">
                          <BookOpen size={20} className="text-white" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-400">{videos.length}</p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lessons</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 sm:mt-12">
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">Course Instructor</p>
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                  <div className="relative flex items-center p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                    <div className="relative mr-6">
                      <div className="absolute -inset-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full blur opacity-25 animate-pulse"></div>
                      <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {course.instructor.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{course.instructor.name}</p>
                      <p className="text-gray-600 dark:text-gray-400">{course.instructor.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl p-4 sm:p-6 sticky top-24 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(79,70,229,0.15)]">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-2xl blur opacity-20"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl">
                    {/* Course Image */}
                    <div className="rounded-xl overflow-hidden mb-6 border border-gray-100 dark:border-gray-700 bg-white group/image relative">
                      <img
                        src={course.thumbnail || '/level up.png'}
                        alt={`${course.title} thumbnail`}
                        className="w-full h-48 object-cover transform transition-transform duration-500 group-hover/image:scale-105"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/level up.png' }}
                      />
                      <div className="pointer-events-none absolute inset-0 translate-x-[-120%] group-hover/image:translate-x-[120%] transition-transform duration-[900ms] ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    </div>

                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                        {formatPrice(course.price)}
                      </div>
                      {course.price > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">One-time payment • Lifetime access</p>
                      )}
                    </div>

                    {error && (
                      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-red-400 dark:text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
                        </div>
                      </div>
                    )}

                    {!isAuthenticated ? (
                      <Link
                        to="/login"
                        className="block w-full py-4 px-6 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        Sign In to Enroll
                      </Link>
                    ) : isEnrolled ? (
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-6">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle size={20} className="text-green-600" />
                          </div>
                          <span className="font-medium text-green-600">Successfully Enrolled</span>
                        </div>
                        {enrollment && (
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Course Progress</span>
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{enrollment.progress.overallPercentage}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                              <div 
                                className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 transition-all duration-500"
                                style={{ width: `${enrollment.progress.overallPercentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                        <Link
                          to={`/course/${course._id}/learn`}
                          className="group/cta block w-full py-4 px-6 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg"
                        >
                          <span className="inline-flex items-center">Continue Learning <ChevronRight className="ml-1 w-4 h-4 transform group-hover/cta:translate-x-0.5 transition-transform"/></span>
                        </Link>
                      </div>
                    ) : (
                      <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="group/cta w-full py-4 px-6 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
                      >
                        {enrolling ? (
                          <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enrolling...
                          </div>
                        ) : (
                          <span className="inline-flex items-center">Enroll Now <ChevronRight className="ml-1 w-4 h-4 transform group-hover/cta:translate-x-0.5 transition-transform"/></span>
                        )}
                      </button>
                    )}

                    {isEnrolled && (
                      <button
                        onClick={handleUnenroll}
                        disabled={unenrolling}
                        className="mt-3 w-full py-3 px-6 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-red-500 hover:text-red-600 transition-all duration-300 disabled:opacity-50"
                      >
                        {unenrolling ? 'Removing...' : 'Unenroll from Course'}
                      </button>
                    )}

                    {/* Course Includes */}
                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">This course includes:</h4>
                      <ul className="space-y-4">
                        <li className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg transition-transform duration-200 hover:-translate-y-0.5">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                            <Play size={16} className="text-purple-600 dark:text-purple-400" />
                          </div>
                          <span>{videos.length} video lessons</span>
                        </li>
                        <li className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg transition-transform duration-200 hover:-translate-y-0.5">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                            <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <span>{formatDuration(course.duration)} total content</span>
                        </li>
                        <li
                          className="flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-all duration-200 hover:-translate-y-0.5"
                          onClick={openNotesDrive}
                          title="Open course notes"
                        >
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                            <FileText size={16} className="text-green-600 dark:text-green-400" />
                          </div>
                          <span>Downloadable resources</span>
                        </li>
                        <li 
                          className="group/certi flex items-center text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-all duration-200 hover:-translate-y-0.5"
                          onClick={handleGenerateCertificate}
                        >
                          <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mr-3">
                            {generatingCertificate ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-600 border-t-transparent"></div>
                            ) : (
                              <Award size={16} className="text-yellow-600 dark:text-yellow-400" />
                            )}
                          </div>
                          <span className="relative">
                            {generatingCertificate ? 'Generating certificate...' : 'Certificate of completion'}
                            <span className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent opacity-0 group-hover/certi:opacity-100 transition-opacity"></span>
                          </span>
                          {certificate && (
                            <Download size={14} className="ml-2 text-green-600 dark:text-green-400" />
                          )}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8 sm:space-y-12">
              {/* What You'll Learn */}
              {course.learningOutcomes.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sm:p-8 hover:shadow-md transition-all duration-300">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6">
                    What you'll learn
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {course.learningOutcomes.map((outcome, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 rounded-lg">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle size={14} className="text-white" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {course.requirements.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sm:p-8 hover:shadow-md transition-all duration-300">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6">
                    Requirements
                  </h3>
                  <ul className="space-y-4">
                    {course.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right side - curriculum */}
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sm:p-8 hover:shadow-md transition-all duration-300">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400 mb-6">
                  Course Content
                </h3>
                <div className="space-y-3">
                  {videos.map((video, index) => (
                    <div
                      key={video._id}
                      className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-600 dark:hover:to-gray-600 transition-all duration-300 hover:-translate-y-0.5 hover:shadow"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          video.isPreview 
                            ? 'bg-green-100' 
                            : isEnrolled
                              ? video.progress?.isCompleted
                                ? 'bg-green-100'
                                : 'bg-blue-100'
                              : 'bg-gray-100'
                        }`}>
                          {video.isPreview ? (
                            <Play size={16} className="text-green-600" />
                          ) : isEnrolled ? (
                            video.progress?.isCompleted ? (
                              <CheckCircle size={16} className="text-green-600" />
                            ) : (
                              <Play size={16} className="text-blue-600" />
                            )
                          ) : (
                            <Lock size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">
                            {index + 1}. {video.title}
                          </p>
                          {video.isPreview && (
                            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                              Preview
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                        {formatVideoDuration(video.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* New Sections */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sm:p-8 hover:shadow-md transition-all duration-300">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent mb-6">Course Insights</h3>
                <div className="space-y-2">
                  {course.importantTopics && course.importantTopics.length > 0 && (
                    <AccordionItem title="Important Topics">
                      <ul className="space-y-3 list-disc list-inside">
                        {course.importantTopics.map((topic, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{topic}</li>
                        ))}
                      </ul>
                    </AccordionItem>
                  )}
                  {course.timeManagement && course.timeManagement.length > 0 && (
                    <AccordionItem title="Time Management Guide">
                      <ul className="space-y-3 list-decimal list-inside">
                        {course.timeManagement.map((item, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{item}</li>
                        ))}
                      </ul>
                    </AccordionItem>
                  )}
                  {course.tipsAndTricks && course.tipsAndTricks.length > 0 && (
                    <AccordionItem title="Tips & Tricks">
                      <ul className="space-y-3 list-disc list-inside">
                        {course.tipsAndTricks.map((tip, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{tip}</li>
                        ))}
                      </ul>
                    </AccordionItem>
                  )}
                  {course.weeklyAssignments && course.weeklyAssignments.length > 0 && (
                    <AccordionItem title="Weekly Assignments">
                      <div className="space-y-4">
                        {course.weeklyAssignments.map((assignment, index) => (
                          <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">Week {assignment.week}: {assignment.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{assignment.description}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionItem>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Learner Feedback</h3>
                {feedbackList.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300">No feedback yet. Be the first to share your thoughts!</p>
                ) : (
                  <div className="space-y-4">
                    {feedbackList.map((f) => (
                      <div key={f._id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center">
                              {(f.userId || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-200">{new Date(f.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg key={i} className={`w-4 h-4 ${i < f.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.034a1 1 0 00-1.175 0l-2.802 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            ))}
                          </div>
                        </div>
                        {f.comment && <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{f.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
                <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Leave Feedback</h4>
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Rating</label>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setMyRating(i + 1)}
                          className="focus:outline-none"
                          aria-label={`Rate ${i + 1} stars`}
                        >
                          <svg className={`w-6 h-6 ${i < myRating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.034a1 1 0 00-1.175 0l-2.802 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comment (optional)</label>
                    <textarea
                      id="feedback"
                      rows={4}
                      value={myComment}
                      onChange={(e) => setMyComment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Share your thoughts about this course"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="w-full py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors disabled:opacity-50"
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CourseDetailPage