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
const VideoSchema = new mongoose_1.Schema({
    courseId: {
        type: String,
        required: [true, 'Course ID is required'],
        ref: 'Course'
    },
    title: {
        type: String,
        required: [true, 'Video title is required'],
        trim: true,
        maxlength: [100, 'Video title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Video description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    videoUrl: {
        type: String,
        required: [true, 'Video URL is required'],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'Video duration is required'],
        min: [1, 'Duration must be at least 1 second']
    },
    order: {
        type: Number,
        required: [true, 'Video order is required'],
        min: [1, 'Order must be at least 1']
    },
    isPreview: {
        type: Boolean,
        default: false
    },
    thumbnail: {
        type: String,
        required: [true, 'Video thumbnail is required']
    },
    resources: [{
            title: {
                type: String,
                required: true,
                trim: true
            },
            url: {
                type: String,
                required: true,
                trim: true
            },
            type: {
                type: String,
                required: true,
                enum: ['pdf', 'link', 'download']
            }
        }],
    transcription: {
        type: String,
        trim: true
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
VideoSchema.index({ courseId: 1, order: 1 });
VideoSchema.index({ courseId: 1, isPublished: 1 });
VideoSchema.index({ isPreview: 1 });
VideoSchema.index({ courseId: 1, order: 1 }, { unique: true });
VideoSchema.virtual('formattedDuration').get(function () {
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});
VideoSchema.methods.getNextVideo = function () {
    return mongoose_1.default.model('Video').findOne({
        courseId: this.courseId,
        order: this.order + 1,
        isPublished: true
    });
};
VideoSchema.methods.getPreviousVideo = function () {
    return mongoose_1.default.model('Video').findOne({
        courseId: this.courseId,
        order: this.order - 1,
        isPublished: true
    });
};
exports.default = mongoose_1.default.model('Video', VideoSchema);
