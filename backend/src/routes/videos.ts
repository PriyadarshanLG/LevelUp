import { Router } from 'express'
import {
  getVideo,
  updateVideoProgress,
  getCourseVideos,
  createVideo,
  updateVideo
} from '../controllers/videoController'
import { authenticate, authorize, optionalAuth } from '../middleware/auth'

const router = Router()

// Public/Protected routes (authentication optional for preview videos)
router.get('/:videoId', optionalAuth, getVideo) // Get single video
router.get('/course/:courseId', optionalAuth, getCourseVideos) // Get all videos for a course

// Protected routes (authentication required)
router.post('/:videoId/progress', authenticate, updateVideoProgress) // Update video progress

// Admin/Instructor routes (special permissions required)
router.post('/', authenticate, authorize('instructor', 'admin'), createVideo) // Create video
router.put('/:videoId', authenticate, authorize('instructor', 'admin'), updateVideo) // Update video

// Health check for video routes
router.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Video routes are working!',
    timestamp: new Date().toISOString()
  })
})

export default router

