import { Request, Response, NextFunction } from 'express'
import { verifyToken, JWTPayload } from '../utils/jwt'
import User, { IUser } from '../models/User'

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser
      userId?: string
    }
  }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.'
      })
      return
    }

    // Extract token
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Token is required.'
      })
      return
    }

    // Verify token
    const decoded: JWTPayload = verifyToken(token)
    
    // Find user from database
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      })
      return
    }

    // Add user to request object
    req.user = user
    req.userId = user._id.toString()
    
    next()
  } catch (error: any) {
    console.error('Authentication error:', error.message)
    
    // Handle specific JWT errors
    if (error.message === 'Token has expired') {
      res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      })
    } else if (error.message === 'Invalid token') {
      res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.',
        code: 'INVALID_TOKEN'
      })
    } else {
      res.status(401).json({
        success: false,
        message: 'Authentication failed. Please login again.'
      })
    }
  }
}

// Authorization middleware - check user roles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.'
      })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
        requiredRoles: roles,
        userRole: req.user.role
      })
      return
    }

    next()
  }
}

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      
      if (token) {
        const decoded: JWTPayload = verifyToken(token)
        const user = await User.findById(decoded.userId)
        
        if (user) {
          req.user = user
          req.userId = user._id.toString()
        }
      }
    }
    
    next()
  } catch (error) {
    // Continue without authentication for optional auth
    next()
  }
}
