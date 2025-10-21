import { Request, Response } from 'express'
import Quiz, { IQuiz, IQuizAttempt, QuestionType } from '../models/Quiz'
import Course from '../models/Course'
import Enrollment from '../models/Enrollment'
import { Types } from 'mongoose'

// Get all quizzes for a course
export const getCourseQuizzes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params
    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
      return
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      userId: new Types.ObjectId(userId),
      courseId: new Types.ObjectId(courseId),
      status: { $in: ['active', 'completed'] }
    })

    if (!enrollment) {
      res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to access quizzes'
      })
      return
    }

    // Get published quizzes for the course
    const quizzes = await Quiz.find({
      courseId: new Types.ObjectId(courseId),
      isPublished: true
    }).sort({ order: 1 })

    // Add user's attempt info to each quiz
    const quizzesWithAttempts = quizzes.map(quiz => {
      const userAttempts = quiz.attempts.filter(attempt => 
        attempt.userId.toString() === userId
      )

      const bestAttempt = userAttempts.length > 0 
        ? userAttempts.reduce((best, current) => 
            current.score > best.score ? current : best
          )
        : null

      return {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        instructions: quiz.instructions,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
        totalQuestions: quiz.questions.length,
        totalPoints: quiz.totalPoints,
        order: quiz.order,
        userStats: {
          attempts: userAttempts.length,
          bestScore: bestAttempt?.score || 0,
          bestPercentage: bestAttempt?.percentage || 0,
          passed: bestAttempt?.passed || false,
          canAttempt: quiz.canUserAttempt(new Types.ObjectId(userId)),
          lastAttempt: userAttempts.length > 0 
            ? userAttempts[userAttempts.length - 1].completedAt 
            : null
        }
      }
    })

    res.status(200).json({
      success: true,
      message: 'Quizzes retrieved successfully',
      data: {
        quizzes: quizzesWithAttempts,
        totalQuizzes: quizzes.length
      }
    })
  } catch (error) {
    console.error('Get course quizzes error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quizzes',
      errors: ['Internal server error']
    })
  }
}

// Get specific quiz details
export const getQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params
    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
      return
    }

    const quiz = await Quiz.findById(quizId)
    
    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found'
      })
      return
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      userId: new Types.ObjectId(userId),
      courseId: quiz.courseId,
      status: { $in: ['active', 'completed'] }
    })

    if (!enrollment) {
      res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to access this quiz'
      })
      return
    }

    // Check if user can attempt the quiz
    const canAttempt = quiz.canUserAttempt(new Types.ObjectId(userId))
    
    if (!canAttempt) {
      res.status(403).json({
        success: false,
        message: 'Maximum attempts reached for this quiz'
      })
      return
    }

    // Get randomized questions (without correct answers)
    const questions = quiz.getRandomizedQuestions().map((question: any) => ({
      id: question.id,
      type: question.type,
      question: question.question,
      options: question.options.map((option: any) => ({
        id: option.id,
        text: option.text
        // Don't include isCorrect in the response
      })),
      points: question.points
    }))

    res.status(200).json({
      success: true,
      message: 'Quiz retrieved successfully',
      data: {
        quiz: {
          _id: quiz._id,
          courseId: quiz.courseId,
          title: quiz.title,
          description: quiz.description,
          instructions: quiz.instructions,
          timeLimit: quiz.timeLimit,
          passingScore: quiz.passingScore,
          totalQuestions: quiz.questions.length,
          totalPoints: quiz.totalPoints,
          questions
        }
      }
    })
  } catch (error) {
    console.error('Get quiz error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz',
      errors: ['Internal server error']
    })
  }
}

// Submit quiz attempt
export const submitQuizAttempt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params
    const { answers, timeSpent } = req.body
    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
      return
    }

    // Validate input
    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({
        success: false,
        message: 'Invalid answers format'
      })
      return
    }

    const quiz = await Quiz.findById(quizId)
    
    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found'
      })
      return
    }

    // Check if user can attempt the quiz
    const canAttempt = quiz.canUserAttempt(new Types.ObjectId(userId))
    
    if (!canAttempt) {
      res.status(403).json({
        success: false,
        message: 'Maximum attempts reached for this quiz'
      })
      return
    }

    // Calculate score
    let totalScore = 0
    const maxScore = quiz.totalPoints
    const questionResults: any[] = []

    for (const question of quiz.questions) {
      const userAnswer = answers.find((answer: any) => answer.questionId === question.id)
      
      if (!userAnswer) {
        questionResults.push({
          questionId: question.id,
          correct: false,
          score: 0,
          maxScore: question.points
        })
        continue
      }

      let isCorrect = false
      let questionScore = 0

      // Check answer based on question type
      switch (question.type) {
        case QuestionType.MULTIPLE_CHOICE:
          // For multiple choice, all correct options must be selected and no incorrect ones
          const correctOptions = question.correctAnswers
          const selectedOptions = userAnswer.selectedOptions || []
          
          isCorrect = correctOptions.length === selectedOptions.length &&
                     correctOptions.every(option => selectedOptions.includes(option)) &&
                     selectedOptions.every((option: string) => correctOptions.includes(option))
          break

        case QuestionType.SINGLE_CHOICE:
        case QuestionType.TRUE_FALSE:
          // For single choice, only one correct option
          isCorrect = userAnswer.selectedOptions?.length === 1 &&
                     question.correctAnswers.includes(userAnswer.selectedOptions[0])
          break

        case QuestionType.FILL_IN_BLANK:
          // For fill in the blank, check text answer
          const correctAnswer = question.correctAnswers[0]?.toLowerCase().trim()
          const userTextAnswer = userAnswer.textAnswer?.toLowerCase().trim()
          isCorrect = correctAnswer === userTextAnswer
          break

        default:
          isCorrect = false
      }

      if (isCorrect) {
        questionScore = question.points
        totalScore += questionScore
      }

      questionResults.push({
        questionId: question.id,
        correct: isCorrect,
        score: questionScore,
        maxScore: question.points,
        userAnswer: userAnswer.selectedOptions || userAnswer.textAnswer,
        correctAnswers: question.correctAnswers,
        explanation: question.explanation
      })
    }

    // Calculate percentage and determine if passed
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
    const passed = percentage >= quiz.passingScore

    // Create quiz attempt
    const quizAttempt: IQuizAttempt = {
      userId: new Types.ObjectId(userId),
      answers: answers.map((answer: any) => ({
        questionId: answer.questionId,
        selectedOptions: answer.selectedOptions || [],
        textAnswer: answer.textAnswer
      })),
      score: totalScore,
      maxScore,
      percentage,
      timeSpent: timeSpent || 0,
      completedAt: new Date(),
      passed
    }

    // Add attempt to quiz
    quiz.attempts.push(quizAttempt)
    
    // Recalculate stats
    quiz.calculateStats()
    
    await quiz.save()

    // Update enrollment progress if quiz passed
    if (passed) {
      const enrollment = await Enrollment.findOne({
        userId: new Types.ObjectId(userId),
        courseId: quiz.courseId
      })

      if (enrollment) {
        // Update quiz progress
        const courseQuizzes = await Quiz.find({ 
          courseId: quiz.courseId, 
          isPublished: true 
        })
        
        const passedQuizzes = courseQuizzes.filter(q => {
          const userBest = q.getUserBestAttempt(new Types.ObjectId(userId))
          return userBest && userBest.passed
        })

        enrollment.progress.quizzesPassed = passedQuizzes.length
        enrollment.progress.totalQuizzes = courseQuizzes.length

        // Recalculate overall percentage
        const videoWeight = 0.7 // 70% for videos
        const quizWeight = 0.3   // 30% for quizzes

        const videoProgress = enrollment.progress.totalVideos > 0 
          ? (enrollment.progress.videosCompleted / enrollment.progress.totalVideos) * 100 
          : 0

        const quizProgress = enrollment.progress.totalQuizzes > 0 
          ? (enrollment.progress.quizzesPassed / enrollment.progress.totalQuizzes) * 100 
          : 0

        enrollment.progress.overallPercentage = Math.round(
          (videoProgress * videoWeight) + (quizProgress * quizWeight)
        )

        // Check for course completion
        if (enrollment.progress.overallPercentage >= 90 && 
            enrollment.progress.quizzesPassed === enrollment.progress.totalQuizzes) {
          enrollment.status = 'completed'
          enrollment.completedAt = new Date()
        }

        enrollment.lastAccessedAt = new Date()
        await enrollment.save()
      }
    }

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        result: {
          score: totalScore,
          maxScore,
          percentage,
          passed,
          timeSpent: timeSpent || 0,
          questions: quiz.showCorrectAnswers ? questionResults : undefined,
          canRetake: quiz.canUserAttempt(new Types.ObjectId(userId))
        }
      }
    })
  } catch (error) {
    console.error('Submit quiz attempt error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      errors: ['Internal server error']
    })
  }
}

// Get quiz results/attempts for user
export const getUserQuizResults = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params
    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
      return
    }

    const quiz = await Quiz.findById(quizId)
    
    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found'
      })
      return
    }

    // Get user's attempts
    const userAttempts = quiz.attempts.filter(attempt => 
      attempt.userId.toString() === userId
    ).sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())

    const bestAttempt = userAttempts.length > 0 
      ? userAttempts.reduce((best, current) => 
          current.score > best.score ? current : best
        )
      : null

    res.status(200).json({
      success: true,
      message: 'Quiz results retrieved successfully',
      data: {
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          passingScore: quiz.passingScore,
          totalPoints: quiz.totalPoints
        },
        attempts: userAttempts.map(attempt => ({
          score: attempt.score,
          maxScore: attempt.maxScore,
          percentage: attempt.percentage,
          passed: attempt.passed,
          timeSpent: attempt.timeSpent,
          completedAt: attempt.completedAt
        })),
        bestAttempt: bestAttempt ? {
          score: bestAttempt.score,
          maxScore: bestAttempt.maxScore,
          percentage: bestAttempt.percentage,
          passed: bestAttempt.passed,
          timeSpent: bestAttempt.timeSpent,
          completedAt: bestAttempt.completedAt
        } : null,
        canRetake: quiz.canUserAttempt(new Types.ObjectId(userId)),
        attemptsLeft: quiz.maxAttempts > 0 ? quiz.maxAttempts - userAttempts.length : -1
      }
    })
  } catch (error) {
    console.error('Get quiz results error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz results',
      errors: ['Internal server error']
    })
  }
}

// Create new quiz (admin/instructor only)
export const createQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      courseId,
      title,
      description,
      instructions,
      timeLimit,
      passingScore,
      maxAttempts,
      randomizeQuestions,
      showCorrectAnswers,
      allowReview,
      questions,
      order
    } = req.body

    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
      return
    }

    // Check if course exists and user has permission
    const course = await Course.findById(courseId)
    
    if (!course) {
      res.status(404).json({
        success: false,
        message: 'Course not found'
      })
      return
    }

    if (course.instructor.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Only course instructor can create quizzes'
      })
      return
    }

    // Validate questions
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({
        success: false,
        message: 'At least one question is required'
      })
      return
    }

    // Create quiz
    const quiz = new Quiz({
      courseId,
      title,
      description,
      instructions: instructions || [],
      timeLimit: timeLimit || 0,
      passingScore: passingScore || 70,
      maxAttempts: maxAttempts || 3,
      randomizeQuestions: randomizeQuestions || false,
      showCorrectAnswers: showCorrectAnswers !== false,
      allowReview: allowReview !== false,
      questions: questions.map((q: any, index: number) => ({
        id: new Types.ObjectId().toString(),
        type: q.type,
        question: q.question,
        options: q.options.map((option: any) => ({
          id: new Types.ObjectId().toString(),
          text: option.text,
          isCorrect: option.isCorrect
        })),
        correctAnswers: q.options
          .filter((option: any) => option.isCorrect)
          .map((option: any) => option.id || new Types.ObjectId().toString()),
        explanation: q.explanation,
        points: q.points || 1,
        order: index
      })),
      order: order || 0,
      createdBy: new Types.ObjectId(userId),
      isPublished: false
    })

    await quiz.save()

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: { quiz }
    })
  } catch (error) {
    console.error('Create quiz error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create quiz',
      errors: ['Internal server error']
    })
  }
}

// Publish/unpublish quiz
export const updateQuizStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params
    const { isPublished } = req.body
    const userId = req.userId

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
      return
    }

    const quiz = await Quiz.findById(quizId).populate('courseId')
    
    if (!quiz) {
      res.status(404).json({
        success: false,
        message: 'Quiz not found'
      })
      return
    }

    // @ts-ignore - courseId is populated
    if (quiz.courseId.instructor.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Only course instructor can update quiz status'
      })
      return
    }

    quiz.isPublished = isPublished
    await quiz.save()

    res.status(200).json({
      success: true,
      message: `Quiz ${isPublished ? 'published' : 'unpublished'} successfully`,
      data: { quiz }
    })
  } catch (error) {
    console.error('Update quiz status error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz status',
      errors: ['Internal server error']
    })
  }
}
