# LearnHub - Complete Learning Management System

A fully-featured learning management system with AI-powered assistance, comprehensive course management, video streaming, quiz system, and certificate generation. Built with modern web technologies and designed with Zara-inspired aesthetics.

## 🎨 Design Philosophy

LearnHub embraces a **Zara-inspired design language** featuring:
- **Minimalist aesthetic** with generous white space
- **Monochromatic color palette** (blacks, whites, and elegant grays)
- **Premium typography** with clean sans-serif fonts
- **Sophisticated interactions** with subtle animations
- **Mobile-first responsive design**

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for blazing-fast development and builds
- **Tailwind CSS** with custom Zara-inspired theme
- **React Router** for seamless navigation
- **Modern component architecture**

### Backend
- **Node.js** with Express.js framework
- **TypeScript** for enhanced developer experience
- **MongoDB** with Mongoose ODM
- **JWT** authentication system
- **OpenAI API** integration for AI chatbot
- **RESTful API design**
- **Certificate generation** with HTML templates
- **File upload** and management system

## 🚀 Current Status - FULLY COMPLETED ✅

### ✅ All Features Implemented and Working

#### ✅ Complete Authentication System
- [x] User registration and login with validation
- [x] JWT authentication with secure token handling
- [x] Password hashing with bcryptjs
- [x] Protected routes and authorization middleware
- [x] User profile management and completion tracking

#### ✅ Comprehensive Course Management
- [x] **14 Complete Courses** with full content
- [x] Course catalog with filtering and search
- [x] Course enrollment system
- [x] Video streaming with progress tracking
- [x] Interactive quiz system with automated grading
- [x] Certificate generation upon completion
- [x] Course completion tracking and analytics

#### ✅ Advanced Features
- [x] **AI-Powered Chatbot** with OpenAI integration
- [x] **Video Player** with YouTube and custom video support
- [x] **Quiz System** with multiple choice questions
- [x] **Certificate Generation** with HTML templates
- [x] **Progress Tracking** for courses and videos
- [x] **Responsive Design** with dark/light theme support
- [x] **Database Seeding** with comprehensive sample data

#### ✅ Technical Implementation
- [x] React + TypeScript + Vite frontend
- [x] Node.js + Express + TypeScript backend
- [x] MongoDB with Mongoose ODM
- [x] Tailwind CSS with custom Zara-inspired theme
- [x] JWT authentication system
- [x] File upload and certificate generation
- [x] RESTful API with comprehensive endpoints

## 📁 Project Structure

```
LearnHub/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CoursePage.tsx
│   │   │   ├── VideoPlayer.tsx
│   │   │   └── QuizPage.tsx
│   │   ├── components/       # Reusable components
│   │   │   ├── AppHeader.tsx
│   │   │   ├── Chatbot.tsx
│   │   │   ├── QuizTaking.tsx
│   │   │   └── ProfileCompletionModal.tsx
│   │   ├── contexts/         # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── utils/           # Utility functions
│   │   └── App.tsx          # Main app component
│   ├── tailwind.config.js   # Tailwind with Zara theme
│   └── package.json
│
├── backend/                  # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── courseController.ts
│   │   │   ├── videoController.ts
│   │   │   ├── quizController.ts
│   │   │   ├── chatbotController.ts
│   │   │   └── certificateController.ts
│   │   ├── models/          # MongoDB schemas
│   │   │   ├── User.ts
│   │   │   ├── Course.ts
│   │   │   ├── Video.ts
│   │   │   ├── Quiz.ts
│   │   │   └── Enrollment.ts
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── utils/           # Utility functions
│   │   ├── seed-data.ts     # Database seeding
│   │   └── index.ts         # Server entry point
│   ├── public/              # Static files and certificates
│   └── package.json
│
└── README.md                # This file
```

## 🎯 Key Features (IMPLEMENTED ✅)

### Learning Management
- **📚 Course Catalog**: 14 comprehensive courses with full content
- **🎥 Video Streaming**: High-quality video content with progress tracking
- **🧠 Interactive Quizzes**: Automated assessment and grading system
- **📊 Progress Analytics**: Detailed learning progress tracking
- **🏆 Certificate System**: Automated certificate generation upon completion
- **👤 User Management**: Student and instructor role-based access

### AI-Powered Assistance
- **🤖 Smart Chatbot**: 24/7 AI assistant powered by OpenAI
- **💬 Contextual Help**: Course-specific guidance and support
- **🎯 Personalized Recommendations**: AI-driven learning suggestions
- **⚡ Instant Q&A**: Real-time answers to learning questions

### User Experience
- **🎨 Elegant Design**: Zara-inspired sophisticated interface
- **📱 Responsive Layout**: Seamless experience across all devices
- **⚡ Fast Performance**: Optimized for speed and efficiency
- **🧭 Intuitive Navigation**: User-friendly interface design
- **🌙 Dark/Light Theme**: Theme switching with user preference
- **📈 Progress Tracking**: Visual progress indicators and completion status

### Technical Features
- **🔐 JWT Authentication**: Secure user authentication and authorization
- **📁 File Management**: Certificate generation and file upload system
- **🗄️ Database Seeding**: Comprehensive sample data with 14 courses
- **🔄 Real-time Updates**: Live progress tracking and status updates
- **📱 Mobile Responsive**: Optimized for all device sizes

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB 5+
- npm or yarn

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`

### Backend Setup
```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and Gemini API key

npm run dev
```
The backend will be available at `http://localhost:5000`

### Environment Variables
Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb://localhost:27017/learnhub
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your-openai-api-key-here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Database Seeding
To populate the database with sample data (14 courses, videos, and quizzes):
```bash
# Start the backend server first
cd backend
npm run dev

# In another terminal, seed the database
curl -X GET "http://localhost:5000/api/seed?force=true"
```

This will create:
- **14 Complete Courses** with full content
- **97 Videos** with progress tracking
- **24 Quizzes** with automated grading
- **Sample Instructor** account (instructor@learnhub.com / instructor123)

## 📚 Available Courses (14 Complete Courses)

### Free Courses
1. **Complete React Development Course** (Beginner)
2. **Python for Beginners** (Beginner) 
3. **HTML5 Complete Course** (Beginner)

### Premium Courses
4. **Node.js & Express Masterclass** ($49.99 - Intermediate)
5. **UI/UX Design Fundamentals** ($29.99 - Beginner)
6. **Python for Data Science** ($79.99 - Intermediate)
7. **Java Programming Masterclass** ($59.99 - Beginner)
8. **C Programming Fundamentals** ($39.99 - Beginner)
9. **C++ Programming Complete Guide** ($69.99 - Intermediate)
10. **CSS3 Styling Masterclass** ($29.99 - Beginner)
11. **Computer Networks Fundamentals** ($79.99 - Intermediate)
12. **Software Engineering Principles** ($89.99 - Intermediate)
13. **Cloud Computing Essentials** ($99.99 - Intermediate)
14. **Artificial Intelligence Fundamentals** ($129.99 - Intermediate)

Each course includes:
- **Multiple video lessons** with progress tracking
- **Interactive quizzes** with automated grading
- **Certificate generation** upon completion
- **Comprehensive content** from beginner to advanced levels

## 🎨 Design System

### Colors (Zara-inspired)
- **Black**: Primary text and accents (`#000000`)
- **Charcoal**: Secondary text (`#1a1a1a`)
- **Gray**: Subtle text (`#666666`)
- **Light Gray**: Borders and dividers (`#a3a3a3`)
- **Off White**: Subtle backgrounds (`#f8f8f8`)
- **White**: Main background (`#ffffff`)

### Typography
- **Primary Font**: Inter (sans-serif)
- **Accent Font**: Georgia (serif) for headings and branding
- **Letter Spacing**: Refined tracking for premium feel

### Components
- **Minimalist forms** with bottom-border inputs
- **Elegant buttons** with subtle hover effects
- **Clean navigation** with understated styling
- **Spacious layouts** with generous white space

## 📱 Pages Overview (IMPLEMENTED ✅)

### Landing Page
- ✅ Hero section with elegant typography
- ✅ Feature showcase with grid layout
- ✅ Statistics section with key metrics
- ✅ Call-to-action with premium styling

### Authentication Pages
- ✅ Clean, centered form design
- ✅ Minimal input styling with focus states
- ✅ Consistent branding and navigation
- ✅ User-friendly error handling

### Dashboard
- ✅ Personal learning overview
- ✅ Course progress visualization
- ✅ AI assistant integration
- ✅ Clean, organized information hierarchy

### Course Pages
- ✅ Course catalog with filtering
- ✅ Video player with progress tracking
- ✅ Interactive quiz system
- ✅ Certificate generation
- ✅ Progress analytics

## 🚀 Quick Start Guide

1. **Clone the repository**:
   ```bash
   git clone https://github.com/PriyadarshanLG/LevelUp.git
   cd LevelUp
   ```

2. **Start the backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Start the frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Seed the database**:
   ```bash
   curl -X GET "http://localhost:5000/api/seed?force=true"
   ```

5. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔮 Future Enhancements

- **Advanced Analytics**: Detailed learning insights and reports
- **Social Learning**: Discussion forums and peer interaction
- **Mobile Apps**: Native iOS and Android applications
- **Advanced AI**: Enhanced chatbot with course-specific training
- **Multi-language Support**: Internationalization capabilities
- **Advanced Testing**: Comprehensive test coverage

## 🤝 Contributing

This project follows a structured development approach:

1. **TypeScript First**: All code is written in TypeScript for better maintainability
2. **Design Consistency**: All UI follows the established Zara-inspired design system
3. **API-First**: Backend APIs are designed before frontend implementation
4. **Component-based**: Reusable React components for maintainability

## 📄 License

This project is licensed under the MIT License.

---

**LearnHub** - A complete, production-ready learning management system with AI-powered assistance, comprehensive course management, and elegant design.

**GitHub Repository**: [https://github.com/PriyadarshanLG/LevelUp.git](https://github.com/PriyadarshanLG/LevelUp.git)
