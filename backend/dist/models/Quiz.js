"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const QuizSchema = new mongoose_1.Schema({
    courseId: {
        type: String,
        required: [true, 'Course ID is required'],
        ref: 'Course'
    },
    title: {
        type: String,
        required: [true, 'Quiz title is required'],
        trim: true,
        maxlength: [100, 'Quiz title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Quiz description is required'],
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    questions: [{
            question: {
                type: String,
                required: [true, 'Question text is required'],
                trim: true
            },
            type: {
                type: String,
                required: [true, 'Question type is required'],
                enum: ['multiple-choice', 'true-false', 'short-answer']
            },
            options: [{
                    type: String,
                    trim: true
                }],
            correctAnswer: {
                type: mongoose_1.Schema.Types.Mixed,
                required: [true, 'Correct answer is required']
            },
            explanation: {
                type: String,
                trim: true
            },
            points: {
                type: Number,
                required: [true, 'Points are required'],
                min: [1, 'Points must be at least 1'],
                default: 1
            }
        }],
    timeLimit: {
        type: Number,
        required: [true, 'Time limit is required'],
        min: [0, 'Time limit cannot be negative'],
        default: 0
    },
    passingScore: {
        type: Number,
        required: [true, 'Passing score is required'],
        min: [0, 'Passing score cannot be negative'],
        max: [100, 'Passing score cannot be more than 100'],
        default: 70
    },
    maxAttempts: {
        type: Number,
        required: [true, 'Max attempts is required'],
        min: [0, 'Max attempts cannot be negative'],
        default: 3
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        required: [true, 'Quiz order is required'],
        min: [1, 'Order must be at least 1']
    }
}, {
    timestamps: true
});
QuizSchema.index({ courseId: 1, order: 1 });
QuizSchema.index({ courseId: 1, isPublished: 1 });
QuizSchema.virtual('totalPoints').get(function () {
    return this.questions.reduce((total, question) => total + question.points, 0);
});
QuizSchema.virtual('questionCount').get(function () {
    return this.questions.length;
});
QuizSchema.methods.calculateScore = function (answers) {
    let totalPoints = 0;
    let earnedPoints = 0;
    this.questions.forEach((question, index) => {
        totalPoints += question.points;
        const userAnswer = answers[index.toString()];
        if (this.isCorrectAnswer(question, userAnswer)) {
            earnedPoints += question.points;
        }
    });
    return {
        earnedPoints,
        totalPoints,
        percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0,
        passed: totalPoints > 0 ? (earnedPoints / totalPoints) * 100 >= this.passingScore : false
    };
};
QuizSchema.methods.isCorrectAnswer = function (question, userAnswer) {
    if (!userAnswer)
        return false;
    const correctAnswer = question.correctAnswer;
    switch (question.type) {
        case 'multiple-choice':
        case 'true-false':
            if (Array.isArray(correctAnswer)) {
                return Array.isArray(userAnswer) &&
                    userAnswer.length === correctAnswer.length &&
                    userAnswer.every(answer => correctAnswer.includes(answer));
            }
            return userAnswer.toString().toLowerCase() === correctAnswer.toString().toLowerCase();
        case 'short-answer':
            return userAnswer.toString().toLowerCase().trim() ===
                correctAnswer.toString().toLowerCase().trim();
        default:
            return false;
    }
};
exports.default = mongoose_1.default.model('Quiz', QuizSchema);
