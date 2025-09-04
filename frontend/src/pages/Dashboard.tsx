import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Clock, Users, TrendingUp, Search, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { courseAPI, APIError } from '../utils/api'
import type { Enrollment, Course } from '../utils/api'
import Chatbot from '../components/Chatbot'

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEnrollments()
  }, [])

  const loadEnrollments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await courseAPI.getUserEnrollments({ limit: 6 })
      
      if (response.success) {
        setEnrollments(response.data.enrollments)
      }
    } catch (error) {
      console.error('Failed to load enrollments:', error)
      setError(error instanceof APIError ? error.message : 'Failed to load courses')
    } finally {
      setLoading(false)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'active':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'paused':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-zara-gray bg-zara-offwhite border-zara-lightsilver'
    }
  }

  const completedCourses = enrollments.filter(e => e.status === 'completed').length
  const activeCourses = enrollments.filter(e => e.status === 'active').length
  const totalWatchTime = enrollments.reduce((total, enrollment) => {
    const course = enrollment.courseId as Course
    return total + (course.duration || 0) * (enrollment.progress.overallPercentage / 100)
  }, 0)

  return (
    <div className="min-h-screen bg-zara-white">
      {/* Header */}
      <header className="border-b border-zara-lightsilver">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-serif font-normal text-zara-black tracking-wide">
              LEARNHUB
            </h1>
            <nav className="flex items-center space-x-6">
              <Link
                to="/courses"
                className="text-sm font-light text-zara-charcoal hover:text-zara-black transition-colors duration-200 tracking-wide uppercase"
              >
                Browse Courses
              </Link>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-light text-zara-charcoal">{user?.name}</p>
                  <p className="text-xs font-light text-zara-gray uppercase tracking-wider">
                    {user?.role}
                  </p>
                </div>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 text-sm font-light tracking-wide uppercase border border-zara-lightsilver text-zara-charcoal hover:border-zara-black hover:text-zara-black transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-light text-zara-black mb-4 tracking-wide">
            Welcome back, <em className="font-serif">{user?.name}</em>
          </h1>
          <p className="text-lg font-light text-zara-gray">Continue your learning journey</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-zara-offwhite p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <BookOpen size={24} className="text-zara-charcoal" />
              <span className="text-2xl font-light text-zara-black">{enrollments.length}</span>
            </div>
            <p className="text-sm font-light text-zara-gray">Total Courses</p>
          </div>

          <div className="bg-zara-offwhite p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp size={24} className="text-zara-charcoal" />
              <span className="text-2xl font-light text-zara-black">{activeCourses}</span>
            </div>
            <p className="text-sm font-light text-zara-gray">Active Courses</p>
          </div>

          <div className="bg-zara-offwhite p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <Clock size={24} className="text-zara-charcoal" />
              <span className="text-2xl font-light text-zara-black">{formatDuration(Math.round(totalWatchTime))}</span>
            </div>
            <p className="text-sm font-light text-zara-gray">Learning Time</p>
          </div>

          <div className="bg-zara-offwhite p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <Users size={24} className="text-zara-charcoal" />
              <span className="text-2xl font-light text-zara-black">{completedCourses}</span>
            </div>
            <p className="text-sm font-light text-zara-gray">Completed</p>
          </div>
        </div>

        {/* My Learning Section */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-light text-zara-black">My Learning</h2>
            <Link
              to="/courses"
              className="inline-flex items-center text-sm font-light text-zara-charcoal hover:text-zara-black transition-colors duration-200 tracking-wide uppercase"
            >
              <Plus size={16} className="mr-2" />
              Find New Course
            </Link>
          </div>

          {error && (
            <div className="mb-8 p-4 border border-red-200 bg-red-50 rounded">
              <p className="text-sm text-red-600 font-light">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-zara-lightsilver h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-zara-lightsilver rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-zara-lightsilver rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen size={48} className="mx-auto mb-6 text-zara-lightgray" />
              <h3 className="text-xl font-light text-zara-black mb-4">Start Your Learning Journey</h3>
              <p className="text-zara-gray font-light mb-8 max-w-md mx-auto">
                You haven't enrolled in any courses yet. Browse our catalog to find courses that match your interests.
              </p>
              <Link
                to="/courses"
                className="inline-block px-8 py-4 text-sm font-light tracking-wide uppercase bg-zara-black text-zara-white hover:bg-zara-charcoal transition-colors duration-200"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => {
                const course = enrollment.courseId as Course
                return (
                  <div key={enrollment._id} className="bg-white border border-zara-lightsilver rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    {/* Course Image */}
                    <div className="h-48 bg-gradient-to-br from-zara-silver to-zara-lightsilver flex items-center justify-center">
                      <BookOpen size={32} className="text-zara-gray" />
                    </div>

                    {/* Course Info */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-light text-zara-gray uppercase tracking-wider">
                          {course.category}
                        </span>
                        <span className={`text-xs font-light px-2 py-1 rounded border capitalize ${getStatusColor(enrollment.status)}`}>
                          {enrollment.status}
                        </span>
                      </div>

                      <h3 className="text-lg font-normal text-zara-black mb-2">
                        {course.title}
                      </h3>

                      <p className="text-sm font-light text-zara-gray mb-4 line-clamp-2">
                        {course.shortDescription}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center text-xs font-light text-zara-gray mb-2">
                          <span>Progress</span>
                          <span>{enrollment.progress.overallPercentage}%</span>
                        </div>
                        <div className="w-full bg-zara-lightsilver h-2 rounded">
                          <div 
                            className="bg-zara-charcoal h-2 rounded transition-all duration-300"
                            style={{ width: `${enrollment.progress.overallPercentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-xs font-light text-zara-gray">
                          {enrollment.progress.videosCompleted} of {enrollment.progress.totalVideos} lessons
                        </div>
                        <Link
                          to={`/course/${course._id}/learn`}
                          className="text-sm font-light text-zara-black hover:text-zara-charcoal transition-colors duration-200"
                        >
                          {enrollment.progress.overallPercentage > 0 ? 'Continue' : 'Start'} →
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-zara-offwhite p-8 rounded-lg">
          <h3 className="text-xl font-light text-zara-black mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/courses"
              className="flex items-center p-6 bg-zara-white border border-zara-lightsilver rounded-lg hover:shadow-md transition-shadow duration-200 group"
            >
              <Search size={24} className="mr-4 text-zara-charcoal group-hover:text-zara-black transition-colors duration-200" />
              <div>
                <h4 className="font-normal text-zara-black mb-1">Explore Courses</h4>
                <p className="text-sm font-light text-zara-gray">Discover new learning opportunities</p>
              </div>
            </Link>

            <div className="flex items-center p-6 bg-zara-white border border-zara-lightsilver rounded-lg">
              <TrendingUp size={24} className="mr-4 text-zara-charcoal" />
              <div>
                <h4 className="font-normal text-zara-black mb-1">Track Progress</h4>
                <p className="text-sm font-light text-zara-gray">Monitor your learning journey</p>
              </div>
            </div>

            <div className="flex items-center p-6 bg-zara-white border border-zara-lightsilver rounded-lg">
              <Users size={24} className="mr-4 text-zara-charcoal" />
              <div>
                <h4 className="font-normal text-zara-black mb-1">Join Community</h4>
                <p className="text-sm font-light text-zara-gray">Connect with other learners</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      <Chatbot />
    </div>
  )
}

export default Dashboard