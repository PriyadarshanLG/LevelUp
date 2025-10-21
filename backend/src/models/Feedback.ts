import mongoose, { Document, Schema } from 'mongoose'

export interface IFeedback extends Document {
  userId: string
  courseId: string
  rating: number
  comment?: string
  createdAt: Date
  updatedAt: Date
}

const FeedbackSchema: Schema<IFeedback> = new Schema(
  {
    userId: { type: String, required: true, ref: 'User' },
    courseId: { type: String, required: true, ref: 'Course' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
)

FeedbackSchema.index({ courseId: 1, createdAt: -1 })
FeedbackSchema.index({ userId: 1, courseId: 1 }, { unique: true })

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema)










