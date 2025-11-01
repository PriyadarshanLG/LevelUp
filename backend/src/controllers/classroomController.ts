import { Request, Response } from 'express'
import Classroom from '../models/Classroom'
import User from '../models/User'

// Generate a unique 6-digit PIN
const generatePin = async (): Promise<string> => {
  let pin: string
  let isUnique = false

  while (!isUnique) {
    // Generate random 6-digit number
    pin = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Check if PIN already exists
    const existing = await Classroom.findOne({ pin })
    if (!existing) {
      isUnique = true
      return pin
    }
  }
  
  return '000000' // Fallback (should never reach here)
}

// Create classroom (teacher only)
export const createClassroom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body
    const userId = req.userId

    // Validate user is a teacher
    const user = await User.findById(userId)
    if (!user || user.role !== 'teacher') {
      res.status(403).json({
        success: false,
        message: 'Only teachers can create classrooms'
      })
      return
    }

    // Validate input
    if (!name || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Classroom name is required'
      })
      return
    }

    // Generate unique PIN
    const pin = await generatePin()

    // Create classroom
    const classroom = new Classroom({
      name: name.trim(),
      description: description?.trim() || '',
      pin,
      teacher: userId,
      students: []
    })

    await classroom.save()

    res.status(201).json({
      success: true,
      message: 'Classroom created successfully',
      data: {
        classroom: {
          _id: classroom._id,
          name: classroom.name,
          description: classroom.description,
          pin: classroom.pin,
          teacher: classroom.teacher,
          students: classroom.students,
          createdAt: classroom.createdAt,
          updatedAt: classroom.updatedAt
        }
      }
    })
  } catch (error: any) {
    console.error('Create classroom error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create classroom',
      error: error.message
    })
  }
}

// Get teacher's classrooms
export const getTeacherClassrooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId

    // Validate user is a teacher
    const user = await User.findById(userId)
    if (!user || user.role !== 'teacher') {
      res.status(403).json({
        success: false,
        message: 'Only teachers can access this resource'
      })
      return
    }

    // Get all classrooms created by this teacher
    const classrooms = await Classroom.find({ teacher: userId })
      .populate('students', 'name email')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: {
        classrooms,
        count: classrooms.length
      }
    })
  } catch (error: any) {
    console.error('Get teacher classrooms error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classrooms',
      error: error.message
    })
  }
}

// Get single classroom by ID (teacher or enrolled student)
export const getClassroom = async (req: Request, res: Response): Promise<any> => {
  try {
    const { classroomId } = req.params
    const userId = req.user?.id

    const classroom = await Classroom.findById(classroomId)
      .populate('teacher', 'name email')
      .populate('students', 'name email')

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found'
      })
    }

    // Check if user has access (teacher or enrolled student)
    const isTeacher = classroom.teacher._id.toString() === userId
    const isStudent = classroom.students.some((s: any) => s._id.toString() === userId)

    if (!isTeacher && !isStudent) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      })
    }

    res.status(200).json({
      success: true,
      data: {
        classroom
      }
    })
  } catch (error: any) {
    console.error('Get classroom error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classroom',
      error: error.message
    })
  }
}

// Join classroom with PIN (student only)
export const joinClassroom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pin } = req.body
    const userId = req.userId

    // Validate user is a student
    const user = await User.findById(userId)
    if (!user || user.role !== 'student') {
      res.status(403).json({
        success: false,
        message: 'Only students can join classrooms'
      })
      return
    }

    // Validate PIN
    if (!pin || pin.length !== 6) {
      res.status(400).json({
        success: false,
        message: 'Valid 6-digit PIN is required'
      })
      return
    }

    // Find classroom by PIN
    const classroom = await Classroom.findOne({ pin })
    if (!classroom) {
      res.status(404).json({
        success: false,
        message: 'Invalid PIN. Classroom not found'
      })
      return
    }

    // Check if student is already in classroom
    if (classroom.students.includes(userId as any)) {
      res.status(400).json({
        success: false,
        message: 'You are already a member of this classroom'
      })
      return
    }

    // Add student to classroom
    classroom.students.push(userId as any)
    await classroom.save()

    // Populate classroom details
    const populatedClassroom = await Classroom.findById(classroom._id)
      .populate('teacher', 'name email')
      .populate('students', 'name email')

    res.status(200).json({
      success: true,
      message: 'Successfully joined classroom',
      data: {
        classroom: populatedClassroom
      }
    })
  } catch (error: any) {
    console.error('Join classroom error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to join classroom',
      error: error.message
    })
  }
}

// Get student's classrooms
export const getStudentClassrooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId

    // Validate user is a student
    const user = await User.findById(userId)
    if (!user || user.role !== 'student') {
      res.status(403).json({
        success: false,
        message: 'Only students can access this resource'
      })
      return
    }

    // Get all classrooms where student is a member
    const classrooms = await Classroom.find({ students: userId })
      .populate('teacher', 'name email')
      .populate('students', 'name email')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: {
        classrooms,
        count: classrooms.length
      }
    })
  } catch (error: any) {
    console.error('Get student classrooms error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classrooms',
      error: error.message
    })
  }
}

// Delete classroom (teacher only)
export const deleteClassroom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classroomId } = req.params
    const userId = req.userId

    // Find classroom
    const classroom = await Classroom.findById(classroomId)
    if (!classroom) {
      res.status(404).json({
        success: false,
        message: 'Classroom not found'
      })
      return
    }

    // Check if user is the teacher of this classroom
    if (classroom.teacher.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Only the classroom teacher can delete this classroom'
      })
      return
    }

    await Classroom.findByIdAndDelete(classroomId)

    res.status(200).json({
      success: true,
      message: 'Classroom deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete classroom error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete classroom',
      error: error.message
    })
  }
}
