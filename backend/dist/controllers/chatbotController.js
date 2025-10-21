"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIQuiz = exports.testAIService = exports.getConversationSuggestions = exports.chatWithAI = void 0;
const generative_ai_1 = require("@google/generative-ai");
const Course_1 = __importDefault(require("../models/Course"));
const Video_1 = __importDefault(require("../models/Video"));
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const SYSTEM_PROMPT = `You are LearnHub Assistant, an intelligent and helpful AI tutor for the LearnHub online learning platform. Your role is to assist students with their learning journey.

Your characteristics:
- Professional yet friendly and approachable
- Patient and encouraging with learners
- Knowledgeable about various subjects and learning methodologies
- Focused on education and skill development
- Clear and concise in explanations

Your capabilities:
- Answer questions about course content and concepts
- Explain difficult topics in simple terms
- Provide learning tips and study strategies
- Help with problem-solving and critical thinking
- Offer encouragement and motivation
- Suggest additional resources when helpful

Guidelines:
- Keep responses educational and relevant to learning
- Break down complex topics into digestible parts
- Use examples and analogies to clarify concepts
- Encourage active learning and practice
- Be supportive of all skill levels
- If unsure about something, admit it and suggest reliable sources
- Maintain a positive, growth-mindset approach

Remember: You're here to enhance the learning experience, not replace human instruction.`;
const chatWithAI = async (req, res) => {
    try {
        const { message, conversationHistory = [], courseContext = {} } = req.body;
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Message is required and cannot be empty'
            });
            return;
        }
        if (message.length > 4000) {
            res.status(400).json({
                success: false,
                message: 'Message too long. Please keep it under 4000 characters.'
            });
            return;
        }
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
            res.status(503).json({
                success: false,
                message: 'AI assistant is temporarily unavailable. Please contact support.',
                errors: ['AI service not configured']
            });
            return;
        }
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
        let contextPrompt = SYSTEM_PROMPT;
        if (courseContext.courseTitle) {
            contextPrompt += `\n\nCurrent Course Context: The user is taking "${courseContext.courseTitle}"`;
            if (courseContext.currentTopic) {
                contextPrompt += ` and is currently studying "${courseContext.currentTopic}"`;
            }
        }
        let conversationContext = '';
        if (conversationHistory.length > 0) {
            conversationContext = '\n\nRecent conversation:\n';
            const recentHistory = conversationHistory.slice(-10);
            recentHistory.forEach(msg => {
                conversationContext += `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.content}\n`;
            });
        }
        const fullPrompt = `${contextPrompt}${conversationContext}\n\nStudent: ${message}\n\nAssistant:`;
        try {
            const result = await model.generateContent(fullPrompt);
            const response = result.response;
            const aiMessage = response.text();
            if (!aiMessage || aiMessage.trim().length === 0) {
                throw new Error('Empty response from AI service');
            }
            res.status(200).json({
                success: true,
                message: 'AI response generated successfully',
                data: {
                    response: aiMessage.trim(),
                    timestamp: new Date().toISOString(),
                    conversationId: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                }
            });
        }
        catch (aiError) {
            console.error('Gemini AI Error:', aiError);
            if (aiError.message?.includes('SAFETY')) {
                res.status(400).json({
                    success: false,
                    message: 'Your message was flagged by our content safety system. Please rephrase your question.',
                    errors: ['Content safety violation']
                });
                return;
            }
            if (aiError.message?.includes('QUOTA_EXCEEDED')) {
                res.status(503).json({
                    success: false,
                    message: 'AI assistant is temporarily busy. Please try again in a few moments.',
                    errors: ['Rate limit exceeded']
                });
                return;
            }
            throw aiError;
        }
    }
    catch (error) {
        console.error('Chatbot error:', error);
        if (error.message?.includes('API key')) {
            res.status(503).json({
                success: false,
                message: 'AI assistant is temporarily unavailable',
                errors: ['Configuration error']
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Failed to get AI response. Please try again.',
            errors: ['Internal server error']
        });
    }
};
exports.chatWithAI = chatWithAI;
const getConversationSuggestions = async (req, res) => {
    try {
        const { courseContext } = req.query;
        let suggestions = [
            "Can you explain this concept in simpler terms?",
            "What are some practical examples of this?",
            "How can I practice this skill?",
            "What should I study next?",
            "Can you give me some study tips?"
        ];
        if (courseContext) {
            const courseTitle = courseContext.toString().toLowerCase();
            if (courseTitle.includes('programming') || courseTitle.includes('coding')) {
                suggestions = [
                    "Can you help me debug this code?",
                    "What are best practices for this programming concept?",
                    "How do I implement this algorithm?",
                    "What are common mistakes to avoid?",
                    "Can you explain this programming pattern?"
                ];
            }
            else if (courseTitle.includes('design')) {
                suggestions = [
                    "What are the key design principles I should follow?",
                    "How do I improve my design skills?",
                    "What tools would you recommend for this project?",
                    "Can you critique my design approach?",
                    "What are current design trends I should know?"
                ];
            }
            else if (courseTitle.includes('business') || courseTitle.includes('marketing')) {
                suggestions = [
                    "How do I apply this business concept in real life?",
                    "What are some case studies I should know?",
                    "How do I develop a strategy for this?",
                    "What metrics should I track?",
                    "Can you help me understand this business model?"
                ];
            }
        }
        res.status(200).json({
            success: true,
            message: 'Conversation suggestions retrieved',
            data: { suggestions }
        });
    }
    catch (error) {
        console.error('Get suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get conversation suggestions',
            errors: ['Internal server error']
        });
    }
};
exports.getConversationSuggestions = getConversationSuggestions;
const testAIService = async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
            res.status(503).json({
                success: false,
                message: 'AI service not configured',
                data: { configured: false }
            });
            return;
        }
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
        const result = await model.generateContent('Hello! Please respond with a simple greeting.');
        const response = result.response.text();
        res.status(200).json({
            success: true,
            message: 'AI service is working correctly',
            data: {
                configured: true,
                testResponse: response,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('AI service test error:', error);
        res.status(503).json({
            success: false,
            message: 'AI service is not working properly',
            data: {
                configured: true,
                error: error.message
            }
        });
    }
};
exports.testAIService = testAIService;
const generateAIQuiz = async (req, res) => {
    try {
        const { topic, difficulty = 'easy', numQuestions = 10 } = req.body || {};
        if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
            res.status(400).json({
                success: false,
                message: 'Please provide a topic (min 3 characters)'
            });
            return;
        }
        const allowed = ['easy', 'intermediate', 'advanced'];
        if (!allowed.includes(String(difficulty))) {
            res.status(400).json({ success: false, message: 'Invalid difficulty' });
            return;
        }
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
            res.status(503).json({
                success: false,
                message: 'AI service not configured',
                errors: ['Set GEMINI_API_KEY to enable AI Quiz generation']
            });
            return;
        }
        const safeTopic = topic.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(safeTopic, 'i');
        const courses = await Course_1.default.find({
            $or: [
                { title: regex },
                { description: regex },
                { shortDescription: regex },
                { tags: regex },
                { importantTopics: regex },
                { learningOutcomes: regex }
            ],
            isPublished: true
        })
            .select('title description shortDescription learningOutcomes importantTopics category level')
            .limit(8);
        const courseIds = courses.map((c) => c._id);
        const videos = await Video_1.default.find({
            $or: [
                { title: regex },
                { description: regex },
                { transcription: regex },
                { courseId: { $in: courseIds } }
            ],
            isPublished: true
        })
            .select('title description transcription courseId')
            .limit(20);
        const knowledge = [];
        courses.forEach((c) => {
            knowledge.push(`Course: ${c.title} [${c.category} - ${c.level}]`);
            if (c.shortDescription)
                knowledge.push(`Summary: ${c.shortDescription}`);
            if (Array.isArray(c.learningOutcomes) && c.learningOutcomes.length) {
                knowledge.push(`Learning outcomes: ${c.learningOutcomes.slice(0, 8).join('; ')}`);
            }
            if (Array.isArray(c.importantTopics) && c.importantTopics.length) {
                knowledge.push(`Important topics: ${c.importantTopics.slice(0, 12).join('; ')}`);
            }
        });
        videos.slice(0, 20).forEach((v) => {
            knowledge.push(`Lesson: ${v.title}`);
            if (v.description)
                knowledge.push(`Lesson summary: ${v.description}`);
            if (v.transcription) {
                const snippet = String(v.transcription).replace(/\s+/g, ' ').slice(0, 500);
                if (snippet.length > 60)
                    knowledge.push(`Transcript snippet: ${snippet}...`);
            }
        });
        const knowledgeBlock = knowledge.join('\n') || `No existing lessons found. Create a foundational quiz for topic: ${topic}.`;
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
        const QUIZ_SCHEMA = `Return strictly in compact JSON with the following shape (no markdown, no extra text):\n{\n  "topic": string,\n  "difficulty": "easy"|"intermediate"|"advanced",\n  "questions": [\n    {\n      "id": string,\n      "question": string,\n      "options": string[4],\n      "correctOptionIndex": 0|1|2|3,\n      "explanation": string\n    }\n  ]\n}`;
        const DIFFICULTY_GUIDE = `Difficulty guidance:\n- easy: definitions, simple applications, identify main idea.\n- intermediate: compare/contrast, workflows, trade-offs, why/when to use.\n- advanced: edge cases, complexity, optimization, scalability, security.\nEnsure questions cover multiple sub-concepts from the provided lessons, not just the topic keyword.`;
        const prompt = `You are an expert quiz generator for an e-learning platform. Analyze the following platform content related to the user's topic and generate a ${numQuestions}-question multiple-choice quiz.\n\nUSER TOPIC: "${topic}"\nREQUESTED DIFFICULTY: ${difficulty}\n\nPLATFORM KNOWLEDGE:\n${knowledgeBlock}\n\n${DIFFICULTY_GUIDE}\n\nRules:\n- Cover diverse sub-topics and lessons inferred from the knowledge.\n- Avoid trivial rephrases of the topic name.\n- Make distractors plausible but incorrect.\n- Exactly 4 options per question.\n- Provide a brief explanation for each answer.\n\n${QUIZ_SCHEMA}\nOutput only the JSON.`;
        const gen = await model.generateContent(prompt);
        const text = gen.response.text().trim();
        let parsed;
        try {
            parsed = JSON.parse(text);
        }
        catch (e) {
            const match = text.match(/\{[\s\S]*\}$/);
            if (match) {
                parsed = JSON.parse(match[0]);
            }
            else {
                throw new Error('AI returned non-JSON content');
            }
        }
        if (!parsed?.questions || !Array.isArray(parsed.questions)) {
            throw new Error('Malformed AI quiz response');
        }
        const questions = parsed.questions.slice(0, numQuestions).map((q, idx) => {
            const opts = Array.isArray(q.options) ? q.options.slice(0, 4) : [];
            const correctIdx = Math.min(Math.max(Number(q.correctOptionIndex) || 0, 0), Math.max(opts.length - 1, 0));
            const optionObjs = opts.map((t, i) => ({ id: `${idx}-${i}`, text: String(t) }));
            return {
                id: String(q.id || `q-${idx + 1}`),
                question: String(q.question || ''),
                options: optionObjs,
                correctOptionId: optionObjs[correctIdx]?.id || '0-0',
                explanation: String(q.explanation || '')
            };
        });
        res.status(200).json({
            success: true,
            message: 'AI quiz generated successfully',
            data: {
                topic: String(parsed.topic || topic),
                difficulty: String(parsed.difficulty || difficulty),
                questions
            }
        });
    }
    catch (error) {
        console.error('generateAIQuiz error:', error);
        const message = error?.message || 'Failed to generate AI quiz';
        res.status(500).json({ success: false, message, errors: ['Internal server error'] });
    }
};
exports.generateAIQuiz = generateAIQuiz;
