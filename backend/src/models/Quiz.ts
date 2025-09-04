import mongoose, { Schema, Document, Types } from 'mongoose'

// Question types enum
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SINGLE_CHOICE = 'single_choice',
  FILL_IN_BLANK = 'fill_in_blank'
}

// Question option interface
export interface IQuestionOption {
  id: string
  text: string
  isCorrect: boolean
}

// Question interface
export interface IQuestion {
  id: string
  type: QuestionType
  question: string
  options: IQuestionOption[]
  correctAnswers: string[] // For multiple correct answers
  explanation?: string
  points: number
  order: number
}

// Quiz attempt interface
export interface IQuizAttempt {
  userId: Types.ObjectId
  answers: {
    questionId: string
    selectedOptions: string[]
    textAnswer?: string
  }[]
  score: number
  maxScore: number
  percentage: number
  timeSpent: number // in seconds
  completedAt: Date
  passed: boolean
}

// Main Quiz interface
export interface IQuiz extends Document {
  _id: Types.ObjectId
  courseId: Types.ObjectId
  title: string
  description: string
  instructions: string[]
  
  // Quiz settings
  timeLimit: number // in minutes, 0 = unlimited
  passingScore: number // percentage (0-100)
  maxAttempts: number // 0 = unlimited
  randomizeQuestions: boolean
  showCorrectAnswers: boolean
  allowReview: boolean
  
  // Questions
  questions: IQuestion[]
  totalPoints: number
  
  // Metadata
  isPublished: boolean
  order: number // Position in course
  createdBy: Types.ObjectId
  
  // Attempts
  attempts: IQuizAttempt[]
  
  // Stats
  averageScore: number
  totalAttempts: number
  passRate: number
  
  timestamps: {
    createdAt: Date
    updatedAt: Date
  }

  // Custom methods
  calculateStats(): void
  getUserBestAttempt(userId: Types.ObjectId): IQuizAttempt | null
  canUserAttempt(userId: Types.ObjectId): boolean
  getRandomizedQuestions(): IQuestion[]
}

// Question Option Schema
const QuestionOptionSchema = new Schema({
  id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false
  }
}, { _id: false })

// Question Schema
const QuestionSchema = new Schema({
  id: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  type: {
    type: String,
    enum: Object.values(QuestionType),
    required: true,
    default: QuestionType.MULTIPLE_CHOICE
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [QuestionOptionSchema],
    required: true,
    validate: {
      validator: function(options: IQuestionOption[]) {
        return options.length >= 2
      },
      message: 'At least 2 options are required'
    }
  },
  correctAnswers: {
    type: [String],
    required: true,
    validate: {
      validator: function(answers: string[]) {
        return answers.length > 0
      },
      message: 'At least one correct answer is required'
    }
  },
  explanation: {
    type: String,
    trim: true
  },
  points: {
    type: Number,
    required: true,
    default: 1,
    min: 0
  },
  order: {
    type: Number,
    required: true,
    default: 0
  }
}, { _id: false })

// Quiz Attempt Schema
const QuizAttemptSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionId: {
      type: String,
      required: true
    },
    selectedOptions: [{
      type: String,
      required: true
    }],
    textAnswer: {
      type: String,
      trim: true
    }
  }],
  score: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  maxScore: {
    type: Number,
    required: true,
    default: 0
  },
  percentage: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  completedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  passed: {
    type: Boolean,
    required: true,
    default: false
  }
}, { _id: false })

// Main Quiz Schema
const QuizSchema = new Schema<IQuiz>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxLength: 1000
  },
  instructions: {
    type: [String],
    default: []
  },
  
  // Quiz settings
  timeLimit: {
    type: Number,
    default: 0, // 0 = unlimited
    min: 0
  },
  passingScore: {
    type: Number,
    required: true,
    default: 70,
    min: 0,
    max: 100
  },
  maxAttempts: {
    type: Number,
    default: 3, // 0 = unlimited
    min: 0
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true
  },
  allowReview: {
    type: Boolean,
    default: true
  },
  
  // Questions
  questions: {
    type: [QuestionSchema],
    required: true,
    validate: {
      validator: function(questions: IQuestion[]) {
        return questions.length > 0
      },
      message: 'At least one question is required'
    }
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Metadata
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  },
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Attempts
  attempts: {
    type: [QuizAttemptSchema],
    default: []
  },
  
  // Stats (calculated fields)
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalAttempts: {
    type: Number,
    default: 0,
    min: 0
  },
  passRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      delete ret.__v
      return ret
    }
  }
})

// Indexes for performance
QuizSchema.index({ courseId: 1, order: 1 })
QuizSchema.index({ courseId: 1, isPublished: 1 })
QuizSchema.index({ 'attempts.userId': 1 })
QuizSchema.index({ createdBy: 1 })

// Pre-save middleware to calculate total points
QuizSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0)
  }
  next()
})

// Method to calculate quiz statistics
QuizSchema.methods.calculateStats = function() {
  const attempts = this.attempts
  
  if (attempts.length === 0) {
    this.averageScore = 0
    this.totalAttempts = 0
    this.passRate = 0
    return
  }
  
  this.totalAttempts = attempts.length
  
  const totalScore = attempts.reduce((sum: number, attempt: IQuizAttempt) => sum + attempt.percentage, 0)
  this.averageScore = Math.round(totalScore / attempts.length)
  
  const passedAttempts = attempts.filter((attempt: IQuizAttempt) => attempt.passed).length
  this.passRate = Math.round((passedAttempts / attempts.length) * 100)
}

// Method to get user's best attempt
QuizSchema.methods.getUserBestAttempt = function(userId: Types.ObjectId) {
  const userAttempts = this.attempts.filter((attempt: IQuizAttempt) => 
    attempt.userId.toString() === userId.toString()
  )
  
  if (userAttempts.length === 0) return null
  
  return userAttempts.reduce((best: IQuizAttempt, current: IQuizAttempt) => 
    current.score > best.score ? current : best
  )
}

// Method to check if user can attempt quiz
QuizSchema.methods.canUserAttempt = function(userId: Types.ObjectId): boolean {
  if (this.maxAttempts === 0) return true // Unlimited attempts
  
  const userAttempts = this.attempts.filter((attempt: IQuizAttempt) => 
    attempt.userId.toString() === userId.toString()
  )
  
  return userAttempts.length < this.maxAttempts
}

// Method to randomize questions
QuizSchema.methods.getRandomizedQuestions = function(): IQuestion[] {
  if (!this.randomizeQuestions) {
    return [...this.questions].sort((a, b) => a.order - b.order)
  }
  
  const questions = [...this.questions]
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[questions[i], questions[j]] = [questions[j], questions[i]]
  }
  
  return questions
}

// Static method to find quizzes by course
QuizSchema.statics.findByCourse = function(courseId: Types.ObjectId, isPublished: boolean = true) {
  return this.find({
    courseId,
    ...(isPublished !== undefined && { isPublished })
  }).sort({ order: 1 })
}

const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema)

export default Quiz