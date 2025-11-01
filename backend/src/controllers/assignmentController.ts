import { Request, Response } from 'express';
import { Assignment, AssignmentSubmission } from '../models/Assignment';
import Classroom from '../models/Classroom';
import path from 'path';
import fs from 'fs';

// Create assignment (Teacher only)
export const createAssignment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { classroomId, lessonId, title, description, dueDate } = req.body;
    const userId = req.user?.id;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    if (classroom.teacher.toString() !== userId) {
      return res.status(403).json({ message: 'Only the teacher can create assignments' });
    }

    let documentUrl = '';
    if (req.file) {
      documentUrl = `/uploads/assignments/${req.file.filename}`;
    }

    const assignment = new Assignment({
      classroom: classroomId,
      lesson: lessonId || undefined,
      title,
      description,
      documentUrl,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    await assignment.save();

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment,
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Failed to create assignment' });
  }
};

// Get all assignments for a classroom
export const getClassroomAssignments = async (req: Request, res: Response): Promise<any> => {
  try {
    const { classroomId } = req.params;
    const userId = req.user?.id;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    const isTeacher = classroom.teacher.toString() === userId;
    const isStudent = classroom.students.some((s) => s.toString() === userId);

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const assignments = await Assignment.find({ classroom: classroomId })
      .populate('lesson', 'title')
      .sort({ createdAt: -1 });

    // If student, include their submission status
    if (isStudent) {
      const assignmentsWithSubmission = await Promise.all(
        assignments.map(async (assignment) => {
          const submission = await AssignmentSubmission.findOne({
            assignment: assignment._id,
            student: userId,
          });
          return {
            ...assignment.toObject(),
            submission,
          };
        })
      );
      return res.json({ success: true, data: { assignments: assignmentsWithSubmission } });
    }

    res.json({ success: true, data: { assignments } });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Failed to fetch assignments' });
  }
};

// Get a single assignment by ID
export const getAssignment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user?.id;

    console.log('🔍 getAssignment called:', { assignmentId, userId });

    const assignment = await Assignment.findById(assignmentId)
      .populate('lesson', 'title')
      .populate('classroom', 'name teacher students');

    console.log('📄 Assignment found:', assignment ? 'Yes' : 'No');

    if (!assignment) {
      console.log('❌ Assignment not found in database');
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const classroom = assignment.classroom as any;
    
    // Verify user has access to this assignment
    const isTeacher = classroom.teacher.toString() === userId;
    const isStudent = classroom.students.some((s: any) => s.toString() === userId);

    console.log('👤 Access check:', { isTeacher, isStudent });

    if (!isTeacher && !isStudent) {
      console.log('🚫 Access denied');
      return res.status(403).json({ message: 'Access denied' });
    }

    // If student, include their submission
    let assignmentData: any = assignment.toObject();
    if (isStudent) {
      const submission = await AssignmentSubmission.findOne({
        assignment: assignmentId,
        student: userId,
      });
      assignmentData.submission = submission;
      console.log('📝 Student submission:', submission ? 'Found' : 'Not found');
    }

    console.log('✅ Returning assignment data');
    res.json({ success: true, data: { assignment: assignmentData } });
  } catch (error) {
    console.error('❌ Get assignment error:', error);
    res.status(500).json({ message: 'Failed to fetch assignment' });
  }
};

// Submit assignment (Student only)
export const submitAssignment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { assignmentId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Verify student is in the classroom
    const classroom = await Classroom.findById(assignment.classroom);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    const isStudent = classroom.students.some((s) => s.toString() === userId);
    if (!isStudent) {
      return res.status(403).json({ message: 'Only enrolled students can submit assignments' });
    }

    let documentUrl = '';
    if (req.file) {
      documentUrl = `/uploads/submissions/${req.file.filename}`;
    }

    // Check if submission already exists
    let submission = await AssignmentSubmission.findOne({
      assignment: assignmentId,
      student: userId,
    });

    if (submission) {
      // Update existing submission
      if (submission.documentUrl && documentUrl) {
        const oldPath = path.join(process.cwd(), 'public', submission.documentUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      submission.content = content || submission.content;
      submission.documentUrl = documentUrl || submission.documentUrl;
      submission.submittedAt = new Date();
      await submission.save();
    } else {
      // Create new submission
      submission = new AssignmentSubmission({
        assignment: assignmentId,
        student: userId,
        content,
        documentUrl,
      });
      await submission.save();
    }

    res.json({
      success: true,
      message: 'Assignment submitted successfully',
      data: { submission },
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Failed to submit assignment' });
  }
};

// Get submissions for an assignment (Teacher only)
export const getAssignmentSubmissions = async (req: Request, res: Response): Promise<any> => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user?.id;

    console.log('📥 getAssignmentSubmissions called:', { assignmentId, userId });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      console.log('❌ Assignment not found');
      return res.status(404).json({ message: 'Assignment not found' });
    }

    console.log('📄 Assignment found, checking classroom...');

    const classroom = await Classroom.findById(assignment.classroom);
    if (!classroom) {
      console.log('❌ Classroom not found');
      return res.status(404).json({ message: 'Classroom not found' });
    }

    console.log('🏫 Classroom found:', classroom.name);
    console.log('👨‍🏫 Teacher check:', { 
      classroomTeacher: classroom.teacher.toString(), 
      currentUser: userId,
      isTeacher: classroom.teacher.toString() === userId 
    });

    if (classroom.teacher.toString() !== userId) {
      console.log('🚫 Access denied - user is not the teacher');
      return res.status(403).json({ message: 'Only the teacher can view submissions' });
    }

    const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    console.log(`✅ Found ${submissions.length} submission(s)`);

    res.json({ success: true, data: { submissions } });
  } catch (error) {
    console.error('❌ Get submissions error:', error);
    res.status(500).json({ message: 'Failed to fetch submissions' });
  }
};

// Grade submission (Teacher only)
export const gradeSubmission = async (req: Request, res: Response): Promise<any> => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    const userId = req.user?.id;

    const submission = await AssignmentSubmission.findById(submissionId).populate({
      path: 'assignment',
      populate: { path: 'classroom' },
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const assignment = submission.assignment as any;
    const classroom = assignment.classroom;

    if (classroom.teacher.toString() !== userId) {
      return res.status(403).json({ message: 'Only the teacher can grade submissions' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    await submission.save();

    res.json({
      success: true,
      message: 'Submission graded successfully',
      data: { submission },
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Failed to grade submission' });
  }
};

// Delete assignment (Teacher only)
export const deleteAssignment = async (req: Request, res: Response): Promise<any> => {
  try {
    const { assignmentId} = req.params;
    const userId = req.user?.id;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const classroom = await Classroom.findById(assignment.classroom);
    if (!classroom || classroom.teacher.toString() !== userId) {
      return res.status(403).json({ message: 'Only the teacher can delete assignments' });
    }

    // Delete assignment document if exists
    if (assignment.documentUrl) {
      const filePath = path.join(process.cwd(), 'public', assignment.documentUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete all submissions
    const submissions = await AssignmentSubmission.find({ assignment: assignmentId });
    for (const submission of submissions) {
      if (submission.documentUrl) {
        const filePath = path.join(process.cwd(), 'public', submission.documentUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    await AssignmentSubmission.deleteMany({ assignment: assignmentId });

    await Assignment.findByIdAndDelete(assignmentId);

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Failed to delete assignment' });
  }
};
