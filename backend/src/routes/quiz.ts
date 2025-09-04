import express from 'express'
import {
  getCourseQuizzes,
  getQuiz,
  submitQuizAttempt,
  getUserQuizResults,
  createQuiz,
  updateQuizStatus
} from '../controllers/quizController'
import { authenticate, authorize } from '../middleware/auth'

const router = express.Router()

// Public routes (protected by authentication middleware)

// Get all quizzes for a course
router.get('/course/:courseId', authenticate, getCourseQuizzes)

// Get specific quiz details (for taking the quiz)
router.get('/:quizId', authenticate, getQuiz)

// Submit quiz attempt
router.post('/:quizId/submit', authenticate, submitQuizAttempt)

// Get user's quiz results/attempts
router.get('/:quizId/results', authenticate, getUserQuizResults)

// Admin/Instructor routes

// Create new quiz (instructors only)
router.post('/', authenticate, authorize('admin', 'instructor'), createQuiz)

// Update quiz status (publish/unpublish)
router.patch('/:quizId/status', authenticate, authorize('admin', 'instructor'), updateQuizStatus)

export default router
