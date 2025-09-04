import mongoose, { Document, Schema } from 'mongoose'
import bcrypt from 'bcryptjs'

// User interface for TypeScript
export interface IUser extends Document {
  _id: any
  name: string
  email: string
  password: string
  avatar?: string
  role: 'student' | 'instructor' | 'admin'
  isEmailVerified: boolean
  createdAt: Date
  updatedAt: Date
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>
}

// User Schema
const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't include password in queries by default
    },
    avatar: {
      type: String,
      default: ''
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

// Index for better performance
UserSchema.index({ email: 1 })

// Pre-save middleware to hash password
UserSchema.pre<IUser>('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next()
  }

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error: any) {
    next(error)
  }
})

// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    return false
  }
}

// Static method to find user by email and include password
UserSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email }).select('+password')
}

export default mongoose.model<IUser>('User', UserSchema)
