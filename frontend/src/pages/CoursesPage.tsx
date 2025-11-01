import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, Clock, Users, BookOpen, Plus, Video, X, Upload, FileUp, Image, Trash2 } from 'lucide-react'
import { courseAPI, videoAPI, APIError } from '../utils/api'
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

  // Video upload modal state
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [creatingVideo, setCreatingVideo] = useState(false)
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: 0,
    order: 1,
    isPreview: false,
    thumbnail: '',
    startTime: 0
  })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // File upload state
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Course creation modal state
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [creatingCourse, setCreatingCourse] = useState(false)
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    price: 0,
    previewVideo: '',
    tags: [] as string[],
    requirements: [] as string[],
    learningOutcomes: [] as string[]
  })
  const [courseThumbnailFile, setCourseThumbnailFile] = useState<File | null>(null)
  const [coursePreviewVideoFile, setCoursePreviewVideoFile] = useState<File | null>(null)
  
  // Lesson videos for course creation
  const [lessonVideos, setLessonVideos] = useState<Array<{
    title: string
    description: string
    videoFile: File | null
    thumbnailFile: File | null
    duration: number
    order: number
  }>>([])
  const [showAddLessonForm, setShowAddLessonForm] = useState(false)
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    duration: 0
  })

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

  // Function to check if user can manage the course
  const canManageCourse = (_course: Course) => {
    // Only admin or instructor can manage courses
    // Teachers can only manage their classrooms, not courses
    return user?.role === 'admin' || user?.role === 'instructor'
  }

  // State for delete confirmation
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)

  // Function to handle delete course
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return

    try {
      setDeletingCourseId(courseToDelete._id)
      await courseAPI.deleteCourse(courseToDelete._id)
      
      // Show success message
      setSuccessMessage('Course deleted successfully!')
      setTimeout(() => setSuccessMessage(null), 3000)
      
      // Close modal and refresh courses
      setShowDeleteModal(false)
      setCourseToDelete(null)
      await loadCourses()
    } catch (error) {
      console.error('Failed to delete course:', error)
      setError(error instanceof APIError ? error.message : 'Failed to delete course')
    } finally {
      setDeletingCourseId(null)
    }
  }

  // Function to open delete confirmation modal
  const openDeleteModal = (course: Course, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCourseToDelete(course)
    setShowDeleteModal(true)
  }

  // Function to open video upload modal
  const openVideoModal = (courseId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedCourseId(courseId)
    setShowVideoModal(true)
    setVideoForm({
      title: '',
      description: '',
      videoUrl: '',
      duration: 0,
      order: 1,
      isPreview: false,
      thumbnail: '',
      startTime: 0
    })
    // Reset file upload states
    setSelectedVideoFile(null)
    setSelectedThumbnailFile(null)
    setUploadProgress(0)
    setIsUploading(false)
  }

  // Function to handle video file selection
  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if it's a video file
      if (file.type.startsWith('video/')) {
        setSelectedVideoFile(file)
        // Auto-extract duration using HTML5 video element
        const videoElement = document.createElement('video')
        videoElement.preload = 'metadata'
        videoElement.onloadedmetadata = () => {
          setVideoForm(prev => ({ ...prev, duration: Math.round(videoElement.duration) }))
          URL.revokeObjectURL(videoElement.src)
        }
        videoElement.src = URL.createObjectURL(file)
      } else {
        setError('Please select a valid video file')
      }
    }
  }

  // Function to handle thumbnail file selection
  const handleThumbnailFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check if it's an image file
      if (file.type.startsWith('image/')) {
        setSelectedThumbnailFile(file)
      } else {
        setError('Please select a valid image file')
      }
    }
  }

  // Function to close video upload modal
  const closeVideoModal = () => {
    setShowVideoModal(false)
    setSelectedCourseId(null)
    setError(null)
  }

  // Function to handle video form submission
  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCourseId) return

    try {
      setCreatingVideo(true)
      setIsUploading(true)
      setError(null)

      // Validate video file is selected
      if (!selectedVideoFile) {
        setError('Please select a video file to upload')
        setCreatingVideo(false)
        setIsUploading(false)
        return
      }

      // Create FormData for video upload
      const formData = new FormData()
      formData.append('courseId', selectedCourseId)
      formData.append('title', videoForm.title.trim())
      formData.append('description', videoForm.description.trim())
      formData.append('duration', videoForm.duration.toString())
      formData.append('order', videoForm.order.toString())
      formData.append('isPreview', videoForm.isPreview.toString())
      formData.append('startTime', (videoForm.startTime || 0).toString())
      
      // Add video file
      formData.append('video', selectedVideoFile)
      
      // Add thumbnail file if provided, otherwise use default
      if (selectedThumbnailFile) {
        formData.append('thumbnail', selectedThumbnailFile)
      }

      console.log('Uploading video to server...')
      setUploadProgress(50)

      const response = await videoAPI.createVideo(formData)

      if (response.success) {
        console.log('Video uploaded successfully!')
        setSuccessMessage('Video added successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
        closeVideoModal()
      }
    } catch (err) {
      console.error('Failed to create video:', err)
      setError(err instanceof APIError ? err.message : 'Failed to create video')
    } finally {
      setCreatingVideo(false)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Function to open course creation modal
  const openCourseModal = () => {
    setShowCourseModal(true)
    setCourseForm({
      title: '',
      description: '',
      shortDescription: '',
      category: '',
      level: 'beginner',
      price: 0,
      previewVideo: '',
      tags: [],
      requirements: [],
      learningOutcomes: []
    })
    setCourseThumbnailFile(null)
    setCoursePreviewVideoFile(null)
    setLessonVideos([])
    setShowAddLessonForm(false)
  }

  // Function to close course creation modal
  const closeCourseModal = () => {
    setShowCourseModal(false)
    setError(null)
  }

  // Function to add lesson video to the list
  const addLessonVideo = (videoFile: File, thumbnailFile: File | null) => {
    if (!newLesson.title.trim() || !videoFile || newLesson.duration <= 0) {
      setError('Please fill in all lesson details and select a video file')
      return
    }

    setLessonVideos(prev => [
      ...prev,
      {
        title: newLesson.title.trim(),
        description: newLesson.description.trim(),
        videoFile,
        thumbnailFile,
        duration: newLesson.duration,
        order: prev.length + 1
      }
    ])

    // Reset form
    setNewLesson({ title: '', description: '', duration: 0 })
    setSelectedVideoFile(null)
    setSelectedThumbnailFile(null)
    setShowAddLessonForm(false)
  }

  // Function to remove lesson video from list
  const removeLessonVideo = (index: number) => {
    setLessonVideos(prev => prev.filter((_, i) => i !== index))
  }

  // Function to handle course thumbnail file selection
  const handleCourseThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setCourseThumbnailFile(file)
      } else {
        setError('Please select a valid image file')
      }
    }
  }

  // Function to handle course preview video file selection
  const handleCoursePreviewVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type.startsWith('video/')) {
        setCoursePreviewVideoFile(file)
      } else {
        setError('Please select a valid video file')
      }
    }
  }

  // Function to handle course form submission
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setCreatingCourse(true)
      setError(null)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('title', courseForm.title.trim())
      formData.append('description', courseForm.description.trim())
      formData.append('shortDescription', courseForm.shortDescription.trim())
      formData.append('category', courseForm.category.trim())
      formData.append('level', courseForm.level)
      formData.append('price', courseForm.price.toString())
      formData.append('tags', JSON.stringify(courseForm.tags))
      formData.append('requirements', JSON.stringify(courseForm.requirements))
      formData.append('learningOutcomes', JSON.stringify(courseForm.learningOutcomes))

      // Add thumbnail file if selected
      if (courseThumbnailFile) {
        formData.append('thumbnail', courseThumbnailFile)
      }

      // Add preview video file if selected
      if (coursePreviewVideoFile) {
        formData.append('previewVideo', coursePreviewVideoFile)
      }

      const response = await courseAPI.createCourse(formData)

      if (response.success) {
        const newCourseId = response.data.course._id
        
        // Upload lesson videos if any
        if (lessonVideos.length > 0) {
          console.log(`Uploading ${lessonVideos.length} lesson videos for course ${newCourseId}`)
          
          for (const lesson of lessonVideos) {
            try {
              const videoFormData = new FormData()
              videoFormData.append('courseId', newCourseId)
              videoFormData.append('title', lesson.title)
              videoFormData.append('description', lesson.description)
              videoFormData.append('duration', lesson.duration.toString())
              videoFormData.append('order', lesson.order.toString())
              videoFormData.append('isPreview', 'false')
              videoFormData.append('startTime', '0')
              
              if (lesson.videoFile) {
                videoFormData.append('video', lesson.videoFile)
              }
              
              if (lesson.thumbnailFile) {
                videoFormData.append('thumbnail', lesson.thumbnailFile)
              }
              
              await videoAPI.createVideo(videoFormData)
              console.log(`✓ Uploaded lesson: ${lesson.title}`)
            } catch (videoErr) {
              console.error(`Failed to upload lesson ${lesson.title}:`, videoErr)
            }
          }
        }
        
        setSuccessMessage(`Course created successfully with ${lessonVideos.length} lesson(s)!`)
        setTimeout(() => setSuccessMessage(null), 3000)
        closeCourseModal()
        loadCourses() // Reload courses to show the new one
      }
    } catch (err) {
      console.error('Failed to create course:', err)
      // Show detailed error message with all validation errors
      if (err instanceof APIError && err.errors && err.errors.length > 0) {
        setError(`Validation failed: ${err.errors.join(', ')}`)
      } else {
        setError(err instanceof APIError ? err.message : 'Failed to create course')
      }
    } finally {
      setCreatingCourse(false)
    }
  }

  // Helper to add/remove items from arrays (tags, requirements, outcomes)
  const addArrayItem = (field: 'tags' | 'requirements' | 'learningOutcomes', value: string) => {
    if (value.trim()) {
      setCourseForm(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }))
    }
  }

  const removeArrayItem = (field: 'tags' | 'requirements' | 'learningOutcomes', index: number) => {
    setCourseForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
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

          {/* Upload Course Button (for admin/instructor only) */}
          {(user?.role === 'admin' || user?.role === 'instructor') && (
            <div className="mt-4">
              <button
                onClick={openCourseModal}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 group"
              >
                <Upload size={20} className="group-hover:scale-110 transition-transform duration-200" />
                <span>Upload New Course</span>
              </button>
            </div>
          )}

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
          {/* Debug Info - Remove this after testing */}
          {user && (
            <div className="mb-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
              <p className="text-sm font-mono">
                <strong>Debug Info:</strong> User Role: {user.role} | User ID: {user._id}
              </p>
            </div>
          )}
          
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
                    
                    {/* Delete Button - Top Right Corner - Always Visible for Instructors */}
                    {canManageCourse(course) && (
                      <button
                        onClick={(e) => openDeleteModal(course, e)}
                        className="absolute top-3 right-3 z-10 p-2.5 text-white bg-red-500 backdrop-blur-sm rounded-lg hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl group/delete hover:scale-110"
                        aria-label="Delete course"
                        title="Delete Course"
                        disabled={deletingCourseId === course._id}
                      >
                        <Trash2 size={18} className="group-hover/delete:rotate-12 transition-transform duration-200" />
                      </button>
                    )}
                    
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
                        <div className="flex items-center gap-2">
                          {canManageCourse(course) && (
                            <button
                              onClick={(e) => openVideoModal(course._id, e)}
                              className="p-2 text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-sm hover:shadow-md group/btn"
                              aria-label="Add video to course"
                              title="Add Video"
                            >
                              <Plus size={16} className="group-hover/btn:rotate-90 transition-transform duration-200" />
                            </button>
                          )}
                          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover/card:from-indigo-700 group-hover/card:to-purple-700">
                            {formatPrice(course.price)}
                          </span>
                        </div>
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

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-20 right-6 z-50 animate-slide-down">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Video Upload Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={closeVideoModal}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Video size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white" id="modal-title">
                      Add New Video
                    </h3>
                  </div>
                  <button
                    onClick={closeVideoModal}
                    className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleVideoSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                    <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label htmlFor="video-title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Video Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="video-title"
                    type="text"
                    required
                    value={videoForm.title}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Introduction to React Hooks"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="video-description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="video-description"
                    required
                    value={videoForm.description}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of what this video covers..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* File Upload Section */}
                <div className="space-y-4 bg-emerald-50/30 p-4 rounded-lg border border-emerald-100">
                    {/* Video File Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        📹 Video File <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="video-file"
                          type="file"
                          accept="video/*"
                          onChange={handleVideoFileSelect}
                          className="hidden"
                        />
                        <label
                          htmlFor="video-file"
                          className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedVideoFile
                              ? 'border-emerald-400 bg-emerald-50 hover:bg-emerald-100'
                              : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50'
                          }`}
                        >
                          <div className="text-center">
                            {selectedVideoFile ? (
                              <div className="flex items-center justify-center mb-2">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                  <FileUp size={32} className="text-emerald-600" />
                                </div>
                              </div>
                            ) : (
                              <FileUp size={32} className="mx-auto text-gray-400 mb-2" />
                            )}
                            <p className={`text-sm font-medium ${selectedVideoFile ? 'text-emerald-700' : 'text-gray-700'}`}>
                              {selectedVideoFile ? selectedVideoFile.name : '🎬 Click here to select video file from your computer'}
                            </p>
                            {selectedVideoFile && (
                              <p className="text-xs text-emerald-600 mt-1 font-semibold">
                                ✓ {(selectedVideoFile.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Supported: MP4, WebM, MOV, AVI, MKV
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Thumbnail File Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        🖼️ Thumbnail Image (optional)
                      </label>
                      <div className="relative">
                        <input
                          id="thumbnail-file"
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailFileSelect}
                          className="hidden"
                        />
                        <label
                          htmlFor="thumbnail-file"
                          className={`flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedThumbnailFile
                              ? 'border-emerald-400 bg-emerald-50 hover:bg-emerald-100'
                              : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50'
                          }`}
                        >
                          <div className="text-center">
                            {selectedThumbnailFile ? (
                              <div className="flex items-center justify-center mb-2">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                  <Image size={24} className="text-emerald-600" />
                                </div>
                              </div>
                            ) : (
                              <Image size={24} className="mx-auto text-gray-400 mb-2" />
                            )}
                            <p className={`text-sm font-medium ${selectedThumbnailFile ? 'text-emerald-700' : 'text-gray-700'}`}>
                              {selectedThumbnailFile ? selectedThumbnailFile.name : 'Click to select thumbnail image'}
                            </p>
                            {selectedThumbnailFile && (
                              <p className="text-xs text-emerald-600 mt-1 font-semibold">
                                ✓ {(selectedThumbnailFile.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Supported: JPG, PNG, WebP, GIF
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Upload Progress */}
                    {isUploading && uploadProgress > 0 && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-indigo-700">Uploading...</span>
                          <span className="text-sm font-bold text-indigo-700">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                </div>

                {/* Duration and Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="video-duration" className="block text-sm font-semibold text-gray-700 mb-2">
                      Duration (seconds) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="video-duration"
                      type="number"
                      required
                      min="1"
                      value={videoForm.duration}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, duration: Number(e.target.value) }))}
                      placeholder="300"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="video-order" className="block text-sm font-semibold text-gray-700 mb-2">
                      Order <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="video-order"
                      type="number"
                      required
                      min="1"
                      value={videoForm.order}
                      onChange={(e) => setVideoForm(prev => ({ ...prev, order: Number(e.target.value) }))}
                      placeholder="1"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>


                {/* Start Time */}
                <div>
                  <label htmlFor="video-start-time" className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time (seconds, optional)
                  </label>
                  <input
                    id="video-start-time"
                    type="number"
                    min="0"
                    value={videoForm.startTime}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, startTime: Number(e.target.value) }))}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Is Preview Checkbox */}
                <div className="flex items-center space-x-3">
                  <input
                    id="video-preview"
                    type="checkbox"
                    checked={videoForm.isPreview}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, isPreview: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="video-preview" className="text-sm font-medium text-gray-700">
                    Mark as preview video (accessible without enrollment)
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeVideoModal}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingVideo}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                  >
                    {creatingVideo ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      'Create Video'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Course Creation Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="course-modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={closeCourseModal}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Upload size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white" id="course-modal-title">
                      Create New Course
                    </h3>
                  </div>
                  <button
                    onClick={closeCourseModal}
                    className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCourseSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                    <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label htmlFor="course-title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="course-title"
                    type="text"
                    required
                    value={courseForm.title}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Complete Web Development Bootcamp"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label htmlFor="course-short-desc" className="block text-sm font-semibold text-gray-700 mb-2">
                    Short Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="course-short-desc"
                    type="text"
                    required
                    value={courseForm.shortDescription}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, shortDescription: e.target.value }))}
                    placeholder="Brief one-line summary"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="course-description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="course-description"
                    required
                    value={courseForm.description}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of your course..."
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Category and Level */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="course-category" className="block text-sm font-semibold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="course-category"
                      type="text"
                      required
                      value={courseForm.category}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Web Development"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="course-level" className="block text-sm font-semibold text-gray-700 mb-2">
                      Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="course-level"
                      required
                      value={courseForm.level}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="course-price" className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="course-price"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                    placeholder="0 for free course"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Thumbnail Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📷 Course Thumbnail (optional)
                  </label>
                  <div className="relative">
                    <input
                      id="course-thumbnail-file"
                      type="file"
                      accept="image/*"
                      onChange={handleCourseThumbnailSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="course-thumbnail-file"
                      className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                        courseThumbnailFile
                          ? 'border-emerald-400 bg-emerald-50 hover:bg-emerald-100'
                          : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/50'
                      }`}
                    >
                      <div className="text-center">
                        {courseThumbnailFile ? (
                          <div>
                            <div className="flex items-center justify-center mb-2">
                              <div className="p-2 bg-emerald-100 rounded-full">
                                <Image size={32} className="text-emerald-600" />
                              </div>
                            </div>
                            <p className="text-sm font-medium text-emerald-700">
                              {courseThumbnailFile.name}
                            </p>
                            <p className="text-xs text-emerald-600 mt-1 font-semibold">
                              ✓ {(courseThumbnailFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                            {/* Preview the thumbnail */}
                            <div className="mt-3">
                              <img
                                src={URL.createObjectURL(courseThumbnailFile)}
                                alt="Thumbnail preview"
                                className="max-w-full max-h-32 mx-auto rounded-lg shadow-md object-cover"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Image size={32} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700">
                              🎨 Click to upload course thumbnail from your computer
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Supported: JPG, PNG, WebP, GIF (Max 5MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: Use a 16:9 aspect ratio image (e.g., 1280x720) for best results
                  </p>
                </div>

                {/* Preview Video Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🎬 Preview Video (optional)
                  </label>
                  <div className="relative">
                    <input
                      id="course-preview-video-file"
                      type="file"
                      accept="video/*"
                      onChange={handleCoursePreviewVideoSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="course-preview-video-file"
                      className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                        coursePreviewVideoFile
                          ? 'border-purple-400 bg-purple-50 hover:bg-purple-100'
                          : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50/50'
                      }`}
                    >
                      <div className="text-center">
                        {coursePreviewVideoFile ? (
                          <div>
                            <div className="flex items-center justify-center mb-2">
                              <div className="p-2 bg-purple-100 rounded-full">
                                <Video size={32} className="text-purple-600" />
                              </div>
                            </div>
                            <p className="text-sm font-medium text-purple-700">
                              {coursePreviewVideoFile.name}
                            </p>
                            <p className="text-xs text-purple-600 mt-1 font-semibold">
                              ✓ {(coursePreviewVideoFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                            <p className="text-xs text-purple-500 mt-2">
                              Video file ready for upload
                            </p>
                          </div>
                        ) : (
                          <div>
                            <Video size={32} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-700">
                              🎥 Click to upload preview video from your computer
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Supported: MP4, WebM, MOV, AVI (Max 500MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: Keep preview videos short (1-3 minutes) to give students a quick overview
                  </p>
                </div>

                {/* Tags (optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tags (optional)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      id="tag-input"
                      placeholder="Add a tag and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.currentTarget
                          addArrayItem('tags', input.value)
                          input.value = ''
                        }
                      }}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {courseForm.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm flex items-center space-x-2">
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeArrayItem('tags', index)}
                          className="text-indigo-500 hover:text-indigo-700"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Requirements (optional)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      id="requirement-input"
                      placeholder="Add a requirement and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.currentTarget
                          addArrayItem('requirements', input.value)
                          input.value = ''
                        }
                      }}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <ul className="space-y-1">
                    {courseForm.requirements.map((req, index) => (
                      <li key={index} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm">
                        <span>{req}</span>
                        <button
                          type="button"
                          onClick={() => removeArrayItem('requirements', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Learning Outcomes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Learning Outcomes (optional)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      id="outcome-input"
                      placeholder="Add a learning outcome and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.currentTarget
                          addArrayItem('learningOutcomes', input.value)
                          input.value = ''
                        }
                      }}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <ul className="space-y-1">
                    {courseForm.learningOutcomes.map((outcome, index) => (
                      <li key={index} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm">
                        <span>{outcome}</span>
                        <button
                          type="button"
                          onClick={() => removeArrayItem('learningOutcomes', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Lesson Videos Section */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        📚 Lesson Videos (optional)
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Add lesson videos to your course</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddLessonForm(!showAddLessonForm)}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
                    >
                      <Plus size={16} className="mr-1.5" />
                      Add Lesson
                    </button>
                  </div>

                  {/* Add Lesson Form */}
                  {showAddLessonForm && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Lesson Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newLesson.title}
                          onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Introduction to HTML"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={newLesson.description}
                          onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description of this lesson"
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (seconds) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={newLesson.duration}
                          onChange={(e) => setNewLesson(prev => ({ ...prev, duration: Number(e.target.value) }))}
                          placeholder="e.g., 300 (5 minutes)"
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Video File <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setSelectedVideoFile(e.target.files?.[0] || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                        {selectedVideoFile && (
                          <p className="text-xs text-emerald-600 mt-1">
                            ✓ {selectedVideoFile.name} ({(selectedVideoFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Thumbnail (optional)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setSelectedThumbnailFile(e.target.files?.[0] || null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        />
                        {selectedThumbnailFile && (
                          <p className="text-xs text-emerald-600 mt-1">
                            ✓ {selectedThumbnailFile.name}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddLessonForm(false)
                            setNewLesson({ title: '', description: '', duration: 0 })
                            setSelectedVideoFile(null)
                            setSelectedThumbnailFile(null)
                          }}
                          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedVideoFile) {
                              addLessonVideo(selectedVideoFile, selectedThumbnailFile)
                            } else {
                              setError('Please select a video file')
                            }
                          }}
                          className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
                        >
                          Add Lesson
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lesson Videos List */}
                  {lessonVideos.length > 0 && (
                    <div className="space-y-2">
                      {lessonVideos.map((lesson, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                #{lesson.order}
                              </span>
                              <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{lesson.description || 'No description'}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                              <span>⏱️ {Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}</span>
                              <span>🎬 {lesson.videoFile?.name}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLessonVideo(index)}
                            className="ml-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                      <p className="text-sm text-gray-600 mt-2">
                        Total: {lessonVideos.length} lesson(s) • {Math.floor(lessonVideos.reduce((sum, l) => sum + l.duration, 0) / 60)} minutes
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={closeCourseModal}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingCourse}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                  >
                    {creatingCourse ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Course...
                      </span>
                    ) : (
                      'Create Course'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Course Confirmation Modal */}
      {showDeleteModal && courseToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="delete-modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" 
              aria-hidden="true"
              onClick={() => setShowDeleteModal(false)}
            ></div>

            {/* Center modal */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <X size={24} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white" id="delete-modal-title">
                      Delete Course
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-8">
                <div className="mb-6">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                    <X size={32} className="text-red-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 text-center mb-2">
                    Are you sure you want to delete this course?
                  </h4>
                  <p className="text-gray-600 text-center mb-4">
                    You are about to delete "<span className="font-semibold">{courseToDelete.title}</span>"
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      <strong>Warning:</strong> This action cannot be undone. Deleting this course will permanently remove:
                    </p>
                    <ul className="mt-2 ml-4 space-y-1 text-sm text-amber-700 list-disc">
                      <li>All videos and course content</li>
                      <li>All quizzes and assessments</li>
                      <li>All student enrollments</li>
                      <li>All feedback and ratings</li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deletingCourseId === courseToDelete._id}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteCourse}
                    disabled={deletingCourseId === courseToDelete._id}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-lg hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                  >
                    {deletingCourseId === courseToDelete._id ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </span>
                    ) : (
                      'Delete Course'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoursesPage
