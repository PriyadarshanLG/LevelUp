"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const generative_ai_1 = require("@google/generative-ai");
const auth_1 = __importDefault(require("./routes/auth"));
const courses_1 = __importDefault(require("./routes/courses"));
const videos_1 = __importDefault(require("./routes/videos"));
const chatbot_1 = __importDefault(require("./routes/chatbot"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'LearnHub API is running successfully!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/courses', courses_1.default);
app.use('/api/videos', videos_1.default);
app.use('/api/chatbot', chatbot_1.default);
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnhub';
        await mongoose_1.default.connect(mongoURI);
        console.log('✅ MongoDB Connected Successfully');
        console.log(`📂 Database: ${mongoose_1.default.connection.name}`);
    }
    catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log('🚀 LearnHub Backend Server Started');
            console.log(`📍 Server: http://localhost:${PORT}`);
            console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
            console.log(`🌟 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    await mongoose_1.default.connection.close();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('🛑 SIGINT received. Shutting down gracefully...');
    await mongoose_1.default.connection.close();
    process.exit(0);
});
startServer();
exports.default = app;
