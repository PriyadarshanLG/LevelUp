import mongoose, { Document, Schema } from 'mongoose'

// Video interface for TypeScript
export interface IVideo extends Document {
  _id: any
  courseId: string
  title: string
  description: string
  videoUrl: string
  duration: number // in seconds
  order: number // position within the course
  isPreview: boolean // can be watched without enrollment
  startTime?: number // Optional: start time in seconds for chapters
  thumbnail: string
  resources: {
    title: string
    url: string
    type: 'pdf' | 'link' | 'download'
  }[]
  transcription?: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

// Video Schema
const VideoSchema: Schema<IVideo> = new Schema(
  {
    courseId: {
      type: String,
      required: [true, 'Course ID is required'],
      ref: 'Course'
    },
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
      maxlength: [100, 'Video title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Video description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true
    },
    duration: {
      type: Number,
      required: [true, 'Video duration is required'],
      min: [1, 'Duration must be at least 1 second']
    },
    order: {
      type: Number,
      required: [true, 'Video order is required'],
      min: [1, 'Order must be at least 1']
    },
    isPreview: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: Number,
      required: false
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail URL is required']
    },
    resources: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      url: {
        type: String,
        required: true,
        trim: true
      },
      type: {
        type: String,
        required: true,
        enum: ['pdf', 'link', 'download']
      }
    }],
    transcription: {
      type: String,
      trim: true
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

// Indexes for better performance
VideoSchema.index({ courseId: 1, order: 1 })
VideoSchema.index({ courseId: 1, isPublished: 1 })
VideoSchema.index({ isPreview: 1 })

// Ensure unique order within each course
VideoSchema.index({ courseId: 1, order: 1 }, { unique: true })

// Virtual for formatted duration
VideoSchema.virtual('formattedDuration').get(function() {
  const minutes = Math.floor(this.duration / 60)
  const seconds = this.duration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Method to get next video in course
VideoSchema.methods.getNextVideo = function() {
  return mongoose.model('Video').findOne({
    courseId: this.courseId,
    order: this.order + 1,
    isPublished: true
  })
}

// Method to get previous video in course
VideoSchema.methods.getPreviousVideo = function() {
  return mongoose.model('Video').findOne({
    courseId: this.courseId,
    order: this.order - 1,
    isPublished: true
  })
}

export default mongoose.model<IVideo>('Video', VideoSchema)

