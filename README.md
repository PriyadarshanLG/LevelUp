# LearnHub - Modern Learning Management System

A sophisticated learning management system with AI-powered assistance, built with modern web technologies and designed with Zara-inspired aesthetics.

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
- **Google Gemini AI** integration
- **RESTful API design**

## 🚀 Current Status

### ✅ Phase 1: Project Foundation & Setup (COMPLETED)
- [x] React + TypeScript + Vite frontend setup
- [x] Tailwind CSS with Zara-inspired theme
- [x] React Router implementation
- [x] Node.js + Express + TypeScript backend
- [x] MongoDB connection setup
- [x] Essential dependencies installed
- [x] Google Gemini AI SDK integration
- [x] Environment configuration
- [x] Zara-inspired UI implementation

### 📋 Upcoming Phases

#### Phase 2: Landing Page & User Authentication (Weeks 2-3)
- [ ] Complete landing page with Zara aesthetics
- [ ] User registration and login API endpoints
- [ ] JWT authentication implementation
- [ ] Password hashing with bcryptjs
- [ ] Authorization middleware
- [ ] Frontend auth state management

#### Phase 3: Core Content & Chatbot Backend (Weeks 4-5)
- [ ] MongoDB schemas for Course, Video, Quiz, Enrollment
- [ ] CRUD APIs for course management
- [ ] Protected chatbot endpoint
- [ ] Gemini AI integration for chatbot responses
- [ ] Basic chatbot UI components

#### Phase 4: Video Tracking & Chatbot Integration (Weeks 6-8)
- [ ] Video player integration with react-player
- [ ] Progress tracking system
- [ ] Chatbot frontend-backend integration
- [ ] Course enrollment system
- [ ] Real-time progress updates

#### Phase 5: Quiz Implementation & Course Completion (Weeks 9-10)
- [ ] Interactive quiz system
- [ ] Automated grading system
- [ ] Course completion logic
- [ ] Certificate generation
- [ ] Final testing and deployment

## 📁 Project Structure

```
learning-website/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── components/       # Reusable components
│   │   ├── utils/           # Utility functions
│   │   └── App.tsx          # Main app component
│   ├── tailwind.config.js   # Tailwind with Zara theme
│   └── package.json
│
├── backend/                  # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── utils/           # Utility functions
│   │   └── index.ts         # Server entry point
│   ├── .env.example         # Environment variables template
│   └── package.json
│
└── README.md                # This file
```

## 🎯 Key Features (Planned)

### Learning Management
- **Course Catalog**: Browse and enroll in premium courses
- **Video Streaming**: High-quality video content with progress tracking
- **Interactive Quizzes**: Automated assessment and grading
- **Progress Analytics**: Detailed learning progress tracking
- **Certificate System**: Earn certificates upon course completion

### AI-Powered Assistance
- **Smart Chatbot**: 24/7 AI assistant powered by Google Gemini
- **Contextual Help**: Course-specific guidance and support
- **Personalized Recommendations**: AI-driven learning suggestions
- **Instant Q&A**: Real-time answers to learning questions

### User Experience
- **Elegant Design**: Zara-inspired sophisticated interface
- **Responsive Layout**: Seamless experience across all devices
- **Fast Performance**: Optimized for speed and efficiency
- **Intuitive Navigation**: User-friendly interface design

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
GEMINI_API_KEY=your-gemini-api-key-here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

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

## 📱 Pages Overview

### Landing Page
- Hero section with elegant typography
- Feature showcase with grid layout
- Statistics section with key metrics
- Call-to-action with premium styling

### Authentication Pages
- Clean, centered form design
- Minimal input styling with focus states
- Consistent branding and navigation
- User-friendly error handling

### Dashboard
- Personal learning overview
- Course progress visualization
- AI assistant integration
- Clean, organized information hierarchy

## 🔮 Future Enhancements

- **Advanced Analytics**: Detailed learning insights and reports
- **Social Learning**: Discussion forums and peer interaction
- **Mobile Apps**: Native iOS and Android applications
- **Advanced AI**: Enhanced chatbot with course-specific training
- **Multi-language Support**: Internationalization capabilities
- **Advanced Testing**: Comprehensive test coverage

## 🤝 Contributing

This project follows a structured development approach:

1. **Phase-based Development**: Features are implemented in organized phases
2. **TypeScript First**: All code is written in TypeScript for better maintainability
3. **Design Consistency**: All UI follows the established Zara-inspired design system
4. **API-First**: Backend APIs are designed before frontend implementation

## 📄 License

This project is licensed under the MIT License.

---

**LearnHub** - Elevating online learning through sophisticated design and intelligent assistance.
