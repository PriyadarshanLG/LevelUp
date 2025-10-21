"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCourse = exports.getCategories = exports.getUserEnrollments = exports.unenrollCourse = exports.enrollCourse = exports.getCourse = exports.getCourseFeedback = exports.submitFeedback = exports.getCourses = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const Video_1 = __importDefault(require("../models/Video"));
const Quiz_1 = __importDefault(require("../models/Quiz"));
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const Feedback_1 = __importDefault(require("../models/Feedback"));
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
const submitFeedback = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.userId;
        const { rating, comment } = req.body;
        const enrollment = await Enrollment_1.default.findOne({ userId, courseId });
        if (!enrollment) {
            res.status(403).json({ success: false, message: 'Enroll in the course to leave feedback' });
            return;
        }
        let created = false;
        let feedback = await Feedback_1.default.findOne({ userId, courseId });
        if (feedback) {
            feedback.rating = rating;
            feedback.comment = comment;
            await feedback.save();
        }
        else {
            feedback = new Feedback_1.default({ userId, courseId, rating, comment });
            await feedback.save();
            created = true;
        }
        if (created) {
            const course = await Course_1.default.findById(courseId);
            if (course) {
                const total = course.rating.average * course.rating.count + rating;
                course.rating.count += 1;
                course.rating.average = total / course.rating.count;
                await course.save();
            }
        }
        else {
            const agg = await Feedback_1.default.aggregate([
                { $match: { courseId } },
                { $group: { _id: '$courseId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
            ]);
            if (agg[0]) {
                await Course_1.default.updateOne({ _id: courseId }, { $set: { 'rating.average': agg[0].avg, 'rating.count': agg[0].count } });
            }
        }
        res.status(200).json({ success: true, message: 'Feedback submitted', data: { feedback } });
    }
    catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit feedback' });
    }
};
exports.submitFeedback = submitFeedback;
const getCourseFeedback = async (req, res) => {
    try {
        const { courseId } = req.params;
        const feedback = await Feedback_1.default.find({ courseId }).sort({ createdAt: -1 }).limit(50).select('-__v');
        res.status(200).json({ success: true, message: 'Feedback retrieved', data: { feedback } });
    }
    catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({ success: false, message: 'Failed to load feedback' });
    }
};
exports.getCourseFeedback = getCourseFeedback;
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
const unenrollCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.userId;
        const enrollment = await Enrollment_1.default.findOne({ userId, courseId });
        if (!enrollment) {
            res.status(404).json({
                success: false,
                message: 'Enrollment not found'
            });
            return;
        }
        await Enrollment_1.default.deleteOne({ _id: enrollment._id });
        const course = await Course_1.default.findOne({ _id: courseId });
        if (course) {
            course.enrollmentCount = Math.max(0, (course.enrollmentCount || 0) - 1);
            await course.save();
        }
        res.status(200).json({
            success: true,
            message: 'Successfully unenrolled from course'
        });
    }
    catch (error) {
        console.error('Unenroll course error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unenroll from course',
            errors: ['Internal server error']
        });
    }
};
exports.unenrollCourse = unenrollCourse;
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
            learningOutcomes,
            isPublished: true
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
