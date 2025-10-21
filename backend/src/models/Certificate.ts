import mongoose, { Document, Schema } from 'mongoose'

// Certificate interface for TypeScript
export interface ICertificate extends Document {
  _id: any
  userId: string
  courseId: string
  userName: string
  courseName: string
  issuedAt: Date
  certificateUrl: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

// Certificate Schema
const CertificateSchema: Schema<ICertificate> = new Schema(
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
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true
    },
    issuedAt: {
      type: Date,
      default: Date.now
    },
    certificateUrl: {
      type: String,
      required: [true, 'Certificate URL is required']
    },
    isVerified: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

// Indexes for better performance
CertificateSchema.index({ userId: 1, courseId: 1 }, { unique: true })
CertificateSchema.index({ issuedAt: -1 })

export default mongoose.model<ICertificate>('Certificate', CertificateSchema)

