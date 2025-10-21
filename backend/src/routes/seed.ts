import express from 'express'
import User from '../models/User'
import Course from '../models/Course'
import Video from '../models/Video'
import Quiz from '../models/Quiz'
import Enrollment from '../models/Enrollment'
import { Types } from 'mongoose'
import { seedDatabase } from '../seed-data'

const router = express.Router()

// GET /api/seed - Create sample data
router.get('/', async (req, res): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...')

    // Check if we should force reseed
    const force = req.query.force === 'true'
    const existingCourses = await Course.countDocuments()
    
    if (existingCourses > 0 && !force) {
      res.json({
        success: true,
        message: 'Sample data already exists',
        data: {
          courses: existingCourses,
          message: 'Database already has sample courses. Use ?force=true to recreate with all 14 courses.'
        }
      })
      return
    }

    // Use the comprehensive seed data from seed-data.ts
    const result = await seedDatabase(force)
    
    res.status(200).json({
      success: true,
      message: 'Sample data created successfully!',
      data: result
    })

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create sample data',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
