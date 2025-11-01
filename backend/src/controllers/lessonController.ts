import { Request, Response } from 'express';
import Lesson from '../models/Lesson';
import Classroom from '../models/Classroom';
import VideoProgress from '../models/VideoProgress';
import User from '../models/User';
import path from 'path';
import fs from 'fs';

// Lesson Controller - Manages lesson CRUD operations

// Create a new lesson
export const createLesson = async (req: Request, res: Response): Promise<any> => {
  try {
    const { classroomId, title, description, videoUrl, order } = req.body;
    const userId = req.user?.id;

    // Verify classroom exists and user is the teacher
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    if (classroom.teacher.toString() !== userId) {
      return res.status(403).json({ message: 'Only the classroom teacher can create lessons' });
    }

    // Handle file uploads
    let notesPath = '';
    let videoPath = '';
    
    if (req.files && Array.isArray(req.files)) {
      // Handle multiple files
      req.files.forEach((file: Express.Multer.File) => {
        if (file.fieldname === 'notes') {
          notesPath = `/uploads/notes/${file.filename}`;
        } else if (file.fieldname === 'video') {
          videoPath = `/uploads/videos/${file.filename}`;
        }
      });
    } else if (req.files && typeof req.files === 'object') {
      // Handle files object
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.notes && files.notes[0]) {
        notesPath = `/uploads/notes/${files.notes[0].filename}`;
      }
      if (files.video && files.video[0]) {
        videoPath = `/uploads/videos/${files.video[0].filename}`;
      }
    } else if (req.file) {
      // Handle single file
      if (req.file.fieldname === 'notes') {
        notesPath = `/uploads/notes/${req.file.filename}`;
      } else if (req.file.fieldname === 'video') {
        videoPath = `/uploads/videos/${req.file.filename}`;
      }
    }

    // Use uploaded video path if available, otherwise use YouTube URL
    const finalVideoUrl = videoPath || videoUrl || '';

    const lesson = new Lesson({
      classroom: classroomId,
      title,
      description,
      videoUrl: finalVideoUrl,
      notes: notesPath,
      order: order || 0,
    });

    await lesson.save();

    res.status(201).json({
      message: 'Lesson created successfully',
      lesson,
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ message: 'Failed to create lesson' });
  }
};

// Get all lessons for a classroom
export const getClassroomLessons = async (req: Request, res: Response): Promise<any> => {
  try {
    const { classroomId } = req.params;
    const userId = req.user?.id;

    // Verify user has access to this classroom
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    const isTeacher = classroom.teacher.toString() === userId;
    const isStudent = classroom.students.some((s) => s.toString() === userId);

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const lessons = await Lesson.find({ classroom: classroomId })
      .sort({ order: 1, createdAt: 1 });

    res.json({ success: true, data: { lessons } });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ message: 'Failed to fetch lessons' });
  }
};

// Update a lesson
export const updateLesson = async (req: Request, res: Response): Promise<any> => {
  try {
    const { lessonId } = req.params;
    const { title, description, videoUrl, order } = req.body;
    const userId = req.user?.id;

    const lesson = await Lesson.findById(lessonId).populate('classroom');
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const classroom = lesson.classroom as any;
    if (classroom.teacher.toString() !== userId) {
      return res.status(403).json({ message: 'Only the classroom teacher can update lessons' });
    }

    // Update fields
    if (title) lesson.title = title;
    if (description) lesson.description = description;
    if (videoUrl) lesson.videoUrl = videoUrl;
    if (order !== undefined) lesson.order = order;

    // Handle file uploads
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: Express.Multer.File) => {
        if (file.fieldname === 'notes') {
          // Delete old notes file if exists
          if (lesson.notes) {
            const oldPath = path.join(process.cwd(), 'public', lesson.notes);
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          }
          lesson.notes = `/uploads/notes/${file.filename}`;
        } else if (file.fieldname === 'video') {
          // Delete old video file if exists and it's a local file
          if (lesson.videoUrl && lesson.videoUrl.startsWith('/uploads/')) {
            const oldPath = path.join(process.cwd(), 'public', lesson.videoUrl);
            if (fs.existsSync(oldPath)) {
              fs.unlinkSync(oldPath);
            }
          }
          lesson.videoUrl = `/uploads/videos/${file.filename}`;
        }
      });
    } else if (req.files && typeof req.files === 'object') {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files.notes && files.notes[0]) {
        // Delete old notes file if exists
        if (lesson.notes) {
          const oldPath = path.join(process.cwd(), 'public', lesson.notes);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        lesson.notes = `/uploads/notes/${files.notes[0].filename}`;
      }
      if (files.video && files.video[0]) {
        // Delete old video file if exists and it's a local file
        if (lesson.videoUrl && lesson.videoUrl.startsWith('/uploads/')) {
          const oldPath = path.join(process.cwd(), 'public', lesson.videoUrl);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        lesson.videoUrl = `/uploads/videos/${files.video[0].filename}`;
      }
    } else if (req.file) {
      if (req.file.fieldname === 'notes') {
        // Delete old notes file if exists
        if (lesson.notes) {
          const oldPath = path.join(process.cwd(), 'public', lesson.notes);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        lesson.notes = `/uploads/notes/${req.file.filename}`;
      } else if (req.file.fieldname === 'video') {
        // Delete old video file if exists and it's a local file
        if (lesson.videoUrl && lesson.videoUrl.startsWith('/uploads/')) {
          const oldPath = path.join(process.cwd(), 'public', lesson.videoUrl);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        lesson.videoUrl = `/uploads/videos/${req.file.filename}`;
      }
    }

    await lesson.save();

    res.json({
      message: 'Lesson updated successfully',
      lesson,
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ message: 'Failed to update lesson' });
  }
};

// Delete a lesson
export const deleteLesson = async (req: Request, res: Response): Promise<any> => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.id;

    const lesson = await Lesson.findById(lessonId).populate('classroom');
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const classroom = lesson.classroom as any;
    if (classroom.teacher.toString() !== userId) {
      return res.status(403).json({ message: 'Only the classroom teacher can delete lessons' });
    }

    // Delete notes file if exists
    if (lesson.notes) {
      const filePath = path.join(process.cwd(), 'public', lesson.notes);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete video file if exists and it's a local file
    if (lesson.videoUrl && lesson.videoUrl.startsWith('/uploads/')) {
      const videoPath = path.join(process.cwd(), 'public', lesson.videoUrl);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    await Lesson.findByIdAndDelete(lessonId);

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ message: 'Failed to delete lesson' });
  }
};

// Update video progress
export const updateVideoProgress = async (req: Request, res: Response): Promise<any> => {
  try {
    const { lessonId } = req.params;
    const { watchedDuration, totalDuration, isCompleted } = req.body;
    const userId = req.user?.id;

    // Verify lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Verify user is a student in this classroom
    const classroom = await Classroom.findById(lesson.classroom);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    const isStudent = classroom.students.some((s) => s.toString() === userId);
    if (!isStudent) {
      return res.status(403).json({ message: 'Only enrolled students can track progress' });
    }

    // Calculate progress percentage
    const progressPercentage = totalDuration > 0 
      ? Math.min(100, Math.round((watchedDuration / totalDuration) * 100)) 
      : 0;

    // Update or create progress record
    let progress = await VideoProgress.findOne({
      lesson: lessonId,
      student: userId,
    });

    if (progress) {
      // Update existing progress
      progress.watchedDuration = watchedDuration;
      progress.totalDuration = totalDuration;
      progress.progressPercentage = progressPercentage;
      progress.isCompleted = isCompleted || progressPercentage >= 95; // Mark complete if 95%+ watched
      progress.lastWatchedAt = new Date();
      await progress.save();
    } else {
      // Create new progress record
      progress = new VideoProgress({
        lesson: lessonId,
        student: userId,
        classroom: lesson.classroom,
        watchedDuration,
        totalDuration,
        progressPercentage,
        isCompleted: isCompleted || progressPercentage >= 95,
        lastWatchedAt: new Date(),
      });
      await progress.save();
    }

    res.json({
      success: true,
      data: { progress },
    });
  } catch (error) {
    console.error('Update video progress error:', error);
    res.status(500).json({ message: 'Failed to update video progress' });
  }
};

// Get video progress for a student (for a specific lesson)
export const getVideoProgress = async (req: Request, res: Response): Promise<any> => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.id;

    const progress = await VideoProgress.findOne({
      lesson: lessonId,
      student: userId,
    });

    res.json({
      success: true,
      data: { progress: progress || null },
    });
  } catch (error) {
    console.error('Get video progress error:', error);
    res.status(500).json({ message: 'Failed to fetch video progress' });
  }
};

// Get all students' video statistics for a classroom (Teacher only)
export const getClassroomVideoStatistics = async (req: Request, res: Response): Promise<any> => {
  try {
    const { classroomId } = req.params;
    const userId = req.user?.id;

    // Verify user is the teacher
    const classroom = await Classroom.findById(classroomId).populate('students', 'name email');
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    if (classroom.teacher.toString() !== userId) {
      return res.status(403).json({ message: 'Only the teacher can view statistics' });
    }

    // Get all lessons for this classroom
    const lessons = await Lesson.find({ classroom: classroomId })
      .select('title order videoUrl')
      .sort({ order: 1 });

    // Get all video progress for this classroom
    const allProgress = await VideoProgress.find({ classroom: classroomId })
      .populate('student', 'name email')
      .populate('lesson', 'title order');

    // Organize statistics by student
    const studentStats = classroom.students.map((student: any) => {
      const studentProgress = allProgress.filter(
        (p: any) => p.student._id.toString() === student._id.toString()
      );

      const completedVideos = studentProgress.filter((p) => p.isCompleted).length;
      const totalVideos = lessons.length;
      const averageProgress = studentProgress.length > 0
        ? studentProgress.reduce((sum, p) => sum + p.progressPercentage, 0) / studentProgress.length
        : 0;

      // Get progress for each lesson
      const lessonProgress = lessons.map((lesson) => {
        const progress = studentProgress.find(
          (p: any) => {
            const pLesson = p.lesson as any;
            return pLesson && pLesson._id && String(pLesson._id) === String(lesson._id);
          }
        );
        return {
          lessonId: lesson._id,
          lessonTitle: lesson.title,
          lessonOrder: lesson.order,
          progress: progress ? {
            watchedDuration: progress.watchedDuration,
            totalDuration: progress.totalDuration,
            progressPercentage: progress.progressPercentage,
            isCompleted: progress.isCompleted,
            lastWatchedAt: progress.lastWatchedAt,
          } : null,
        };
      });

      return {
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
        },
        statistics: {
          completedVideos,
          totalVideos,
          completionPercentage: totalVideos > 0 
            ? Math.round((completedVideos / totalVideos) * 100) 
            : 0,
          averageProgress: Math.round(averageProgress),
        },
        lessonProgress,
      };
    });

    // Overall classroom statistics
    const overallStats = {
      totalStudents: classroom.students.length,
      totalLessons: lessons.length,
      averageCompletion: studentStats.length > 0
        ? Math.round(
            studentStats.reduce((sum, s) => sum + s.statistics.completionPercentage, 0) / 
            studentStats.length
          )
        : 0,
    };

    res.json({
      success: true,
      data: {
        classroom: {
          _id: classroom._id,
          name: classroom.name,
        },
        overallStats,
        studentStats,
        lessons: lessons.map((l) => ({
          _id: l._id,
          title: l.title,
          order: l.order,
          hasVideo: !!l.videoUrl,
        })),
      },
    });
  } catch (error) {
    console.error('Get classroom video statistics error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
};

// Get individual student's video statistics (Teacher only)
export const getStudentVideoStatistics = async (req: Request, res: Response): Promise<any> => {
  try {
    const { classroomId, studentId } = req.params;
    const userId = req.user?.id;

    // Verify user is the teacher
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    if (classroom.teacher.toString() !== userId) {
      return res.status(403).json({ message: 'Only the teacher can view student statistics' });
    }

    // Verify student is in the classroom
    const isStudent = classroom.students.some((s) => s.toString() === studentId);
    if (!isStudent) {
      return res.status(404).json({ message: 'Student not found in this classroom' });
    }

    // Get student details
    const student = await User.findById(studentId).select('name email');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get all lessons for this classroom
    const lessons = await Lesson.find({ classroom: classroomId })
      .select('title description videoUrl notes order')
      .sort({ order: 1 });

    // Get student's progress for all lessons
    const progress = await VideoProgress.find({
      classroom: classroomId,
      student: studentId,
    }).populate('lesson', 'title order');

    // Map progress to lessons
    const lessonProgress = lessons.map((lesson) => {
      const lessonProg = progress.find(
        (p: any) => {
          const pLesson = p.lesson as any;
          return pLesson && pLesson._id && String(pLesson._id) === String(lesson._id);
        }
      );
      return {
        lesson: {
          _id: lesson._id,
          title: lesson.title,
          description: lesson.description,
          hasVideo: !!lesson.videoUrl,
          hasNotes: !!lesson.notes,
          order: lesson.order,
        },
        progress: lessonProg ? {
          watchedDuration: lessonProg.watchedDuration,
          totalDuration: lessonProg.totalDuration,
          progressPercentage: lessonProg.progressPercentage,
          isCompleted: lessonProg.isCompleted,
          lastWatchedAt: lessonProg.lastWatchedAt,
        } : null,
      };
    });

    const completedVideos = progress.filter((p) => p.isCompleted).length;
    const totalVideos = lessons.filter((l) => l.videoUrl).length;

    res.json({
      success: true,
      data: {
        student: {
          _id: student._id,
          name: student.name,
          email: student.email,
        },
        statistics: {
          completedVideos,
          totalVideos,
          completionPercentage: totalVideos > 0 
            ? Math.round((completedVideos / totalVideos) * 100) 
            : 0,
        },
        lessonProgress,
      },
    });
  } catch (error) {
    console.error('Get student video statistics error:', error);
    res.status(500).json({ message: 'Failed to fetch student statistics' });
  }
};
