"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatbotController_1 = require("../controllers/chatbotController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/chat', auth_1.authenticate, chatbotController_1.chatWithAI);
router.get('/suggestions', auth_1.authenticate, chatbotController_1.getConversationSuggestions);
router.post('/generate-quiz', auth_1.authenticate, chatbotController_1.generateAIQuiz);
router.get('/test', auth_1.authenticate, (0, auth_1.authorize)('admin'), chatbotController_1.testAIService);
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Chatbot routes are working!',
        timestamp: new Date().toISOString(),
        aiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here')
    });
});
exports.default = router;
