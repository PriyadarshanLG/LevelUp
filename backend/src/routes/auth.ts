import { Router } from 'express'
import { register, login, getProfile, logout } from '../controllers/authController'
import { authenticate } from '../middleware/auth'

const router = Router()

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)

// Protected routes
router.get('/profile', authenticate, getProfile)

// Health check for auth routes
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString()
  })
})

export default router
