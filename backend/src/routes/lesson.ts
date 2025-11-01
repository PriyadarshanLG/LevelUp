import express from 'express';
import { authenticate } from '../middleware/auth';
import { uploadLesson } from '../middleware/upload';
import {
  createLesson,
  getClassroomLessons,
  updateLesson,
  deleteLesson,
  updateVideoProgress,
  getVideoProgress,
  getClassroomVideoStatistics,
  getStudentVideoStatistics,
} from '../controllers/lessonController';

const router = express.Router();

// Create a new lesson (Teacher only) - accepts video and/or notes files
router.post(
  '/', 
  authenticate, 
  uploadLesson.fields([
    { name: 'video', maxCount: 1 },
    { name: 'notes', maxCount: 1 }
  ]), 
  createLesson
);

// Get all lessons for a classroom
router.get('/classroom/:classroomId', authenticate, getClassroomLessons);

// Update a lesson (Teacher only) - accepts video and/or notes files
router.put(
  '/:lessonId', 
  authenticate, 
  uploadLesson.fields([
    { name: 'video', maxCount: 1 },
    { name: 'notes', maxCount: 1 }
  ]), 
  updateLesson
);

// Delete a lesson (Teacher only)
router.delete('/:lessonId', authenticate, deleteLesson);

// Video Progress Tracking Routes

// Update video progress for a lesson (Student only)
router.post('/:lessonId/progress', authenticate, updateVideoProgress);

// Get video progress for a lesson (Student only)
router.get('/:lessonId/progress', authenticate, getVideoProgress);

// Get all students' video statistics for a classroom (Teacher only)
router.get('/classroom/:classroomId/statistics', authenticate, getClassroomVideoStatistics);

// Get individual student's video statistics (Teacher only)
router.get('/classroom/:classroomId/student/:studentId/statistics', authenticate, getStudentVideoStatistics);

export default router;
