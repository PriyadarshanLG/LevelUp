import { Request, Response } from 'express'
import Course, { ICourse } from '../models/Course'
import Video from '../models/Video'
import Quiz from '../models/Quiz'
import Enrollment from '../models/Enrollment'
import Feedback from '../models/Feedback'

// Get all published courses (public)
export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      level,
      search,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query

    // Build query
    const query: any = { isPublished: true }

    if (category) {
      query.category = category
    }

    if (level) {
      query.level = level
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ]
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit)
    const sortOptions: any = {}
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1

    // Execute query
    const courses = await Course.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v')

    const total = await Course.countDocuments(query)
    const totalPages = Math.ceil(total / Number(limit))

    res.status(200).json({
      success: true,
      message: 'Courses retrieved successfully',
      data: {
        courses,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCourses: total,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      }
    })

  } catch (error: any) {
    console.error('Get courses error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve courses',
      errors: ['Internal server error']
    })
  }
}

// Submit feedback for a course (protected)
export const submitFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params
    const userId = req.userId!
    const { rating, comment } = req.body

    // Ensure enrolled before feedback
    const enrollment = await Enrollment.findOne({ userId, courseId })
    if (!enrollment) {
      res.status(403).json({ success: false, message: 'Enroll in the course to leave feedback' })
      return
    }

    // Upsert feedback (one per user per course) with creation detection
    let created = false
    let feedback = await Feedback.findOne({ userId, courseId })
    if (feedback) {
      feedback.rating = rating
      feedback.comment = comment
      await feedback.save()
    } else {
      feedback = new Feedback({ userId, courseId, rating, comment })
      await feedback.save()
      created = true
    }

    // Update course rating using new rating when created; when updated, recompute average quickly
    if (created) {
      const course = await Course.findById(courseId)
      if (course) {
        const total = course.rating.average * course.rating.count + rating
        course.rating.count += 1
        course.rating.average = total / course.rating.count
        await course.save()
      }
    } else {
      // recompute average from all feedbacks
      const agg = await Feedback.aggregate([
        { $match: { courseId } },
        { $group: { _id: '$courseId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
      ])
      if (agg[0]) {
        await Course.updateOne({ _id: courseId }, { $set: { 'rating.average': agg[0].avg, 'rating.count': agg[0].count } })
      }
    }

    res.status(200).json({ success: true, message: 'Feedback submitted', data: { feedback } })
  } catch (error: any) {
    console.error('Submit feedback error:', error)
    res.status(500).json({ success: false, message: 'Failed to submit feedback' })
  }
}

// Get feedback list for a course (public)
export const getCourseFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params
    const feedback = await Feedback.find({ courseId }).sort({ createdAt: -1 }).limit(50).select('-__v')
    res.status(200).json({ success: true, message: 'Feedback retrieved', data: { feedback } })
  } catch (error: any) {
    console.error('Get feedback error:', error)
    res.status(500).json({ success: false, message: 'Failed to load feedback' })
  }
}

// Get single course by ID (public)
export const getCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params
    
    console.log('=== getCourse Request ===')
    console.log('Course ID:', courseId)
    console.log('User ID:', req.userId)

    const course = await Course.findOne({
      _id: courseId,
      isPublished: true
    }).select('-__v')

    if (!course) {
      console.log('❌ Course not found in database')
      res.status(404).json({
        success: false,
        message: 'Course not found'
      })
      return
    }
    
    console.log('✅ Course found:', course.title)

    // Get course videos (only preview videos for non-enrolled users)
    const isEnrolled = req.user ? await Enrollment.findOne({
      userId: req.userId,
      courseId,
      status: { $in: ['active', 'completed'] }
    }) : null
    
    console.log('Enrollment status:', isEnrolled ? 'Enrolled' : 'Not enrolled')

    const videoQuery: any = { courseId, isPublished: true }
    if (!isEnrolled) {
      videoQuery.isPreview = true
    }
    
    console.log('Video query:', JSON.stringify(videoQuery))

    const videos = await Video.find(videoQuery)
      .sort({ order: 1 })
      .select('-__v')
      
    console.log('Videos found:', videos.length)
    console.log('Video titles:', videos.map(v => v.title))

    // Get course quizzes (only for enrolled users)
    const quizzes = isEnrolled ? await Quiz.find({
      courseId,
      isPublished: true
    }).sort({ order: 1 }).select('-questions.correctAnswer -__v') : []

    console.log('Sending response with', videos.length, 'videos')

    res.status(200).json({
      success: true,
      message: 'Course retrieved successfully',
      data: {
        course,
        videos,
        quizzes,
        isEnrolled: !!isEnrolled,
        enrollment: isEnrolled || null
      }
    })

  } catch (error: any) {
    console.error('Get course error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course',
      errors: ['Internal server error']
    })
  }
}

// Enroll in course (protected)
export const enrollCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params
    const userId = req.userId!

    // Check if course exists
    const course = await Course.findOne({
      _id: courseId,
      isPublished: true
    })

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      })
      return
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId,
      courseId
    })

    if (existingEnrollment) {
      res.status(409).json({
        success: false,
        message: 'Already enrolled in this course',
        data: { enrollment: existingEnrollment }
      })
      return
    }

    // Get course stats
    const totalVideos = await Video.countDocuments({
      courseId,
      isPublished: true
    })

    const totalQuizzes = await Quiz.countDocuments({
      courseId,
      isPublished: true
    })

    // Create enrollment
    const enrollment = new Enrollment({
      userId,
      courseId,
      progress: {
        videosCompleted: 0,
        totalVideos,
        quizzesPassed: 0,
        totalQuizzes,
        overallPercentage: 0
      }
    })

    await enrollment.save()

    // Update course enrollment count
    course.enrollmentCount += 1
    await course.save()

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course!',
      data: { enrollment }
    })

  } catch (error: any) {
    console.error('Enroll course error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course',
      errors: ['Internal server error']
    })
  }
}

// Unenroll from course (protected)
export const unenrollCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params
    const userId = req.userId!

    // Find enrollment
    const enrollment = await Enrollment.findOne({ userId, courseId })

    if (!enrollment) {
      res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      })
      return
    }

    // Remove enrollment
    await Enrollment.deleteOne({ _id: enrollment._id })

    // Decrement course enrollment count (safely)
    const course = await Course.findOne({ _id: courseId })
    if (course) {
      course.enrollmentCount = Math.max(0, (course.enrollmentCount || 0) - 1)
      await course.save()
    }

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from course'
    })

  } catch (error: any) {
    console.error('Unenroll course error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to unenroll from course',
      errors: ['Internal server error']
    })
  }
}

// Get user's enrollments (protected)
export const getUserEnrollments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!
    const { status, page = 1, limit = 10 } = req.query

    // Build query
    const query: any = { userId }
    if (status) {
      query.status = status
    }

    const skip = (Number(page) - 1) * Number(limit)

    const enrollments = await Enrollment.find(query)
      .sort({ lastAccessedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate({
        path: 'courseId',
        model: 'Course',
        select: 'title shortDescription thumbnail category level duration price rating'
      })
      .select('-__v')

    const total = await Enrollment.countDocuments(query)

    res.status(200).json({
      success: true,
      message: 'Enrollments retrieved successfully',
      data: {
        enrollments,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          total
        }
      }
    })

  } catch (error: any) {
    console.error('Get enrollments error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve enrollments',
      errors: ['Internal server error']
    })
  }
}

// Get course categories (public)
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Course.distinct('category', { isPublished: true })
    
    // Get course count for each category
    const categoryStats = await Promise.all(
      categories.map(async (category) => ({
        name: category,
        count: await Course.countDocuments({ category, isPublished: true })
      }))
    )

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: { categories: categoryStats }
    })

  } catch (error: any) {
    console.error('Get categories error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      errors: ['Internal server error']
    })
  }
}

// Admin: Create course (protected - admin only)
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== Create Course Request ===')
    console.log('Body:', req.body)
    console.log('Files:', req.files)
    
    const {
      title,
      description,
      shortDescription,
      category,
      level,
      price,
      tags,
      requirements,
      learningOutcomes
    } = req.body

    // Validate required fields
    if (!title || !description || !shortDescription || !category || !level) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: ['Title, description, short description, category, and level are required']
      })
      return
    }

    // Get files from uploaded files (using multer fields)
    const files = req.files as { [fieldname: string]: Express.Multer.File[] }
    
    // Get thumbnail from uploaded file or use default
    let thumbnail = '/level up.png'
    if (files && files.thumbnail && files.thumbnail[0]) {
      thumbnail = `/uploads/thumbnails/${files.thumbnail[0].filename}`
    }

    // Get preview video from uploaded file if provided
    let previewVideo = ''
    if (files && files.previewVideo && files.previewVideo[0]) {
      previewVideo = `/uploads/videos/${files.previewVideo[0].filename}`
    }

    const instructor = {
      id: req.userId!,
      name: req.user!.name,
      email: req.user!.email
    }

    // Parse array fields if they come as JSON strings (safely)
    let parsedTags: string[] = []
    let parsedRequirements: string[] = []
    let parsedLearningOutcomes: string[] = []

    try {
      parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : []
      parsedRequirements = requirements ? (typeof requirements === 'string' ? JSON.parse(requirements) : requirements) : []
      parsedLearningOutcomes = learningOutcomes ? (typeof learningOutcomes === 'string' ? JSON.parse(learningOutcomes) : learningOutcomes) : []
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      // If parsing fails, use empty arrays
      parsedTags = []
      parsedRequirements = []
      parsedLearningOutcomes = []
    }

    const course = new Course({
      title: title.trim(),
      description: description.trim(),
      shortDescription: shortDescription.trim(),
      instructor,
      category: category.trim(),
      level,
      duration: 0, // Will be calculated from videos
      price: Number(price) || 0,
      thumbnail,
      previewVideo,
      tags: parsedTags,
      requirements: parsedRequirements,
      learningOutcomes: parsedLearningOutcomes,
      isPublished: true // Publish by default
    })

    console.log('Course object before save:', course)

    await course.save()

    console.log('Course saved successfully:', course._id)

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course }
    })

  } catch (error: any) {
    console.error('Create course error:', error)
    console.error('Error details:', error.message)
    console.error('Error stack:', error.stack)

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      console.error('Validation errors:', errors)
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      })
      return
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      errors: [error.message || 'Internal server error']
    })
  }
}

// Delete course (protected - admin/teacher only)
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params
    const userId = req.userId!
    const userRole = req.user!.role

    // Find the course
    const course = await Course.findById(courseId)

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      })
      return
    }

    // Check authorization: only admin or instructor can delete courses
    if (userRole !== 'admin' && userRole !== 'instructor') {
      res.status(403).json({
        success: false,
        message: 'Only instructors can delete courses'
      })
      return
    }

    // Delete related data
    // Delete all videos for this course
    await Video.deleteMany({ courseId })

    // Delete all quizzes for this course
    await Quiz.deleteMany({ courseId })

    // Delete all enrollments for this course
    await Enrollment.deleteMany({ courseId })

    // Delete all feedback for this course
    await Feedback.deleteMany({ courseId })

    // Delete the course
    await Course.deleteOne({ _id: courseId })

    res.status(200).json({
      success: true,
      message: 'Course and related data deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete course error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      errors: ['Internal server error']
    })
  }
}

