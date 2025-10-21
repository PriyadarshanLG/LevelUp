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
const CourseSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Course title is required'],
        trim: true,
        maxlength: [100, 'Course title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Course description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    shortDescription: {
        type: String,
        required: [true, 'Short description is required'],
        trim: true,
        maxlength: [200, 'Short description cannot be more than 200 characters']
    },
    instructor: {
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true
        }
    },
    category: {
        type: String,
        required: [true, 'Course category is required'],
        enum: [
            'Programming',
            'Design',
            'Business',
            'Marketing',
            'Data Science',
            'Personal Development',
            'Language',
            'Health & Fitness',
            'Music',
            'Photography'
        ]
    },
    level: {
        type: String,
        required: [true, 'Course level is required'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    duration: {
        type: Number,
        required: [true, 'Course duration is required'],
        min: [0, 'Duration must be at least 0 minutes'],
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Course price is required'],
        min: [0, 'Price cannot be negative'],
        default: 0
    },
    thumbnail: {
        type: String,
        required: [true, 'Course thumbnail is required']
    },
    previewVideo: {
        type: String,
        default: ''
    },
    tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],
    isPublished: {
        type: Boolean,
        default: false
    },
    enrollmentCount: {
        type: Number,
        default: 0,
        min: 0
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    requirements: [{
            type: String,
            trim: true
        }],
    learningOutcomes: [{
            type: String,
            trim: true
        }],
    importantTopics: [{
            type: String,
            trim: true
        }],
    timeManagement: [{
            type: String,
            trim: true
        }],
    tipsAndTricks: [{
            type: String,
            trim: true
        }],
    weeklyAssignments: [{
            week: { type: Number, required: true },
            title: { type: String, required: true, trim: true },
            description: { type: String, required: true, trim: true }
        }]
}, {
    timestamps: true
});
CourseSchema.index({ category: 1, level: 1 });
CourseSchema.index({ isPublished: 1, createdAt: -1 });
CourseSchema.index({ 'instructor.id': 1 });
CourseSchema.index({ tags: 1 });
CourseSchema.virtual('slug').get(function () {
    return this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
});
CourseSchema.methods.updateRating = function (newRating) {
    const totalRating = this.rating.average * this.rating.count + newRating;
    this.rating.count += 1;
    this.rating.average = totalRating / this.rating.count;
    return this.save();
};
exports.default = mongoose_1.default.model('Course', CourseSchema);
