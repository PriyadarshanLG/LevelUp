import { Router } from 'express'
import {
  createClassroom,
  getTeacherClassrooms,
  getStudentClassrooms,
  getClassroom,
  joinClassroom,
  deleteClassroom
} from '../controllers/classroomController'
import { authenticate } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Teacher routes
router.post('/create', createClassroom)
router.get('/teacher', getTeacherClassrooms)
router.delete('/:classroomId', deleteClassroom)

// Student routes
router.post('/join', joinClassroom)
router.get('/student', getStudentClassrooms)

// Shared routes (teacher or enrolled student)
router.get('/:classroomId', getClassroom)

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Classroom routes are working!',
    timestamp: new Date().toISOString()
  })
})

export default router
