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

// Backfill quizzes for courses missing them (non-destructive)
router.get('/ensure-quizzes', async (req, res): Promise<void> => {
  try {
    const courses = await Course.find({ isPublished: true }).select('_id title shortDescription learningOutcomes importantTopics instructor')

    let createdCount = 0
    let skippedCount = 0
    const results: Array<{ courseId: string; title: string; action: 'created'|'skipped'; createdQuestions?: number }> = []

    for (const course of courses) {
      const existing = await Quiz.countDocuments({ courseId: course._id, isPublished: true })
      if (existing > 0) {
        skippedCount += 1
        results.push({ courseId: String(course._id), title: course.title, action: 'skipped' })
        continue
      }

      const quizDoc = await buildDefaultQuizForCourse(course)
      await quizDoc.save()
      createdCount += 1
      results.push({ courseId: String(course._id), title: course.title, action: 'created', createdQuestions: quizDoc.questions.length })
    }

    res.status(200).json({
      success: true,
      message: 'Quiz backfill completed',
      data: { created: createdCount, skipped: skippedCount, totalCourses: courses.length, results }
    })
  } catch (error) {
    console.error('ensure-quizzes error:', error)
    res.status(500).json({ success: false, message: 'Failed to backfill quizzes' })
  }
})

function buildDefaultQuizForCourse(course: any) {
  const topics: string[] = []
  if (Array.isArray(course.learningOutcomes) && course.learningOutcomes.length) {
    topics.push(...course.learningOutcomes.slice(0, 6))
  } else if (Array.isArray(course.importantTopics) && course.importantTopics.length) {
    topics.push(...course.importantTopics.slice(0, 6))
  } else if (typeof course.shortDescription === 'string' && course.shortDescription.trim()) {
    topics.push('Basics', 'Core Concepts', 'Use Cases', 'Best Practices', 'Pitfalls', 'Terminology')
  } else {
    topics.push('Foundations', 'Concepts', 'Workflow', 'Quality', 'Optimization', 'Review')
  }

  const qCount = Math.min(Math.max(topics.length, 5), 10)
  const questions = [] as any[]

  for (let i = 0; i < qCount; i++) {
    const t = topics[i] || `Topic ${i + 1}`
    const id = new Types.ObjectId().toString()

    // Build 4 options and choose one correct
    const optionIds = [0,1,2,3].map(() => new Types.ObjectId().toString())
    const correctIndex = i % 4
    const options = optionIds.map((oid, idx) => ({ id: oid, text: idx === correctIndex ? `${t} — correct` : `${t} — option ${idx+1}`, isCorrect: idx === correctIndex }))

    questions.push({
      id,
      type: 'single_choice',
      question: `In ${course.title}, which statement best describes ${t}?`,
      options,
      correctAnswers: [ optionIds[correctIndex] ],
      explanation: `The correct choice highlights the key idea of ${t} in ${course.title}.`,
      points: 1,
      order: i
    })
  }

  const quiz = new Quiz({
    courseId: course._id,
    title: `${course.title} – Fundamentals Quiz`,
    description: `Auto-generated fundamentals assessment for ${course.title}.`,
    instructions: [
      'Answer all questions to the best of your knowledge.',
      'One correct option per question.',
      'You may review concepts before submitting.'
    ],
    timeLimit: 0,
    passingScore: 70,
    maxAttempts: 3,
    randomizeQuestions: false,
    showCorrectAnswers: true,
    allowReview: true,
    questions,
    order: 0,
    createdBy: new Types.ObjectId(course.instructor?.id || new Types.ObjectId()),
    isPublished: true
  })

  return quiz
}
