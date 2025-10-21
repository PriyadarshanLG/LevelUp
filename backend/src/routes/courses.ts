import { Router } from 'express'
import {
  getCourses,
  getCourse,
  enrollCourse,
  unenrollCourse,
  getUserEnrollments,
  getCategories,
  createCourse,
  submitFeedback,
  getCourseFeedback
} from '../controllers/courseController'
import { authenticate, authorize, optionalAuth } from '../middleware/auth'

const router = Router()

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

// Admin/Instructor routes (special permissions required)
router.post('/', authenticate, authorize('instructor', 'admin'), createCourse) // Create course

// Health check for course routes
router.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Course routes are working!',
    timestamp: new Date().toISOString()
  })
})

export default router

