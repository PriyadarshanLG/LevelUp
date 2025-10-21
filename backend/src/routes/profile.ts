import express from 'express'
import { getProfile, updateProfile } from '../controllers/profileController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

router.get('/', authenticate, getProfile)
router.put('/', authenticate, updateProfile)

export default router