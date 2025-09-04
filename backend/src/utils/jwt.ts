import jwt from 'jsonwebtoken'
import { IUser } from '../models/User'

// JWT payload interface
export interface JWTPayload {
  userId: string
  email: string
  role: string
}

// Generate JWT token
export const generateToken = (user: IUser): string => {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables')
  }

  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'learnhub-api'
  } as jwt.SignOptions)
}

// Verify JWT token
export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables')
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload
    return decoded
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired')
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token')
    } else {
      throw new Error('Token verification failed')
    }
  }
}

// Generate refresh token (longer expiry)
export const generateRefreshToken = (user: IUser): string => {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables')
  }

  return jwt.sign(payload, secret, {
    expiresIn: '30d',
    issuer: 'learnhub-api'
  } as jwt.SignOptions)
}
