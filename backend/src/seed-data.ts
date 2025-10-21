// Seed Data Script for LearnHub Platform
// Run this script to populate your database with sample courses, videos, and quizzes

import mongoose from 'mongoose';
import User from './models/User';
import Course from './models/Course';
import Video from './models/Video';
import Quiz from './models/Quiz';
import Enrollment from './models/Enrollment';

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

const cleanDB = async (force: boolean = false) => {
  try {
    if (force) {
      console.log('🧹 Cleaning database...');
      await Promise.all([
        Course.deleteMany({}),
        Video.deleteMany({}),
        Quiz.deleteMany({}),
        Enrollment.deleteMany({}),
        User.deleteMany({ role: { $ne: 'student' } }) // Keep student users
      ]);
      console.log('🧼 Database cleaned');
    }
  } catch (error) {
    console.error('❌ Database cleaning failed:', error);
    throw error;
  }
};

export const seedDatabase = async (force: boolean = false) => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clean database if force is true
    await cleanDB(force);

    // Create a sample instructor user
    const existingInstructor = await User.findOne({ email: 'instructor@learnhub.com' });
    let instructor = existingInstructor;

    if (!instructor) {
      instructor = new User({
        name: 'Dr. Sarah Johnson',
        email: 'instructor@learnhub.com',
        password: 'instructor123', // Will be hashed by pre-save middleware
        role: 'instructor',
        isEmailVerified: true
      });
      await instructor.save();
      console.log('👨‍🏫 Created instructor user');
    }

    // Sample courses data
    const coursesData = [
      {
        title: 'Complete React Development Course',
        description: 'Master React from basics to advanced concepts. Learn hooks, context, state management, and build real-world applications with modern React patterns.',
        shortDescription: 'Learn React from scratch and build amazing web applications',
        instructor: {
          id: instructor._id,
          name: 'freeCodeCamp.org',
          email: 'noreply@freecodecamp.org'
        },
        category: 'Programming',
        level: 'beginner',
        duration: 480, // 8 hours
        price: 0, // Free course
        thumbnail: '/react.jpg',
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
        instructor: {
          id: instructor._id,
          name: 'Stacky Patel',
          email: 'noreply@stackypatel.dev'
        },
        category: 'Programming',
        level: 'intermediate',
        duration: 360, // 6 hours
        price: 49.99,
        thumbnail: '/node.jpg',
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
        instructor: {
          id: instructor._id,
          name: 'Intellipaat',
          email: 'noreply@intellipaat.com'
        },
        category: 'Design',
        level: 'beginner',
        duration: 240, // 4 hours
        price: 29.99,
        thumbnail: '/ui.jpg',
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
        instructor: {
          id: instructor._id,
          name: 'Simplilearn',
          email: 'noreply@simplilearn.com'
        },
        category: 'Data Science',
        level: 'intermediate',
        duration: 600, // 10 hours
        price: 79.99,
        thumbnail: '/ds.jpg',
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
      },
      {
        title: 'Python for Beginners',
        description: 'A practical, beginner-friendly Python course covering syntax, data types, control flow, functions, and basic projects. Perfect for those starting their programming journey.',
        shortDescription: 'Learn Python from scratch with hands-on examples',
        instructor: {
          id: instructor._id,
          name: 'Code with Harry',
          email: 'noreply@codewithharry.com'
        },
        category: 'Programming',
        level: 'beginner',
        duration: 90, // 1.5 hours
        price: 0, // Free course
        thumbnail: '/python.jpg',
        previewVideo: 'https://youtu.be/UrsmFxEIp5k?si=YXjiEuov3djVftHt',
        tags: ['Python', 'Beginner', 'Programming', 'Basics'],
        isPublished: true,
        enrollmentCount: 0,
        requirements: [
          'No prior programming experience required',
          'A computer with internet connection',
          'Python installed on your machine'
        ],
        learningOutcomes: [
          'Understand Python syntax and variables',
          'Work with data types and control flow',
          'Write functions and simple scripts',
          'Build your first Python projects'
        ]
      },
      {
        title: 'Java Programming Masterclass',
        description: 'Complete Java programming course from basics to advanced concepts. Learn object-oriented programming, collections, multithreading, and build real-world applications.',
        shortDescription: 'Master Java programming from beginner to advanced level',
        instructor: {
          id: instructor._id,
          name: 'Code with Mosh',
          email: 'noreply@codewithmosh.com'
        },
        category: 'Programming',
        level: 'beginner',
        duration: 720, // 12 hours
        price: 59.99,
        thumbnail: '/java.jpg',
        tags: ['Java', 'OOP', 'Programming', 'Backend'],
        isPublished: true,
        enrollmentCount: 0,
        requirements: [
          'No prior programming experience required',
          'Java Development Kit (JDK) installed',
          'A computer with internet connection'
        ],
        learningOutcomes: [
          'Master Java syntax and fundamentals',
          'Understand object-oriented programming',
          'Work with collections and generics',
          'Build desktop and web applications',
          'Handle multithreading and concurrency'
        ]
      },
      {
        title: 'C Programming Fundamentals',
        description: 'Learn C programming from the ground up. Master pointers, memory management, data structures, and system programming concepts.',
        shortDescription: 'Master the fundamentals of C programming language',
        instructor: {
          id: instructor._id,
          name: 'Apna College',
          email: 'noreply@apnacollege.in'
        },
        category: 'Programming',
        level: 'beginner',
        duration: 600, // 10 hours
        price: 39.99,
        thumbnail: '/c.jpg',
        tags: ['C', 'Programming', 'System Programming', 'Memory Management'],
        isPublished: true,
        enrollmentCount: 0,
        requirements: [
          'Basic computer knowledge',
          'C compiler installed (GCC recommended)',
          'A computer with internet connection'
        ],
        learningOutcomes: [
          'Understand C syntax and data types',
          'Master pointers and memory management',
          'Work with arrays and strings',
          'Implement data structures',
          'Write system-level programs'
        ]
      },
      {
        title: 'C++ Programming Complete Guide',
        description: 'Comprehensive C++ course covering modern C++ features, STL, object-oriented programming, and advanced concepts like templates and smart pointers.',
        shortDescription: 'Learn modern C++ programming with advanced features',
        instructor: {
          id: instructor._id,
          name: 'College wallah',
          email: 'noreply@collegewallah.com'
        },
        category: 'Programming',
        level: 'intermediate',
        duration: 900, // 15 hours
        price: 69.99,
        thumbnail: '/c+.jpg',
        tags: ['C++', 'OOP', 'STL', 'Modern C++', 'Templates'],
        isPublished: true,
        enrollmentCount: 0,
        requirements: [
          'Basic knowledge of C programming',
          'C++ compiler installed',
          'A computer with internet connection'
        ],
        learningOutcomes: [
          'Master C++ syntax and features',
          'Understand object-oriented programming',
          'Work with STL containers and algorithms',
          'Implement templates and generic programming',
          'Build high-performance applications'
        ]
      },
      {
        title: 'HTML5 Complete Course',
        description: 'Master HTML5 from basics to advanced features. Learn semantic markup, forms, multimedia, canvas, and modern web development practices.',
        shortDescription: 'Learn HTML5 and modern web markup',
        instructor: {
          id: instructor._id,
          name: 'freeCodeCamp.org',
          email: 'noreply@freecodecamp.org'
        },
        category: 'Programming',
        level: 'beginner',
        duration: 300, // 5 hours
        price: 0, // Free course
        thumbnail: '/html.jpg',
        tags: ['HTML5', 'Web Development', 'Markup', 'Semantic HTML'],
        isPublished: true,
        enrollmentCount: 0,
        requirements: [
          'No prior experience required',
          'A text editor',
          'A web browser',
          'Internet connection'
        ],
        learningOutcomes: [
          'Master HTML5 syntax and elements',
          'Create semantic and accessible markup',
          'Build responsive web layouts',
          'Work with forms and multimedia',
          'Understand modern web standards'
        ]
      },
      {
        title: 'CSS3 Styling Masterclass',
        description: 'Complete CSS3 course covering selectors, layouts, animations, responsive design, and modern CSS features like Grid and Flexbox.',
        shortDescription: 'Master CSS3 styling and modern web design',
        instructor: {
          id: instructor._id,
          name: 'Apna College',
          email: 'noreply@apnacollege.in'
        },
        category: 'Programming',
        level: 'beginner',
        duration: 420, // 7 hours
        price: 29.99,
        thumbnail: '/css.jpg',
        tags: ['CSS3', 'Web Design', 'Responsive Design', 'Flexbox', 'Grid'],
        isPublished: true,
        enrollmentCount: 0,
        requirements: [
          'Basic HTML knowledge',
          'A text editor',
          'A web browser',
          'Internet connection'
        ],
        learningOutcomes: [
          'Master CSS3 selectors and properties',
          'Create responsive layouts with Flexbox and Grid',
          'Implement animations and transitions',
          'Design beautiful user interfaces',
          'Optimize CSS for performance'
        ]
      },
      {
        title: 'Computer Networks Fundamentals',
        description: 'Comprehensive course on computer networking covering protocols, network architecture, security, and practical network administration.',
        shortDescription: 'Understand computer networks and networking protocols',
        instructor: {
          id: instructor._id,
          name: 'Kunal Kushwaha',
          email: 'noreply@kunalk.dev'
        },
        category: 'Programming',
        level: 'intermediate',
        duration: 600, // 10 hours
        price: 79.99,
        thumbnail: '/cn.jpg',
        tags: ['Networking', 'TCP/IP', 'Network Security', 'Protocols'],
        isPublished: true,
        enrollmentCount: 0,
        requirements: [
          'Basic computer science knowledge',
          'Understanding of operating systems',
          'A computer with internet connection'
        ],
        learningOutcomes: [
          'Understand network protocols and architecture',
          'Master TCP/IP and OSI models',
          'Configure and troubleshoot networks',
          'Implement network security measures',
          'Design network topologies'
        ]
      },
      {
        title: 'Software Engineering Principles',
        description: 'Learn software engineering methodologies, design patterns, testing strategies, and project management for building scalable software systems.',
        shortDescription: 'Master software engineering principles and practices',
        instructor: {
          id: instructor._id,
          name: 'Knowledge Gate by Sanchit',
          email: 'noreply@knowledgegate.in'
        },
        category: 'Programming',
        level: 'intermediate',
        duration: 720, // 12 hours
        price: 89.99,
        thumbnail: '/software.jpg',
        tags: ['Software Engineering', 'Design Patterns', 'Testing', 'Project Management'],
        isPublished: true,
        enrollmentCount: 0,
        requirements: [
          'Programming experience in any language',
          'Basic understanding of software development',
          'A computer with internet connection'
        ],
        learningOutcomes: [
          'Understand software development lifecycle',
          'Master design patterns and principles',
          'Implement testing strategies',
          'Manage software projects effectively',
          'Build maintainable software systems'
        ]
      },
      {
        title: 'Cloud Computing Essentials',
        description: 'Complete guide to cloud computing covering AWS, Azure, Google Cloud, virtualization, containers, and cloud architecture patterns.',
        shortDescription: 'Master cloud computing platforms and services',
        instructor: {
          id: instructor._id,
          name: 'Edureka!',
          email: 'noreply@edureka.co'
        },
        category: 'Programming',
        level: 'intermediate',
        duration: 900, // 15 hours
        price: 99.99,
        thumbnail: '/cloud.jpg',
        tags: ['Cloud Computing', 'AWS', 'Azure', 'Docker', 'Kubernetes'],
        isPublished: true,
        enrollmentCount: 0,
        requirements: [
          'Basic understanding of networking',
          'Programming experience helpful',
          'A computer with internet connection'
        ],
        learningOutcomes: [
          'Understand cloud computing concepts',
          'Work with major cloud platforms',
          'Deploy and manage cloud services',
          'Implement containerization with Docker',
          'Design scalable cloud architectures'
        ]
      },
      {
        title: 'Artificial Intelligence Fundamentals',
        description: 'Comprehensive AI course covering machine learning, deep learning, neural networks, natural language processing, and AI applications.',
        shortDescription: 'Learn AI concepts and build intelligent systems',
        instructor: {
          id: instructor._id,
          name: 'freeCodeCamp.org',
          email: 'noreply@freecodecamp.org'
        },
        category: 'Data Science',
        level: 'intermediate',
        duration: 1200, // 20 hours
        price: 129.99,
        thumbnail: '/ai.jpg',
        tags: ['AI', 'Machine Learning', 'Deep Learning', 'Neural Networks', 'NLP'],
        isPublished: true,
        enrollmentCount: 0,
        requirements: [
          'Python programming knowledge',
          'Basic mathematics and statistics',
          'A computer with internet connection'
        ],
        learningOutcomes: [
          'Understand AI and machine learning concepts',
          'Build and train neural networks',
          'Implement various ML algorithms',
          'Work with natural language processing',
          'Create AI-powered applications'
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
      },
      // Python for Beginners Videos
      {
        courseId: courses.find(c => c.title.includes('Python for Beginners'))?._id,
        videos: [
          { title: 'Python for Beginners - Full Course', description: 'Complete beginner lesson covering Python basics from scratch', duration: 5400, order: 1, isPreview: true }
        ]
      },
      // Java Course Videos
      {
        courseId: courses.find(c => c.title.includes('Java Programming'))?._id,
        videos: [
          { title: 'Introduction to Java', description: 'What is Java and why learn it?', duration: 900, order: 1, isPreview: true },
          { title: 'Java Environment Setup', description: 'Install JDK and set up development environment', duration: 1200, order: 2 },
          { title: 'Java Syntax and Variables', description: 'Learn Java syntax, data types, and variables', duration: 1500, order: 3 },
          { title: 'Control Flow and Loops', description: 'Master if-else, switch, and loop statements', duration: 1800, order: 4 },
          { title: 'Object-Oriented Programming', description: 'Classes, objects, inheritance, and polymorphism', duration: 2400, order: 5 },
          { title: 'Collections Framework', description: 'ArrayList, HashMap, and other collections', duration: 2100, order: 6 },
          { title: 'Exception Handling', description: 'Try-catch blocks and custom exceptions', duration: 1200, order: 7 },
          { title: 'Multithreading Basics', description: 'Creating and managing threads in Java', duration: 1800, order: 8 }
        ]
      },
      // C Programming Videos
      {
        courseId: courses.find(c => c.title.includes('C Programming Fundamentals'))?._id,
        videos: [
          { title: 'Introduction to C Programming', description: 'History and importance of C language', duration: 800, order: 1, isPreview: true },
          { title: 'C Environment Setup', description: 'Install compiler and set up development environment', duration: 1000, order: 2 },
          { title: 'Data Types and Variables', description: 'Understanding C data types and variable declaration', duration: 1200, order: 3 },
          { title: 'Operators and Expressions', description: 'Arithmetic, logical, and bitwise operators', duration: 1000, order: 4 },
          { title: 'Control Structures', description: 'If-else, loops, and switch statements', duration: 1500, order: 5 },
          { title: 'Functions in C', description: 'Creating and using functions', duration: 1800, order: 6 },
          { title: 'Arrays and Strings', description: 'Working with arrays and string manipulation', duration: 2000, order: 7 },
          { title: 'Pointers and Memory Management', description: 'Understanding pointers and dynamic memory allocation', duration: 2400, order: 8 },
          { title: 'Structures and Unions', description: 'Creating custom data types', duration: 1500, order: 9 }
        ]
      },
      // C++ Programming Videos
      {
        courseId: courses.find(c => c.title.includes('C++ Programming'))?._id,
        videos: [
          { title: 'C++ Introduction and Setup', description: 'Overview of C++ and development environment', duration: 900, order: 1, isPreview: true },
          { title: 'C++ Basics and Syntax', description: 'Variables, data types, and basic syntax', duration: 1200, order: 2 },
          { title: 'Object-Oriented Programming in C++', description: 'Classes, objects, and OOP principles', duration: 2100, order: 3 },
          { title: 'Inheritance and Polymorphism', description: 'Advanced OOP concepts', duration: 1800, order: 4 },
          { title: 'STL Containers', description: 'Vector, list, map, and other STL containers', duration: 2400, order: 5 },
          { title: 'STL Algorithms', description: 'Sorting, searching, and other algorithms', duration: 1800, order: 6 },
          { title: 'Templates and Generic Programming', description: 'Function and class templates', duration: 2100, order: 7 },
          { title: 'Smart Pointers and RAII', description: 'Modern C++ memory management', duration: 1500, order: 8 },
          { title: 'Lambda Expressions', description: 'Anonymous functions and functional programming', duration: 1200, order: 9 }
        ]
      },
      // HTML5 Course Videos
      {
        courseId: courses.find(c => c.title.includes('HTML5'))?._id,
        videos: [
          { title: 'HTML5 Introduction', description: 'What is HTML5 and its new features', duration: 600, order: 1, isPreview: true },
          { title: 'HTML5 Document Structure', description: 'Basic HTML5 document structure and semantic elements', duration: 900, order: 2 },
          { title: 'Text and Media Elements', description: 'Working with text, images, and multimedia', duration: 1200, order: 3 },
          { title: 'Forms and Input Types', description: 'Creating forms with new HTML5 input types', duration: 1500, order: 4 },
          { title: 'Canvas and SVG', description: 'Drawing graphics with Canvas and SVG', duration: 1800, order: 5 },
          { title: 'Audio and Video', description: 'Embedding audio and video content', duration: 1200, order: 6 },
          { title: 'Web Storage and APIs', description: 'Local storage and HTML5 APIs', duration: 1500, order: 7 }
        ]
      },
      // CSS3 Course Videos
      {
        courseId: courses.find(c => c.title.includes('CSS3'))?._id,
        videos: [
          { title: 'CSS3 Introduction', description: 'What is CSS3 and its new features', duration: 600, order: 1, isPreview: true },
          { title: 'Selectors and Specificity', description: 'CSS selectors and how specificity works', duration: 900, order: 2 },
          { title: 'Box Model and Layout', description: 'Understanding the CSS box model', duration: 1200, order: 3 },
          { title: 'Flexbox Layout', description: 'Creating flexible layouts with Flexbox', duration: 1800, order: 4 },
          { title: 'CSS Grid Layout', description: 'Building complex layouts with CSS Grid', duration: 2100, order: 5 },
          { title: 'Responsive Design', description: 'Making websites work on all devices', duration: 1500, order: 6 },
          { title: 'Animations and Transitions', description: 'Adding motion and interactivity', duration: 1800, order: 7 },
          { title: 'CSS Variables and Custom Properties', description: 'Using CSS custom properties', duration: 900, order: 8 }
        ]
      },
      // Computer Networks Videos
      {
        courseId: courses.find(c => c.title.includes('Computer Networks'))?._id,
        videos: [
          { title: 'Introduction to Computer Networks', description: 'What are computer networks and why they matter', duration: 900, order: 1, isPreview: true },
          { title: 'Network Models and Protocols', description: 'OSI model and TCP/IP protocol suite', duration: 1200, order: 2 },
          { title: 'Physical Layer and Data Link', description: 'Cables, switches, and Ethernet', duration: 1500, order: 3 },
          { title: 'Network Layer and IP', description: 'IP addressing and routing', duration: 1800, order: 4 },
          { title: 'Transport Layer', description: 'TCP and UDP protocols', duration: 1500, order: 5 },
          { title: 'Application Layer Protocols', description: 'HTTP, HTTPS, DNS, and email protocols', duration: 1800, order: 6 },
          { title: 'Network Security', description: 'Firewalls, VPNs, and security threats', duration: 2100, order: 7 },
          { title: 'Wireless Networks', description: 'Wi-Fi, Bluetooth, and mobile networks', duration: 1200, order: 8 }
        ]
      },
      // Software Engineering Videos
      {
        courseId: courses.find(c => c.title.includes('Software Engineering'))?._id,
        videos: [
          { title: 'Software Engineering Introduction', description: 'What is software engineering and its importance', duration: 900, order: 1, isPreview: true },
          { title: 'Software Development Lifecycle', description: 'SDLC models and methodologies', duration: 1200, order: 2 },
          { title: 'Requirements Engineering', description: 'Gathering and analyzing requirements', duration: 1500, order: 3 },
          { title: 'System Design and Architecture', description: 'Designing software systems and architectures', duration: 1800, order: 4 },
          { title: 'Design Patterns', description: 'Common design patterns and their applications', duration: 2100, order: 5 },
          { title: 'Software Testing', description: 'Testing strategies and techniques', duration: 1800, order: 6 },
          { title: 'Version Control and Collaboration', description: 'Git, GitHub, and team collaboration', duration: 1500, order: 7 },
          { title: 'Project Management', description: 'Agile, Scrum, and project planning', duration: 1800, order: 8 },
          { title: 'Software Maintenance', description: 'Code maintenance and refactoring', duration: 1200, order: 9 }
        ]
      },
      // Cloud Computing Videos
      {
        courseId: courses.find(c => c.title.includes('Cloud Computing'))?._id,
        videos: [
          { title: 'Cloud Computing Introduction', description: 'What is cloud computing and its benefits', duration: 900, order: 1, isPreview: true },
          { title: 'Cloud Service Models', description: 'IaaS, PaaS, and SaaS explained', duration: 1200, order: 2 },
          { title: 'AWS Fundamentals', description: 'Amazon Web Services overview and core services', duration: 1800, order: 3 },
          { title: 'Microsoft Azure', description: 'Azure services and deployment options', duration: 1500, order: 4 },
          { title: 'Google Cloud Platform', description: 'GCP services and features', duration: 1500, order: 5 },
          { title: 'Virtualization and Containers', description: 'VMs, Docker, and containerization', duration: 2100, order: 6 },
          { title: 'Kubernetes Orchestration', description: 'Container orchestration with Kubernetes', duration: 1800, order: 7 },
          { title: 'Cloud Security', description: 'Security best practices in the cloud', duration: 1500, order: 8 },
          { title: 'Cloud Architecture Patterns', description: 'Designing scalable cloud architectures', duration: 1800, order: 9 }
        ]
      },
      // Artificial Intelligence Videos
      {
        courseId: courses.find(c => c.title.includes('Artificial Intelligence'))?._id,
        videos: [
          { title: 'AI Introduction and History', description: 'What is AI and its evolution', duration: 900, order: 1, isPreview: true, videoUrl: 'https://youtu.be/mEsleV16qdo?si=60oLx8yzDxcyPj35', thumbnail: 'https://img.youtube.com/vi/mEsleV16qdo/maxresdefault.jpg' },
          { title: 'Machine Learning Fundamentals', description: 'Supervised, unsupervised, and reinforcement learning', duration: 1500, order: 2 },
          { title: 'Data Preprocessing', description: 'Cleaning and preparing data for ML', duration: 1200, order: 3 },
          { title: 'Linear Regression and Classification', description: 'Basic ML algorithms', duration: 1800, order: 4 },
          { title: 'Neural Networks', description: 'Introduction to artificial neural networks', duration: 2100, order: 5 },
          { title: 'Deep Learning', description: 'Deep neural networks and frameworks', duration: 2400, order: 6 },
          { title: 'Natural Language Processing', description: 'Text processing and language models', duration: 1800, order: 7 },
          { title: 'Computer Vision', description: 'Image recognition and processing', duration: 2100, order: 8 },
          { title: 'AI Ethics and Future', description: 'Ethical considerations and future of AI', duration: 1200, order: 9 }
        ]
      }
    ];

    // Create videos
    for (const courseVideos of videosData) {
      for (const [videoIndex, videoData] of courseVideos.videos.entries()) {
        // Find the course to get its title for special handling
        const course = courses.find(c => c._id.equals(courseVideos.courseId));
        const courseTitle = course ? course.title : '';
        
        // Use specific YouTube URL for Python for Beginners course
        const isPythonBeginners = courseTitle.includes('Python for Beginners');
        const isArtificialIntelligence = courseTitle.includes('Artificial Intelligence');
        const isCloudComputing = courseTitle.includes('Cloud Computing Essentials');
        const isSoftwareEngineering = courseTitle.includes('Software Engineering');
        const isComputerNetworks = courseTitle.includes('Computer Networks');
        const isCSS3 = courseTitle.includes('CSS3');
        const isHTML5 = courseTitle.includes('HTML5');
        const isCpp = courseTitle.includes('C++ Programming');
        const isCProg = courseTitle.includes('C Programming Fundamentals');
        const isJava = courseTitle.includes('Java Programming');
        const isPythonDS = courseTitle.includes('Python for Data Science');
        const isUIUX = courseTitle.includes('UI/UX Design Fundamentals');
        const isNodeExpress = courseTitle.includes('Node.js & Express');
        const isReactCourse = courseTitle.includes('Complete React Development Course');
        const isFirstVideo = videoIndex === 0;

        // Prefer specific URLs for known courses/videos
        // Respect per-video URL if provided, otherwise choose based on course
        const vd: any = videoData;
        const videoUrl = vd.videoUrl
          ? vd.videoUrl
          : isArtificialIntelligence
          ? 'https://youtu.be/mEsleV16qdo?si=60oLx8yzDxcyPj35'
          : isCloudComputing
          ? 'https://youtu.be/2LaAJq1lB1Q?si=g9T5klOUGrcbM3nr'
          : isSoftwareEngineering
          ? 'https://youtu.be/NlLM3sVF8wY?si=L3ey3BLEwtYbDSMw'
          : isComputerNetworks
          ? 'https://youtu.be/IPvYjXCsTg8?si=kmyg_gqR1ioR1kAg'
          : isCSS3
          ? 'https://youtu.be/ESnrn1kAD4E?si=hmYrq7QNoM_-Q5GZ'
          : isHTML5
          ? 'https://youtu.be/DPnqb74Smug?si=AG8TEn67yoeuolal'
          : isCpp
          ? 'https://youtu.be/e7sAf4SbS_g?si=Dm1eLEN0In7_ro7l'
          : isCProg
          ? 'https://youtu.be/irqbmMNs2Bo?si=K6EOM2-9tKKcuaR6'
          : isJava
          ? 'https://youtu.be/eIrMbAQSU34?si=iUeiJQfh_vA5iQ-v'
          : isPythonDS
          ? 'https://youtu.be/rZscdOTs3s0?si=lJnrQSLUCV7phT3T'
          : isUIUX
          ? 'https://youtu.be/MBblN98-5lg?si=Gsrg2xJNDBDlp5yi'
          : isNodeExpress
          ? 'https://youtu.be/PCcMF1xTQO0?si=kdCv6jBjq8NaH1ty'
          : isReactCourse
          ? 'https://youtu.be/bMknfKXIFA8?si=10VrAiGIcTeNkow0'
          : isPythonBeginners
          ? 'https://youtu.be/UrsmFxEIp5k?si=YXjiEuov3djVftHt'
            : 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

        const thumbnail = vd.thumbnail
          ? vd.thumbnail
          : isArtificialIntelligence
          ? 'https://img.youtube.com/vi/mEsleV16qdo/maxresdefault.jpg'
          : isCloudComputing
          ? 'https://img.youtube.com/vi/2LaAJq1lB1Q/maxresdefault.jpg'
          : isSoftwareEngineering
          ? 'https://img.youtube.com/vi/NlLM3sVF8wY/maxresdefault.jpg'
          : isComputerNetworks
          ? 'https://img.youtube.com/vi/IPvYjXCsTg8/maxresdefault.jpg'
          : isCSS3
          ? 'https://img.youtube.com/vi/ESnrn1kAD4E/maxresdefault.jpg'
          : isHTML5
          ? 'https://img.youtube.com/vi/DPnqb74Smug/maxresdefault.jpg'
          : isCpp
          ? 'https://img.youtube.com/vi/e7sAf4SbS_g/maxresdefault.jpg'
          : isCProg
          ? 'https://img.youtube.com/vi/irqbmMNs2Bo/maxresdefault.jpg'
          : isJava
          ? 'https://img.youtube.com/vi/eIrMbAQSU34/maxresdefault.jpg'
          : isPythonDS
          ? 'https://img.youtube.com/vi/rZscdOTs3s0/maxresdefault.jpg'
          : isUIUX
          ? 'https://img.youtube.com/vi/MBblN98-5lg/maxresdefault.jpg'
          : isNodeExpress
          ? 'https://img.youtube.com/vi/PCcMF1xTQO0/maxresdefault.jpg'
          : isReactCourse
          ? 'https://img.youtube.com/vi/bMknfKXIFA8/maxresdefault.jpg'
          : isPythonBeginners
          ? 'https://img.youtube.com/vi/UrsmFxEIp5k/maxresdefault.jpg'
            : 'https://via.placeholder.com/300x200/6b7280/ffffff?text=Video+Thumbnail';

        const video = new Video({
          ...videoData,
          courseId: courseVideos.courseId,
          videoUrl: videoUrl,
          thumbnail: thumbnail,
          resources: [
            {
              title: 'Lesson Notes',
              url: 'https://drive.google.com/drive/folders/1Ua8yyBZ8lnk4Vrwg-2jwigq0DwKxSSWY',
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

    // Create comprehensive quizzes for all courses
    const quizData = [
      // Complete React Development Course - 10 quizzes
      {
        courseId: courses.find(c => c.title.includes('Complete React Development Course'))?._id,
        title: 'React Fundamentals Quiz 1',
        description: 'Test your knowledge of React basics and components',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
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
            explanation: 'useState, useEffect, and useContext are built-in React hooks.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of React components?',
            options: [
              { id: 'a', text: 'To style web pages', isCorrect: false },
              { id: 'b', text: 'To create reusable UI pieces', isCorrect: true },
              { id: 'c', text: 'To handle database operations', isCorrect: false },
              { id: 'd', text: 'To manage server requests', isCorrect: false }
            ],
            correctAnswers: ['b'],
            explanation: 'React components are reusable pieces of UI that can be composed together.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'How do you pass data to a React component?',
            options: [
              { id: 'a', text: 'Using props', isCorrect: true },
              { id: 'b', text: 'Using variables', isCorrect: false },
              { id: 'c', text: 'Using imports', isCorrect: false },
              { id: 'd', text: 'Using exports', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Props are used to pass data from parent to child components.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the virtual DOM?',
            options: [
              { id: 'a', text: 'A real DOM element', isCorrect: false },
              { id: 'b', text: 'A JavaScript representation of the DOM', isCorrect: true },
              { id: 'c', text: 'A CSS framework', isCorrect: false },
              { id: 'd', text: 'A database table', isCorrect: false }
            ],
            correctAnswers: ['b'],
            explanation: 'Virtual DOM is a JavaScript representation of the real DOM for efficient updates.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'Which method is called after a component is rendered?',
            options: [
              { id: 'a', text: 'componentWillMount', isCorrect: false },
              { id: 'b', text: 'componentDidMount', isCorrect: true },
              { id: 'c', text: 'componentWillUnmount', isCorrect: false },
              { id: 'd', text: 'componentDidUpdate', isCorrect: false }
            ],
            correctAnswers: ['b'],
            explanation: 'componentDidMount is called after a component is rendered to the DOM.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of setState in React?',
            options: [
              { id: 'a', text: 'To create new components', isCorrect: false },
              { id: 'b', text: 'To update component state', isCorrect: true },
              { id: 'c', text: 'To delete components', isCorrect: false },
              { id: 'd', text: 'To import modules', isCorrect: false }
            ],
            correctAnswers: ['b'],
            explanation: 'setState is used to update the state of a component and trigger re-rendering.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the correct way to handle events in React?',
            options: [
              { id: 'a', text: 'onClick={handleClick}', isCorrect: true },
              { id: 'b', text: 'onClick="handleClick"', isCorrect: false },
              { id: 'c', text: 'onClick=handleClick', isCorrect: false },
              { id: 'd', text: 'onClick={handleClick()}', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Event handlers in React are passed as function references, not function calls.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of keys in React lists?',
            options: [
              { id: 'a', text: 'To style list items', isCorrect: false },
              { id: 'b', text: 'To help React identify which items have changed', isCorrect: true },
              { id: 'c', text: 'To sort list items', isCorrect: false },
              { id: 'd', text: 'To filter list items', isCorrect: false }
            ],
            correctAnswers: ['b'],
            explanation: 'Keys help React identify which items have changed, been added, or removed.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the difference between props and state?',
            options: [
              { id: 'a', text: 'Props are read-only, state can be changed', isCorrect: true },
              { id: 'b', text: 'State is read-only, props can be changed', isCorrect: false },
              { id: 'c', text: 'There is no difference', isCorrect: false },
              { id: 'd', text: 'Props are for styling, state is for data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Props are read-only and passed from parent components, while state can be changed within the component.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // Python for Beginners - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('Python for Beginners'))?._id,
        title: 'Python Fundamentals Quiz 1',
        description: 'Test your knowledge of Python basics and syntax',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the correct way to print "Hello, World!" in Python?',
            options: [
              { id: 'a', text: 'print("Hello, World!")', isCorrect: true },
              { id: 'b', text: 'echo "Hello, World!"', isCorrect: false },
              { id: 'c', text: 'console.log("Hello, World!")', isCorrect: false },
              { id: 'd', text: 'System.out.println("Hello, World!")', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'The `print()` function is used to output text in Python.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'Which of the following is used to define a single-line comment in Python?',
            options: [
              { id: 'a', text: '//', isCorrect: false },
              { id: 'b', text: '/* ... */', isCorrect: false },
              { id: 'c', text: '#', isCorrect: true },
              { id: 'd', text: '<!-- ... -->', isCorrect: false }
            ],
            correctAnswers: ['c'],
            explanation: 'The hash symbol (#) is used for single-line comments in Python.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the data type of the result of `6 / 2` in Python 3?',
            options: [
              { id: 'a', text: 'Integer', isCorrect: false },
              { id: 'b', text: 'Float', isCorrect: true },
              { id: 'c', text: 'String', isCorrect: false },
              { id: 'd', text: 'Boolean', isCorrect: false }
            ],
            correctAnswers: ['b'],
            explanation: 'Standard division in Python 3 always results in a float.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'How do you create a variable with the numeric value 5?',
            options: [
              { id: 'a', text: 'let x = 5', isCorrect: false },
              { id: 'b', text: 'var x = 5', isCorrect: false },
              { id: 'c', text: 'int x = 5', isCorrect: false },
              { id: 'd', text: 'x = 5', isCorrect: true }
            ],
            correctAnswers: ['d'],
            explanation: 'In Python, variables are created by simply assigning a value to them.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'Which operator is used for exponentiation (e.g., 5 to the power of 2)?',
            options: [
              { id: 'a', text: '^', isCorrect: false },
              { id: 'b', text: '**', isCorrect: true },
              { id: 'c', text: '*', isCorrect: false },
              { id: 'd', text: 'pow()', isCorrect: false }
            ],
            correctAnswers: ['b'],
            explanation: 'The double asterisk (**) operator is used for exponentiation.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the correct way to create a function in Python?',
            options: [
              { id: 'a', text: 'function myFunction():', isCorrect: false },
              { id: 'b', text: 'def my_function():', isCorrect: true },
              { id: 'c', text: 'create myFunction():', isCorrect: false },
              { id: 'd', text: 'function = my_function():', isCorrect: false }
            ],
            correctAnswers: ['b'],
            explanation: 'Functions in Python are defined using the `def` keyword.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'How do you get the length of a list named `my_list`?',
            options: [
              { id: 'a', text: 'my_list.length()', isCorrect: false },
              { id: 'b', text: 'length(my_list)', isCorrect: false },
              { id: 'c', text: 'len(my_list)', isCorrect: true },
              { id: 'd', text: 'my_list.size()', isCorrect: false }
            ],
            correctAnswers: ['c'],
            explanation: 'The `len()` function returns the number of items in a list.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'Which of these is the correct way to start an `if` statement in Python?',
            options: [
              { id: 'a', text: 'if (x > y)', isCorrect: false },
              { id: 'b', text: 'if x > y then:', isCorrect: false },
              { id: 'c', text: 'if x > y:', isCorrect: true },
              { id: 'd', text: 'if x > y {}', isCorrect: false }
            ],
            correctAnswers: ['c'],
            explanation: 'Python `if` statements end with a colon (:).',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the output of `print("Python"[1])`?',
            options: [
              { id: 'a', text: 'P', isCorrect: false },
              { id: 'b', text: 'y', isCorrect: true },
              { id: 'c', text: 'py', isCorrect: false },
              { id: 'd', text: 'Error', isCorrect: false }
            ],
            correctAnswers: ['b'],
            explanation: 'String indexing in Python starts at 0. The character at index 1 is "y".',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'Which collection is ordered, changeable, and allows duplicate members?',
            options: [
              { id: 'a', text: 'Tuple', isCorrect: false },
              { id: 'b', text: 'Set', isCorrect: false },
              { id: 'c', text: 'Dictionary', isCorrect: false },
              { id: 'd', text: 'List', isCorrect: true }
            ],
            correctAnswers: ['d'],
            explanation: 'Lists are ordered, mutable (changeable), and allow duplicate elements.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // Java Programming Masterclass - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('Java Programming Masterclass'))?._id,
        title: 'Java Fundamentals Quiz 1',
        description: 'Test your knowledge of Java programming basics and OOP concepts',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the correct way to declare a variable in Java?',
            options: [
              { id: 'a', text: 'int x = 5;', isCorrect: true },
              { id: 'b', text: 'var x = 5;', isCorrect: false },
              { id: 'c', text: 'x = 5;', isCorrect: false },
              { id: 'd', text: 'int x; x = 5;', isCorrect: true }
            ],
            correctAnswers: ['a', 'd'],
            explanation: 'In Java, you must declare the data type before the variable name.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'Which keyword is used to create a class in Java?',
            options: [
              { id: 'a', text: 'class', isCorrect: true },
              { id: 'b', text: 'Class', isCorrect: false },
              { id: 'c', text: 'object', isCorrect: false },
              { id: 'd', text: 'struct', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'The keyword "class" is used to define a class in Java.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the main method signature in Java?',
            options: [
              { id: 'a', text: 'public static void main(String[] args)', isCorrect: true },
              { id: 'b', text: 'public void main(String[] args)', isCorrect: false },
              { id: 'c', text: 'static void main(String[] args)', isCorrect: false },
              { id: 'd', text: 'public static main(String[] args)', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'The main method must be public, static, void, and take String array as parameter.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'Which access modifier provides the most restrictive access?',
            options: [
              { id: 'a', text: 'public', isCorrect: false },
              { id: 'b', text: 'protected', isCorrect: false },
              { id: 'c', text: 'default (package-private)', isCorrect: false },
              { id: 'd', text: 'private', isCorrect: true }
            ],
            correctAnswers: ['d'],
            explanation: 'Private provides the most restrictive access, only within the same class.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is inheritance in Java?',
            options: [
              { id: 'a', text: 'Creating multiple objects', isCorrect: false },
              { id: 'b', text: 'A mechanism where one class acquires properties of another', isCorrect: true },
              { id: 'c', text: 'Hiding implementation details', isCorrect: false },
              { id: 'd', text: 'Creating interfaces', isCorrect: false }
            ],
            correctAnswers: ['b'],
            explanation: 'Inheritance allows a class to inherit properties and methods from another class.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'Which keyword is used for inheritance in Java?',
            options: [
              { id: 'a', text: 'extends', isCorrect: true },
              { id: 'b', text: 'implements', isCorrect: false },
              { id: 'c', text: 'inherits', isCorrect: false },
              { id: 'd', text: 'super', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'The "extends" keyword is used for class inheritance in Java.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is polymorphism in Java?',
            options: [
              { id: 'a', text: 'Multiple inheritance', isCorrect: false },
              { id: 'b', text: 'One interface, multiple implementations', isCorrect: true },
              { id: 'c', text: 'Data hiding', isCorrect: false },
              { id: 'd', text: 'Method overloading only', isCorrect: false }
            ],
            correctAnswers: ['b'],
            explanation: 'Polymorphism allows one interface to have multiple implementations.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the difference between == and .equals() in Java?',
            options: [
              { id: 'a', text: '== compares references, .equals() compares content', isCorrect: true },
              { id: 'b', text: '== compares content, .equals() compares references', isCorrect: false },
              { id: 'c', text: 'They are identical', isCorrect: false },
              { id: 'd', text: '== is for primitives, .equals() is for objects', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: '== compares object references, while .equals() compares the actual content.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is an interface in Java?',
            options: [
              { id: 'a', text: 'A class with all methods implemented', isCorrect: false },
              { id: 'b', text: 'A blueprint of a class with abstract methods', isCorrect: true },
              { id: 'c', text: 'A data structure', isCorrect: false },
              { id: 'd', text: 'A package', isCorrect: false }
            ],
            correctAnswers: ['b'],
            explanation: 'An interface is a blueprint of a class that contains abstract methods.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of the super keyword?',
            options: [
              { id: 'a', text: 'To call parent class methods and constructors', isCorrect: true },
              { id: 'b', text: 'To create new objects', isCorrect: false },
              { id: 'c', text: 'To implement interfaces', isCorrect: false },
              { id: 'd', text: 'To override methods', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'The super keyword is used to call parent class methods and constructors.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // C Programming Fundamentals - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('C Programming Fundamentals'))?._id,
        title: 'C Programming Fundamentals Quiz 1',
        description: 'Test your understanding of C programming basics and syntax',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the correct way to include a header file in C?',
            options: [
              { id: 'a', text: '#include <stdio.h>', isCorrect: true },
              { id: 'b', text: 'import stdio.h', isCorrect: false },
              { id: 'c', text: 'using stdio.h', isCorrect: false },
              { id: 'd', text: 'include "stdio.h"', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Header files are included using #include directive with angle brackets for system headers.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the main function signature in C?',
            options: [
              { id: 'a', text: 'int main()', isCorrect: true },
              { id: 'b', text: 'void main()', isCorrect: false },
              { id: 'c', text: 'main()', isCorrect: false },
              { id: 'd', text: 'int main(void)', isCorrect: true }
            ],
            correctAnswers: ['a', 'd'],
            explanation: 'The main function in C returns an int and can take void as parameter.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'Which data type is used to store whole numbers in C?',
            options: [
              { id: 'a', text: 'float', isCorrect: false },
              { id: 'b', text: 'int', isCorrect: true },
              { id: 'c', text: 'char', isCorrect: false },
              { id: 'd', text: 'double', isCorrect: false }
            ],
            correctAnswers: ['b'],
            explanation: 'The int data type is used to store whole numbers in C.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the size of an int in C?',
            options: [
              { id: 'a', text: '2 bytes', isCorrect: false },
              { id: 'b', text: '4 bytes', isCorrect: true },
              { id: 'c', text: '8 bytes', isCorrect: false },
              { id: 'd', text: 'Depends on the system', isCorrect: true }
            ],
            correctAnswers: ['b', 'd'],
            explanation: 'The size of int is typically 4 bytes, but it can vary depending on the system.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a pointer in C?',
            options: [
              { id: 'a', text: 'A variable that stores the address of another variable', isCorrect: true },
              { id: 'b', text: 'A function', isCorrect: false },
              { id: 'c', text: 'A data type', isCorrect: false },
              { id: 'd', text: 'A constant', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A pointer is a variable that stores the memory address of another variable.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the correct way to declare a pointer?',
            options: [
              { id: 'a', text: 'int *ptr;', isCorrect: true },
              { id: 'b', text: 'int ptr*;', isCorrect: false },
              { id: 'c', text: 'int * ptr;', isCorrect: true },
              { id: 'd', text: 'int* ptr;', isCorrect: true }
            ],
            correctAnswers: ['a', 'c', 'd'],
            explanation: 'All three syntaxes are valid for declaring a pointer in C.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of malloc() in C?',
            options: [
              { id: 'a', text: 'To free memory', isCorrect: false },
              { id: 'b', text: 'To allocate memory dynamically', isCorrect: true },
              { id: 'c', text: 'To copy strings', isCorrect: false },
              { id: 'd', text: 'To print output', isCorrect: false }
            ],
            correctAnswers: ['b'],
            explanation: 'malloc() is used to allocate memory dynamically at runtime.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the difference between ++i and i++?',
            options: [
              { id: 'a', text: '++i increments before use, i++ increments after use', isCorrect: true },
              { id: 'b', text: '++i increments after use, i++ increments before use', isCorrect: false },
              { id: 'c', text: 'They are identical', isCorrect: false },
              { id: 'd', text: '++i is faster than i++', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: '++i is pre-increment (increment then use), i++ is post-increment (use then increment).',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a structure in C?',
            options: [
              { id: 'a', text: 'A collection of variables of different types', isCorrect: true },
              { id: 'b', text: 'A function', isCorrect: false },
              { id: 'c', text: 'A pointer', isCorrect: false },
              { id: 'd', text: 'A loop', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A structure is a user-defined data type that groups variables of different types.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the correct way to access structure members?',
            options: [
              { id: 'a', text: 'structure.member', isCorrect: true },
              { id: 'b', text: 'structure->member', isCorrect: true },
              { id: 'c', text: 'structure[member]', isCorrect: false },
              { id: 'd', text: 'structure(member)', isCorrect: false }
            ],
            correctAnswers: ['a', 'b'],
            explanation: 'Use . for direct access and -> for pointer access to structure members.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // C++ Programming Complete Guide - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('C++ Programming Complete Guide'))?._id,
        title: 'C++ Programming Fundamentals Quiz 1',
        description: 'Test your understanding of C++ programming concepts',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is C++?',
            options: [
              { id: 'a', text: 'An object-oriented programming language', isCorrect: true },
              { id: 'b', text: 'A web framework', isCorrect: false },
              { id: 'c', text: 'A database system', isCorrect: false },
              { id: 'd', text: 'A markup language', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'C++ is an object-oriented programming language that extends C.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a class in C++?',
            options: [
              { id: 'a', text: 'A blueprint for creating objects', isCorrect: true },
              { id: 'b', text: 'A function', isCorrect: false },
              { id: 'c', text: 'A variable', isCorrect: false },
              { id: 'd', text: 'A loop', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A class is a blueprint for creating objects in C++.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is inheritance in C++?',
            options: [
              { id: 'a', text: 'A mechanism to create new classes from existing ones', isCorrect: true },
              { id: 'b', text: 'A way to create variables', isCorrect: false },
              { id: 'c', text: 'A way to create functions', isCorrect: false },
              { id: 'd', text: 'A way to create loops', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Inheritance allows creating new classes from existing ones.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is polymorphism in C++?',
            options: [
              { id: 'a', text: 'The ability to use the same interface for different types', isCorrect: true },
              { id: 'b', text: 'A way to create variables', isCorrect: false },
              { id: 'c', text: 'A way to create functions', isCorrect: false },
              { id: 'd', text: 'A way to create loops', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Polymorphism allows using the same interface for different types.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is encapsulation in C++?',
            options: [
              { id: 'a', text: 'Bundling data and methods together', isCorrect: true },
              { id: 'b', text: 'A way to create variables', isCorrect: false },
              { id: 'c', text: 'A way to create functions', isCorrect: false },
              { id: 'd', text: 'A way to create loops', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Encapsulation bundles data and methods together in a class.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a constructor in C++?',
            options: [
              { id: 'a', text: 'A special function that initializes objects', isCorrect: true },
              { id: 'b', text: 'A regular function', isCorrect: false },
              { id: 'c', text: 'A variable', isCorrect: false },
              { id: 'd', text: 'A loop', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A constructor is a special function that initializes objects.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a destructor in C++?',
            options: [
              { id: 'a', text: 'A special function that cleans up objects', isCorrect: true },
              { id: 'b', text: 'A regular function', isCorrect: false },
              { id: 'c', text: 'A variable', isCorrect: false },
              { id: 'd', text: 'A loop', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A destructor is a special function that cleans up objects.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a pointer in C++?',
            options: [
              { id: 'a', text: 'A variable that stores memory addresses', isCorrect: true },
              { id: 'b', text: 'A regular variable', isCorrect: false },
              { id: 'c', text: 'A function', isCorrect: false },
              { id: 'd', text: 'A loop', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A pointer is a variable that stores memory addresses.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is dynamic memory allocation in C++?',
            options: [
              { id: 'a', text: 'Allocating memory at runtime', isCorrect: true },
              { id: 'b', text: 'Allocating memory at compile time', isCorrect: false },
              { id: 'c', text: 'Creating variables', isCorrect: false },
              { id: 'd', text: 'Creating functions', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Dynamic memory allocation allocates memory at runtime.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the STL in C++?',
            options: [
              { id: 'a', text: 'Standard Template Library', isCorrect: true },
              { id: 'b', text: 'Standard Text Library', isCorrect: false },
              { id: 'c', text: 'Standard Type Library', isCorrect: false },
              { id: 'd', text: 'Standard Test Library', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'STL stands for Standard Template Library, providing containers and algorithms.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // Python for Data Science - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('Python for Data Science'))?._id,
        title: 'Python Data Science Fundamentals Quiz 1',
        description: 'Test your knowledge of Python for data science',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is NumPy?',
            options: [
              { id: 'a', text: 'A Python library for numerical computing', isCorrect: true },
              { id: 'b', text: 'A Python library for web development', isCorrect: false },
              { id: 'c', text: 'A Python library for databases', isCorrect: false },
              { id: 'd', text: 'A Python library for graphics', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'NumPy is a Python library for numerical computing and arrays.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Pandas?',
            options: [
              { id: 'a', text: 'A Python library for data manipulation and analysis', isCorrect: true },
              { id: 'b', text: 'A Python library for web development', isCorrect: false },
              { id: 'c', text: 'A Python library for databases', isCorrect: false },
              { id: 'd', text: 'A Python library for graphics', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Pandas is a Python library for data manipulation and analysis.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Matplotlib?',
            options: [
              { id: 'a', text: 'A Python library for plotting and visualization', isCorrect: true },
              { id: 'b', text: 'A Python library for web development', isCorrect: false },
              { id: 'c', text: 'A Python library for databases', isCorrect: false },
              { id: 'd', text: 'A Python library for numerical computing', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Matplotlib is a Python library for plotting and visualization.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a DataFrame in Pandas?',
            options: [
              { id: 'a', text: 'A two-dimensional data structure', isCorrect: true },
              { id: 'b', text: 'A one-dimensional data structure', isCorrect: false },
              { id: 'c', text: 'A three-dimensional data structure', isCorrect: false },
              { id: 'd', text: 'A four-dimensional data structure', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A DataFrame is a two-dimensional data structure in Pandas.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a Series in Pandas?',
            options: [
              { id: 'a', text: 'A one-dimensional data structure', isCorrect: true },
              { id: 'b', text: 'A two-dimensional data structure', isCorrect: false },
              { id: 'c', text: 'A three-dimensional data structure', isCorrect: false },
              { id: 'd', text: 'A four-dimensional data structure', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A Series is a one-dimensional data structure in Pandas.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Scikit-learn?',
            options: [
              { id: 'a', text: 'A Python library for machine learning', isCorrect: true },
              { id: 'b', text: 'A Python library for web development', isCorrect: false },
              { id: 'c', text: 'A Python library for databases', isCorrect: false },
              { id: 'd', text: 'A Python library for graphics', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Scikit-learn is a Python library for machine learning.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is data cleaning?',
            options: [
              { id: 'a', text: 'The process of preparing data for analysis', isCorrect: true },
              { id: 'b', text: 'The process of creating data', isCorrect: false },
              { id: 'c', text: 'The process of deleting data', isCorrect: false },
              { id: 'd', text: 'The process of copying data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Data cleaning is the process of preparing data for analysis.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is data visualization?',
            options: [
              { id: 'a', text: 'The graphical representation of data', isCorrect: true },
              { id: 'b', text: 'The textual representation of data', isCorrect: false },
              { id: 'c', text: 'The numerical representation of data', isCorrect: false },
              { id: 'd', text: 'The audio representation of data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Data visualization is the graphical representation of data.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is exploratory data analysis?',
            options: [
              { id: 'a', text: 'The process of exploring and understanding data', isCorrect: true },
              { id: 'b', text: 'The process of creating data', isCorrect: false },
              { id: 'c', text: 'The process of deleting data', isCorrect: false },
              { id: 'd', text: 'The process of copying data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'EDA is the process of exploring and understanding data.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Jupyter Notebook?',
            options: [
              { id: 'a', text: 'An interactive development environment for data science', isCorrect: true },
              { id: 'b', text: 'A Python library for web development', isCorrect: false },
              { id: 'c', text: 'A Python library for databases', isCorrect: false },
              { id: 'd', text: 'A Python library for graphics', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Jupyter Notebook is an interactive development environment for data science.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // UI/UX Design Fundamentals - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('UI/UX Design Fundamentals'))?._id,
        title: 'UI/UX Design Fundamentals Quiz 1',
        description: 'Test your knowledge of UI/UX design principles',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is UI design?',
            options: [
              { id: 'a', text: 'User Interface design', isCorrect: true },
              { id: 'b', text: 'User Integration design', isCorrect: false },
              { id: 'c', text: 'User Information design', isCorrect: false },
              { id: 'd', text: 'User Interaction design', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'UI design stands for User Interface design.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is UX design?',
            options: [
              { id: 'a', text: 'User Experience design', isCorrect: true },
              { id: 'b', text: 'User Extension design', isCorrect: false },
              { id: 'c', text: 'User Execution design', isCorrect: false },
              { id: 'd', text: 'User Expression design', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'UX design stands for User Experience design.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of wireframing?',
            options: [
              { id: 'a', text: 'To create a basic layout structure', isCorrect: true },
              { id: 'b', text: 'To add colors', isCorrect: false },
              { id: 'c', text: 'To add animations', isCorrect: false },
              { id: 'd', text: 'To add content', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Wireframing creates a basic layout structure for the design.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is prototyping?',
            options: [
              { id: 'a', text: 'Creating an interactive model of the design', isCorrect: true },
              { id: 'b', text: 'Creating a static image', isCorrect: false },
              { id: 'c', text: 'Creating a text document', isCorrect: false },
              { id: 'd', text: 'Creating a database', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Prototyping creates an interactive model of the design.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is usability testing?',
            options: [
              { id: 'a', text: 'Testing how easy a product is to use', isCorrect: true },
              { id: 'b', text: 'Testing the speed of a product', isCorrect: false },
              { id: 'c', text: 'Testing the security of a product', isCorrect: false },
              { id: 'd', text: 'Testing the cost of a product', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Usability testing evaluates how easy a product is to use.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is user research?',
            options: [
              { id: 'a', text: 'Understanding user needs and behaviors', isCorrect: true },
              { id: 'b', text: 'Creating user accounts', isCorrect: false },
              { id: 'c', text: 'Deleting user data', isCorrect: false },
              { id: 'd', text: 'Modifying user data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'User research involves understanding user needs and behaviors.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is information architecture?',
            options: [
              { id: 'a', text: 'Organizing and structuring information', isCorrect: true },
              { id: 'b', text: 'Creating information', isCorrect: false },
              { id: 'c', text: 'Deleting information', isCorrect: false },
              { id: 'd', text: 'Modifying information', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Information architecture involves organizing and structuring information.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is visual hierarchy?',
            options: [
              { id: 'a', text: 'The arrangement of elements to show importance', isCorrect: true },
              { id: 'b', text: 'The arrangement of colors', isCorrect: false },
              { id: 'c', text: 'The arrangement of fonts', isCorrect: false },
              { id: 'd', text: 'The arrangement of images', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Visual hierarchy arranges elements to show their importance.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is accessibility in design?',
            options: [
              { id: 'a', text: 'Making designs usable by people with disabilities', isCorrect: true },
              { id: 'b', text: 'Making designs faster', isCorrect: false },
              { id: 'c', text: 'Making designs cheaper', isCorrect: false },
              { id: 'd', text: 'Making designs smaller', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Accessibility makes designs usable by people with disabilities.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is responsive design?',
            options: [
              { id: 'a', text: 'Design that adapts to different screen sizes', isCorrect: true },
              { id: 'b', text: 'Design that responds to user input', isCorrect: false },
              { id: 'c', text: 'Design that responds to time', isCorrect: false },
              { id: 'd', text: 'Design that responds to location', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Responsive design adapts to different screen sizes and devices.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // Node.js & Express Masterclass - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('Node.js & Express Masterclass'))?._id,
        title: 'Node.js & Express Fundamentals Quiz 1',
        description: 'Test your knowledge of Node.js and Express.js',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Node.js?',
            options: [
              { id: 'a', text: 'A JavaScript runtime built on Chrome\'s V8 engine', isCorrect: true },
              { id: 'b', text: 'A JavaScript library', isCorrect: false },
              { id: 'c', text: 'A JavaScript framework', isCorrect: false },
              { id: 'd', text: 'A JavaScript database', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Express.js?',
            options: [
              { id: 'a', text: 'A web application framework for Node.js', isCorrect: true },
              { id: 'b', text: 'A JavaScript library', isCorrect: false },
              { id: 'c', text: 'A JavaScript database', isCorrect: false },
              { id: 'd', text: 'A JavaScript compiler', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Express.js is a web application framework for Node.js.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is NPM?',
            options: [
              { id: 'a', text: 'Node Package Manager', isCorrect: true },
              { id: 'b', text: 'Node Program Manager', isCorrect: false },
              { id: 'c', text: 'Node Project Manager', isCorrect: false },
              { id: 'd', text: 'Node Process Manager', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'NPM stands for Node Package Manager.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is middleware in Express.js?',
            options: [
              { id: 'a', text: 'Functions that execute during the request-response cycle', isCorrect: true },
              { id: 'b', text: 'Functions that execute before the request', isCorrect: false },
              { id: 'c', text: 'Functions that execute after the response', isCorrect: false },
              { id: 'd', text: 'Functions that execute independently', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Middleware functions execute during the request-response cycle.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a route in Express.js?',
            options: [
              { id: 'a', text: 'A path and HTTP method combination', isCorrect: true },
              { id: 'b', text: 'A path only', isCorrect: false },
              { id: 'c', text: 'An HTTP method only', isCorrect: false },
              { id: 'd', text: 'A function only', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A route is a combination of a path and HTTP method.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of package.json?',
            options: [
              { id: 'a', text: 'To define project metadata and dependencies', isCorrect: true },
              { id: 'b', text: 'To define project structure', isCorrect: false },
              { id: 'c', text: 'To define project tests', isCorrect: false },
              { id: 'd', text: 'To define project documentation', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'package.json defines project metadata and dependencies.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is asynchronous programming in Node.js?',
            options: [
              { id: 'a', text: 'Non-blocking I/O operations', isCorrect: true },
              { id: 'b', text: 'Blocking I/O operations', isCorrect: false },
              { id: 'c', text: 'Synchronous operations', isCorrect: false },
              { id: 'd', text: 'Sequential operations', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Asynchronous programming enables non-blocking I/O operations.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a callback function?',
            options: [
              { id: 'a', text: 'A function passed as an argument to another function', isCorrect: true },
              { id: 'b', text: 'A function that calls itself', isCorrect: false },
              { id: 'c', text: 'A function that returns a value', isCorrect: false },
              { id: 'd', text: 'A function that takes no arguments', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A callback function is passed as an argument to another function.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a Promise in JavaScript?',
            options: [
              { id: 'a', text: 'An object representing the eventual completion of an asynchronous operation', isCorrect: true },
              { id: 'b', text: 'A function that returns a value', isCorrect: false },
              { id: 'c', text: 'A variable that stores data', isCorrect: false },
              { id: 'd', text: 'A loop that repeats code', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A Promise represents the eventual completion of an asynchronous operation.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of environment variables?',
            options: [
              { id: 'a', text: 'To store configuration data outside the code', isCorrect: true },
              { id: 'b', text: 'To store user data', isCorrect: false },
              { id: 'c', text: 'To store application data', isCorrect: false },
              { id: 'd', text: 'To store database data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Environment variables store configuration data outside the code.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // Computer Networks Fundamentals - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('Computer Networks Fundamentals'))?._id,
        title: 'Computer Networks Fundamentals Quiz 1',
        description: 'Test your understanding of networking concepts and protocols',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'How many layers are in the OSI model?',
            options: [
              { id: 'a', text: '5', isCorrect: false },
              { id: 'b', text: '6', isCorrect: false },
              { id: 'c', text: '7', isCorrect: true },
              { id: 'd', text: '8', isCorrect: false }
            ],
            correctAnswers: ['c'],
            explanation: 'The OSI (Open Systems Interconnection) model has 7 layers.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is TCP?',
            options: [
              { id: 'a', text: 'Transmission Control Protocol', isCorrect: true },
              { id: 'b', text: 'Transfer Control Protocol', isCorrect: false },
              { id: 'c', text: 'Transmission Communication Protocol', isCorrect: false },
              { id: 'd', text: 'Transfer Communication Protocol', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'TCP stands for Transmission Control Protocol.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of IP addresses?',
            options: [
              { id: 'a', text: 'To identify devices on a network', isCorrect: true },
              { id: 'b', text: 'To encrypt data', isCorrect: false },
              { id: 'c', text: 'To compress files', isCorrect: false },
              { id: 'd', text: 'To create websites', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'IP addresses are used to identify devices on a network.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a router?',
            options: [
              { id: 'a', text: 'A device that forwards data packets between networks', isCorrect: true },
              { id: 'b', text: 'A device that connects to the internet', isCorrect: false },
              { id: 'c', text: 'A device that stores data', isCorrect: false },
              { id: 'd', text: 'A device that processes data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A router forwards data packets between networks.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the difference between TCP and UDP?',
            options: [
              { id: 'a', text: 'TCP is connection-oriented, UDP is connectionless', isCorrect: true },
              { id: 'b', text: 'TCP is faster than UDP', isCorrect: false },
              { id: 'c', text: 'UDP is more reliable than TCP', isCorrect: false },
              { id: 'd', text: 'They are identical', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'TCP is connection-oriented and reliable, UDP is connectionless and faster.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is DNS?',
            options: [
              { id: 'a', text: 'Domain Name System', isCorrect: true },
              { id: 'b', text: 'Data Network Service', isCorrect: false },
              { id: 'c', text: 'Digital Network System', isCorrect: false },
              { id: 'd', text: 'Dynamic Name Service', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'DNS stands for Domain Name System, which translates domain names to IP addresses.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is HTTP?',
            options: [
              { id: 'a', text: 'HyperText Transfer Protocol', isCorrect: true },
              { id: 'b', text: 'High Transfer Protocol', isCorrect: false },
              { id: 'c', text: 'HyperText Transport Protocol', isCorrect: false },
              { id: 'd', text: 'HyperText Transmission Protocol', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'HTTP stands for HyperText Transfer Protocol, used for web communication.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a switch?',
            options: [
              { id: 'a', text: 'A device that connects devices on the same network', isCorrect: true },
              { id: 'b', text: 'A device that connects to the internet', isCorrect: false },
              { id: 'c', text: 'A device that stores data', isCorrect: false },
              { id: 'd', text: 'A device that processes data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A switch connects devices on the same network and forwards data based on MAC addresses.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a firewall?',
            options: [
              { id: 'a', text: 'A security device that filters network traffic', isCorrect: true },
              { id: 'b', text: 'A device that connects networks', isCorrect: false },
              { id: 'c', text: 'A device that stores data', isCorrect: false },
              { id: 'd', text: 'A device that processes data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A firewall is a security device that filters and controls network traffic.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of MAC addresses?',
            options: [
              { id: 'a', text: 'To identify network interfaces at the data link layer', isCorrect: true },
              { id: 'b', text: 'To identify devices on the internet', isCorrect: false },
              { id: 'c', text: 'To encrypt data', isCorrect: false },
              { id: 'd', text: 'To compress files', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'MAC addresses identify network interfaces at the data link layer.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // Software Engineering Principles - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('Software Engineering Principles'))?._id,
        title: 'Software Engineering Fundamentals Quiz 1',
        description: 'Test your knowledge of software engineering concepts and practices',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What does SDLC stand for?',
            options: [
              { id: 'a', text: 'Software Development Life Cycle', isCorrect: true },
              { id: 'b', text: 'System Design Life Cycle', isCorrect: false },
              { id: 'c', text: 'Software Design Life Cycle', isCorrect: false },
              { id: 'd', text: 'System Development Life Cycle', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'SDLC stands for Software Development Life Cycle.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the Waterfall model?',
            options: [
              { id: 'a', text: 'A sequential software development approach', isCorrect: true },
              { id: 'b', text: 'An iterative development approach', isCorrect: false },
              { id: 'c', text: 'A testing methodology', isCorrect: false },
              { id: 'd', text: 'A design pattern', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'The Waterfall model is a sequential software development approach.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Agile methodology?',
            options: [
              { id: 'a', text: 'An iterative and incremental development approach', isCorrect: true },
              { id: 'b', text: 'A sequential development approach', isCorrect: false },
              { id: 'c', text: 'A testing methodology', isCorrect: false },
              { id: 'd', text: 'A design pattern', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Agile is an iterative and incremental development approach.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a design pattern?',
            options: [
              { id: 'a', text: 'A reusable solution to a common problem', isCorrect: true },
              { id: 'b', text: 'A programming language', isCorrect: false },
              { id: 'c', text: 'A testing framework', isCorrect: false },
              { id: 'd', text: 'A database schema', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A design pattern is a reusable solution to a common problem.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is version control?',
            options: [
              { id: 'a', text: 'A system for tracking changes to files', isCorrect: true },
              { id: 'b', text: 'A testing methodology', isCorrect: false },
              { id: 'c', text: 'A design pattern', isCorrect: false },
              { id: 'd', text: 'A programming language', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Version control is a system for tracking changes to files.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is unit testing?',
            options: [
              { id: 'a', text: 'Testing individual components in isolation', isCorrect: true },
              { id: 'b', text: 'Testing the entire system', isCorrect: false },
              { id: 'c', text: 'Testing user interfaces', isCorrect: false },
              { id: 'd', text: 'Testing databases', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Unit testing involves testing individual components in isolation.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is refactoring?',
            options: [
              { id: 'a', text: 'Improving code structure without changing functionality', isCorrect: true },
              { id: 'b', text: 'Adding new features', isCorrect: false },
              { id: 'c', text: 'Fixing bugs', isCorrect: false },
              { id: 'd', text: 'Writing documentation', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Refactoring is improving code structure without changing functionality.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of code reviews?',
            options: [
              { id: 'a', text: 'To improve code quality and catch bugs', isCorrect: true },
              { id: 'b', text: 'To add new features', isCorrect: false },
              { id: 'c', text: 'To deploy applications', isCorrect: false },
              { id: 'd', text: 'To write documentation', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Code reviews help improve code quality and catch bugs.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is continuous integration?',
            options: [
              { id: 'a', text: 'Automatically integrating code changes', isCorrect: true },
              { id: 'b', text: 'Manual code integration', isCorrect: false },
              { id: 'c', text: 'Testing only', isCorrect: false },
              { id: 'd', text: 'Deployment only', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Continuous integration automatically integrates code changes.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of documentation in software engineering?',
            options: [
              { id: 'a', text: 'To explain how the software works', isCorrect: true },
              { id: 'b', text: 'To add features', isCorrect: false },
              { id: 'c', text: 'To fix bugs', isCorrect: false },
              { id: 'd', text: 'To deploy applications', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Documentation explains how the software works and how to use it.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // Cloud Computing Essentials - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('Cloud Computing Essentials'))?._id,
        title: 'Cloud Computing Fundamentals Quiz 1',
        description: 'Test your understanding of cloud computing concepts and services',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What does IaaS stand for?',
            options: [
              { id: 'a', text: 'Infrastructure as a Service', isCorrect: true },
              { id: 'b', text: 'Internet as a Service', isCorrect: false },
              { id: 'c', text: 'Integration as a Service', isCorrect: false },
              { id: 'd', text: 'Information as a Service', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'IaaS stands for Infrastructure as a Service, one of the main cloud service models.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What does PaaS stand for?',
            options: [
              { id: 'a', text: 'Platform as a Service', isCorrect: true },
              { id: 'b', text: 'Programming as a Service', isCorrect: false },
              { id: 'c', text: 'Processing as a Service', isCorrect: false },
              { id: 'd', text: 'Protocol as a Service', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'PaaS stands for Platform as a Service, providing a platform for application development.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What does SaaS stand for?',
            options: [
              { id: 'a', text: 'Software as a Service', isCorrect: true },
              { id: 'b', text: 'System as a Service', isCorrect: false },
              { id: 'c', text: 'Storage as a Service', isCorrect: false },
              { id: 'd', text: 'Security as a Service', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'SaaS stands for Software as a Service, delivering software applications over the internet.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is cloud computing?',
            options: [
              { id: 'a', text: 'Delivery of computing services over the internet', isCorrect: true },
              { id: 'b', text: 'A type of computer', isCorrect: false },
              { id: 'c', text: 'A programming language', isCorrect: false },
              { id: 'd', text: 'A database system', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Cloud computing is the delivery of computing services over the internet.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What are the main benefits of cloud computing?',
            options: [
              { id: 'a', text: 'Cost savings, scalability, and flexibility', isCorrect: true },
              { id: 'b', text: 'Only cost savings', isCorrect: false },
              { id: 'c', text: 'Only scalability', isCorrect: false },
              { id: 'd', text: 'Only flexibility', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Cloud computing offers cost savings, scalability, and flexibility.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a public cloud?',
            options: [
              { id: 'a', text: 'Cloud services available to the general public', isCorrect: true },
              { id: 'b', text: 'Cloud services for government only', isCorrect: false },
              { id: 'c', text: 'Cloud services for businesses only', isCorrect: false },
              { id: 'd', text: 'Cloud services for individuals only', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A public cloud provides services available to the general public.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a private cloud?',
            options: [
              { id: 'a', text: 'Cloud services dedicated to a single organization', isCorrect: true },
              { id: 'b', text: 'Cloud services for individuals', isCorrect: false },
              { id: 'c', text: 'Cloud services for small businesses', isCorrect: false },
              { id: 'd', text: 'Cloud services for government', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A private cloud is dedicated to a single organization.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a hybrid cloud?',
            options: [
              { id: 'a', text: 'A combination of public and private clouds', isCorrect: true },
              { id: 'b', text: 'A type of public cloud', isCorrect: false },
              { id: 'c', text: 'A type of private cloud', isCorrect: false },
              { id: 'd', text: 'A new cloud model', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A hybrid cloud combines public and private cloud services.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is virtualization in cloud computing?',
            options: [
              { id: 'a', text: 'Creating virtual versions of physical resources', isCorrect: true },
              { id: 'b', text: 'Creating physical servers', isCorrect: false },
              { id: 'c', text: 'Creating databases', isCorrect: false },
              { id: 'd', text: 'Creating networks', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Virtualization creates virtual versions of physical resources.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is auto-scaling in cloud computing?',
            options: [
              { id: 'a', text: 'Automatically adjusting resources based on demand', isCorrect: true },
              { id: 'b', text: 'Manually adjusting resources', isCorrect: false },
              { id: 'c', text: 'Fixed resource allocation', isCorrect: false },
              { id: 'd', text: 'Random resource allocation', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Auto-scaling automatically adjusts resources based on demand.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // Artificial Intelligence Fundamentals - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('Artificial Intelligence Fundamentals'))?._id,
        title: 'AI Fundamentals Quiz 1',
        description: 'Test your knowledge of artificial intelligence and machine learning',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is machine learning?',
            options: [
              { id: 'a', text: 'A subset of artificial intelligence', isCorrect: true },
              { id: 'b', text: 'A programming language', isCorrect: false },
              { id: 'c', text: 'A database system', isCorrect: false },
              { id: 'd', text: 'A web framework', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Machine learning is a subset of artificial intelligence that focuses on algorithms that can learn from data.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is deep learning?',
            options: [
              { id: 'a', text: 'A subset of machine learning using neural networks', isCorrect: true },
              { id: 'b', text: 'A programming language', isCorrect: false },
              { id: 'c', text: 'A database system', isCorrect: false },
              { id: 'd', text: 'A web framework', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Deep learning is a subset of machine learning that uses neural networks with multiple layers.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a neural network?',
            options: [
              { id: 'a', text: 'A computing system inspired by biological neural networks', isCorrect: true },
              { id: 'b', text: 'A computer network', isCorrect: false },
              { id: 'c', text: 'A database system', isCorrect: false },
              { id: 'd', text: 'A web framework', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A neural network is a computing system inspired by biological neural networks.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is supervised learning?',
            options: [
              { id: 'a', text: 'Learning with labeled training data', isCorrect: true },
              { id: 'b', text: 'Learning without any data', isCorrect: false },
              { id: 'c', text: 'Learning with unlabeled data', isCorrect: false },
              { id: 'd', text: 'Learning with random data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Supervised learning uses labeled training data to learn patterns.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is unsupervised learning?',
            options: [
              { id: 'a', text: 'Learning with unlabeled data', isCorrect: true },
              { id: 'b', text: 'Learning with labeled data', isCorrect: false },
              { id: 'c', text: 'Learning without any data', isCorrect: false },
              { id: 'd', text: 'Learning with random data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Unsupervised learning finds patterns in unlabeled data.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is reinforcement learning?',
            options: [
              { id: 'a', text: 'Learning through interaction with an environment', isCorrect: true },
              { id: 'b', text: 'Learning with labeled data', isCorrect: false },
              { id: 'c', text: 'Learning with unlabeled data', isCorrect: false },
              { id: 'd', text: 'Learning without any data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Reinforcement learning learns through interaction with an environment and feedback.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is natural language processing?',
            options: [
              { id: 'a', text: 'AI field focused on human language', isCorrect: true },
              { id: 'b', text: 'A programming language', isCorrect: false },
              { id: 'c', text: 'A database system', isCorrect: false },
              { id: 'd', text: 'A web framework', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'NLP is the AI field focused on understanding and processing human language.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is computer vision?',
            options: [
              { id: 'a', text: 'AI field focused on visual information', isCorrect: true },
              { id: 'b', text: 'A programming language', isCorrect: false },
              { id: 'c', text: 'A database system', isCorrect: false },
              { id: 'd', text: 'A web framework', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Computer vision is the AI field focused on understanding visual information.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is overfitting in machine learning?',
            options: [
              { id: 'a', text: 'When a model performs well on training data but poorly on new data', isCorrect: true },
              { id: 'b', text: 'When a model performs poorly on training data', isCorrect: false },
              { id: 'c', text: 'When a model performs well on new data', isCorrect: false },
              { id: 'd', text: 'When a model is too simple', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Overfitting occurs when a model memorizes training data but fails to generalize.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of training data in machine learning?',
            options: [
              { id: 'a', text: 'To teach the model patterns and relationships', isCorrect: true },
              { id: 'b', text: 'To test the model', isCorrect: false },
              { id: 'c', text: 'To validate the model', isCorrect: false },
              { id: 'd', text: 'To deploy the model', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Training data is used to teach the model patterns and relationships.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // C++ Programming Complete Guide - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('C++ Programming Complete Guide'))?._id,
        title: 'C++ Programming Fundamentals Quiz 1',
        description: 'Test your understanding of C++ programming concepts',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is C++?',
            options: [
              { id: 'a', text: 'An object-oriented programming language', isCorrect: true },
              { id: 'b', text: 'A web framework', isCorrect: false },
              { id: 'c', text: 'A database system', isCorrect: false },
              { id: 'd', text: 'A markup language', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'C++ is an object-oriented programming language that extends C.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a class in C++?',
            options: [
              { id: 'a', text: 'A blueprint for creating objects', isCorrect: true },
              { id: 'b', text: 'A function', isCorrect: false },
              { id: 'c', text: 'A variable', isCorrect: false },
              { id: 'd', text: 'A loop', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A class is a blueprint for creating objects in C++.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is inheritance in C++?',
            options: [
              { id: 'a', text: 'A mechanism to create new classes from existing ones', isCorrect: true },
              { id: 'b', text: 'A way to create variables', isCorrect: false },
              { id: 'c', text: 'A way to create functions', isCorrect: false },
              { id: 'd', text: 'A way to create loops', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Inheritance allows creating new classes from existing ones.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is polymorphism in C++?',
            options: [
              { id: 'a', text: 'The ability to use the same interface for different types', isCorrect: true },
              { id: 'b', text: 'A way to create variables', isCorrect: false },
              { id: 'c', text: 'A way to create functions', isCorrect: false },
              { id: 'd', text: 'A way to create loops', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Polymorphism allows using the same interface for different types.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is encapsulation in C++?',
            options: [
              { id: 'a', text: 'Bundling data and methods together', isCorrect: true },
              { id: 'b', text: 'A way to create variables', isCorrect: false },
              { id: 'c', text: 'A way to create functions', isCorrect: false },
              { id: 'd', text: 'A way to create loops', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Encapsulation bundles data and methods together in a class.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a constructor in C++?',
            options: [
              { id: 'a', text: 'A special function that initializes objects', isCorrect: true },
              { id: 'b', text: 'A regular function', isCorrect: false },
              { id: 'c', text: 'A variable', isCorrect: false },
              { id: 'd', text: 'A loop', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A constructor is a special function that initializes objects.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a destructor in C++?',
            options: [
              { id: 'a', text: 'A special function that cleans up objects', isCorrect: true },
              { id: 'b', text: 'A regular function', isCorrect: false },
              { id: 'c', text: 'A variable', isCorrect: false },
              { id: 'd', text: 'A loop', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A destructor is a special function that cleans up objects.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a pointer in C++?',
            options: [
              { id: 'a', text: 'A variable that stores memory addresses', isCorrect: true },
              { id: 'b', text: 'A regular variable', isCorrect: false },
              { id: 'c', text: 'A function', isCorrect: false },
              { id: 'd', text: 'A loop', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A pointer is a variable that stores memory addresses.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is dynamic memory allocation in C++?',
            options: [
              { id: 'a', text: 'Allocating memory at runtime', isCorrect: true },
              { id: 'b', text: 'Allocating memory at compile time', isCorrect: false },
              { id: 'c', text: 'Creating variables', isCorrect: false },
              { id: 'd', text: 'Creating functions', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Dynamic memory allocation allocates memory at runtime.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the STL in C++?',
            options: [
              { id: 'a', text: 'Standard Template Library', isCorrect: true },
              { id: 'b', text: 'Standard Text Library', isCorrect: false },
              { id: 'c', text: 'Standard Type Library', isCorrect: false },
              { id: 'd', text: 'Standard Test Library', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'STL stands for Standard Template Library, providing containers and algorithms.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // Python for Data Science - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('Python for Data Science'))?._id,
        title: 'Python Data Science Fundamentals Quiz 1',
        description: 'Test your knowledge of Python for data science',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is NumPy?',
            options: [
              { id: 'a', text: 'A Python library for numerical computing', isCorrect: true },
              { id: 'b', text: 'A Python library for web development', isCorrect: false },
              { id: 'c', text: 'A Python library for databases', isCorrect: false },
              { id: 'd', text: 'A Python library for graphics', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'NumPy is a Python library for numerical computing and arrays.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Pandas?',
            options: [
              { id: 'a', text: 'A Python library for data manipulation and analysis', isCorrect: true },
              { id: 'b', text: 'A Python library for web development', isCorrect: false },
              { id: 'c', text: 'A Python library for databases', isCorrect: false },
              { id: 'd', text: 'A Python library for graphics', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Pandas is a Python library for data manipulation and analysis.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Matplotlib?',
            options: [
              { id: 'a', text: 'A Python library for plotting and visualization', isCorrect: true },
              { id: 'b', text: 'A Python library for web development', isCorrect: false },
              { id: 'c', text: 'A Python library for databases', isCorrect: false },
              { id: 'd', text: 'A Python library for numerical computing', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Matplotlib is a Python library for plotting and visualization.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a DataFrame in Pandas?',
            options: [
              { id: 'a', text: 'A two-dimensional data structure', isCorrect: true },
              { id: 'b', text: 'A one-dimensional data structure', isCorrect: false },
              { id: 'c', text: 'A three-dimensional data structure', isCorrect: false },
              { id: 'd', text: 'A four-dimensional data structure', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A DataFrame is a two-dimensional data structure in Pandas.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a Series in Pandas?',
            options: [
              { id: 'a', text: 'A one-dimensional data structure', isCorrect: true },
              { id: 'b', text: 'A two-dimensional data structure', isCorrect: false },
              { id: 'c', text: 'A three-dimensional data structure', isCorrect: false },
              { id: 'd', text: 'A four-dimensional data structure', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A Series is a one-dimensional data structure in Pandas.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Scikit-learn?',
            options: [
              { id: 'a', text: 'A Python library for machine learning', isCorrect: true },
              { id: 'b', text: 'A Python library for web development', isCorrect: false },
              { id: 'c', text: 'A Python library for databases', isCorrect: false },
              { id: 'd', text: 'A Python library for graphics', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Scikit-learn is a Python library for machine learning.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is data cleaning?',
            options: [
              { id: 'a', text: 'The process of preparing data for analysis', isCorrect: true },
              { id: 'b', text: 'The process of creating data', isCorrect: false },
              { id: 'c', text: 'The process of deleting data', isCorrect: false },
              { id: 'd', text: 'The process of copying data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Data cleaning is the process of preparing data for analysis.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is data visualization?',
            options: [
              { id: 'a', text: 'The graphical representation of data', isCorrect: true },
              { id: 'b', text: 'The textual representation of data', isCorrect: false },
              { id: 'c', text: 'The numerical representation of data', isCorrect: false },
              { id: 'd', text: 'The audio representation of data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Data visualization is the graphical representation of data.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is exploratory data analysis?',
            options: [
              { id: 'a', text: 'The process of exploring and understanding data', isCorrect: true },
              { id: 'b', text: 'The process of creating data', isCorrect: false },
              { id: 'c', text: 'The process of deleting data', isCorrect: false },
              { id: 'd', text: 'The process of copying data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'EDA is the process of exploring and understanding data.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Jupyter Notebook?',
            options: [
              { id: 'a', text: 'An interactive development environment for data science', isCorrect: true },
              { id: 'b', text: 'A Python library for web development', isCorrect: false },
              { id: 'c', text: 'A Python library for databases', isCorrect: false },
              { id: 'd', text: 'A Python library for graphics', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Jupyter Notebook is an interactive development environment for data science.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // UI/UX Design Fundamentals - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('UI/UX Design Fundamentals'))?._id,
        title: 'UI/UX Design Fundamentals Quiz 1',
        description: 'Test your knowledge of UI/UX design principles',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is UI design?',
            options: [
              { id: 'a', text: 'User Interface design', isCorrect: true },
              { id: 'b', text: 'User Integration design', isCorrect: false },
              { id: 'c', text: 'User Information design', isCorrect: false },
              { id: 'd', text: 'User Interaction design', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'UI design stands for User Interface design.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is UX design?',
            options: [
              { id: 'a', text: 'User Experience design', isCorrect: true },
              { id: 'b', text: 'User Extension design', isCorrect: false },
              { id: 'c', text: 'User Execution design', isCorrect: false },
              { id: 'd', text: 'User Expression design', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'UX design stands for User Experience design.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of wireframing?',
            options: [
              { id: 'a', text: 'To create a basic layout structure', isCorrect: true },
              { id: 'b', text: 'To add colors', isCorrect: false },
              { id: 'c', text: 'To add animations', isCorrect: false },
              { id: 'd', text: 'To add content', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Wireframing creates a basic layout structure for the design.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is prototyping?',
            options: [
              { id: 'a', text: 'Creating an interactive model of the design', isCorrect: true },
              { id: 'b', text: 'Creating a static image', isCorrect: false },
              { id: 'c', text: 'Creating a text document', isCorrect: false },
              { id: 'd', text: 'Creating a database', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Prototyping creates an interactive model of the design.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is usability testing?',
            options: [
              { id: 'a', text: 'Testing how easy a product is to use', isCorrect: true },
              { id: 'b', text: 'Testing the speed of a product', isCorrect: false },
              { id: 'c', text: 'Testing the security of a product', isCorrect: false },
              { id: 'd', text: 'Testing the cost of a product', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Usability testing evaluates how easy a product is to use.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is user research?',
            options: [
              { id: 'a', text: 'Understanding user needs and behaviors', isCorrect: true },
              { id: 'b', text: 'Creating user accounts', isCorrect: false },
              { id: 'c', text: 'Deleting user data', isCorrect: false },
              { id: 'd', text: 'Modifying user data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'User research involves understanding user needs and behaviors.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is information architecture?',
            options: [
              { id: 'a', text: 'Organizing and structuring information', isCorrect: true },
              { id: 'b', text: 'Creating information', isCorrect: false },
              { id: 'c', text: 'Deleting information', isCorrect: false },
              { id: 'd', text: 'Modifying information', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Information architecture involves organizing and structuring information.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is visual hierarchy?',
            options: [
              { id: 'a', text: 'The arrangement of elements to show importance', isCorrect: true },
              { id: 'b', text: 'The arrangement of colors', isCorrect: false },
              { id: 'c', text: 'The arrangement of fonts', isCorrect: false },
              { id: 'd', text: 'The arrangement of images', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Visual hierarchy arranges elements to show their importance.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is accessibility in design?',
            options: [
              { id: 'a', text: 'Making designs usable by people with disabilities', isCorrect: true },
              { id: 'b', text: 'Making designs faster', isCorrect: false },
              { id: 'c', text: 'Making designs cheaper', isCorrect: false },
              { id: 'd', text: 'Making designs smaller', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Accessibility makes designs usable by people with disabilities.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is responsive design?',
            options: [
              { id: 'a', text: 'Design that adapts to different screen sizes', isCorrect: true },
              { id: 'b', text: 'Design that responds to user input', isCorrect: false },
              { id: 'c', text: 'Design that responds to time', isCorrect: false },
              { id: 'd', text: 'Design that responds to location', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Responsive design adapts to different screen sizes and devices.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // Node.js & Express Masterclass - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('Node.js & Express Masterclass'))?._id,
        title: 'Node.js & Express Fundamentals Quiz 1',
        description: 'Test your knowledge of Node.js and Express.js',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Node.js?',
            options: [
              { id: 'a', text: 'A JavaScript runtime built on Chrome\'s V8 engine', isCorrect: true },
              { id: 'b', text: 'A JavaScript library', isCorrect: false },
              { id: 'c', text: 'A JavaScript framework', isCorrect: false },
              { id: 'd', text: 'A JavaScript database', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Express.js?',
            options: [
              { id: 'a', text: 'A web application framework for Node.js', isCorrect: true },
              { id: 'b', text: 'A JavaScript library', isCorrect: false },
              { id: 'c', text: 'A JavaScript database', isCorrect: false },
              { id: 'd', text: 'A JavaScript compiler', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Express.js is a web application framework for Node.js.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is NPM?',
            options: [
              { id: 'a', text: 'Node Package Manager', isCorrect: true },
              { id: 'b', text: 'Node Program Manager', isCorrect: false },
              { id: 'c', text: 'Node Project Manager', isCorrect: false },
              { id: 'd', text: 'Node Process Manager', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'NPM stands for Node Package Manager.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is middleware in Express.js?',
            options: [
              { id: 'a', text: 'Functions that execute during the request-response cycle', isCorrect: true },
              { id: 'b', text: 'Functions that execute before the request', isCorrect: false },
              { id: 'c', text: 'Functions that execute after the response', isCorrect: false },
              { id: 'd', text: 'Functions that execute independently', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Middleware functions execute during the request-response cycle.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a route in Express.js?',
            options: [
              { id: 'a', text: 'A path and HTTP method combination', isCorrect: true },
              { id: 'b', text: 'A path only', isCorrect: false },
              { id: 'c', text: 'An HTTP method only', isCorrect: false },
              { id: 'd', text: 'A function only', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A route is a combination of a path and HTTP method.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of package.json?',
            options: [
              { id: 'a', text: 'To define project metadata and dependencies', isCorrect: true },
              { id: 'b', text: 'To define project structure', isCorrect: false },
              { id: 'c', text: 'To define project tests', isCorrect: false },
              { id: 'd', text: 'To define project documentation', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'package.json defines project metadata and dependencies.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is asynchronous programming in Node.js?',
            options: [
              { id: 'a', text: 'Non-blocking I/O operations', isCorrect: true },
              { id: 'b', text: 'Blocking I/O operations', isCorrect: false },
              { id: 'c', text: 'Synchronous operations', isCorrect: false },
              { id: 'd', text: 'Sequential operations', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Asynchronous programming enables non-blocking I/O operations.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a callback function?',
            options: [
              { id: 'a', text: 'A function passed as an argument to another function', isCorrect: true },
              { id: 'b', text: 'A function that calls itself', isCorrect: false },
              { id: 'c', text: 'A function that returns a value', isCorrect: false },
              { id: 'd', text: 'A function that takes no arguments', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A callback function is passed as an argument to another function.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a Promise in JavaScript?',
            options: [
              { id: 'a', text: 'An object representing the eventual completion of an asynchronous operation', isCorrect: true },
              { id: 'b', text: 'A function that returns a value', isCorrect: false },
              { id: 'c', text: 'A variable that stores data', isCorrect: false },
              { id: 'd', text: 'A loop that repeats code', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A Promise represents the eventual completion of an asynchronous operation.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of environment variables?',
            options: [
              { id: 'a', text: 'To store configuration data outside the code', isCorrect: true },
              { id: 'b', text: 'To store user data', isCorrect: false },
              { id: 'c', text: 'To store application data', isCorrect: false },
              { id: 'd', text: 'To store database data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Environment variables store configuration data outside the code.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // Computer Networks Fundamentals - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('Computer Networks Fundamentals'))?._id,
        title: 'Computer Networks Fundamentals Quiz 1',
        description: 'Test your understanding of networking concepts and protocols',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'How many layers are in the OSI model?',
            options: [
              { id: 'a', text: '5', isCorrect: false },
              { id: 'b', text: '6', isCorrect: false },
              { id: 'c', text: '7', isCorrect: true },
              { id: 'd', text: '8', isCorrect: false }
            ],
            correctAnswers: ['c'],
            explanation: 'The OSI (Open Systems Interconnection) model has 7 layers.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is TCP?',
            options: [
              { id: 'a', text: 'Transmission Control Protocol', isCorrect: true },
              { id: 'b', text: 'Transfer Control Protocol', isCorrect: false },
              { id: 'c', text: 'Transmission Communication Protocol', isCorrect: false },
              { id: 'd', text: 'Transfer Communication Protocol', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'TCP stands for Transmission Control Protocol.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of IP addresses?',
            options: [
              { id: 'a', text: 'To identify devices on a network', isCorrect: true },
              { id: 'b', text: 'To encrypt data', isCorrect: false },
              { id: 'c', text: 'To compress files', isCorrect: false },
              { id: 'd', text: 'To create websites', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'IP addresses are used to identify devices on a network.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a router?',
            options: [
              { id: 'a', text: 'A device that forwards data packets between networks', isCorrect: true },
              { id: 'b', text: 'A device that connects to the internet', isCorrect: false },
              { id: 'c', text: 'A device that stores data', isCorrect: false },
              { id: 'd', text: 'A device that processes data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A router forwards data packets between networks.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the difference between TCP and UDP?',
            options: [
              { id: 'a', text: 'TCP is connection-oriented, UDP is connectionless', isCorrect: true },
              { id: 'b', text: 'TCP is faster than UDP', isCorrect: false },
              { id: 'c', text: 'UDP is more reliable than TCP', isCorrect: false },
              { id: 'd', text: 'They are identical', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'TCP is connection-oriented and reliable, UDP is connectionless and faster.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is DNS?',
            options: [
              { id: 'a', text: 'Domain Name System', isCorrect: true },
              { id: 'b', text: 'Data Network Service', isCorrect: false },
              { id: 'c', text: 'Digital Network System', isCorrect: false },
              { id: 'd', text: 'Dynamic Name Service', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'DNS stands for Domain Name System, which translates domain names to IP addresses.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is HTTP?',
            options: [
              { id: 'a', text: 'HyperText Transfer Protocol', isCorrect: true },
              { id: 'b', text: 'High Transfer Protocol', isCorrect: false },
              { id: 'c', text: 'HyperText Transport Protocol', isCorrect: false },
              { id: 'd', text: 'HyperText Transmission Protocol', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'HTTP stands for HyperText Transfer Protocol, used for web communication.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a switch?',
            options: [
              { id: 'a', text: 'A device that connects devices on the same network', isCorrect: true },
              { id: 'b', text: 'A device that connects to the internet', isCorrect: false },
              { id: 'c', text: 'A device that stores data', isCorrect: false },
              { id: 'd', text: 'A device that processes data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A switch connects devices on the same network and forwards data based on MAC addresses.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a firewall?',
            options: [
              { id: 'a', text: 'A security device that filters network traffic', isCorrect: true },
              { id: 'b', text: 'A device that connects networks', isCorrect: false },
              { id: 'c', text: 'A device that stores data', isCorrect: false },
              { id: 'd', text: 'A device that processes data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A firewall is a security device that filters and controls network traffic.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of MAC addresses?',
            options: [
              { id: 'a', text: 'To identify network interfaces at the data link layer', isCorrect: true },
              { id: 'b', text: 'To identify devices on the internet', isCorrect: false },
              { id: 'c', text: 'To encrypt data', isCorrect: false },
              { id: 'd', text: 'To compress files', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'MAC addresses identify network interfaces at the data link layer.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // Software Engineering Principles - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('Software Engineering Principles'))?._id,
        title: 'Software Engineering Fundamentals Quiz 1',
        description: 'Test your knowledge of software engineering concepts and practices',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What does SDLC stand for?',
            options: [
              { id: 'a', text: 'Software Development Life Cycle', isCorrect: true },
              { id: 'b', text: 'System Design Life Cycle', isCorrect: false },
              { id: 'c', text: 'Software Design Life Cycle', isCorrect: false },
              { id: 'd', text: 'System Development Life Cycle', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'SDLC stands for Software Development Life Cycle.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the Waterfall model?',
            options: [
              { id: 'a', text: 'A sequential software development approach', isCorrect: true },
              { id: 'b', text: 'An iterative development approach', isCorrect: false },
              { id: 'c', text: 'A testing methodology', isCorrect: false },
              { id: 'd', text: 'A design pattern', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'The Waterfall model is a sequential software development approach.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Agile methodology?',
            options: [
              { id: 'a', text: 'An iterative and incremental development approach', isCorrect: true },
              { id: 'b', text: 'A sequential development approach', isCorrect: false },
              { id: 'c', text: 'A testing methodology', isCorrect: false },
              { id: 'd', text: 'A design pattern', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Agile is an iterative and incremental development approach.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a design pattern?',
            options: [
              { id: 'a', text: 'A reusable solution to a common problem', isCorrect: true },
              { id: 'b', text: 'A programming language', isCorrect: false },
              { id: 'c', text: 'A testing framework', isCorrect: false },
              { id: 'd', text: 'A database schema', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A design pattern is a reusable solution to a common problem.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is version control?',
            options: [
              { id: 'a', text: 'A system for tracking changes to files', isCorrect: true },
              { id: 'b', text: 'A testing methodology', isCorrect: false },
              { id: 'c', text: 'A design pattern', isCorrect: false },
              { id: 'd', text: 'A programming language', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Version control is a system for tracking changes to files.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is unit testing?',
            options: [
              { id: 'a', text: 'Testing individual components in isolation', isCorrect: true },
              { id: 'b', text: 'Testing the entire system', isCorrect: false },
              { id: 'c', text: 'Testing user interfaces', isCorrect: false },
              { id: 'd', text: 'Testing databases', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Unit testing involves testing individual components in isolation.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is refactoring?',
            options: [
              { id: 'a', text: 'Improving code structure without changing functionality', isCorrect: true },
              { id: 'b', text: 'Adding new features', isCorrect: false },
              { id: 'c', text: 'Fixing bugs', isCorrect: false },
              { id: 'd', text: 'Writing documentation', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Refactoring is improving code structure without changing functionality.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of code reviews?',
            options: [
              { id: 'a', text: 'To improve code quality and catch bugs', isCorrect: true },
              { id: 'b', text: 'To add new features', isCorrect: false },
              { id: 'c', text: 'To deploy applications', isCorrect: false },
              { id: 'd', text: 'To write documentation', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Code reviews help improve code quality and catch bugs.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is continuous integration?',
            options: [
              { id: 'a', text: 'Automatically integrating code changes', isCorrect: true },
              { id: 'b', text: 'Manual code integration', isCorrect: false },
              { id: 'c', text: 'Testing only', isCorrect: false },
              { id: 'd', text: 'Deployment only', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Continuous integration automatically integrates code changes.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of documentation in software engineering?',
            options: [
              { id: 'a', text: 'To explain how the software works', isCorrect: true },
              { id: 'b', text: 'To add features', isCorrect: false },
              { id: 'c', text: 'To fix bugs', isCorrect: false },
              { id: 'd', text: 'To deploy applications', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Documentation explains how the software works and how to use it.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // Cloud Computing Essentials - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('Cloud Computing Essentials'))?._id,
        title: 'Cloud Computing Fundamentals Quiz 1',
        description: 'Test your understanding of cloud computing concepts and services',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What does IaaS stand for?',
            options: [
              { id: 'a', text: 'Infrastructure as a Service', isCorrect: true },
              { id: 'b', text: 'Internet as a Service', isCorrect: false },
              { id: 'c', text: 'Integration as a Service', isCorrect: false },
              { id: 'd', text: 'Information as a Service', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'IaaS stands for Infrastructure as a Service, one of the main cloud service models.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What does PaaS stand for?',
            options: [
              { id: 'a', text: 'Platform as a Service', isCorrect: true },
              { id: 'b', text: 'Programming as a Service', isCorrect: false },
              { id: 'c', text: 'Processing as a Service', isCorrect: false },
              { id: 'd', text: 'Protocol as a Service', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'PaaS stands for Platform as a Service, providing a platform for application development.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What does SaaS stand for?',
            options: [
              { id: 'a', text: 'Software as a Service', isCorrect: true },
              { id: 'b', text: 'System as a Service', isCorrect: false },
              { id: 'c', text: 'Storage as a Service', isCorrect: false },
              { id: 'd', text: 'Security as a Service', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'SaaS stands for Software as a Service, delivering software applications over the internet.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is cloud computing?',
            options: [
              { id: 'a', text: 'Delivery of computing services over the internet', isCorrect: true },
              { id: 'b', text: 'A type of computer', isCorrect: false },
              { id: 'c', text: 'A programming language', isCorrect: false },
              { id: 'd', text: 'A database system', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Cloud computing is the delivery of computing services over the internet.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What are the main benefits of cloud computing?',
            options: [
              { id: 'a', text: 'Cost savings, scalability, and flexibility', isCorrect: true },
              { id: 'b', text: 'Only cost savings', isCorrect: false },
              { id: 'c', text: 'Only scalability', isCorrect: false },
              { id: 'd', text: 'Only flexibility', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Cloud computing offers cost savings, scalability, and flexibility.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a public cloud?',
            options: [
              { id: 'a', text: 'Cloud services available to the general public', isCorrect: true },
              { id: 'b', text: 'Cloud services for government only', isCorrect: false },
              { id: 'c', text: 'Cloud services for businesses only', isCorrect: false },
              { id: 'd', text: 'Cloud services for individuals only', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A public cloud provides services available to the general public.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a private cloud?',
            options: [
              { id: 'a', text: 'Cloud services dedicated to a single organization', isCorrect: true },
              { id: 'b', text: 'Cloud services for individuals', isCorrect: false },
              { id: 'c', text: 'Cloud services for small businesses', isCorrect: false },
              { id: 'd', text: 'Cloud services for government', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A private cloud is dedicated to a single organization.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a hybrid cloud?',
            options: [
              { id: 'a', text: 'A combination of public and private clouds', isCorrect: true },
              { id: 'b', text: 'A type of public cloud', isCorrect: false },
              { id: 'c', text: 'A type of private cloud', isCorrect: false },
              { id: 'd', text: 'A new cloud model', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A hybrid cloud combines public and private cloud services.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is virtualization in cloud computing?',
            options: [
              { id: 'a', text: 'Creating virtual versions of physical resources', isCorrect: true },
              { id: 'b', text: 'Creating physical servers', isCorrect: false },
              { id: 'c', text: 'Creating databases', isCorrect: false },
              { id: 'd', text: 'Creating networks', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Virtualization creates virtual versions of physical resources.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is auto-scaling in cloud computing?',
            options: [
              { id: 'a', text: 'Automatically adjusting resources based on demand', isCorrect: true },
              { id: 'b', text: 'Manually adjusting resources', isCorrect: false },
              { id: 'c', text: 'Fixed resource allocation', isCorrect: false },
              { id: 'd', text: 'Random resource allocation', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Auto-scaling automatically adjusts resources based on demand.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // Artificial Intelligence Fundamentals - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('Artificial Intelligence Fundamentals'))?._id,
        title: 'AI Fundamentals Quiz 1',
        description: 'Test your knowledge of artificial intelligence and machine learning',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is machine learning?',
            options: [
              { id: 'a', text: 'A subset of artificial intelligence', isCorrect: true },
              { id: 'b', text: 'A programming language', isCorrect: false },
              { id: 'c', text: 'A database system', isCorrect: false },
              { id: 'd', text: 'A web framework', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Machine learning is a subset of artificial intelligence that focuses on algorithms that can learn from data.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is deep learning?',
            options: [
              { id: 'a', text: 'A subset of machine learning using neural networks', isCorrect: true },
              { id: 'b', text: 'A programming language', isCorrect: false },
              { id: 'c', text: 'A database system', isCorrect: false },
              { id: 'd', text: 'A web framework', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Deep learning is a subset of machine learning that uses neural networks with multiple layers.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a neural network?',
            options: [
              { id: 'a', text: 'A computing system inspired by biological neural networks', isCorrect: true },
              { id: 'b', text: 'A computer network', isCorrect: false },
              { id: 'c', text: 'A database system', isCorrect: false },
              { id: 'd', text: 'A web framework', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A neural network is a computing system inspired by biological neural networks.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is supervised learning?',
            options: [
              { id: 'a', text: 'Learning with labeled training data', isCorrect: true },
              { id: 'b', text: 'Learning without any data', isCorrect: false },
              { id: 'c', text: 'Learning with unlabeled data', isCorrect: false },
              { id: 'd', text: 'Learning with random data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Supervised learning uses labeled training data to learn patterns.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is unsupervised learning?',
            options: [
              { id: 'a', text: 'Learning with unlabeled data', isCorrect: true },
              { id: 'b', text: 'Learning with labeled data', isCorrect: false },
              { id: 'c', text: 'Learning without any data', isCorrect: false },
              { id: 'd', text: 'Learning with random data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Unsupervised learning finds patterns in unlabeled data.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is reinforcement learning?',
            options: [
              { id: 'a', text: 'Learning through interaction with an environment', isCorrect: true },
              { id: 'b', text: 'Learning with labeled data', isCorrect: false },
              { id: 'c', text: 'Learning with unlabeled data', isCorrect: false },
              { id: 'd', text: 'Learning without any data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Reinforcement learning learns through interaction with an environment and feedback.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is natural language processing?',
            options: [
              { id: 'a', text: 'AI field focused on human language', isCorrect: true },
              { id: 'b', text: 'A programming language', isCorrect: false },
              { id: 'c', text: 'A database system', isCorrect: false },
              { id: 'd', text: 'A web framework', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'NLP is the AI field focused on understanding and processing human language.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is computer vision?',
            options: [
              { id: 'a', text: 'AI field focused on visual information', isCorrect: true },
              { id: 'b', text: 'A programming language', isCorrect: false },
              { id: 'c', text: 'A database system', isCorrect: false },
              { id: 'd', text: 'A web framework', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Computer vision is the AI field focused on understanding visual information.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is overfitting in machine learning?',
            options: [
              { id: 'a', text: 'When a model performs well on training data but poorly on new data', isCorrect: true },
              { id: 'b', text: 'When a model performs poorly on training data', isCorrect: false },
              { id: 'c', text: 'When a model performs well on new data', isCorrect: false },
              { id: 'd', text: 'When a model is too simple', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Overfitting occurs when a model memorizes training data but fails to generalize.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of training data in machine learning?',
            options: [
              { id: 'a', text: 'To teach the model patterns and relationships', isCorrect: true },
              { id: 'b', text: 'To test the model', isCorrect: false },
              { id: 'c', text: 'To validate the model', isCorrect: false },
              { id: 'd', text: 'To deploy the model', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Training data is used to teach the model patterns and relationships.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // C++ Programming Complete Guide - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('C++ Programming Complete Guide'))?._id,
        title: 'C++ Programming Fundamentals Quiz 1',
        description: 'Test your understanding of C++ programming concepts',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is C++?',
            options: [
              { id: 'a', text: 'An object-oriented programming language', isCorrect: true },
              { id: 'b', text: 'A web framework', isCorrect: false },
              { id: 'c', text: 'A database system', isCorrect: false },
              { id: 'd', text: 'A markup language', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'C++ is an object-oriented programming language that extends C.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a class in C++?',
            options: [
              { id: 'a', text: 'A blueprint for creating objects', isCorrect: true },
              { id: 'b', text: 'A function', isCorrect: false },
              { id: 'c', text: 'A variable', isCorrect: false },
              { id: 'd', text: 'A loop', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A class is a blueprint for creating objects in C++.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is inheritance in C++?',
            options: [
              { id: 'a', text: 'A mechanism to create new classes from existing ones', isCorrect: true },
              { id: 'b', text: 'A way to create variables', isCorrect: false },
              { id: 'c', text: 'A way to create functions', isCorrect: false },
              { id: 'd', text: 'A way to create loops', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Inheritance allows creating new classes from existing ones.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is polymorphism in C++?',
            options: [
              { id: 'a', text: 'The ability to use the same interface for different types', isCorrect: true },
              { id: 'b', text: 'A way to create variables', isCorrect: false },
              { id: 'c', text: 'A way to create functions', isCorrect: false },
              { id: 'd', text: 'A way to create loops', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Polymorphism allows using the same interface for different types.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is encapsulation in C++?',
            options: [
              { id: 'a', text: 'Bundling data and methods together', isCorrect: true },
              { id: 'b', text: 'A way to create variables', isCorrect: false },
              { id: 'c', text: 'A way to create functions', isCorrect: false },
              { id: 'd', text: 'A way to create loops', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Encapsulation bundles data and methods together in a class.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a constructor in C++?',
            options: [
              { id: 'a', text: 'A special function that initializes objects', isCorrect: true },
              { id: 'b', text: 'A regular function', isCorrect: false },
              { id: 'c', text: 'A variable', isCorrect: false },
              { id: 'd', text: 'A loop', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A constructor is a special function that initializes objects.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a destructor in C++?',
            options: [
              { id: 'a', text: 'A special function that cleans up objects', isCorrect: true },
              { id: 'b', text: 'A regular function', isCorrect: false },
              { id: 'c', text: 'A variable', isCorrect: false },
              { id: 'd', text: 'A loop', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A destructor is a special function that cleans up objects.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a pointer in C++?',
            options: [
              { id: 'a', text: 'A variable that stores memory addresses', isCorrect: true },
              { id: 'b', text: 'A regular variable', isCorrect: false },
              { id: 'c', text: 'A function', isCorrect: false },
              { id: 'd', text: 'A loop', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A pointer is a variable that stores memory addresses.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is dynamic memory allocation in C++?',
            options: [
              { id: 'a', text: 'Allocating memory at runtime', isCorrect: true },
              { id: 'b', text: 'Allocating memory at compile time', isCorrect: false },
              { id: 'c', text: 'Creating variables', isCorrect: false },
              { id: 'd', text: 'Creating functions', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Dynamic memory allocation allocates memory at runtime.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the STL in C++?',
            options: [
              { id: 'a', text: 'Standard Template Library', isCorrect: true },
              { id: 'b', text: 'Standard Text Library', isCorrect: false },
              { id: 'c', text: 'Standard Type Library', isCorrect: false },
              { id: 'd', text: 'Standard Test Library', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'STL stands for Standard Template Library, providing containers and algorithms.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // Python for Data Science - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('Python for Data Science'))?._id,
        title: 'Python Data Science Fundamentals Quiz 1',
        description: 'Test your knowledge of Python for data science',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is NumPy?',
            options: [
              { id: 'a', text: 'A Python library for numerical computing', isCorrect: true },
              { id: 'b', text: 'A Python library for web development', isCorrect: false },
              { id: 'c', text: 'A Python library for databases', isCorrect: false },
              { id: 'd', text: 'A Python library for graphics', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'NumPy is a Python library for numerical computing and arrays.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Pandas?',
            options: [
              { id: 'a', text: 'A Python library for data manipulation and analysis', isCorrect: true },
              { id: 'b', text: 'A Python library for web development', isCorrect: false },
              { id: 'c', text: 'A Python library for databases', isCorrect: false },
              { id: 'd', text: 'A Python library for graphics', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Pandas is a Python library for data manipulation and analysis.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Matplotlib?',
            options: [
              { id: 'a', text: 'A Python library for plotting and visualization', isCorrect: true },
              { id: 'b', text: 'A Python library for web development', isCorrect: false },
              { id: 'c', text: 'A Python library for databases', isCorrect: false },
              { id: 'd', text: 'A Python library for numerical computing', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Matplotlib is a Python library for plotting and visualization.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a DataFrame in Pandas?',
            options: [
              { id: 'a', text: 'A two-dimensional data structure', isCorrect: true },
              { id: 'b', text: 'A one-dimensional data structure', isCorrect: false },
              { id: 'c', text: 'A three-dimensional data structure', isCorrect: false },
              { id: 'd', text: 'A four-dimensional data structure', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A DataFrame is a two-dimensional data structure in Pandas.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a Series in Pandas?',
            options: [
              { id: 'a', text: 'A one-dimensional data structure', isCorrect: true },
              { id: 'b', text: 'A two-dimensional data structure', isCorrect: false },
              { id: 'c', text: 'A three-dimensional data structure', isCorrect: false },
              { id: 'd', text: 'A four-dimensional data structure', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A Series is a one-dimensional data structure in Pandas.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Scikit-learn?',
            options: [
              { id: 'a', text: 'A Python library for machine learning', isCorrect: true },
              { id: 'b', text: 'A Python library for web development', isCorrect: false },
              { id: 'c', text: 'A Python library for databases', isCorrect: false },
              { id: 'd', text: 'A Python library for graphics', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Scikit-learn is a Python library for machine learning.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is data cleaning?',
            options: [
              { id: 'a', text: 'The process of preparing data for analysis', isCorrect: true },
              { id: 'b', text: 'The process of creating data', isCorrect: false },
              { id: 'c', text: 'The process of deleting data', isCorrect: false },
              { id: 'd', text: 'The process of copying data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Data cleaning is the process of preparing data for analysis.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is data visualization?',
            options: [
              { id: 'a', text: 'The graphical representation of data', isCorrect: true },
              { id: 'b', text: 'The textual representation of data', isCorrect: false },
              { id: 'c', text: 'The numerical representation of data', isCorrect: false },
              { id: 'd', text: 'The audio representation of data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Data visualization is the graphical representation of data.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is exploratory data analysis?',
            options: [
              { id: 'a', text: 'The process of exploring and understanding data', isCorrect: true },
              { id: 'b', text: 'The process of creating data', isCorrect: false },
              { id: 'c', text: 'The process of deleting data', isCorrect: false },
              { id: 'd', text: 'The process of copying data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'EDA is the process of exploring and understanding data.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Jupyter Notebook?',
            options: [
              { id: 'a', text: 'An interactive development environment for data science', isCorrect: true },
              { id: 'b', text: 'A Python library for web development', isCorrect: false },
              { id: 'c', text: 'A Python library for databases', isCorrect: false },
              { id: 'd', text: 'A Python library for graphics', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Jupyter Notebook is an interactive development environment for data science.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // UI/UX Design Fundamentals - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('UI/UX Design Fundamentals'))?._id,
        title: 'UI/UX Design Fundamentals Quiz 1',
        description: 'Test your knowledge of UI/UX design principles',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is UI design?',
            options: [
              { id: 'a', text: 'User Interface design', isCorrect: true },
              { id: 'b', text: 'User Integration design', isCorrect: false },
              { id: 'c', text: 'User Information design', isCorrect: false },
              { id: 'd', text: 'User Interaction design', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'UI design stands for User Interface design.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is UX design?',
            options: [
              { id: 'a', text: 'User Experience design', isCorrect: true },
              { id: 'b', text: 'User Extension design', isCorrect: false },
              { id: 'c', text: 'User Execution design', isCorrect: false },
              { id: 'd', text: 'User Expression design', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'UX design stands for User Experience design.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of wireframing?',
            options: [
              { id: 'a', text: 'To create a basic layout structure', isCorrect: true },
              { id: 'b', text: 'To add colors', isCorrect: false },
              { id: 'c', text: 'To add animations', isCorrect: false },
              { id: 'd', text: 'To add content', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Wireframing creates a basic layout structure for the design.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is prototyping?',
            options: [
              { id: 'a', text: 'Creating an interactive model of the design', isCorrect: true },
              { id: 'b', text: 'Creating a static image', isCorrect: false },
              { id: 'c', text: 'Creating a text document', isCorrect: false },
              { id: 'd', text: 'Creating a database', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Prototyping creates an interactive model of the design.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is usability testing?',
            options: [
              { id: 'a', text: 'Testing how easy a product is to use', isCorrect: true },
              { id: 'b', text: 'Testing the speed of a product', isCorrect: false },
              { id: 'c', text: 'Testing the security of a product', isCorrect: false },
              { id: 'd', text: 'Testing the cost of a product', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Usability testing evaluates how easy a product is to use.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is user research?',
            options: [
              { id: 'a', text: 'Understanding user needs and behaviors', isCorrect: true },
              { id: 'b', text: 'Creating user accounts', isCorrect: false },
              { id: 'c', text: 'Deleting user data', isCorrect: false },
              { id: 'd', text: 'Modifying user data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'User research involves understanding user needs and behaviors.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is information architecture?',
            options: [
              { id: 'a', text: 'Organizing and structuring information', isCorrect: true },
              { id: 'b', text: 'Creating information', isCorrect: false },
              { id: 'c', text: 'Deleting information', isCorrect: false },
              { id: 'd', text: 'Modifying information', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Information architecture involves organizing and structuring information.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is visual hierarchy?',
            options: [
              { id: 'a', text: 'The arrangement of elements to show importance', isCorrect: true },
              { id: 'b', text: 'The arrangement of colors', isCorrect: false },
              { id: 'c', text: 'The arrangement of fonts', isCorrect: false },
              { id: 'd', text: 'The arrangement of images', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Visual hierarchy arranges elements to show their importance.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is accessibility in design?',
            options: [
              { id: 'a', text: 'Making designs usable by people with disabilities', isCorrect: true },
              { id: 'b', text: 'Making designs faster', isCorrect: false },
              { id: 'c', text: 'Making designs cheaper', isCorrect: false },
              { id: 'd', text: 'Making designs smaller', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Accessibility makes designs usable by people with disabilities.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is responsive design?',
            options: [
              { id: 'a', text: 'Design that adapts to different screen sizes', isCorrect: true },
              { id: 'b', text: 'Design that responds to user input', isCorrect: false },
              { id: 'c', text: 'Design that responds to time', isCorrect: false },
              { id: 'd', text: 'Design that responds to location', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Responsive design adapts to different screen sizes and devices.',
            points: 10,
            order: 10
          }
        ],
        order: 1,
        createdBy: instructor._id,
        isPublished: true
      },
      // Node.js & Express Masterclass - 3 quizzes
      {
        courseId: courses.find(c => c.title.includes('Node.js & Express Masterclass'))?._id,
        title: 'Node.js & Express Fundamentals Quiz 1',
        description: 'Test your knowledge of Node.js and Express.js',
        instructions: ['Answer all questions carefully', 'You have 20 minutes to complete', 'Passing score: 70%'],
        timeLimit: 20,
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Node.js?',
            options: [
              { id: 'a', text: 'A JavaScript runtime built on Chrome\'s V8 engine', isCorrect: true },
              { id: 'b', text: 'A JavaScript library', isCorrect: false },
              { id: 'c', text: 'A JavaScript framework', isCorrect: false },
              { id: 'd', text: 'A JavaScript database', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine.',
            points: 10,
            order: 1
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is Express.js?',
            options: [
              { id: 'a', text: 'A web application framework for Node.js', isCorrect: true },
              { id: 'b', text: 'A JavaScript library', isCorrect: false },
              { id: 'c', text: 'A JavaScript database', isCorrect: false },
              { id: 'd', text: 'A JavaScript compiler', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Express.js is a web application framework for Node.js.',
            points: 10,
            order: 2
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is NPM?',
            options: [
              { id: 'a', text: 'Node Package Manager', isCorrect: true },
              { id: 'b', text: 'Node Program Manager', isCorrect: false },
              { id: 'c', text: 'Node Project Manager', isCorrect: false },
              { id: 'd', text: 'Node Process Manager', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'NPM stands for Node Package Manager.',
            points: 10,
            order: 3
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is middleware in Express.js?',
            options: [
              { id: 'a', text: 'Functions that execute during the request-response cycle', isCorrect: true },
              { id: 'b', text: 'Functions that execute before the request', isCorrect: false },
              { id: 'c', text: 'Functions that execute after the response', isCorrect: false },
              { id: 'd', text: 'Functions that execute independently', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Middleware functions execute during the request-response cycle.',
            points: 10,
            order: 4
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a route in Express.js?',
            options: [
              { id: 'a', text: 'A path and HTTP method combination', isCorrect: true },
              { id: 'b', text: 'A path only', isCorrect: false },
              { id: 'c', text: 'An HTTP method only', isCorrect: false },
              { id: 'd', text: 'A function only', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A route is a combination of a path and HTTP method.',
            points: 10,
            order: 5
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of package.json?',
            options: [
              { id: 'a', text: 'To define project metadata and dependencies', isCorrect: true },
              { id: 'b', text: 'To define project structure', isCorrect: false },
              { id: 'c', text: 'To define project tests', isCorrect: false },
              { id: 'd', text: 'To define project documentation', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'package.json defines project metadata and dependencies.',
            points: 10,
            order: 6
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is asynchronous programming in Node.js?',
            options: [
              { id: 'a', text: 'Non-blocking I/O operations', isCorrect: true },
              { id: 'b', text: 'Blocking I/O operations', isCorrect: false },
              { id: 'c', text: 'Synchronous operations', isCorrect: false },
              { id: 'd', text: 'Sequential operations', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Asynchronous programming enables non-blocking I/O operations.',
            points: 10,
            order: 7
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a callback function?',
            options: [
              { id: 'a', text: 'A function passed as an argument to another function', isCorrect: true },
              { id: 'b', text: 'A function that calls itself', isCorrect: false },
              { id: 'c', text: 'A function that returns a value', isCorrect: false },
              { id: 'd', text: 'A function that takes no arguments', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A callback function is passed as an argument to another function.',
            points: 10,
            order: 8
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is a Promise in JavaScript?',
            options: [
              { id: 'a', text: 'An object representing the eventual completion of an asynchronous operation', isCorrect: true },
              { id: 'b', text: 'A function that returns a value', isCorrect: false },
              { id: 'c', text: 'A variable that stores data', isCorrect: false },
              { id: 'd', text: 'A loop that repeats code', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'A Promise represents the eventual completion of an asynchronous operation.',
            points: 10,
            order: 9
          },
          {
            id: new mongoose.Types.ObjectId().toString(),
            type: 'single_choice',
            question: 'What is the purpose of environment variables?',
            options: [
              { id: 'a', text: 'To store configuration data outside the code', isCorrect: true },
              { id: 'b', text: 'To store user data', isCorrect: false },
              { id: 'c', text: 'To store application data', isCorrect: false },
              { id: 'd', text: 'To store database data', isCorrect: false }
            ],
            correctAnswers: ['a'],
            explanation: 'Environment variables store configuration data outside the code.',
            points: 10,
            order: 10
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
    
    return {
      instructor: {
        email: 'instructor@learnhub.com',
        password: 'instructor123'
      },
      stats: {
        courses: courses.length,
        videos: videosData.reduce((total, course) => total + course.videos.length, 0),
        quizzes: quizData.length
      },
      courses: courses.map(course => ({
        id: course._id,
        title: course.title,
        price: course.price,
        level: course.level,
        isPublished: course.isPublished
      }))
    };
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};
