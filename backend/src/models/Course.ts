import mongoose, { Document, Schema } from 'mongoose'

// Course interface for TypeScript
export interface ICourse extends Document {
  _id: any
  title: string
  description: string
  shortDescription: string
  instructor: {
    id: string
    name: string
    email: string
  }
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number // in minutes
  price: number
  thumbnail: string
  previewVideo?: string
  tags: string[]
  isPublished: boolean
  enrollmentCount: number
  rating: {
    average: number
    count: number
  }
  requirements: string[]
  learningOutcomes: string[]
  createdAt: Date
  updatedAt: Date
}

// Course Schema
const CourseSchema: Schema<ICourse> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [100, 'Course title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      maxlength: [200, 'Short description cannot be more than 200 characters']
    },
    instructor: {
      id: {
        type: String,
        required: true
      },
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        lowercase: true
      }
    },
    category: {
      type: String,
      required: [true, 'Course category is required'],
      enum: [
        'Programming',
        'Design',
        'Business',
        'Marketing',
        'Data Science',
        'Personal Development',
        'Language',
        'Health & Fitness',
        'Music',
        'Photography'
      ]
    },
    level: {
      type: String,
      required: [true, 'Course level is required'],
      enum: ['beginner', 'intermediate', 'advanced']
    },
    duration: {
      type: Number,
      required: [true, 'Course duration is required'],
      min: [1, 'Duration must be at least 1 minute']
    },
    price: {
      type: Number,
      required: [true, 'Course price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0
    },
    thumbnail: {
      type: String,
      required: [true, 'Course thumbnail is required']
    },
    previewVideo: {
      type: String,
      default: ''
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    isPublished: {
      type: Boolean,
      default: false
    },
    enrollmentCount: {
      type: Number,
      default: 0,
      min: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    requirements: [{
      type: String,
      trim: true
    }],
    learningOutcomes: [{
      type: String,
      trim: true
    }]
  },
  {
    timestamps: true
  }
)

// Indexes for better performance
CourseSchema.index({ category: 1, level: 1 })
CourseSchema.index({ isPublished: 1, createdAt: -1 })
CourseSchema.index({ 'instructor.id': 1 })
CourseSchema.index({ tags: 1 })

// Virtual for course URL slug
CourseSchema.virtual('slug').get(function() {
  return this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
})

// Method to update rating
CourseSchema.methods.updateRating = function(newRating: number) {
  const totalRating = this.rating.average * this.rating.count + newRating
  this.rating.count += 1
  this.rating.average = totalRating / this.rating.count
  return this.save()
}

export default mongoose.model<ICourse>('Course', CourseSchema)

