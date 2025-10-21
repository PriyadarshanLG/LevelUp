import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, Clock, Users, BookOpen } from 'lucide-react'
import { courseAPI, APIError } from '../utils/api'
import type { Course } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import AppHeader from '../components/AppHeader'

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCourses, setTotalCourses] = useState(0)
  
  const { user } = useAuth()

  const levels = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' }
  ]

  // Load courses
  const loadCourses = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await courseAPI.getCourses({
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        level: selectedLevel || undefined,
        page: currentPage,
        limit: 12
      })

      if (response.success) {
        setCourses(response.data.courses)
        setTotalPages(response.data.pagination.totalPages)
        setTotalCourses(response.data.pagination.totalCourses)
      }
    } catch (error) {
      console.error('Failed to load courses:', error)
      setError(error instanceof APIError ? error.message : 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await courseAPI.getCategories()
      if (response.success) {
        setCategories([{ name: '', count: 0 }, ...response.data.categories])
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [searchTerm, selectedCategory, selectedLevel, currentPage])

  useEffect(() => {
    loadCategories()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadCourses()
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free'
    try {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price)
    } catch {
      return `₹${price}`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30">
      {/* Header (dashboard style) */}
      <AppHeader rightContent={
        <Link
          to="/dashboard"
          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-indigo-700 border border-indigo-200 rounded-xl bg-white/60 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200"
        >
          <span>Dashboard</span>
        </Link>
      } />

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50/30"></div>
        <div className="absolute top-0 left-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl transform translate-x-1/4 translate-y-1/4"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-bold mb-8 tracking-tight">
            <span className="block text-gray-900">Discover Your Next</span>
            <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Learning Adventure
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Explore our curated collection of premium courses designed to accelerate your growth and transform your skills.
          </p>
          <div className="flex justify-center space-x-4">
            <div className="flex items-center space-x-8 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100/20">
              <div className="text-center px-4">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {totalCourses}+
                </div>
                <div className="text-sm text-gray-600">Total Courses</div>
              </div>
              <div className="text-center px-4 border-x border-gray-200">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
              <div className="text-center px-4">
                <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  100%
                </div>
                <div className="text-sm text-gray-600">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-purple-50/50"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative group">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-600 transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 font-medium placeholder-gray-400 shadow-sm"
                />
              </div>
            </form>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative group">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 font-medium text-gray-700 pr-10 min-w-[180px] shadow-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.name || 'All Categories'} {category.count > 0 && `(${category.count})`}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-indigo-600 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative group">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="appearance-none px-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 font-medium text-gray-700 pr-10 min-w-[160px] shadow-sm"
                >
                  {levels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-indigo-600 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Results summary */}
          <div className="flex justify-between items-center mt-8">
            <p className="text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200/50 shadow-sm">
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="font-bold text-indigo-600 mr-1">{totalCourses}</span> courses found
                </span>
              )}
            </p>
            <div className="relative group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 font-medium text-gray-700 pr-10 shadow-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-indigo-600 transition-colors duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {error && (
            <div className="mb-8 p-4 border border-red-200 bg-red-50 rounded">
              <p className="text-sm text-red-600 font-light">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-zara-lightsilver h-48 rounded mb-4"></div>
                  <div className="h-4 bg-zara-lightsilver rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-zara-lightsilver rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {courses.map((course, index) => (
                <Link
                  key={course._id}
                  to={`/course/${course._id}`}
                  aria-label={`Open course ${course.title}`}
                  className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:rounded-2xl"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="group/card relative bg-white rounded-2xl overflow-hidden transition-all duration-300 transform will-change-transform animate-slide-up hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl">
                    {/* Hover glow / gradient border */}
                    <div className="pointer-events-none absolute -inset-px rounded-[1.05rem] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 blur group-hover/card:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>
                    {/* Course Image */}
                    <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={`${course.title} thumbnail`}
                          className="w-full h-48 object-cover transform transition-transform duration-500 group-hover/card:scale-110"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/level up.png' }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center relative">
                          <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                          <BookOpen size={32} className="text-white/90" />
                        </div>
                      )}
                      {/* Shine effect */}
                      <div className="pointer-events-none absolute inset-0 translate-x-[-120%] group-hover/card:translate-x-[120%] transition-transform duration-[900ms] ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    </div>

                    {/* Course Info */}
                    <div className="p-6 relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">
                          {course.category}
                        </span>
                        <span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded-full">
                          {course.level}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover/card:text-indigo-600 transition-colors duration-200">
                        {course.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {course.shortDescription}
                      </p>

                      <div className="flex items-center text-xs font-medium text-gray-500 space-x-4 mb-4">
                        <div className="flex items-center px-2 py-1 bg-gray-50 rounded-lg group-hover/card:bg-indigo-50 transition-colors">
                          <Clock size={14} className="mr-1.5 text-indigo-500" />
                          {formatDuration(course.duration)}
                        </div>
                        <div className="flex items-center px-2 py-1 bg-gray-50 rounded-lg group-hover/card:bg-purple-50 transition-colors">
                          <Users size={14} className="mr-1.5 text-purple-500" />
                          {course.enrollmentCount} students
                        </div>
                        {course.rating.count > 0 && (
                          <div className="flex items-center px-2 py-1 bg-gray-50 rounded-lg group-hover/card:bg-yellow-50 transition-colors">
                            <Star size={14} className="mr-1.5 text-yellow-500" />
                            {course.rating.average.toFixed(1)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 p-0.5 mr-2 group-hover/card:from-indigo-600 group-hover/card:to-purple-600 transition-colors">
                            <div className="w-full h-full rounded-[6px] bg-white flex items-center justify-center">
                              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold">
                                {course.instructor.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-600">
                            by {course.instructor.name}
                          </span>
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover/card:from-indigo-700 group-hover/card:to-purple-700">
                          {formatPrice(course.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 space-x-4">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>
              
              <div className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl flex items-center space-x-1">
                <span>Page</span>
                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg">{currentPage}</span>
                <span>of</span>
                <span className="font-bold text-gray-900">{totalPages}</span>
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700 flex items-center space-x-2"
              >
                <span>Next</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default CoursesPage
