"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVideo = exports.createVideo = exports.getCourseVideos = exports.updateVideoProgress = exports.getVideo = void 0;
const Video_1 = __importDefault(require("../models/Video"));
const Course_1 = __importDefault(require("../models/Course"));
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const getVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.userId;
        const video = await Video_1.default.findOne({
            _id: videoId,
            isPublished: true
        }).select('-__v');
        if (!video) {
            res.status(404).json({
                success: false,
                message: 'Video not found'
            });
            return;
        }
        if (!video.isPreview && userId) {
            const enrollment = await Enrollment_1.default.findOne({
                userId,
                courseId: video.courseId,
                status: { $in: ['active', 'completed'] }
            });
            if (!enrollment) {
                res.status(403).json({
                    success: false,
                    message: 'You must be enrolled in the course to watch this video'
                });
                return;
            }
        }
        else if (!video.isPreview && !userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required to watch this video'
            });
            return;
        }
        let videoProgress = null;
        if (userId) {
            const enrollment = await Enrollment_1.default.findOne({
                userId,
                courseId: video.courseId
            });
            if (enrollment) {
                videoProgress = enrollment.videoProgress.find(vp => vp.videoId === videoId);
            }
        }
        res.status(200).json({
            success: true,
            message: 'Video retrieved successfully',
            data: {
                video,
                progress: videoProgress
            }
        });
    }
    catch (error) {
        console.error('Get video error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve video',
            errors: ['Internal server error']
        });
    }
};
exports.getVideo = getVideo;
const updateVideoProgress = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { watchedDuration, isCompleted = false } = req.body;
        const userId = req.userId;
        if (typeof watchedDuration !== 'number' || watchedDuration < 0) {
            res.status(400).json({
                success: false,
                message: 'Invalid watched duration'
            });
            return;
        }
        const video = await Video_1.default.findById(videoId);
        if (!video) {
            res.status(404).json({
                success: false,
                message: 'Video not found'
            });
            return;
        }
        const enrollment = await Enrollment_1.default.findOne({
            userId,
            courseId: video.courseId,
            status: { $in: ['active', 'completed'] }
        });
        if (!enrollment) {
            res.status(403).json({
                success: false,
                message: 'You must be enrolled in the course to track progress'
            });
            return;
        }
        await enrollment.updateVideoProgress(videoId, watchedDuration, isCompleted);
        res.status(200).json({
            success: true,
            message: 'Video progress updated successfully',
            data: {
                progress: enrollment.progress,
                videoProgress: enrollment.videoProgress.find(vp => vp.videoId === videoId)
            }
        });
    }
    catch (error) {
        console.error('Update video progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update video progress',
            errors: ['Internal server error']
        });
    }
};
exports.updateVideoProgress = updateVideoProgress;
const getCourseVideos = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.userId;
        const course = await Course_1.default.findById(courseId);
        if (!course) {
            res.status(404).json({
                success: false,
                message: 'Course not found'
            });
            return;
        }
        let enrollment = null;
        if (userId) {
            enrollment = await Enrollment_1.default.findOne({
                userId,
                courseId,
                status: { $in: ['active', 'completed'] }
            });
        }
        const videoQuery = { courseId, isPublished: true };
        if (!enrollment) {
            videoQuery.isPreview = true;
        }
        const videos = await Video_1.default.find(videoQuery)
            .sort({ order: 1 })
            .select('-__v');
        const videosWithProgress = videos.map(video => {
            const videoObj = video.toObject();
            if (enrollment) {
                const progress = enrollment.videoProgress.find((vp) => vp.videoId === video._id.toString());
                videoObj.progress = progress || {
                    isCompleted: false,
                    watchedDuration: 0,
                    lastWatchedAt: null
                };
            }
            return videoObj;
        });
        res.status(200).json({
            success: true,
            message: 'Course videos retrieved successfully',
            data: {
                videos: videosWithProgress,
                isEnrolled: !!enrollment,
                totalVideos: videos.length
            }
        });
    }
    catch (error) {
        console.error('Get course videos error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve course videos',
            errors: ['Internal server error']
        });
    }
};
exports.getCourseVideos = getCourseVideos;
const createVideo = async (req, res) => {
    try {
        const { courseId, title, description, videoUrl, duration, order, isPreview = false, thumbnail, resources = [], transcription } = req.body;
        const course = await Course_1.default.findById(courseId);
        if (!course) {
            res.status(404).json({
                success: false,
                message: 'Course not found'
            });
            return;
        }
        if (course.instructor.id !== req.userId && req.user.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'You can only add videos to your own courses'
            });
            return;
        }
        const video = new Video_1.default({
            courseId,
            title,
            description,
            videoUrl,
            duration,
            order,
            isPreview,
            thumbnail,
            resources,
            transcription
        });
        await video.save();
        const totalDuration = await Video_1.default.aggregate([
            { $match: { courseId, isPublished: true } },
            { $group: { _id: null, total: { $sum: '$duration' } } }
        ]);
        if (totalDuration.length > 0) {
            course.duration = Math.ceil(totalDuration[0].total / 60);
            await course.save();
        }
        res.status(201).json({
            success: true,
            message: 'Video created successfully',
            data: { video }
        });
    }
    catch (error) {
        console.error('Create video error:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
            return;
        }
        if (error.code === 11000 && error.keyPattern?.order) {
            res.status(409).json({
                success: false,
                message: 'A video with this order already exists in the course',
                errors: ['Duplicate video order']
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create video',
            errors: ['Internal server error']
        });
    }
};
exports.createVideo = createVideo;
const updateVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const updates = req.body;
        const video = await Video_1.default.findById(videoId);
        if (!video) {
            res.status(404).json({
                success: false,
                message: 'Video not found'
            });
            return;
        }
        const course = await Course_1.default.findById(video.courseId);
        if (!course || (course.instructor.id !== req.userId && req.user.role !== 'admin')) {
            res.status(403).json({
                success: false,
                message: 'You can only edit videos in your own courses'
            });
            return;
        }
        Object.assign(video, updates);
        await video.save();
        res.status(200).json({
            success: true,
            message: 'Video updated successfully',
            data: { video }
        });
    }
    catch (error) {
        console.error('Update video error:', error);
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
            message: 'Failed to update video',
            errors: ['Internal server error']
        });
    }
};
exports.updateVideo = updateVideo;
