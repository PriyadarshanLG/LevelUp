"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const generative_ai_1 = require("@google/generative-ai");
dotenv_1.default.config();
const auth_1 = __importDefault(require("./routes/auth"));
const courses_1 = __importDefault(require("./routes/courses"));
const videos_1 = __importDefault(require("./routes/videos"));
const chatbot_1 = __importDefault(require("./routes/chatbot"));
const quiz_1 = __importDefault(require("./routes/quiz"));
const seed_1 = __importDefault(require("./routes/seed"));
const certificate_1 = __importDefault(require("./routes/certificate"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
let server = null;
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/public', express_1.default.static(path_1.default.join(__dirname, '../public')));
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
app.use('/api/quizzes', quiz_1.default);
app.use('/api/seed', seed_1.default);
app.use('/api/certificates', certificate_1.default);
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
        server = app.listen(PORT, () => {
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
const closeServer = async () => {
    console.log('🛑 Shutting down server...');
    if (server) {
        server.close(async () => {
            console.log('✅ HTTP server closed.');
            await mongoose_1.default.connection.close();
            console.log('✅ MongoDB connection closed.');
            process.exit(0);
        });
    }
    else {
        await mongoose_1.default.connection.close();
        console.log('✅ MongoDB connection closed.');
        process.exit(0);
    }
};
process.on('SIGTERM', closeServer);
process.on('SIGINT', closeServer);
startServer();
exports.default = app;
