import { Request, Response } from 'express'
import Video, { IVideo } from '../models/Video'
import Course from '../models/Course'
import Enrollment from '../models/Enrollment'

// Get video by ID (protected for enrolled users)
export const getVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params
    const userId = req.userId

    const video = await Video.findOne({
      _id: videoId,
      isPublished: true
    }).select('-__v')

    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found'
      })
      return
    }

    // Check if user is enrolled or if video is a preview
    if (!video.isPreview && userId) {
      const enrollment = await Enrollment.findOne({
        userId,
        courseId: video.courseId,
        status: { $in: ['active', 'completed'] }
      })

      if (!enrollment) {
        res.status(403).json({
          success: false,
          message: 'You must be enrolled in the course to watch this video'
        })
        return
      }
    } else if (!video.isPreview && !userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required to watch this video'
      })
      return
    }

    // Get user's progress for this video (if authenticated)
    let videoProgress = null
    if (userId) {
      const enrollment = await Enrollment.findOne({
        userId,
        courseId: video.courseId
      })

      if (enrollment) {
        videoProgress = enrollment.videoProgress.find(vp => vp.videoId === videoId)
      }
    }

    res.status(200).json({
      success: true,
      message: 'Video retrieved successfully',
      data: {
        video,
        progress: videoProgress
      }
    })

  } catch (error: any) {
    console.error('Get video error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve video',
      errors: ['Internal server error']
    })
  }
}

// Update video progress (protected)
export const updateVideoProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params
    const { watchedDuration, isCompleted = false } = req.body
    const userId = req.userId!

    // Validate input
    if (typeof watchedDuration !== 'number' || watchedDuration < 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid watched duration'
      })
      return
    }

    // Get video
    const video = await Video.findById(videoId)
    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found'
      })
      return
    }

    // Get enrollment
    const enrollment = await Enrollment.findOne({
      userId,
      courseId: video.courseId,
      status: { $in: ['active', 'completed'] }
    })

    if (!enrollment) {
      res.status(403).json({
        success: false,
        message: 'You must be enrolled in the course to track progress'
      })
      return
    }

    // Update progress
    await enrollment.updateVideoProgress(videoId, watchedDuration, isCompleted)

    res.status(200).json({
      success: true,
      message: 'Video progress updated successfully',
      data: {
        progress: enrollment.progress,
        videoProgress: enrollment.videoProgress.find(vp => vp.videoId === videoId)
      }
    })

  } catch (error: any) {
    console.error('Update video progress error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update video progress',
      errors: ['Internal server error']
    })
  }
}

// Get course videos (protected for enrolled users)
export const getCourseVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params
    const userId = req.userId

    // Check if course exists
    const course = await Course.findById(courseId)
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      })
      return
    }

    // Check enrollment
    let enrollment = null
    if (userId) {
      enrollment = await Enrollment.findOne({
        userId,
        courseId,
        status: { $in: ['active', 'completed'] }
      })
    }

    // Build video query
    const videoQuery: any = { courseId, isPublished: true }
    if (!enrollment) {
      videoQuery.isPreview = true // Only preview videos for non-enrolled users
    }

    const videos = await Video.find(videoQuery)
      .sort({ order: 1 })
      .select('-__v')

    // Add progress information for enrolled users
    const videosWithProgress = videos.map(video => {
      const videoObj = video.toObject() as any
      
      if (enrollment) {
        const progress = enrollment.videoProgress.find((vp: any) => vp.videoId === video._id.toString())
        videoObj.progress = progress || {
          isCompleted: false,
          watchedDuration: 0,
          lastWatchedAt: null
        }
      }
      
      return videoObj
    })

    res.status(200).json({
      success: true,
      message: 'Course videos retrieved successfully',
      data: {
        videos: videosWithProgress,
        isEnrolled: !!enrollment,
        totalVideos: videos.length
      }
    })

  } catch (error: any) {
    console.error('Get course videos error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course videos',
      errors: ['Internal server error']
    })
  }
}

// Admin: Create video (protected - instructor/admin only)
export const createVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      courseId,
      title,
      description,
      videoUrl,
      duration,
      order,
      isPreview = false,
      thumbnail,
      resources = [],
      transcription
    } = req.body

    // Check if course exists and user has permission
    const course = await Course.findById(courseId)
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      })
      return
    }

    // Check if user is the instructor of the course (basic check)
    if (course.instructor.id !== req.userId && req.user!.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You can only add videos to your own courses'
      })
      return
    }

    const video = new Video({
      courseId,
      title,
      description,
      videoUrl,
      duration,
      order,
      isPreview,
      thumbnail,
      resources,
      transcription
    })

    await video.save()

    // Update course duration
    const totalDuration = await Video.aggregate([
      { $match: { courseId, isPublished: true } },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ])

    if (totalDuration.length > 0) {
      course.duration = Math.ceil(totalDuration[0].total / 60) // Convert to minutes
      await course.save()
    }

    res.status(201).json({
      success: true,
      message: 'Video created successfully',
      data: { video }
    })

  } catch (error: any) {
    console.error('Create video error:', error)

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      })
      return
    }

    // Handle duplicate order error
    if (error.code === 11000 && error.keyPattern?.order) {
      res.status(409).json({
        success: false,
        message: 'A video with this order already exists in the course',
        errors: ['Duplicate video order']
      })
      return
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create video',
      errors: ['Internal server error']
    })
  }
}

// Admin: Update video (protected - instructor/admin only)
export const updateVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { videoId } = req.params
    const updates = req.body

    const video = await Video.findById(videoId)
    if (!video) {
      res.status(404).json({
        success: false,
        message: 'Video not found'
      })
      return
    }

    // Check if user has permission
    const course = await Course.findById(video.courseId)
    if (!course || (course.instructor.id !== req.userId && req.user!.role !== 'admin')) {
      res.status(403).json({
        success: false,
        message: 'You can only edit videos in your own courses'
      })
      return
    }

    // Update video
    Object.assign(video, updates)
    await video.save()

    res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      data: { video }
    })

  } catch (error: any) {
    console.error('Update video error:', error)

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
      message: 'Failed to update video',
      errors: ['Internal server error']
    })
  }
}

// Debug: Get all videos (protected - admin only)
export const getAllVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const videos = await Video.find({})
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .select('-__v')

    res.status(200).json({
      success: true,
      message: 'All videos retrieved successfully',
      data: {
        videos,
        count: videos.length
      }
    })

  } catch (error: any) {
    console.error('Get all videos error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve videos',
      errors: ['Internal server error']
    })
  }
}
