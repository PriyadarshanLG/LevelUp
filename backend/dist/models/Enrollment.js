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
const EnrollmentSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        ref: 'User'
    },
    courseId: {
        type: String,
        required: [true, 'Course ID is required'],
        ref: 'Course'
    },
    status: {
        type: String,
        required: [true, 'Enrollment status is required'],
        enum: ['active', 'completed', 'paused', 'dropped'],
        default: 'active'
    },
    progress: {
        videosCompleted: {
            type: Number,
            default: 0,
            min: 0
        },
        totalVideos: {
            type: Number,
            default: 0,
            min: 0
        },
        quizzesPassed: {
            type: Number,
            default: 0,
            min: 0
        },
        totalQuizzes: {
            type: Number,
            default: 0,
            min: 0
        },
        overallPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        }
    },
    videoProgress: [{
            videoId: {
                type: String,
                required: true,
                ref: 'Video'
            },
            isCompleted: {
                type: Boolean,
                default: false
            },
            watchedDuration: {
                type: Number,
                default: 0,
                min: 0
            },
            lastWatchedAt: {
                type: Date,
                default: Date.now
            },
            completedAt: {
                type: Date
            }
        }],
    quizAttempts: [{
            quizId: {
                type: String,
                required: true,
                ref: 'Quiz'
            },
            attemptNumber: {
                type: Number,
                required: true,
                min: 1
            },
            answers: {
                type: mongoose_1.Schema.Types.Mixed,
                required: true
            },
            score: {
                earnedPoints: {
                    type: Number,
                    required: true,
                    min: 0
                },
                totalPoints: {
                    type: Number,
                    required: true,
                    min: 0
                },
                percentage: {
                    type: Number,
                    required: true,
                    min: 0,
                    max: 100
                },
                passed: {
                    type: Boolean,
                    required: true
                }
            },
            startedAt: {
                type: Date,
                required: true
            },
            completedAt: {
                type: Date,
                required: true
            },
            timeSpent: {
                type: Number,
                required: true,
                min: 0
            }
        }],
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    certificateIssued: {
        type: Boolean,
        default: false
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    },
    totalWatchTime: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
EnrollmentSchema.index({ userId: 1, status: 1 });
EnrollmentSchema.index({ courseId: 1, status: 1 });
EnrollmentSchema.index({ lastAccessedAt: -1 });
EnrollmentSchema.methods.updateVideoProgress = function (videoId, watchedDuration, isCompleted = false) {
    const existingProgress = this.videoProgress.find((vp) => vp.videoId === videoId);
    if (existingProgress) {
        existingProgress.watchedDuration = Math.max(existingProgress.watchedDuration, watchedDuration);
        existingProgress.lastWatchedAt = new Date();
        if (isCompleted && !existingProgress.isCompleted) {
            existingProgress.isCompleted = true;
            existingProgress.completedAt = new Date();
            this.progress.videosCompleted += 1;
        }
    }
    else {
        this.videoProgress.push({
            videoId,
            isCompleted,
            watchedDuration,
            lastWatchedAt: new Date(),
            completedAt: isCompleted ? new Date() : undefined
        });
        if (isCompleted) {
            this.progress.videosCompleted += 1;
        }
    }
    this.lastAccessedAt = new Date();
    this.totalWatchTime += watchedDuration;
    this.updateOverallProgress();
    return this.save();
};
EnrollmentSchema.methods.addQuizAttempt = function (attempt) {
    this.quizAttempts.push(attempt);
    const previousAttempts = this.quizAttempts.filter((qa) => qa.quizId === attempt.quizId && qa.attemptNumber < attempt.attemptNumber);
    const hadPassedBefore = previousAttempts.some((pa) => pa.score.passed);
    if (attempt.score.passed && !hadPassedBefore) {
        this.progress.quizzesPassed += 1;
    }
    this.lastAccessedAt = new Date();
    this.updateOverallProgress();
    return this.save();
};
EnrollmentSchema.methods.updateOverallProgress = function () {
    const videoProgress = this.progress.totalVideos > 0 ?
        (this.progress.videosCompleted / this.progress.totalVideos) * 70 : 0;
    const quizProgress = this.progress.totalQuizzes > 0 ?
        (this.progress.quizzesPassed / this.progress.totalQuizzes) * 30 : 0;
    this.progress.overallPercentage = Math.round(videoProgress + quizProgress);
    if (this.progress.overallPercentage === 100 && this.status === 'active') {
        this.status = 'completed';
        this.completedAt = new Date();
    }
};
EnrollmentSchema.methods.getBestQuizScore = function (quizId) {
    const attempts = this.quizAttempts.filter((qa) => qa.quizId === quizId);
    if (attempts.length === 0)
        return null;
    return attempts.reduce((best, current) => current.score.percentage > best.score.percentage ? current : best);
};
EnrollmentSchema.methods.canAttemptQuiz = function (quizId, maxAttempts) {
    if (maxAttempts === 0)
        return true;
    const attemptCount = this.quizAttempts.filter((qa) => qa.quizId === quizId).length;
    return attemptCount < maxAttempts;
};
exports.default = mongoose_1.default.model('Enrollment', EnrollmentSchema);
