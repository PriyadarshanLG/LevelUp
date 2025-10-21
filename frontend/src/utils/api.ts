// API Configuration and Utilities

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

import type { User } from '../types/user';

// Course interface
export interface Course {
  _id: string
  title: string
  description: string
  shortDescription: string
  instructor: {
    id: string
    name: string
    email: string
  }
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number
  price: number
  thumbnail: string
  previewVideo?: string
  tags: string[]
  isPublished: boolean
  enrollmentCount: number
  rating: {
    average: number
    count: number
  }
  requirements: string[]
  learningOutcomes: string[]
  importantTopics: string[];
  timeManagement: string[];
  tipsAndTricks: string[];
  weeklyAssignments: { week: number; title: string; description: string }[];
  createdAt: string
  updatedAt: string
}

// Video interface
export interface Video {
  _id: string
  courseId: string
  title: string
  description: string
  videoUrl: string
  duration: number
  order: number
  isPreview: boolean
  startTime?: number
  thumbnail: string
  resources: {
    title: string
    url: string
    type: 'pdf' | 'link' | 'download'
  }[]
  transcription?: string
  isPublished: boolean
  progress?: {
    isCompleted: boolean
    watchedDuration: number
    lastWatchedAt: string | null
  }
}

// Enrollment interface
export interface Enrollment {
  _id: string
  userId: string
  courseId: string | Course
  status: 'active' | 'completed' | 'paused' | 'dropped'
  progress: {
    videosCompleted: number
    totalVideos: number
    quizzesPassed: number
    totalQuizzes: number
    overallPercentage: number
  }
  enrolledAt: string
  completedAt?: string
  lastAccessedAt: string
}

// Chat message interface
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

// Quiz interfaces
export interface QuizOption {
  id: string
  text: string
  isCorrect?: boolean
}

export interface QuizQuestion {
  id: string
  type: 'multiple_choice' | 'single_choice' | 'true_false' | 'fill_in_blank'
  question: string
  options: QuizOption[]
  points: number
  explanation?: string
}

export interface Quiz {
  _id: string
  title: string
  description: string
  instructions: string[]
  timeLimit: number
  passingScore: number
  maxAttempts: number
  totalQuestions: number
  totalPoints: number
  questions: QuizQuestion[]
  userStats?: {
    attempts: number
    bestScore: number
    bestPercentage: number
    passed: boolean
    canAttempt: boolean
    lastAttempt: string | null
  }
}

export interface QuizAttempt {
  score: number
  maxScore: number
  percentage: number
  passed: boolean
  timeSpent: number
  completedAt: string
}

export interface QuizResult {
  score: number
  maxScore: number
  percentage: number
  passed: boolean
  timeSpent: number
  questions?: QuizQuestionResult[]
  canRetake: boolean
}

export interface QuizQuestionResult {
  questionId: string
  correct: boolean
  score: number
  maxScore: number
  userAnswer: string[] | string
  correctAnswers: string[]
  explanation?: string
}

// Certificate interface
export interface Certificate {
  _id: string
  userId: string
  courseId: string
  userName: string
  courseName: string
  issuedAt: string
  certificateUrl: string
  isVerified: boolean
}

// Feedback types
export interface Feedback {
  _id: string
  userId: string
  courseId: string
  rating: number
  comment?: string
  createdAt: string
}

// Generic API response interface
export interface APIResponse<T = any> {
  success: boolean
  message: string
  data: T
  errors?: string[]
}

// Auth response interface
export interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: User
    token: string
    refreshToken?: string
  }
  errors?: string[]
}

// API Error class
export class APIError extends Error {
  statusCode: number
  errors?: string[]

  constructor(
    message: string,
    statusCode: number,
    errors?: string[]
  ) {
    super(message)
    this.name = 'APIError'
    this.statusCode = statusCode
    this.errors = errors
  }
}

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`
  
  // Default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Merge with existing headers if any
  if (options.headers) {
    Object.entries(options.headers as Record<string, string>).forEach(([key, value]) => {
      headers[key] = value
    })
  }

  // Add auth token if available
  const token = localStorage.getItem('authToken')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new APIError(
        data.message || 'An error occurred',
        response.status,
        data.errors
      )
    }

    return data
  } catch (error) {
    if (error instanceof APIError) {
      throw error
    }
    
    // Handle network errors
    throw new APIError('Network error. Please check your connection.', 500)
  }
}

// Blob request helper (for file downloads)
const apiRequestBlob = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Blob> => {
  const url = `${API_BASE_URL}${endpoint}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (options.headers) {
    Object.entries(options.headers as Record<string, string>).forEach(([key, value]) => {
      headers[key] = value
    })
  }

  const token = localStorage.getItem('authToken')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = 'An error occurred'
    try {
      const json = await response.json()
      message = json?.message || message
    } catch {}
    throw new APIError(message, response.status)
  }

  return response.blob()
}

// Auth API functions
export const authAPI = {
  // Register new user
  register: async (userData: {
    name: string
    email: string
    password: string
  }): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  // Login user
  login: async (credentials: {
    email: string
    password: string
  }): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  // Get current user profile
  getProfile: async (): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/profile')
  },

  // Logout user
  logout: async (): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    })
  },

  // Delete account
  deleteAccount: async (): Promise<{ success: boolean; message: string }> => {
    return apiRequest('/auth/delete-account', {
      method: 'DELETE',
    })
  },

  // Check auth status
  checkAuth: async (): Promise<boolean> => {
    try {
      await authAPI.getProfile()
      return true
    } catch {
      return false
    }
  }
}

// Profile API functions
export const profileAPI = {
  // Get user profile
  getProfile: async () => {
    return apiRequest<APIResponse<{
      user: User
    }>>('/profile')
  },

  // Update user profile
  updateProfile: async (profileData: {
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    phoneNumber?: string;
    profession?: string;
    organization?: string;
    bio?: string;
    location?: string;
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
      website?: string;
    };
    interests?: string[];
  }) => {
    return apiRequest<APIResponse<{
      user: User
    }>>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })
  }
}

// Course API functions
export const courseAPI = {
  // Get all courses with filters
  getCourses: async (params?: {
    category?: string
    level?: string
    search?: string
    page?: number
    limit?: number
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.category) queryParams.append('category', params.category)
    if (params?.level) queryParams.append('level', params.level)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    return apiRequest<APIResponse<{
      courses: Course[]
      pagination: {
        currentPage: number
        totalPages: number
        totalCourses: number
        hasNext: boolean
        hasPrev: boolean
      }
    }>>(`/courses?${queryParams}`)
  },

  // Get single course
  getCourse: async (courseId: string) => {
    return apiRequest<APIResponse<{
      course: Course
      videos: Video[]
      quizzes: any[]
      isEnrolled: boolean
      enrollment: Enrollment | null
    }>>(`/courses/${courseId}`)
  },

  createCourse: async (courseData: Omit<Course, '_id' | 'instructor' | 'isPublished' | 'enrollmentCount' | 'rating' | 'createdAt' | 'updatedAt' | 'duration' | 'importantTopics' | 'timeManagement' | 'tipsAndTricks' | 'weeklyAssignments'>) => {
    return apiRequest<APIResponse<{ course: Course }>>('/courses', {
        method: 'POST',
        body: JSON.stringify(courseData)
    })
  },

  // Enroll in course
  enrollCourse: async (courseId: string) => {
    return apiRequest<APIResponse<{ enrollment: Enrollment }>>(`/courses/${courseId}/enroll`, {
      method: 'POST'
    })
  },

  // Unenroll from course
  unenrollCourse: async (courseId: string) => {
    return apiRequest<APIResponse<any>>(`/courses/${courseId}/enroll`, {
      method: 'DELETE'
    })
  },

  // Get user enrollments
  getUserEnrollments: async (params?: { status?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.status) queryParams.append('status', params.status)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    return apiRequest<APIResponse<{
      enrollments: Enrollment[]
      pagination: {
        currentPage: number
        totalPages: number
        total: number
      }
    }>>(`/courses/user/enrollments?${queryParams}`)
  },

  // Get course categories
  getCategories: async () => {
    return apiRequest<APIResponse<{
      categories: { name: string; count: number }[]
    }>>('/courses/categories')
  }
}

// Video API functions
export const videoAPI = {
  // Get video details
  getVideo: async (videoId: string) => {
    return apiRequest<APIResponse<{
      video: Video
      progress: any
    }>>(`/videos/${videoId}`)
  },

  // Get course videos
  getCourseVideos: async (courseId: string) => {
    return apiRequest<APIResponse<{
      videos: Video[]
      isEnrolled: boolean
      totalVideos: number
    }>>(`/videos/course/${courseId}`)
  },

  // Update video progress
  updateVideoProgress: async (videoId: string, watchedDuration: number, isCompleted: boolean = false) => {
    return apiRequest<APIResponse<{
      progress: any
      videoProgress: any
    }>>(`/videos/${videoId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ watchedDuration, isCompleted })
    })
  }
}

// Chatbot API functions
export const chatbotAPI = {
  // Send message to AI
  sendMessage: async (
    message: string,
    conversationHistory: ChatMessage[] = [],
    courseContext?: { courseId?: string; courseTitle?: string; currentTopic?: string }
  ) => {
    return apiRequest<APIResponse<{
      response: string
      timestamp: string
      conversationId: string
    }>>('/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversationHistory,
        courseContext
      })
    })
  },

  // Generate AI Quiz (concept-aware)
  generateQuiz: async (
    params: { topic: string; difficulty: 'easy' | 'intermediate' | 'advanced'; numQuestions?: number }
  ) => {
    return apiRequest<APIResponse<{
      topic: string
      difficulty: string
      questions: Array<{
        id: string
        question: string
        options: { id: string; text: string }[]
        correctOptionId: string
        explanation?: string
      }>
    }>>('/chatbot/generate-quiz', {
      method: 'POST',
      body: JSON.stringify(params)
    })
  },

  // Get conversation suggestions
  getSuggestions: async (courseContext?: string) => {
    const queryParams = courseContext ? `?courseContext=${encodeURIComponent(courseContext)}` : ''
    return apiRequest<APIResponse<{
      suggestions: string[]
    }>>(`/chatbot/suggestions${queryParams}`)
  },

  // Check chatbot health
  checkHealth: async () => {
    return apiRequest<APIResponse<{
      aiConfigured: boolean
      timestamp: string
    }>>('/chatbot/health')
  }
}

// Quiz API functions
export const quizAPI = {
  // Get all quizzes for a course
  getCourseQuizzes: async (courseId: string) => {
    return apiRequest<APIResponse<{
      quizzes: Quiz[]
      totalQuizzes: number
    }>>(`/quizzes/course/${courseId}`)
  },

  // Get quiz details for taking the quiz
  getQuiz: async (quizId: string) => {
    return apiRequest<APIResponse<{
      quiz: Quiz
    }>>(`/quizzes/${quizId}`)
  },

  // Submit quiz attempt
  submitQuizAttempt: async (quizId: string, answers: any[], timeSpent: number) => {
    return apiRequest<APIResponse<{
      result: QuizResult
    }>>(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, timeSpent })
    })
  },

  // Get user's quiz results/attempts
  getUserQuizResults: async (quizId: string) => {
    return apiRequest<APIResponse<{
      quiz: {
        _id: string
        title: string
        passingScore: number
        totalPoints: number
      }
      attempts: QuizAttempt[]
      bestAttempt: QuizAttempt | null
      canRetake: boolean
      attemptsLeft: number
    }>>(`/quizzes/${quizId}/results`)
  },

  // Create new quiz (admin/instructor only)
  createQuiz: async (quizData: {
    courseId: string
    title: string
    description: string
    instructions?: string[]
    timeLimit?: number
    passingScore?: number
    maxAttempts?: number
    randomizeQuestions?: boolean
    showCorrectAnswers?: boolean
    allowReview?: boolean
    questions: any[]
    order?: number
  }) => {
    return apiRequest<APIResponse<{
      quiz: Quiz
    }>>('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData)
    })
  },

  // Update quiz status (publish/unpublish)
  updateQuizStatus: async (quizId: string, isPublished: boolean) => {
    return apiRequest<APIResponse<{
      quiz: Quiz
    }>>(`/quizzes/${quizId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished })
    })
  }
}

// Feedback API
export const feedbackAPI = {
  getCourseFeedback: async (courseId: string) => {
    return apiRequest<APIResponse<{ feedback: Feedback[] }>>(`/courses/${courseId}/feedback`)
  },
  submitFeedback: async (courseId: string, rating: number, comment?: string) => {
    return apiRequest<APIResponse<{ feedback: Feedback }>>(`/courses/${courseId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment })
    })
  }
}

// Certificate API functions
export const certificateAPI = {
  // Generate certificate for a course
  generateCertificate: async (courseId: string) => {
    return apiRequest<APIResponse<{
      certificate: Certificate
    }>>(`/certificates/generate/${courseId}`, {
      method: 'POST'
    })
  },

  // Get current user's certificates
  getMyCertificates: async () => {
    return apiRequest<APIResponse<{
      certificates: Certificate[]
    }>>('/certificates/my-certificates')
  },

  // Download certificate image as Blob
  downloadCertificate: async (certificateId: string) => {
    return apiRequestBlob(`/certificates/download/${certificateId}`)
  }
}

// Token management utilities
export const tokenUtils = {
  // Save token to localStorage
  saveToken: (token: string): void => {
    localStorage.setItem('authToken', token)
  },

  // Get token from localStorage
  getToken: (): string | null => {
    return localStorage.getItem('authToken')
  },

  // Remove token from localStorage
  removeToken: (): void => {
    localStorage.removeItem('authToken')
  },

  // Check if token exists
  hasToken: (): boolean => {
    return !!localStorage.getItem('authToken')
  }
}
