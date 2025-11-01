import { Router } from 'express'
import {
  getVideo,
  updateVideoProgress,
  getCourseVideos,
  createVideo,
  updateVideo,
  getAllVideos
} from '../controllers/videoController'
import { authenticate, authorize, optionalAuth } from '../middleware/auth'
import { uploadLesson } from '../middleware/upload'

const router = Router()

// Debug route - get all videos
router.get('/debug/all', authenticate, getAllVideos)

// Public/Protected routes (authentication optional for preview videos)
router.get('/:videoId', optionalAuth, getVideo) // Get single video
router.get('/course/:courseId', optionalAuth, getCourseVideos) // Get all videos for a course

// Protected routes (authentication required)
router.post('/:videoId/progress', authenticate, updateVideoProgress) // Update video progress

// Admin/Instructor routes (special permissions required - only instructors/admin)
router.post('/', authenticate, authorize('admin', 'instructor'), uploadLesson.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), createVideo) // Create video with file upload
router.put('/:videoId', authenticate, authorize('admin', 'instructor'), updateVideo) // Update video

// Health check for video routes
router.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Video routes are working!',
    timestamp: new Date().toISOString()
  })
})

export default router

