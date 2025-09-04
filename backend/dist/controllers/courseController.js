"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCourse = exports.getCategories = exports.getUserEnrollments = exports.enrollCourse = exports.getCourse = exports.getCourses = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const Video_1 = __importDefault(require("../models/Video"));
const Quiz_1 = __importDefault(require("../models/Quiz"));
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const getCourses = async (req, res) => {
    try {
        const { category, level, search, page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        const query = { isPublished: true };
        if (category) {
            query.category = category;
        }
        if (level) {
            query.level = level;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const courses = await Course_1.default.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(Number(limit))
            .select('-__v');
        const total = await Course_1.default.countDocuments(query);
        const totalPages = Math.ceil(total / Number(limit));
        res.status(200).json({
            success: true,
            message: 'Courses retrieved successfully',
            data: {
                courses,
                pagination: {
                    currentPage: Number(page),
                    totalPages,
                    totalCourses: total,
                    hasNext: Number(page) < totalPages,
                    hasPrev: Number(page) > 1
                }
            }
        });
    }
    catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve courses',
            errors: ['Internal server error']
        });
    }
};
exports.getCourses = getCourses;
const getCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await Course_1.default.findOne({
            _id: courseId,
            isPublished: true
        }).select('-__v');
        if (!course) {
            res.status(404).json({
                success: false,
                message: 'Course not found'
            });
            return;
        }
        const isEnrolled = req.user ? await Enrollment_1.default.findOne({
            userId: req.userId,
            courseId,
            status: { $in: ['active', 'completed'] }
        }) : null;
        const videoQuery = { courseId, isPublished: true };
        if (!isEnrolled) {
            videoQuery.isPreview = true;
        }
        const videos = await Video_1.default.find(videoQuery)
            .sort({ order: 1 })
            .select('-__v');
        const quizzes = isEnrolled ? await Quiz_1.default.find({
            courseId,
            isPublished: true
        }).sort({ order: 1 }).select('-questions.correctAnswer -__v') : [];
        res.status(200).json({
            success: true,
            message: 'Course retrieved successfully',
            data: {
                course,
                videos,
                quizzes,
                isEnrolled: !!isEnrolled,
                enrollment: isEnrolled || null
            }
        });
    }
    catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve course',
            errors: ['Internal server error']
        });
    }
};
exports.getCourse = getCourse;
const enrollCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.userId;
        const course = await Course_1.default.findOne({
            _id: courseId,
            isPublished: true
        });
        if (!course) {
            res.status(404).json({
                success: false,
                message: 'Course not found'
            });
            return;
        }
        const existingEnrollment = await Enrollment_1.default.findOne({
            userId,
            courseId
        });
        if (existingEnrollment) {
            res.status(409).json({
                success: false,
                message: 'Already enrolled in this course',
                data: { enrollment: existingEnrollment }
            });
            return;
        }
        const totalVideos = await Video_1.default.countDocuments({
            courseId,
            isPublished: true
        });
        const totalQuizzes = await Quiz_1.default.countDocuments({
            courseId,
            isPublished: true
        });
        const enrollment = new Enrollment_1.default({
            userId,
            courseId,
            progress: {
                videosCompleted: 0,
                totalVideos,
                quizzesPassed: 0,
                totalQuizzes,
                overallPercentage: 0
            }
        });
        await enrollment.save();
        course.enrollmentCount += 1;
        await course.save();
        res.status(201).json({
            success: true,
            message: 'Successfully enrolled in course!',
            data: { enrollment }
        });
    }
    catch (error) {
        console.error('Enroll course error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to enroll in course',
            errors: ['Internal server error']
        });
    }
};
exports.enrollCourse = enrollCourse;
const getUserEnrollments = async (req, res) => {
    try {
        const userId = req.userId;
        const { status, page = 1, limit = 10 } = req.query;
        const query = { userId };
        if (status) {
            query.status = status;
        }
        const skip = (Number(page) - 1) * Number(limit);
        const enrollments = await Enrollment_1.default.find(query)
            .sort({ lastAccessedAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate({
            path: 'courseId',
            model: 'Course',
            select: 'title shortDescription thumbnail category level duration price rating'
        })
            .select('-__v');
        const total = await Enrollment_1.default.countDocuments(query);
        res.status(200).json({
            success: true,
            message: 'Enrollments retrieved successfully',
            data: {
                enrollments,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / Number(limit)),
                    total
                }
            }
        });
    }
    catch (error) {
        console.error('Get enrollments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve enrollments',
            errors: ['Internal server error']
        });
    }
};
exports.getUserEnrollments = getUserEnrollments;
const getCategories = async (req, res) => {
    try {
        const categories = await Course_1.default.distinct('category', { isPublished: true });
        const categoryStats = await Promise.all(categories.map(async (category) => ({
            name: category,
            count: await Course_1.default.countDocuments({ category, isPublished: true })
        })));
        res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            data: { categories: categoryStats }
        });
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve categories',
            errors: ['Internal server error']
        });
    }
};
exports.getCategories = getCategories;
const createCourse = async (req, res) => {
    try {
        const { title, description, shortDescription, category, level, price, thumbnail, previewVideo, tags, requirements, learningOutcomes } = req.body;
        const instructor = {
            id: req.userId,
            name: req.user.name,
            email: req.user.email
        };
        const course = new Course_1.default({
            title,
            description,
            shortDescription,
            instructor,
            category,
            level,
            duration: 0,
            price,
            thumbnail,
            previewVideo,
            tags,
            requirements,
            learningOutcomes
        });
        await course.save();
        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: { course }
        });
    }
    catch (error) {
        console.error('Create course error:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create course',
            errors: ['Internal server error']
        });
    }
};
exports.createCourse = createCourse;
