import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Star, Clock, Users, BookOpen, Play, 
  CheckCircle, Lock, FileText 
} from 'lucide-react'
import { courseAPI, APIError } from '../utils/api'
import type { Course, Video, Enrollment } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  
  const [course, setCourse] = useState<Course | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (courseId) {
      loadCourseDetails()
    }
  }, [courseId, isAuthenticated])

  const loadCourseDetails = async () => {
    if (!courseId) return

    try {
      setLoading(true)
      setError(null)

      const response = await courseAPI.getCourse(courseId)
      
      if (response.success) {
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
    return `$${price}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zara-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zara-black mx-auto mb-4"></div>
          <p className="text-zara-gray font-light">Loading course...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-zara-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-zara-gray font-light mb-4">{error || 'Course not found'}</p>
          <Link
            to="/courses"
            className="inline-block px-6 py-3 text-sm font-light tracking-wide uppercase bg-zara-black text-zara-white hover:bg-zara-charcoal transition-colors duration-200"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zara-white">
      {/* Header */}
      <header className="border-b border-zara-lightsilver">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/courses"
                className="text-zara-charcoal hover:text-zara-black transition-colors duration-200"
              >
                <ArrowLeft size={20} />
              </Link>
              <Link to="/dashboard" className="flex-shrink-0">
                <h1 className="text-xl font-serif font-normal text-zara-black tracking-wide">
                  LEARNHUB
                </h1>
              </Link>
            </div>
            <nav className="flex items-center space-x-6">
              <Link
                to="/dashboard"
                className="text-sm font-light text-zara-charcoal hover:text-zara-black transition-colors duration-200 tracking-wide uppercase"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Course Header */}
      <section className="py-12 bg-zara-offwhite">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-sm font-light text-zara-gray uppercase tracking-wider">
                  {course.category}
                </span>
                <span className="text-sm font-light text-zara-gray uppercase tracking-wider">
                  {course.level}
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-light text-zara-black mb-6 tracking-wide">
                {course.title}
              </h1>

              <p className="text-lg font-light text-zara-gray mb-8 leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm font-light text-zara-gray">
                <div className="flex items-center">
                  <Clock size={16} className="mr-2" />
                  {formatDuration(course.duration)}
                </div>
                <div className="flex items-center">
                  <Users size={16} className="mr-2" />
                  {course.enrollmentCount} students
                </div>
                {course.rating.count > 0 && (
                  <div className="flex items-center">
                    <Star size={16} className="mr-2" />
                    {course.rating.average.toFixed(1)} ({course.rating.count} reviews)
                  </div>
                )}
                <div className="flex items-center">
                  <BookOpen size={16} className="mr-2" />
                  {videos.length} lessons
                </div>
              </div>

              <div className="mt-8">
                <p className="text-sm font-light text-zara-gray mb-2">Instructor</p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-zara-lightsilver rounded-full flex items-center justify-center mr-4">
                    <span className="text-zara-charcoal font-light text-lg">
                      {course.instructor.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-normal text-zara-black">{course.instructor.name}</p>
                    <p className="text-sm font-light text-zara-gray">{course.instructor.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="bg-zara-white border border-zara-lightsilver rounded-lg p-6 sticky top-6">
                {/* Course Image */}
                <div className="aspect-w-16 aspect-h-9 bg-zara-lightsilver rounded mb-6">
                  <div className="w-full h-40 bg-gradient-to-br from-zara-silver to-zara-lightsilver flex items-center justify-center">
                    <BookOpen size={32} className="text-zara-gray" />
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-3xl font-light text-zara-black mb-2">
                    {formatPrice(course.price)}
                  </div>
                  {course.price > 0 && (
                    <p className="text-sm font-light text-zara-gray">One-time payment</p>
                  )}
                </div>

                {error && (
                  <div className="mb-4 p-3 border border-red-200 bg-red-50 rounded">
                    <p className="text-sm text-red-600 font-light">{error}</p>
                  </div>
                )}

                {!isAuthenticated ? (
                  <Link
                    to="/login"
                    className="block w-full py-4 px-6 text-center text-sm font-light tracking-wide uppercase bg-zara-black text-zara-white hover:bg-zara-charcoal transition-colors duration-200"
                  >
                    Sign In to Enroll
                  </Link>
                ) : isEnrolled ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center text-green-600 mb-4">
                      <CheckCircle size={24} className="mr-2" />
                      <span className="font-normal">Enrolled</span>
                    </div>
                    {enrollment && (
                      <div className="mb-4">
                        <div className="text-sm font-light text-zara-gray mb-2">
                          Progress: {enrollment.progress.overallPercentage}%
                        </div>
                        <div className="w-full bg-zara-lightsilver h-2 rounded">
                          <div 
                            className="bg-green-500 h-2 rounded transition-all duration-300"
                            style={{ width: `${enrollment.progress.overallPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <Link
                      to={`/course/${course._id}/learn`}
                      className="block w-full py-4 px-6 text-center text-sm font-light tracking-wide uppercase bg-zara-black text-zara-white hover:bg-zara-charcoal transition-colors duration-200"
                    >
                      Continue Learning
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full py-4 px-6 text-sm font-light tracking-wide uppercase bg-zara-black text-zara-white hover:bg-zara-charcoal transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}

                {/* Course Includes */}
                <div className="mt-8 pt-8 border-t border-zara-lightsilver">
                  <h4 className="font-normal text-zara-black mb-4">This course includes:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center text-sm font-light text-zara-gray">
                      <Play size={16} className="mr-3 text-zara-charcoal" />
                      {videos.length} video lessons
                    </li>
                    <li className="flex items-center text-sm font-light text-zara-gray">
                      <Clock size={16} className="mr-3 text-zara-charcoal" />
                      {formatDuration(course.duration)} total content
                    </li>
                    <li className="flex items-center text-sm font-light text-zara-gray">
                      <FileText size={16} className="mr-3 text-zara-charcoal" />
                      Downloadable resources
                    </li>
                    <li className="flex items-center text-sm font-light text-zara-gray">
                      <CheckCircle size={16} className="mr-3 text-zara-charcoal" />
                      Certificate of completion
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* What You'll Learn */}
              {course.learningOutcomes.length > 0 && (
                <div>
                  <h3 className="text-2xl font-light text-zara-black mb-6">What you'll learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.learningOutcomes.map((outcome, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle size={16} className="mr-3 mt-1 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-light text-zara-gray">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {course.requirements.length > 0 && (
                <div>
                  <h3 className="text-2xl font-light text-zara-black mb-6">Requirements</h3>
                  <ul className="space-y-2">
                    {course.requirements.map((requirement, index) => (
                      <li key={index} className="text-sm font-light text-zara-gray">
                        • {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Course Curriculum */}
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-light text-zara-black mb-6">Course content</h3>
              <div className="space-y-2">
                {videos.map((video, index) => (
                  <div
                    key={video._id}
                    className="flex items-center justify-between p-4 border border-zara-lightsilver rounded hover:bg-zara-offwhite transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      {video.isPreview ? (
                        <Play size={16} className="mr-3 text-zara-charcoal" />
                      ) : isEnrolled ? (
                        video.progress?.isCompleted ? (
                          <CheckCircle size={16} className="mr-3 text-green-600" />
                        ) : (
                          <Play size={16} className="mr-3 text-zara-charcoal" />
                        )
                      ) : (
                        <Lock size={16} className="mr-3 text-zara-lightgray" />
                      )}
                      <div>
                        <p className="text-sm font-light text-zara-black">
                          {index + 1}. {video.title}
                        </p>
                        {video.isPreview && (
                          <span className="text-xs text-green-600 font-light">Preview</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-light text-zara-gray">
                      {formatVideoDuration(video.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CourseDetailPage
