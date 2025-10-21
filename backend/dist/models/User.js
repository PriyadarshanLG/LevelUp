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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['student', 'instructor', 'admin'],
        default: 'student'
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    phoneNumber: {
        type: String,
        match: [/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Please provide a valid phone number']
    },
    country: {
        type: String,
        trim: true,
        maxlength: [100, 'Country cannot be more than 100 characters']
    },
    hobbies: [{
            type: String,
            trim: true
        }],
    institution: {
        type: String,
        trim: true,
        maxlength: [100, 'Institution name cannot be more than 100 characters']
    },
    position: {
        type: String,
        enum: ['Student', 'Faculty', 'Intern', 'Employee', 'Freelancer']
    },
    department: {
        type: String,
        trim: true,
        maxlength: [100, 'Department cannot be more than 100 characters']
    },
    yearOfStudy: {
        type: String,
        trim: true,
        maxlength: [50, 'Year of study cannot be more than 50 characters']
    },
    experienceLevel: {
        type: String,
        trim: true,
        maxlength: [100, 'Experience level cannot be more than 100 characters']
    },
    fieldOfInterest: [{
            type: String,
            trim: true
        }],
    preferredLearningMode: {
        type: String,
        enum: ['Video', 'Text', 'Interactive']
    },
    preferredLanguage: {
        type: String,
        trim: true,
        maxlength: [50, 'Preferred language cannot be more than 50 characters']
    },
    careerGoal: {
        type: String,
        trim: true,
        maxlength: [200, 'Career goal cannot be more than 200 characters']
    },
    profession: {
        type: String,
        trim: true,
        maxlength: [100, 'Profession cannot be more than 100 characters']
    },
    organization: {
        type: String,
        trim: true,
        maxlength: [100, 'Organization name cannot be more than 100 characters']
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [500, 'Bio cannot be more than 500 characters']
    },
    location: {
        type: String,
        trim: true,
        maxlength: [100, 'Location cannot be more than 100 characters']
    },
    socialLinks: {
        linkedin: String,
        twitter: String,
        github: String,
        website: String
    },
    interests: [{
            type: String,
            trim: true
        }]
}, {
    timestamps: true
});
UserSchema.index({ email: 1 });
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcryptjs_1.default.genSalt(12);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
UserSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcryptjs_1.default.compare(candidatePassword, this.password);
    }
    catch (error) {
        return false;
    }
};
UserSchema.statics.findByEmailWithPassword = function (email) {
    return this.findOne({ email }).select('+password');
};
exports.default = mongoose_1.default.model('User', UserSchema);
