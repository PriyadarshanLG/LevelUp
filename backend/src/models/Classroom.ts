import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IClassroom extends Document {
  _id: Types.ObjectId
  name: string
  description: string
  pin: string
  teacher: Types.ObjectId
  students: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const ClassroomSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Classroom name is required'],
      trim: true,
      maxlength: [100, 'Classroom name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    pin: {
      type: String,
      required: true,
      unique: true,
      length: [6, 'PIN must be exactly 6 characters']
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    students: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true
  }
)

// Index for faster queries
ClassroomSchema.index({ teacher: 1 })
ClassroomSchema.index({ pin: 1 })
ClassroomSchema.index({ students: 1 })

export default mongoose.model<IClassroom>('Classroom', ClassroomSchema)
