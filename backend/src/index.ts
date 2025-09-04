import 'dotenv/config'
import express, { Application, Request, Response } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Import routes
import authRoutes from './routes/auth'
import courseRoutes from './routes/courses'
import videoRoutes from './routes/videos'
import chatbotRoutes from './routes/chatbot'
import quizRoutes from './routes/quiz'
import seedRoutes from './routes/seed'

// Load environment variables
dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 5000

// Initialize Google Gemini AI (will be used in Phase 3)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'LearnHub API is running successfully!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api/chatbot', chatbotRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/seed', seedRoutes)

// MongoDB Connection
const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnhub'
    
    await mongoose.connect(mongoURI)
    
    console.log('✅ MongoDB Connected Successfully')
    console.log(`📂 Database: ${mongoose.connection.name}`)
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error)
    // Don't exit in development to allow for easier testing
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('❌ Server Error:', err.stack)
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  })
})

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB()
    
    // Start the server
    app.listen(PORT, () => {
      console.log('🚀 LearnHub Backend Server Started')
      console.log(`📍 Server: http://localhost:${PORT}`)
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`)
      console.log(`🌟 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...')
  await mongoose.connection.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...')
  await mongoose.connection.close()
  process.exit(0)
})

// Start the application
startServer()

export default app
