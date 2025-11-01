import dotenv from 'dotenv'
import express, { Application, Request, Response } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import path from 'path'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Load environment variables first
dotenv.config()

// Import routes
import authRoutes from './routes/auth'
import courseRoutes from './routes/courses'
import videoRoutes from './routes/videos'
import chatbotRoutes from './routes/chatbot'
import quizRoutes from './routes/quiz'
import seedRoutes from './routes/seed'
import certificateRoutes from './routes/certificate'
import classroomRoutes from './routes/classroom'
import lessonRoutes from './routes/lesson'
import assignmentRoutes from './routes/assignment'

const app: Application = express()
const PORT = process.env.PORT || 5000
let server: ReturnType<typeof app.listen> | null = null

// Initialize Google Gemini AI (will be used in Phase 3)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Serve static files
app.use('/public', express.static(path.join(__dirname, '../public')))
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')))

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
app.use('/api/certificates', certificateRoutes)
app.use('/api/classrooms', classroomRoutes)
app.use('/api/lessons', lessonRoutes)
app.use('/api/assignments', assignmentRoutes)

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
    server = app.listen(PORT, () => {
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

// Graceful shutdown function
const closeServer = async () => {
  console.log('🛑 Shutting down server...')
  if (server) {
    server.close(async () => {
      console.log('✅ HTTP server closed.')
      await mongoose.connection.close()
      console.log('✅ MongoDB connection closed.')
      process.exit(0)
    })
  } else {
    await mongoose.connection.close()
    console.log('✅ MongoDB connection closed.')
    process.exit(0)
  }
}

// Handle graceful shutdown
process.on('SIGTERM', closeServer)
process.on('SIGINT', closeServer)

// Start the application
startServer()

export default app
