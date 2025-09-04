// Seed Data Script for LearnHub Platform
// Run this script to populate your database with sample courses, videos, and quizzes

const mongoose = require('mongoose');
require('dotenv').config();

// Import models (adjust paths if needed)
const User = require('./models/User.ts').default;
const Course = require('./models/Course.ts').default;
const Video = require('./models/Video.ts').default;
const Quiz = require('./models/Quiz.ts').default;

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnhub';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create a sample instructor user
    const instructor = new User({
      name: 'Dr. Sarah Johnson',
      email: 'instructor@learnhub.com',
      password: '$2b$10$rQZ1qF5jXjXjGk2gK5rP5eJ8K5rP5eJ8K5rP5eJ8K5rP5eJ8K5rP5e', // password: "instructor123"
      role: 'instructor',
      isEmailVerified: true
    });
    await instructor.save();
    console.log('👨‍🏫 Created instructor user');

    // Sample courses data
    const coursesData = [
      {
        title: 'Complete React Development Course',
        description: 'Master React from basics to advanced concepts. Learn hooks, context, state management, and build real-world applications with modern React patterns.',
        shortDescription: 'Learn React from scratch and build amazing web applications',
        instructor: instructor._id,
        category: 'Web Development',
        level: 'beginner',
        duration: 480, // 8 hours
        price: 0, // Free course
        thumbnail: 'https://via.placeholder.com/300x200/2563eb/ffffff?text=React+Course',
        tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
        isPublished: true,
        enrollmentCount: 1250,
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
        ]
      },
      {
        title: 'Node.js & Express Masterclass',
        description: 'Build powerful backend APIs with Node.js and Express. Learn authentication, database integration, middleware, and deployment strategies.',
        shortDescription: 'Master backend development with Node.js and Express',
        instructor: instructor._id,
        category: 'Backend Development',
        level: 'intermediate',
        duration: 360, // 6 hours
        price: 49.99,
        thumbnail: 'https://via.placeholder.com/300x200/16a34a/ffffff?text=Node.js+Course',
        tags: ['Node.js', 'Express', 'Backend', 'API', 'JavaScript'],
        isPublished: true,
        enrollmentCount: 890,
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
        ]
      },
      {
        title: 'UI/UX Design Fundamentals',
        description: 'Learn the principles of user interface and user experience design. Create beautiful, functional designs that users love.',
        shortDescription: 'Design beautiful and user-friendly interfaces',
        instructor: instructor._id,
        category: 'Design',
        level: 'beginner',
        duration: 240, // 4 hours
        price: 29.99,
        thumbnail: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=UI/UX+Design',
        tags: ['UI Design', 'UX Design', 'Figma', 'Design Principles'],
        isPublished: true,
        enrollmentCount: 2100,
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
        ]
      },
      {
        title: 'Python for Data Science',
        description: 'Dive into data science with Python. Learn pandas, numpy, matplotlib, and machine learning basics to analyze and visualize data.',
        shortDescription: 'Analyze data and build machine learning models with Python',
        instructor: instructor._id,
        category: 'Data Science',
        level: 'intermediate',
        duration: 600, // 10 hours
        price: 79.99,
        thumbnail: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Python+Data+Science',
        tags: ['Python', 'Data Science', 'Machine Learning', 'Pandas', 'Numpy'],
        isPublished: true,
        enrollmentCount: 750,
        requirements: [
          'Basic Python knowledge',
          'High school level mathematics',
          'Python installed on your machine'
        ],
        learningOutcomes: [
          'Manipulate data with pandas and numpy',
          'Create visualizations with matplotlib',
          'Build machine learning models',
          'Perform statistical analysis',
          'Clean and prepare data'
        ]
      }
    ];

    // Create courses
    const courses = [];
    for (const courseData of coursesData) {
      const course = new Course(courseData);
      await course.save();
      courses.push(course);
      console.log(`📚 Created course: ${course.title}`);
    }

    // Create videos for each course
    const videosData = [
      // React Course Videos
      {
        courseId: courses[0]._id,
        videos: [
          { title: 'Introduction to React', description: 'What is React and why use it?', duration: 900, order: 1, isPreview: true },
          { title: 'Setting Up Your Development Environment', description: 'Install Node.js, create-react-app, and VS Code setup', duration: 1200, order: 2 },
          { title: 'Your First React Component', description: 'Create and render your first React component', duration: 1500, order: 3 },
          { title: 'JSX and Props', description: 'Learn JSX syntax and how to pass data with props', duration: 1800, order: 4 },
          { title: 'State and Event Handling', description: 'Manage component state and handle user events', duration: 2100, order: 5 },
          { title: 'React Hooks - useState and useEffect', description: 'Master the most important React hooks', duration: 2400, order: 6 }
        ]
      },
      // Node.js Course Videos
      {
        courseId: courses[1]._id,
        videos: [
          { title: 'Node.js Fundamentals', description: 'Understanding Node.js and its ecosystem', duration: 1200, order: 1, isPreview: true },
          { title: 'Express.js Setup', description: 'Creating your first Express server', duration: 900, order: 2 },
          { title: 'Routing and Middleware', description: 'Handle different routes and create middleware', duration: 1500, order: 3 },
          { title: 'Working with MongoDB', description: 'Connect and interact with MongoDB database', duration: 1800, order: 4 },
          { title: 'User Authentication', description: 'Implement JWT-based authentication', duration: 2100, order: 5 }
        ]
      },
      // UI/UX Course Videos
      {
        courseId: courses[2]._id,
        videos: [
          { title: 'Design Principles Introduction', description: 'Basic principles of good design', duration: 800, order: 1, isPreview: true },
          { title: 'Color Theory and Typography', description: 'Choose colors and fonts that work', duration: 1000, order: 2 },
          { title: 'User Research Methods', description: 'How to understand your users', duration: 1200, order: 3 },
          { title: 'Wireframing and Prototyping', description: 'Create wireframes and interactive prototypes', duration: 1500, order: 4 }
        ]
      },
      // Python Data Science Videos
      {
        courseId: courses[3]._id,
        videos: [
          { title: 'Python Data Science Overview', description: 'Introduction to the data science workflow', duration: 1000, order: 1, isPreview: true },
          { title: 'Pandas Fundamentals', description: 'Data manipulation with pandas library', duration: 1800, order: 2 },
          { title: 'Data Visualization with Matplotlib', description: 'Create charts and graphs', duration: 1500, order: 3 },
          { title: 'Introduction to Machine Learning', description: 'Your first ML model with scikit-learn', duration: 2100, order: 4 },
          { title: 'Data Cleaning Techniques', description: 'Handle missing data and outliers', duration: 1200, order: 5 }
        ]
      }
    ];

    // Create videos
    for (const courseVideos of videosData) {
      for (const videoData of courseVideos.videos) {
        const video = new Video({
          ...videoData,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Sample video URL
          thumbnail: 'https://via.placeholder.com/300x200/6b7280/ffffff?text=Video+Thumbnail',
          resources: [
            {
              title: 'Lesson Notes',
              url: '#',
              type: 'pdf'
            },
            {
              title: 'Source Code',
              url: '#',
              type: 'download'
            }
          ],
          isPublished: true
        });
        await video.save();
        console.log(`🎥 Created video: ${video.title}`);
      }
    }

    // Create sample quizzes
    const quizData = [
      {
        courseId: courses[0]._id, // React course
        title: 'React Fundamentals Quiz',
        description: 'Test your knowledge of React basics',
        instructions: [
          'This quiz covers React components, JSX, and props',
          'You have 15 minutes to complete',
          'You can retake this quiz up to 3 times'
        ],
        timeLimit: 15,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is JSX?',
            options: [
              { id: 'a', text: 'A JavaScript extension', isCorrect: false },
              { id: 'b', text: 'A syntax extension for JavaScript', isCorrect: true },
              { id: 'c', text: 'A CSS framework', isCorrect: false },
              { id: 'd', text: 'A database query language', isCorrect: false }
            ],
            correctAnswers: ['b'],
            explanation: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'multiple_choice',
            question: 'Which of the following are React hooks? (Select all that apply)',
            options: [
              { id: 'a', text: 'useState', isCorrect: true },
              { id: 'b', text: 'useEffect', isCorrect: true },
              { id: 'c', text: 'useRouter', isCorrect: false },
              { id: 'd', text: 'useContext', isCorrect: true }
            ],
            correctAnswers: ['a', 'b', 'd'],
            explanation: 'useState, useEffect, and useContext are built-in React hooks. useRouter is from React Router, not a React hook.',
            points: 15,
            order: 2
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      }
    ];

    for (const quiz of quizData) {
      const newQuiz = new Quiz(quiz);
      await newQuiz.save();
      console.log(`📝 Created quiz: ${newQuiz.title}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Created:');
    console.log(`   👤 1 instructor user`);
    console.log(`   📚 ${courses.length} courses`);
    console.log(`   🎥 ${videosData.reduce((total, course) => total + course.videos.length, 0)} videos`);
    console.log(`   📝 ${quizData.length} quizzes`);
    console.log('');
    console.log('🚀 Your LearnHub platform is now ready to explore!');
    console.log('💡 Try logging in and enrolling in the free React course');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the seeding
connectDB().then(() => {
  seedData();
});
