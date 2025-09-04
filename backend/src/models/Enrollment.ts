import mongoose, { Document, Schema } from 'mongoose'

// Video progress interface
interface IVideoProgress {
  videoId: string
  isCompleted: boolean
  watchedDuration: number // in seconds
  lastWatchedAt: Date
  completedAt?: Date
}

// Quiz attempt interface
interface IQuizAttempt {
  quizId: string
  attemptNumber: number
  answers: Record<string, any> // question index -> user answer
  score: {
    earnedPoints: number
    totalPoints: number
    percentage: number
    passed: boolean
  }
  startedAt: Date
  completedAt: Date
  timeSpent: number // in seconds
}

// Enrollment interface for TypeScript
export interface IEnrollment extends Document {
  _id: any
  userId: string
  courseId: string
  status: 'active' | 'completed' | 'paused' | 'dropped'
  progress: {
    videosCompleted: number
    totalVideos: number
    quizzesPassed: number
    totalQuizzes: number
    overallPercentage: number
  }
  videoProgress: IVideoProgress[]
  quizAttempts: IQuizAttempt[]
  enrolledAt: Date
  completedAt?: Date
  certificateIssued: boolean
  lastAccessedAt: Date
  totalWatchTime: number // in seconds
  createdAt: Date
  updatedAt: Date
  // Methods
  updateVideoProgress(videoId: string, watchedDuration: number, isCompleted?: boolean): Promise<IEnrollment>
  addQuizAttempt(attempt: IQuizAttempt): Promise<IEnrollment>
  updateOverallProgress(): void
  getBestQuizScore(quizId: string): IQuizAttempt | null
  canAttemptQuiz(quizId: string, maxAttempts: number): boolean
}

// Enrollment Schema
const EnrollmentSchema: Schema<IEnrollment> = new Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      ref: 'User'
    },
    courseId: {
      type: String,
      required: [true, 'Course ID is required'],
      ref: 'Course'
    },
    status: {
      type: String,
      required: [true, 'Enrollment status is required'],
      enum: ['active', 'completed', 'paused', 'dropped'],
      default: 'active'
    },
    progress: {
      videosCompleted: {
        type: Number,
        default: 0,
        min: 0
      },
      totalVideos: {
        type: Number,
        default: 0,
        min: 0
      },
      quizzesPassed: {
        type: Number,
        default: 0,
        min: 0
      },
      totalQuizzes: {
        type: Number,
        default: 0,
        min: 0
      },
      overallPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    },
    videoProgress: [{
      videoId: {
        type: String,
        required: true,
        ref: 'Video'
      },
      isCompleted: {
        type: Boolean,
        default: false
      },
      watchedDuration: {
        type: Number,
        default: 0,
        min: 0
      },
      lastWatchedAt: {
        type: Date,
        default: Date.now
      },
      completedAt: {
        type: Date
      }
    }],
    quizAttempts: [{
      quizId: {
        type: String,
        required: true,
        ref: 'Quiz'
      },
      attemptNumber: {
        type: Number,
        required: true,
        min: 1
      },
      answers: {
        type: Schema.Types.Mixed,
        required: true
      },
      score: {
        earnedPoints: {
          type: Number,
          required: true,
          min: 0
        },
        totalPoints: {
          type: Number,
          required: true,
          min: 0
        },
        percentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100
        },
        passed: {
          type: Boolean,
          required: true
        }
      },
      startedAt: {
        type: Date,
        required: true
      },
      completedAt: {
        type: Date,
        required: true
      },
      timeSpent: {
        type: Number,
        required: true,
        min: 0
      }
    }],
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    },
    certificateIssued: {
      type: Boolean,
      default: false
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now
    },
    totalWatchTime: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
)

// Compound index to ensure one enrollment per user per course
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true })

// Other indexes for better performance
EnrollmentSchema.index({ userId: 1, status: 1 })
EnrollmentSchema.index({ courseId: 1, status: 1 })
EnrollmentSchema.index({ lastAccessedAt: -1 })

// Method to update video progress
EnrollmentSchema.methods.updateVideoProgress = function(videoId: string, watchedDuration: number, isCompleted: boolean = false) {
  const existingProgress = this.videoProgress.find((vp: any) => vp.videoId === videoId)
  
  if (existingProgress) {
    existingProgress.watchedDuration = Math.max(existingProgress.watchedDuration, watchedDuration)
    existingProgress.lastWatchedAt = new Date()
    
    if (isCompleted && !existingProgress.isCompleted) {
      existingProgress.isCompleted = true
      existingProgress.completedAt = new Date()
      this.progress.videosCompleted += 1
    }
  } else {
    this.videoProgress.push({
      videoId,
      isCompleted,
      watchedDuration,
      lastWatchedAt: new Date(),
      completedAt: isCompleted ? new Date() : undefined
    })
    
    if (isCompleted) {
      this.progress.videosCompleted += 1
    }
  }
  
  this.lastAccessedAt = new Date()
  this.totalWatchTime += watchedDuration
  this.updateOverallProgress()
  
  return this.save()
}

// Method to add quiz attempt
EnrollmentSchema.methods.addQuizAttempt = function(attempt: IQuizAttempt) {
  this.quizAttempts.push(attempt)
  
  // Check if this is the first passing attempt for this quiz
  const previousAttempts = this.quizAttempts.filter(
    (qa: any) => qa.quizId === attempt.quizId && qa.attemptNumber < attempt.attemptNumber
  )
  
  const hadPassedBefore = previousAttempts.some((pa: any) => pa.score.passed)
  
  if (attempt.score.passed && !hadPassedBefore) {
    this.progress.quizzesPassed += 1
  }
  
  this.lastAccessedAt = new Date()
  this.updateOverallProgress()
  
  return this.save()
}

// Method to update overall progress
EnrollmentSchema.methods.updateOverallProgress = function() {
  const videoProgress = this.progress.totalVideos > 0 ? 
    (this.progress.videosCompleted / this.progress.totalVideos) * 70 : 0 // Videos are 70% of progress
  
  const quizProgress = this.progress.totalQuizzes > 0 ? 
    (this.progress.quizzesPassed / this.progress.totalQuizzes) * 30 : 0 // Quizzes are 30% of progress
  
  this.progress.overallPercentage = Math.round(videoProgress + quizProgress)
  
  // Mark as completed if 100% progress
  if (this.progress.overallPercentage === 100 && this.status === 'active') {
    this.status = 'completed'
    this.completedAt = new Date()
  }
}

// Method to get best quiz score for a specific quiz
EnrollmentSchema.methods.getBestQuizScore = function(quizId: string) {
  const attempts = this.quizAttempts.filter((qa: any) => qa.quizId === quizId)
  
  if (attempts.length === 0) return null
  
  return attempts.reduce((best: any, current: any) => 
    current.score.percentage > best.score.percentage ? current : best
  )
}

// Method to check if user can attempt quiz
EnrollmentSchema.methods.canAttemptQuiz = function(quizId: string, maxAttempts: number) {
  if (maxAttempts === 0) return true // Unlimited attempts
  
  const attemptCount = this.quizAttempts.filter((qa: any) => qa.quizId === quizId).length
  return attemptCount < maxAttempts
}

export default mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema)
