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
exports.QuestionType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var QuestionType;
(function (QuestionType) {
    QuestionType["MULTIPLE_CHOICE"] = "multiple_choice";
    QuestionType["TRUE_FALSE"] = "true_false";
    QuestionType["SINGLE_CHOICE"] = "single_choice";
    QuestionType["FILL_IN_BLANK"] = "fill_in_blank";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
const QuestionOptionSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
        default: () => new mongoose_1.default.Types.ObjectId().toString()
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    isCorrect: {
        type: Boolean,
        required: true,
        default: false
    }
}, { _id: false });
const QuestionSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
        default: () => new mongoose_1.default.Types.ObjectId().toString()
    },
    type: {
        type: String,
        enum: Object.values(QuestionType),
        required: true,
        default: QuestionType.MULTIPLE_CHOICE
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    options: {
        type: [QuestionOptionSchema],
        required: true,
        validate: {
            validator: function (options) {
                return options.length >= 2;
            },
            message: 'At least 2 options are required'
        }
    },
    correctAnswers: {
        type: [String],
        required: true,
        validate: {
            validator: function (answers) {
                return answers.length > 0;
            },
            message: 'At least one correct answer is required'
        }
    },
    explanation: {
        type: String,
        trim: true
    },
    points: {
        type: Number,
        required: true,
        default: 1,
        min: 0
    },
    order: {
        type: Number,
        required: true,
        default: 0
    }
}, { _id: false });
const QuizAttemptSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    answers: [{
            questionId: {
                type: String,
                required: true
            },
            selectedOptions: [{
                    type: String,
                    required: true
                }],
            textAnswer: {
                type: String,
                trim: true
            }
        }],
    score: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    maxScore: {
        type: Number,
        required: true,
        default: 0
    },
    percentage: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 100
    },
    timeSpent: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    completedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    passed: {
        type: Boolean,
        required: true,
        default: false
    }
}, { _id: false });
const QuizSchema = new mongoose_1.Schema({
    courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxLength: 1000
    },
    instructions: {
        type: [String],
        default: []
    },
    timeLimit: {
        type: Number,
        default: 0,
        min: 0
    },
    passingScore: {
        type: Number,
        required: true,
        default: 70,
        min: 0,
        max: 100
    },
    maxAttempts: {
        type: Number,
        default: 3,
        min: 0
    },
    randomizeQuestions: {
        type: Boolean,
        default: false
    },
    showCorrectAnswers: {
        type: Boolean,
        default: true
    },
    allowReview: {
        type: Boolean,
        default: true
    },
    questions: {
        type: [QuestionSchema],
        required: true,
        validate: {
            validator: function (questions) {
                return questions.length > 0;
            },
            message: 'At least one question is required'
        }
    },
    totalPoints: {
        type: Number,
        default: 0,
        min: 0
    },
    isPublished: {
        type: Boolean,
        default: false,
        index: true
    },
    order: {
        type: Number,
        default: 0,
        min: 0
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attempts: {
        type: [QuizAttemptSchema],
        default: []
    },
    averageScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    totalAttempts: {
        type: Number,
        default: 0,
        min: 0
    },
    passRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});
QuizSchema.index({ courseId: 1, order: 1 });
QuizSchema.index({ courseId: 1, isPublished: 1 });
QuizSchema.index({ 'attempts.userId': 1 });
QuizSchema.index({ createdBy: 1 });
QuizSchema.pre('save', function (next) {
    if (this.isModified('questions')) {
        this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
    }
    next();
});
QuizSchema.methods.calculateStats = function () {
    const attempts = this.attempts;
    if (attempts.length === 0) {
        this.averageScore = 0;
        this.totalAttempts = 0;
        this.passRate = 0;
        return;
    }
    this.totalAttempts = attempts.length;
    const totalScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
    this.averageScore = Math.round(totalScore / attempts.length);
    const passedAttempts = attempts.filter((attempt) => attempt.passed).length;
    this.passRate = Math.round((passedAttempts / attempts.length) * 100);
};
QuizSchema.methods.getUserBestAttempt = function (userId) {
    const userAttempts = this.attempts.filter((attempt) => attempt.userId.toString() === userId.toString());
    if (userAttempts.length === 0)
        return null;
    return userAttempts.reduce((best, current) => current.score > best.score ? current : best);
};
QuizSchema.methods.canUserAttempt = function (userId) {
    if (this.maxAttempts === 0)
        return true;
    const userAttempts = this.attempts.filter((attempt) => attempt.userId.toString() === userId.toString());
    return userAttempts.length < this.maxAttempts;
};
QuizSchema.methods.getRandomizedQuestions = function () {
    if (!this.randomizeQuestions) {
        return [...this.questions].sort((a, b) => a.order - b.order);
    }
    const questions = [...this.questions];
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    return questions;
};
QuizSchema.statics.findByCourse = function (courseId, isPublished = true) {
    return this.find({
        courseId,
        ...(isPublished !== undefined && { isPublished })
    }).sort({ order: 1 });
};
const Quiz = mongoose_1.default.model('Quiz', QuizSchema);
exports.default = Quiz;
