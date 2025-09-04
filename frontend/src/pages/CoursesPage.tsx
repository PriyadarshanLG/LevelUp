import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, Clock, Users, BookOpen } from 'lucide-react'
import { courseAPI, APIError } from '../utils/api'
import type { Course } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

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
    return `$${price}`
  }

  return (
    <div className="min-h-screen bg-zara-white">
      {/* Header */}
      <header className="border-b border-zara-lightsilver">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex-shrink-0">
              <h1 className="text-xl font-serif font-normal text-zara-black tracking-wide">
                LEARNHUB
              </h1>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link
                to="/dashboard"
                className="text-sm font-light text-zara-charcoal hover:text-zara-black transition-colors duration-200 tracking-wide uppercase"
              >
                Dashboard
              </Link>
              {user && (
                <span className="text-sm font-light text-zara-gray">
                  {user.name}
                </span>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-zara-offwhite py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-light text-zara-black mb-6 tracking-wide">
            Discover Your Next
            <br />
            <em className="font-serif">Learning Adventure</em>
          </h1>
          <p className="text-lg font-light text-zara-gray max-w-2xl mx-auto mb-8">
            Explore our curated collection of premium courses designed to accelerate your growth.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-zara-lightsilver">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zara-lightgray" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-zara-lightsilver rounded focus:outline-none focus:border-zara-black transition-colors duration-200 font-light"
                />
              </div>
            </form>

            {/* Filters */}
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-zara-lightsilver rounded focus:outline-none focus:border-zara-black transition-colors duration-200 font-light"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.name || 'All Categories'} {category.count > 0 && `(${category.count})`}
                  </option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-3 border border-zara-lightsilver rounded focus:outline-none focus:border-zara-black transition-colors duration-200 font-light"
              >
                {levels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results summary */}
          <div className="flex justify-between items-center mt-6">
            <p className="text-sm font-light text-zara-gray">
              {loading ? 'Loading...' : `${totalCourses} courses found`}
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-sm border border-zara-lightsilver rounded focus:outline-none focus:border-zara-black transition-colors duration-200 font-light"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
              {courses.map((course) => (
                <Link
                  key={course._id}
                  to={`/course/${course._id}`}
                  className="group block"
                >
                  <div className="bg-white border border-zara-lightsilver rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200">
                    {/* Course Image */}
                    <div className="aspect-w-16 aspect-h-9 bg-zara-lightsilver">
                      <div className="w-full h-48 bg-gradient-to-br from-zara-silver to-zara-lightsilver flex items-center justify-center">
                        <BookOpen size={32} className="text-zara-gray" />
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-light text-zara-gray uppercase tracking-wider">
                          {course.category}
                        </span>
                        <span className="text-xs font-light text-zara-gray uppercase tracking-wider">
                          {course.level}
                        </span>
                      </div>

                      <h3 className="text-lg font-normal text-zara-black mb-2 group-hover:text-zara-charcoal transition-colors duration-200">
                        {course.title}
                      </h3>

                      <p className="text-sm font-light text-zara-gray mb-4 line-clamp-2">
                        {course.shortDescription}
                      </p>

                      <div className="flex items-center text-xs font-light text-zara-gray space-x-4 mb-4">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {formatDuration(course.duration)}
                        </div>
                        <div className="flex items-center">
                          <Users size={14} className="mr-1" />
                          {course.enrollmentCount}
                        </div>
                        {course.rating.count > 0 && (
                          <div className="flex items-center">
                            <Star size={14} className="mr-1" />
                            {course.rating.average.toFixed(1)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-lg font-normal text-zara-black">
                          {formatPrice(course.price)}
                        </span>
                        <span className="text-sm font-light text-zara-gray">
                          by {course.instructor.name}
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
            <div className="flex justify-center mt-12 space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-light border border-zara-lightsilver text-zara-charcoal hover:border-zara-black hover:text-zara-black transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-sm font-light text-zara-gray">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-light border border-zara-lightsilver text-zara-charcoal hover:border-zara-black hover:text-zara-black transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default CoursesPage
