"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const videoController_1 = require("../controllers/videoController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/:videoId', auth_1.optionalAuth, videoController_1.getVideo);
router.get('/course/:courseId', auth_1.optionalAuth, videoController_1.getCourseVideos);
router.post('/:videoId/progress', auth_1.authenticate, videoController_1.updateVideoProgress);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('instructor', 'admin'), videoController_1.createVideo);
router.put('/:videoId', auth_1.authenticate, (0, auth_1.authorize)('instructor', 'admin'), videoController_1.updateVideo);
router.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Video routes are working!',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
