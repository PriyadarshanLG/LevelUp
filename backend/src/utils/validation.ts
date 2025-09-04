// User registration validation
export interface RegisterValidation {
  name: string
  email: string
  password: string
}

// User login validation
export interface LoginValidation {
  email: string
  password: string
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Email regex pattern
const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/

// Password requirements: at least 6 characters
const PASSWORD_MIN_LENGTH = 6

// Name validation
const validateName = (name: string): string[] => {
  const errors: string[] = []
  
  if (!name || name.trim().length === 0) {
    errors.push('Name is required')
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long')
  } else if (name.trim().length > 50) {
    errors.push('Name cannot be more than 50 characters')
  }
  
  return errors
}

// Email validation
const validateEmail = (email: string): string[] => {
  const errors: string[] = []
  
  if (!email || email.trim().length === 0) {
    errors.push('Email is required')
  } else if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
    errors.push('Please provide a valid email address')
  }
  
  return errors
}

// Password validation
const validatePassword = (password: string): string[] => {
  const errors: string[] = []
  
  if (!password) {
    errors.push('Password is required')
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`)
  } else if (password.length > 128) {
    errors.push('Password cannot be more than 128 characters')
  }
  
  // Additional password strength checks (optional but recommended)
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  
  if (password.length >= 8) {
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      errors.push('For stronger security, use uppercase, lowercase, and numbers')
    }
  }
  
  return errors
}

// Validate user registration data
export const validateRegistration = (data: RegisterValidation): ValidationResult => {
  const errors: string[] = []
  
  // Validate each field
  errors.push(...validateName(data.name))
  errors.push(...validateEmail(data.email))
  errors.push(...validatePassword(data.password))
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Validate user login data
export const validateLogin = (data: LoginValidation): ValidationResult => {
  const errors: string[] = []
  
  // Validate each field
  errors.push(...validateEmail(data.email))
  
  if (!data.password || data.password.trim().length === 0) {
    errors.push('Password is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Sanitize user input
export const sanitizeUserInput = (input: string): string => {
  if (!input) return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .substring(0, 1000) // Limit length
}

// Check if email domain is allowed (optional feature)
export const isEmailDomainAllowed = (email: string): boolean => {
  const blockedDomains = [
    'tempmail.org',
    '10minutemail.com',
    'guerrillamail.com'
    // Add more disposable email domains as needed
  ]
  
  const domain = email.split('@')[1]?.toLowerCase()
  if (!domain) return false
  
  return !blockedDomains.includes(domain)
}
