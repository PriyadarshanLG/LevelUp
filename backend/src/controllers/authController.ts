import { Request, Response } from 'express'
import User, { IUser } from '../models/User'
import { generateToken, generateRefreshToken } from '../utils/jwt'
import { validateRegistration, validateLogin, sanitizeUserInput, isEmailDomainAllowed } from '../utils/validation'

// Response interface for consistency
interface AuthResponse {
  success: boolean
  message: string
  data?: {
    user: {
      id: string
      name: string
      email: string
      role: string
      avatar?: string
      isEmailVerified: boolean
    }
    token: string
    refreshToken?: string
  }
  errors?: string[]
}

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body

    // Validate input
    const validation = validateRegistration({ name, email, password })
    
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      } as AuthResponse)
      return
    }

    // Validate role (only student or teacher allowed during registration)
    const userRole = role && (role === 'student' || role === 'teacher') ? role : 'student'

    // Sanitize inputs
    const sanitizedName = sanitizeUserInput(name)
    const sanitizedEmail = email.trim().toLowerCase()

    // Check if email domain is allowed (optional security measure)
    if (!isEmailDomainAllowed(sanitizedEmail)) {
      res.status(400).json({
        success: false,
        message: 'Email domain not allowed. Please use a different email address.',
        errors: ['Invalid email domain']
      } as AuthResponse)
      return
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedEmail })
    
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User already exists with this email address.',
        errors: ['Email already registered']
      } as AuthResponse)
      return
    }

    // Create new user
    const user: IUser = new User({
      name: sanitizedName,
      email: sanitizedEmail,
      password: password, // Will be hashed by the pre-save middleware
      role: userRole
    })

    await user.save()

    // Generate tokens
    const token = generateToken(user)
    const refreshToken = generateRefreshToken(user)

    // Prepare response data (exclude password)
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    }

    // Success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully! Welcome to LearnHub.',
      data: {
        user: userData,
        token,
        refreshToken
      }
    } as AuthResponse)

  } catch (error: any) {
    console.error('Registration error:', error)

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message)
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      } as AuthResponse)
      return
    }

    // Handle duplicate key error (shouldn't happen due to our check, but just in case)
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'User already exists with this email address.',
        errors: ['Email already registered']
      } as AuthResponse)
      return
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again later.',
      errors: ['Internal server error']
    } as AuthResponse)
  }
}

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    // Validate input
    const validation = validateLogin({ email, password })
    
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      } as AuthResponse)
      return
    }

    const sanitizedEmail = email.trim().toLowerCase()

    // Find user with password (normally excluded)
    const user = await User.findOne({ email: sanitizedEmail }).select('+password')
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        errors: ['Invalid credentials']
      } as AuthResponse)
      return
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        errors: ['Invalid credentials']
      } as AuthResponse)
      return
    }

    // Generate tokens
    const token = generateToken(user)
    const refreshToken = generateRefreshToken(user)

    // Prepare response data (exclude password)
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    }

    // Success response
    res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back to LearnHub.',
      data: {
        user: userData,
        token,
        refreshToken
      }
    } as AuthResponse)

  } catch (error: any) {
    console.error('Login error:', error)

    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again later.',
      errors: ['Internal server error']
    } as AuthResponse)
  }
}

// Get current user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user // Set by authentication middleware
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
      return
    }

    // Prepare response data
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: userData
      }
    })

  } catch (error: any) {
    console.error('Get profile error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      errors: ['Internal server error']
    })
  }
}

// Logout user (optional - mainly for client-side token cleanup)
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just send a success response
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully. Thank you for using LearnHub!'
    })

  } catch (error: any) {
    console.error('Logout error:', error)

    res.status(500).json({
      success: false,
      message: 'Logout failed',
      errors: ['Internal server error']
    })
  }
}
