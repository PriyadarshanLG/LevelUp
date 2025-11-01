import { Router } from 'express'
import {
  getCourses,
  getCourse,
  enrollCourse,
  unenrollCourse,
  getUserEnrollments,
  getCategories,
  createCourse,
  deleteCourse,
  submitFeedback,
  getCourseFeedback
} from '../controllers/courseController'
import { authenticate, authorize, optionalAuth } from '../middleware/auth'
import { uploadThumbnail, uploadVideo } from '../middleware/upload'
import multer from 'multer'

const router = Router()

// Create multer instance for handling multiple files (thumbnail + preview video)
const uploadCourseFiles = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'thumbnail') {
        cb(null, 'public/uploads/thumbnails')
      } else if (file.fieldname === 'previewVideo') {
        cb(null, 'public/uploads/videos')
      } else {
        cb(null, 'public/uploads')
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      const path = require('path')
      if (file.fieldname === 'thumbnail') {
        cb(null, 'thumbnail-' + uniqueSuffix + path.extname(file.originalname))
      } else if (file.fieldname === 'previewVideo') {
        cb(null, 'preview-video-' + uniqueSuffix + path.extname(file.originalname))
      } else {
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
      }
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'thumbnail') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true)
      } else {
        cb(new Error('Only image files are allowed for thumbnail!'))
      }
    } else if (file.fieldname === 'previewVideo') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true)
      } else {
        cb(new Error('Only video files are allowed for preview video!'))
      }
    } else {
      cb(null, false)
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max
  }
})

// Public routes (no authentication required)
router.get('/', getCourses) // Get all published courses with filters
router.get('/categories', getCategories) // Get course categories
router.get('/:courseId', optionalAuth, getCourse) // Get single course (auth optional for enrollment check)
router.get('/:courseId/feedback', getCourseFeedback)

// Protected routes (authentication required)
router.post('/:courseId/enroll', authenticate, enrollCourse) // Enroll in course
router.delete('/:courseId/enroll', authenticate, unenrollCourse) // Unenroll from course
router.post('/:courseId/feedback', authenticate, submitFeedback)
router.get('/user/enrollments', authenticate, getUserEnrollments) // Get user's enrollments

// Admin/Instructor routes (special permissions required - only instructors/admin)
router.post('/', authenticate, authorize('admin', 'instructor'), uploadCourseFiles.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'previewVideo', maxCount: 1 }
]), createCourse) // Create course with thumbnail and preview video upload
router.delete('/:courseId', authenticate, authorize('admin', 'instructor'), deleteCourse) // Delete course

// Health check for course routes
router.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Course routes are working!',
    timestamp: new Date().toISOString()
  })
})

export default router

