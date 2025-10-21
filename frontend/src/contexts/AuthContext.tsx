import React, { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authAPI, tokenUtils, APIError, profileAPI } from '../utils/api'
import type { User } from '../types/user'

// Auth context interface
interface AuthContextType {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
  deleteAccount: () => Promise<void>
  updateProfile: (profileData: {
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    phoneNumber?: string;
    profession?: string;
    organization?: string;
    bio?: string;
    location?: string;
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
      website?: string;
    };
    interests?: string[];
  }) => Promise<void>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider props
interface AuthProviderProps {
  children: ReactNode
}

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is authenticated
  const isAuthenticated = !!user

  // Clear error
  const clearError = () => setError(null)

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = tokenUtils.getToken()
        
        if (token) {
          // Verify token and get user profile
          const response = await authAPI.getProfile()
          
          if (response.success && response.data) {
            setUser(response.data.user)
          }
        }
      } catch (error) {
        // Token is invalid, remove it
        tokenUtils.removeToken()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await authAPI.login({ email, password })
      
      if (response.success && response.data) {
        // Save token
        tokenUtils.saveToken(response.data.token)
        
        // Save refresh token if provided
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken)
        }
        
        // Set user
        setUser(response.data.user)
      }
    } catch (error) {
      if (error instanceof APIError) {
        setError(error.message)
      } else {
        setError('Login failed. Please try again.')
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string): Promise<void> => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await authAPI.register({ name, email, password })
      
      if (response.success && response.data) {
        // Save token
        tokenUtils.saveToken(response.data.token)
        
        // Save refresh token if provided
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken)
        }
        
        // Set user
        setUser(response.data.user)
      }
    } catch (error) {
      if (error instanceof APIError) {
        setError(error.message)
      } else {
        setError('Registration failed. Please try again.')
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    try {
      // Call logout API (optional)
      authAPI.logout().catch(() => {
        // Ignore errors for logout
      })
    } finally {
      // Clear local state regardless of API response
      tokenUtils.removeToken()
      localStorage.removeItem('refreshToken')
      setUser(null)
      setError(null)
    }
  }

  // Update profile function
  const updateProfile = async (profileData: {
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    phoneNumber?: string;
    profession?: string;
    organization?: string;
    bio?: string;
    location?: string;
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
      website?: string;
    };
    interests?: string[];
  }): Promise<void> => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await profileAPI.updateProfile(profileData)
      
      if (response.success && response.data) {
        setUser(response.data.user)
      }
    } catch (error) {
      if (error instanceof APIError) {
        setError(error.message)
      } else {
        setError('Failed to update profile. Please try again.')
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Delete account function
  const deleteAccount = async (): Promise<void> => {
    try {
      setError(null)
      setIsLoading(true)

      const response = await authAPI.deleteAccount()
      
      if (response.success) {
        // Clear local state
        tokenUtils.removeToken()
        localStorage.removeItem('refreshToken')
        setUser(null)
      }
    } catch (error) {
      if (error instanceof APIError) {
        setError(error.message)
      } else {
        setError('Failed to delete account. Please try again.')
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Context value
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    updateProfile,
    deleteAccount
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

export default AuthContext
