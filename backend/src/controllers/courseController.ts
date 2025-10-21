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

    const course = await Course.findOne({
      _id: courseId,
      isPublished: true
    }).select('-__v')

    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      })
      return
    }

    // Get course videos (only preview videos for non-enrolled users)
    const isEnrolled = req.user ? await Enrollment.findOne({
      userId: req.userId,
      courseId,
      status: { $in: ['active', 'completed'] }
    }) : null

    const videoQuery: any = { courseId, isPublished: true }
    if (!isEnrolled) {
      videoQuery.isPreview = true
    }

    const videos = await Video.find(videoQuery)
      .sort({ order: 1 })
      .select('-__v')

    // Get course quizzes (only for enrolled users)
    const quizzes = isEnrolled ? await Quiz.find({
      courseId,
      isPublished: true
    }).sort({ order: 1 }).select('-questions.correctAnswer -__v') : []

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

// Admin: Create course (protected - admin/instructor only)
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      shortDescription,
      category,
      level,
      price,
      thumbnail,
      previewVideo,
      tags,
      requirements,
      learningOutcomes
    } = req.body

    const instructor = {
      id: req.userId!,
      name: req.user!.name,
      email: req.user!.email
    }

    const course = new Course({
      title,
      description,
      shortDescription,
      instructor,
      category,
      level,
      duration: 0, // Will be calculated from videos
      price,
      thumbnail,
      previewVideo,
      tags,
      requirements,
      learningOutcomes,
      isPublished: true // Publish by default
    })

    await course.save()

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course }
    })

  } catch (error: any) {
    console.error('Create course error:', error)

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
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
      errors: ['Internal server error']
    })
  }
}

