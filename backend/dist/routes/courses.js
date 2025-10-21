"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const courseController_1 = require("../controllers/courseController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', courseController_1.getCourses);
router.get('/categories', courseController_1.getCategories);
router.get('/:courseId', auth_1.optionalAuth, courseController_1.getCourse);
router.get('/:courseId/feedback', courseController_1.getCourseFeedback);
router.post('/:courseId/enroll', auth_1.authenticate, courseController_1.enrollCourse);
router.delete('/:courseId/enroll', auth_1.authenticate, courseController_1.unenrollCourse);
router.post('/:courseId/feedback', auth_1.authenticate, courseController_1.submitFeedback);
router.get('/user/enrollments', auth_1.authenticate, courseController_1.getUserEnrollments);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('instructor', 'admin'), courseController_1.createCourse);
router.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Course routes are working!',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
