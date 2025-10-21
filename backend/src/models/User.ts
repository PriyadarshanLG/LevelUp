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
  // Profile fields
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  phoneNumber?: string
  country?: string
  hobbies?: string[]
  institution?: string
  position?: 'Student' | 'Faculty' | 'Intern' | 'Employee' | 'Freelancer'
  department?: string
  yearOfStudy?: string
  experienceLevel?: string
  fieldOfInterest?: string[]
  preferredLearningMode?: 'Video' | 'Text' | 'Interactive'
  preferredLanguage?: string
  careerGoal?: string
  profession?: string
  organization?: string
  bio?: string
  location?: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    github?: string
    website?: string
  }
  interests?: string[]
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
    },
    // Profile fields
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    phoneNumber: {
      type: String,
      match: [/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please provide a valid phone number']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country cannot be more than 100 characters']
    },
    hobbies: [{
      type: String,
      trim: true
    }],
    institution: {
      type: String,
      trim: true,
      maxlength: [100, 'Institution name cannot be more than 100 characters']
    },
    position: {
      type: String,
      enum: ['Student', 'Faculty', 'Intern', 'Employee', 'Freelancer']
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department cannot be more than 100 characters']
    },
    yearOfStudy: {
      type: String,
      trim: true,
      maxlength: [50, 'Year of study cannot be more than 50 characters']
    },
    experienceLevel: {
      type: String,
      trim: true,
      maxlength: [100, 'Experience level cannot be more than 100 characters']
    },
    fieldOfInterest: [{
      type: String,
      trim: true
    }],
    preferredLearningMode: {
      type: String,
      enum: ['Video', 'Text', 'Interactive']
    },
    preferredLanguage: {
      type: String,
      trim: true,
      maxlength: [50, 'Preferred language cannot be more than 50 characters']
    },
    careerGoal: {
      type: String,
      trim: true,
      maxlength: [200, 'Career goal cannot be more than 200 characters']
    },
    profession: {
      type: String,
      trim: true,
      maxlength: [100, 'Profession cannot be more than 100 characters']
    },
    organization: {
      type: String,
      trim: true,
      maxlength: [100, 'Organization name cannot be more than 100 characters']
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot be more than 100 characters']
    },
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String,
      website: String
    },
    interests: [{
      type: String,
      trim: true
    }]
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
