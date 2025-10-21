import express from 'express'
import { generateCertificate, getUserCertificates, downloadCertificate } from '../controllers/certificateController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

// Generate certificate for a completed course
router.post('/generate/:courseId', authenticate, generateCertificate)

// Get user's certificates
router.get('/my-certificates', authenticate, getUserCertificates)

// Download certificate
router.get('/download/:certificateId', authenticate, downloadCertificate)

export default router
