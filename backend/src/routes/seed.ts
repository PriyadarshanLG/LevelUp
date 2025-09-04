import express from 'express'
import User from '../models/User'
import Course from '../models/Course'
import Video from '../models/Video'
import Quiz from '../models/Quiz'
import Enrollment from '../models/Enrollment'
import { Types } from 'mongoose'

const router = express.Router()

// GET /api/seed - Create sample data
router.get('/', async (req, res): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...')

    // Check if we should force reseed
    const force = req.query.force === 'true'
    const existingCourses = await Course.countDocuments()
    
    if (existingCourses > 0 && !force) {
      res.json({
        success: true,
        message: 'Sample data already exists',
        data: {
          courses: existingCourses,
          message: 'Database already has sample courses. Use ?force=true to recreate with YouTube videos.'
        }
      })
      return
    }

    // Clear existing data if forcing reseed
    if (force) {
      console.log('🗑️ Clearing existing data...')
      await Promise.all([
        Course.deleteMany({}),
        Video.deleteMany({}),
        Quiz.deleteMany({}),
        Enrollment.deleteMany({}),
        User.deleteMany({ role: { $ne: 'student' } }) // Keep student users
      ])
      console.log('✅ Existing data cleared')
    }

    // Create a sample instructor user
    const existingInstructor = await User.findOne({ email: 'instructor@learnhub.com' })
    let instructor = existingInstructor

    if (!instructor) {
      instructor = new User({
        name: 'Dr. Sarah Johnson',
        email: 'instructor@learnhub.com',
        password: '$2b$10$rQZ1qF5jXjXjGk2gK5rP5eJ8K5rP5eJ8K5rP5eJ8K5rP5eJ8K5rP5e', // password: "instructor123"
        role: 'instructor',
        isEmailVerified: true
      })
      await instructor.save()
      console.log('👨‍🏫 Created instructor user')
    }

    // Define a type for our course seed data structure
    type CourseSeedData = {
      title: string;
      description: string;
      shortDescription: string;
      instructor: { id: any; name: string; email: string };
      category: string;
      level: 'beginner' | 'intermediate' | 'advanced';
      duration: number;
      price: number;
      thumbnail: string;
      tags: string[];
      requirements: string[];
      learningOutcomes: string[];
      isPublished: boolean;
      enrollmentCount: number;
      rating: { average: number; count: number };
      videos: {
        title: string;
        description: string;
        duration: number;
        order: number;
        isPreview: boolean;
        startTime: number;
      }[];
    };

    // Create sample courses
    const coursesData: CourseSeedData[] = [
      {
        title: 'Complete React Development Course',
        description: 'Master React from basics to advanced concepts. Learn hooks, context, state management, and build real-world applications with modern React patterns.',
        shortDescription: 'Learn React from scratch and build amazing web applications',
        instructor: {
          id: instructor._id.toString(),
          name: instructor.name,
          email: instructor.email
        },
        category: 'Programming',
        level: 'beginner' as const,
        duration: 480, // 8 hours
        price: 0, // Free course
        thumbnail: 'https://via.placeholder.com/300x200/2563eb/ffffff?text=React+Course',
        tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
        isPublished: true,
        enrollmentCount: 1250,
        rating: { average: 4.8, count: 890 },
        requirements: [
          'Basic knowledge of HTML and CSS',
          'JavaScript fundamentals',
          'A computer with internet connection'
        ],
        learningOutcomes: [
          'Build modern React applications from scratch',
          'Understand React hooks and state management',
          'Create reusable components',
          'Handle forms and user input',
          'Deploy React applications'
        ],
        videos: [
          { title: 'Introduction to React', description: 'Overview of React and its importance in web development', duration: 120, order: 1, isPreview: true, startTime: 0 },
          { title: 'Setting Up Your Development Environment', description: 'Installing Node.js, npm, and creating a new React project', duration: 120, order: 2, isPreview: false, startTime: 120 },
          { title: 'Understanding JSX', description: 'What is JSX and how it differs from HTML', duration: 120, order: 3, isPreview: false, startTime: 240 },
          { title: 'Components and Props', description: 'Creating and using React components, passing data via props', duration: 120, order: 4, isPreview: false, startTime: 360 }
        ]
      },
      {
        title: 'Node.js & Express Masterclass',
        description: 'Build powerful backend APIs with Node.js and Express. Learn authentication, database integration, middleware, and deployment strategies.',
        shortDescription: 'Master backend development with Node.js and Express',
        instructor: {
          id: instructor._id.toString(),
          name: instructor.name,
          email: instructor.email
        },
        category: 'Programming',
        level: 'intermediate' as const,
        duration: 360, // 6 hours
        price: 49.99,
        thumbnail: 'https://via.placeholder.com/300x200/16a34a/ffffff?text=Node.js+Course',
        tags: ['Node.js', 'Express', 'Backend', 'API', 'JavaScript'],
        isPublished: true,
        enrollmentCount: 890,
        rating: { average: 4.6, count: 654 },
        requirements: [
          'JavaScript fundamentals',
          'Basic understanding of web development',
          'Node.js installed on your machine'
        ],
        learningOutcomes: [
          'Build RESTful APIs with Express',
          'Implement user authentication',
          'Work with databases (MongoDB)',
          'Deploy Node.js applications',
          'Handle errors and security'
        ],
        videos: [
          { title: 'Introduction to Node.js', description: 'What is Node.js and why it\'s popular', duration: 120, order: 1, isPreview: true, startTime: 0 },
          { title: 'Setting Up Express', description: 'Installing Express and creating a basic server', duration: 120, order: 2, isPreview: false, startTime: 120 },
          { title: 'Routing and Middleware', description: 'Understanding routes, middleware, and request/response objects', duration: 120, order: 3, isPreview: false, startTime: 240 }
        ]
      },
      {
        title: 'UI/UX Design Fundamentals',
        description: 'Learn the principles of user interface and user experience design. Create beautiful, functional designs that users love.',
        shortDescription: 'Design beautiful and user-friendly interfaces',
        instructor: {
          id: instructor._id.toString(),
          name: instructor.name,
          email: instructor.email
        },
        category: 'Design',
        level: 'beginner' as const,
        duration: 240, // 4 hours
        price: 29.99,
        thumbnail: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=UI/UX+Design',
        tags: ['UI Design', 'UX Design', 'Figma', 'Design Principles'],
        isPublished: true,
        enrollmentCount: 2100,
        rating: { average: 4.9, count: 1456 },
        requirements: [
          'No prior design experience needed',
          'A computer with internet access',
          'Figma account (free)'
        ],
        learningOutcomes: [
          'Understand design principles and psychology',
          'Create wireframes and prototypes',
          'Design responsive layouts',
          'Conduct user research',
          'Build design systems'
        ],
        videos: [
          { title: 'Introduction to UI/UX Design', description: 'What is UI/UX and why it matters', duration: 120, order: 1, isPreview: true, startTime: 0 },
          { title: 'Design Principles', description: 'Understanding color theory, typography, and visual hierarchy', duration: 120, order: 2, isPreview: false, startTime: 120 }
        ]
      }
    ]

    // Create courses
    const courses = []
    for (const courseData of coursesData) {
      const course = new Course(courseData)
      await course.save()
      courses.push(course)
      console.log(`📚 Created course: ${course.title}`)
    }

    // The single long-form YouTube video for the React course
    const singleReactCourseVideoUrl = 'https://www.youtube.com/watch?v=bMknfKXIFA8' // "React Course - Beginner's Tutorial"

    // Create videos (now chapters)
    let totalVideos = 0
    for (const courseData of coursesData) {
      const courseId = courses.find(c => c.title === courseData.title)?._id
      if (!courseId) continue

      for (const videoData of courseData.videos) {
        const video = new Video({
          courseId,
          ...videoData,
          videoUrl: singleReactCourseVideoUrl, // All chapters point to the same video
          thumbnail: `https://img.youtube.com/vi/${singleReactCourseVideoUrl.split('v=')[1]}/maxresdefault.jpg`,
          resources: [
            { title: 'Lesson Notes (PDF)', url: '#', type: 'pdf' as const },
            { title: 'Source Code', url: '#', type: 'download' as const }
          ],
          isPublished: true
        })
        await video.save()
        totalVideos++
        console.log(`🎥 Created chapter: ${video.title}`)
      }
    }

    // Create sample quizzes
    const quizData = [
      {
        courseId: courses[0]._id, // React course
        title: 'React Fundamentals Quiz',
        description: 'Test your knowledge of React basics including components, JSX, and props',
        instructions: [
          'This quiz covers React components, JSX, and props',
          'You have 15 minutes to complete all questions',
          'You can retake this quiz up to 3 times',
          'A score of 70% or higher is required to pass'
        ],
        timeLimit: 15,
        passingScore: 70,
        maxAttempts: 3,
        randomizeQuestions: false,
        showCorrectAnswers: true,
        allowReview: true,
        questions: [
          {
            id: new Types.ObjectId().toString(),
            type: 'single_choice' as const,
            question: 'What is JSX in React?',
            options: [
              { id: new Types.ObjectId().toString(), text: 'A JavaScript extension syntax', isCorrect: false },
              { id: new Types.ObjectId().toString(), text: 'A syntax extension for JavaScript', isCorrect: true },
              { id: new Types.ObjectId().toString(), text: 'A CSS framework for React', isCorrect: false },
              { id: new Types.ObjectId().toString(), text: 'A database query language', isCorrect: false }
            ],
            correctAnswers: [] as string[],
            explanation: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.',
            points: 10,
            order: 1
          },
          {
            id: new Types.ObjectId().toString(),
            type: 'true_false' as const,
            question: 'React components must always return a single parent element.',
            options: [
              { id: new Types.ObjectId().toString(), text: 'True', isCorrect: false },
              { id: new Types.ObjectId().toString(), text: 'False', isCorrect: true }
            ],
            correctAnswers: [] as string[],
            explanation: 'With React Fragments or React 16+, components can return multiple elements without a single parent wrapper.',
            points: 10,
            order: 2
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true,
        attempts: [],
        averageScore: 0,
        totalAttempts: 0,
        passRate: 0
      }
    ]

    // Set correct answers for quiz questions
    const quiz = quizData[0]
    quiz.questions[0].correctAnswers = [quiz.questions[0].options[1].id]
    quiz.questions[1].correctAnswers = [quiz.questions[1].options[1].id]

    let totalQuizzes = 0
    for (const quiz of quizData) {
      const newQuiz = new Quiz(quiz)
      await newQuiz.save()
      totalQuizzes++
      console.log(`📝 Created quiz: ${newQuiz.title}`)
    }

    console.log('🎉 Database seeding completed successfully!')

    res.status(200).json({
      success: true,
      message: 'Sample data created successfully!',
      data: {
        instructor: {
          email: 'instructor@learnhub.com',
          password: 'instructor123'
        },
        stats: {
          courses: courses.length,
          videos: totalVideos,
          quizzes: totalQuizzes
        },
        courses: courses.map(course => ({
          id: course._id,
          title: course.title,
          price: course.price,
          level: course.level,
          isPublished: course.isPublished
        }))
      }
    })

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create sample data',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router
