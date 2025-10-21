import { Router } from 'express'
import {
  chatWithAI,
  getConversationSuggestions,
  testAIService,
  generateAIQuiz
} from '../controllers/chatbotController'
import { authenticate, authorize } from '../middleware/auth'

const router = Router()

// Protected routes (authentication required)
router.post('/chat', authenticate, chatWithAI) // Chat with AI assistant
router.get('/suggestions', authenticate, getConversationSuggestions) // Get conversation suggestions
router.post('/generate-quiz', authenticate, generateAIQuiz) // Generate concept-aware AI quiz

// Admin routes (admin only)
router.get('/test', authenticate, authorize('admin'), testAIService) // Test AI service

// Health check for chatbot routes
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Chatbot routes are working!',
    timestamp: new Date().toISOString(),
    aiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here')
  })
})

export default router

