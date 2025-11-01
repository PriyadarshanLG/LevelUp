import express from 'express';
import { authenticate } from '../middleware/auth';
import { uploadAssignment, uploadSubmission } from '../middleware/upload';
import {
  createAssignment,
  getClassroomAssignments,
  getAssignment,
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
  deleteAssignment,
} from '../controllers/assignmentController';

const router = express.Router();

// Create an assignment (Teacher only)
router.post('/', authenticate, uploadAssignment.single('document'), createAssignment);

// Get all assignments for a classroom
router.get('/classroom/:classroomId', authenticate, getClassroomAssignments);

// Get submissions for an assignment (Teacher only) - Must come before /:assignmentId
router.get('/:assignmentId/submissions', authenticate, getAssignmentSubmissions);

// Submit an assignment (Student only)
router.post('/:assignmentId/submit', authenticate, uploadSubmission.single('document'), submitAssignment);

// Get a single assignment by ID
router.get('/:assignmentId', authenticate, getAssignment);

// Grade a submission (Teacher only)
router.put('/submissions/:submissionId/grade', authenticate, gradeSubmission);

// Delete an assignment (Teacher only)
router.delete('/:assignmentId', authenticate, deleteAssignment);

export default router;
