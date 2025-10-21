import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Users, TrendingUp, Search, Plus, Sparkles, Target, Award, Zap, Moon, Sun, Star, Gift, Share2, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { courseAPI, APIError } from '../utils/api';
import type { Enrollment, Course } from '../utils/api';
// Chatbot is now mounted globally in App
import AIQuizModal from '../components/AIQuizModal'

type DailyProgress = {
  date: string;
  minutes: number;
  completed: boolean;
};

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const completedCourses = enrollments.filter(e => e.status === 'completed').length;

  // Check if profile is complete - more lenient check
  const isProfileComplete = user && (
    user.dateOfBirth &&
    user.phoneNumber &&
    user.country &&
    user.bio &&
    user.fieldOfInterest &&
    user.fieldOfInterest.length > 0
  );

  const [tasks] = useState([
    { id: 1, text: 'Complete your profile', completed: isProfileComplete, icon: Users, link: '/profile' },
    { id: 2, text: 'Finish 1 course', completed: completedCourses > 0, icon: BookOpen, link: '/courses' },
    { id: 3, text: 'Get a 7-day streak', completed: currentStreak >= 7, icon: TrendingUp, link: null },
    { id: 4, text: 'Refer a friend', completed: false, icon: Share2, link: '#refer' },
  ]);

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const tasksCompleted = completedTasks === totalTasks;

  const tips = [
    {
      icon: Zap,
      title: 'Use the Pomodoro Technique',
      description: 'Study in focused 25-minute intervals with short breaks in between to maximize productivity and avoid burnout.',
    },
    {
      icon: BookOpen,
      title: 'Active Recall',
      description: 'Actively test yourself on what you\'ve learned instead of passively re-reading. This strengthens memory retention.',
    },
    {
      icon: Users,
      title: 'Engage with the Community',
      description: 'Don\'t hesitate to ask questions in the course forums. Explaining concepts to others is also a great way to learn.',
    },
  ];

  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const nextTip = () => {
    setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.pushState(null, '', `#${targetId}`);
  };

  const { icon: TipIcon, title: tipTitle, description: tipDescription } = tips[currentTipIndex];

  useEffect(() => {
    loadEnrollments()
    const interval = setInterval(updateTodayProgress, 60000) // Update progress every minute
    return () => clearInterval(interval)
  }, [])

  // Load the last 7 days of progress
  const loadDailyProgress = (enrollmentsForCalc: Enrollment[] = enrollments) => {
    const activityDates = new Set<string>()
    enrollmentsForCalc.forEach(e => {
      if (e.lastAccessedAt) {
        const d = new Date(e.lastAccessedAt)
        const key = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
          .toISOString().split('T')[0]
        activityDates.add(key)
      }
    })

    // Mark today as active when the dashboard is loaded
    const today = new Date();
    const todayKey = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).toISOString().split('T')[0];
    activityDates.add(todayKey);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const key = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
        .toISOString().split('T')[0]
      const completed = activityDates.has(key)
      return {
        date: key,
        minutes: completed ? 30 : 0,
        completed
      }
    }).reverse()
    setDailyProgress(last7Days)

    // current streak (consecutive days up to today)
    let streak = 0
    for (let i = last7Days.length - 1; i >= 0; i--) {
      if (last7Days[i].completed) streak++
      else break
    }
    setCurrentStreak(streak)

    // best streak in window
    let best = 0
    let run = 0
    last7Days.forEach(d => {
      if (d.completed) {
        run += 1
        best = Math.max(best, run)
      } else {
        run = 0
      }
    })
    setBestStreak(best)
  }

  // Update today's progress
  const updateTodayProgress = () => {
    // This function now only updates daily progress data
    loadDailyProgress();
  };

  const loadEnrollments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await courseAPI.getUserEnrollments({ limit: 6 })
      
      if (response.success) {
        setEnrollments(response.data.enrollments)
        loadDailyProgress(response.data.enrollments)
      }
    } catch (error) {
      console.error('Failed to load enrollments:', error)
      setError(error instanceof APIError ? error.message : 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const handleUnenroll = async (courseId: string) => {
    try {
      setRemovingId(courseId)
      await courseAPI.unenrollCourse(courseId)
      await loadEnrollments()
    } catch (error) {
      console.error('Failed to unenroll:', error)
    } finally {
      setRemovingId(null)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const activeCourses = enrollments.filter(e => e.status === 'active').length
  const totalWatchTime = enrollments.reduce((total, enrollment) => {
    const course = enrollment.courseId as Course
    return total + (course.duration || 0) * (enrollment.progress.overallPercentage / 100)
  }, 0)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-float-gentle"></div>
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float-gentle" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float-gentle" style={{ animationDelay: '4s' }}></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-indigo-400/30 dark:bg-indigo-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      
      {/* Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-16 h-16 border border-indigo-200/30 dark:border-indigo-400/20 rounded-lg rotate-45 animate-spin-slow"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-purple-200/20 dark:bg-purple-400/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 left-20 w-8 h-8 border-2 border-pink-200/30 dark:border-pink-400/20 rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-20 right-32 w-20 h-20 border border-blue-200/30 dark:border-blue-400/20 rounded-lg rotate-12 animate-spin-slow" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Main Content Container */}
      <div className="relative z-10">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 group flex items-center transition-transform duration-300 transform hover:scale-105" style={{ gap: '5px' }}>
                <img 
                  src="/level up.png" 
                  alt="LevelUp Logo" 
                  className="h-16 sm:h-[70px] lg:h-[110px] w-auto object-contain transition-transform duration-300 group-hover:rotate-[20deg]"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.1))' }}
                />
                <h1 className="text-xl font-righteous font-semibold">
                  <span className="text-black">Level</span><span className="text-orange-500">Up</span>
                </h1>
              </Link>
              <nav className="ml-12 hidden md:flex space-x-8">
                <Link
                  to="/courses"
                  className="group relative px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <span className="transition-transform duration-200 group-hover:-translate-y-0.5 inline-block">Explore</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Link>
                <Link
                  to="#my-learning"
                  onClick={(e) => handleNavClick(e, 'my-learning')}
                  className="group relative px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <span className="transition-transform duration-200 group-hover:-translate-y-0.5 inline-block">My Learning</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Link>
                <Link
                  to="#learning-paths"
                  onClick={(e) => handleNavClick(e, 'learning-paths')}
                  className="group relative px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <span className="transition-transform duration-200 group-hover:-translate-y-0.5 inline-block">Learning Paths</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Link>
                <Link
                  to="#tasks"
                  onClick={(e) => handleNavClick(e, 'tasks')}
                  className="group relative px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 transform hover:-translate-y-0.5"
                  title="Go to Tasks"
                >
                  <span className="transition-transform duration-200 group-hover:-translate-y-0.5 inline-block">Tasks</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-6">
              <button
                onClick={() => setShowQuiz(true)}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-800 dark:text-gray-200 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md transition-all"
              >
                AI Quiz
              </button>
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="group relative p-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-600/30 dark:hover:border-indigo-400/30 hover:shadow-lg hover:shadow-indigo-600/10 dark:hover:shadow-indigo-400/10 transition-all duration-200"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <span className="relative z-10 flex items-center">
                  <div className="transition-transform duration-500 group-hover:rotate-[360deg]">
                    {theme === 'light' ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <Sun className="w-5 h-5" />
                    )}
                  </div>
                </span>
              </button>

              <div className="relative group">
                <button 
                  onClick={() => {
                    // Future implementation: navigate to a dedicated profile page
                  }}
                  className="flex items-center space-x-3 group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl p-2 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-0.5 relative transition-transform duration-300 group-hover:scale-110">
                    <div className="w-full h-full rounded-[10px] bg-white dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 font-semibold text-lg">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {/* Profile completion indicator */}
                    {!isProfileComplete && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
                    {!isProfileComplete && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Complete Profile</p>
                    )}
                  </div>
                </button>
                
                {/* Profile Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform scale-95 group-hover:scale-100 origin-top-right">
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      View Profile
                    </Link>
                    <Link
                      to="/profile"
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {isProfileComplete ? 'Edit Profile' : 'Complete Profile'}
                    </Link>
                  </div>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="group relative px-3 sm:px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-600/30 dark:hover:border-indigo-400/30 hover:shadow-lg hover:shadow-indigo-600/10 dark:hover:shadow-indigo-400/10 transition-all duration-200 overflow-hidden"
              >
                <span className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                <span className="relative z-10 flex items-center">
                  <svg className="w-4 h-4 mr-0 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <AIQuizModal isOpen={showQuiz} onClose={() => setShowQuiz(false)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Enhanced Welcome Section */}
        <div 
          className="mb-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 
            rounded-3xl p-6 sm:p-10 border border-indigo-100/50 dark:border-gray-600/50 shadow-xl hover:shadow-2xl 
            transform hover:-translate-y-1 transition-all duration-500 relative overflow-hidden animate-fade-in group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-0 group-hover:opacity-20 transition duration-500 animate-pulse-slow"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl transform translate-x-16 -translate-y-8 sm:translate-x-32 sm:-translate-y-16 animate-float-gentle"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-br from-indigo-400/10 to-pink-400/10 rounded-full blur-3xl transform -translate-x-16 translate-y-8 sm:-translate-x-32 sm:translate-y-16 animate-float-gentle" style={{ animationDelay: '1s' }}></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative">
            <div className="relative z-10 w-full">
              <div className="flex items-center mb-6 animate-slide-up">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="px-4 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm font-medium rounded-full">Welcome to <span className="text-black">Level</span><span className="text-orange-500">Up</span></span>
              </div>
              <h1 className="mb-4 flex flex-col sm:flex-row sm:items-baseline animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <span className="text-2xl lg:text-3xl font-medium text-gray-600 dark:text-gray-300 mr-3">Welcome back,</span>
                <span className="text-4xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 font-['Aclonica']">{user?.name}</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl animate-slide-up" style={{ animationDelay: '0.2s' }}>Ready to continue your learning journey? Explore our latest courses and enhance your skills.</p>
              <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <Link
                  to="/courses"
                  className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-medium hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  <span className="relative group-hover:pl-2 transition-all duration-300">
                    Explore New Courses
                    <span className="absolute bottom-0 left-0 w-full h-px bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                  </span>
                  <svg className="w-6 h-6 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative z-10 animate-slide-up mt-8 md:mt-0" style={{ animationDelay: '0.4s' }}>
              <div className="relative transform hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 animate-glow"></div>
                <div className="relative px-8 py-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-xl mr-3">
                      <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Today's Goal</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">2 hours</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">60%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transform origin-left animate-expand relative" style={{ width: '60%' }}>
                          <div className="absolute inset-0 bg-white/25 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">1.2 hours completed</span>
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <Zap className="w-4 h-4 mr-1" />
                        On Track
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div 
            className="group relative transform hover:-translate-y-2 transition-all duration-300 animate-slide-up" 
            style={{ animationDelay: '0.1s', perspective: '1000px' }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            <div 
              className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-6 rounded-2xl border border-indigo-100 dark:border-gray-700 
              hover:border-indigo-200 dark:hover:border-gray-600 transition-all duration-300 transform-gpu group-hover:[transform:rotateX(10deg)_rotateY(-10deg)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <div className="absolute -inset-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                  <div className="relative p-3 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-lg shadow-lg">
                    <BookOpen size={24} className="text-white" />
                  </div>
                </div>
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">{enrollments.length}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Total Courses</p>
              <div className="mt-2 flex items-center text-xs text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                12% from last month
              </div>
            </div>
          </div>

          <div 
            className="group relative transform hover:-translate-y-2 transition-all duration-300 animate-slide-up" 
            style={{ animationDelay: '0.2s', perspective: '1000px' }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            <div 
              className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-6 rounded-2xl border border-green-100 dark:border-gray-700 
              hover:border-green-200 dark:hover:border-gray-600 transition-all duration-300 transform-gpu group-hover:[transform:rotateX(10deg)_rotateY(-10deg)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <div className="absolute -inset-2 bg-green-100 dark:bg-green-900 rounded-lg transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                  <div className="relative p-3 bg-gradient-to-r from-green-600 to-emerald-400 rounded-lg shadow-lg">
                    <TrendingUp size={24} className="text-white" />
                  </div>
                </div>
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">{activeCourses}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Active Courses</p>
              <div className="mt-2 flex items-center text-xs text-green-600 dark:text-green-400">
                <Zap className="w-4 h-4 mr-1" />
                8% completion rate
              </div>
            </div>
          </div>

          <div 
            className="group relative transform hover:-translate-y-2 transition-all duration-300 animate-slide-up" 
            style={{ animationDelay: '0.3s', perspective: '1000px' }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-violet-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            <div 
              className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-6 rounded-2xl border border-purple-100 dark:border-gray-700 
              hover:border-purple-200 dark:hover:border-gray-600 transition-all duration-300 transform-gpu group-hover:[transform:rotateX(10deg)_rotateY(-10deg)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <div className="absolute -inset-2 bg-purple-100 dark:bg-purple-900 rounded-lg transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                  <div className="relative p-3 bg-gradient-to-r from-purple-600 to-violet-400 rounded-lg shadow-lg">
                    <Clock size={24} className="text-white" />
                  </div>
                </div>
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-400">
                  {formatDuration(Math.round(totalWatchTime))}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Learning Time</p>
              <div className="mt-2 flex items-center text-xs text-purple-600 dark:text-purple-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                3.5 hours this week
              </div>
            </div>
          </div>

          <div 
            className="group relative transform hover:-translate-y-2 transition-all duration-300 animate-slide-up" 
            style={{ animationDelay: '0.4s', perspective: '1000px' }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-rose-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
            <div 
              className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-6 rounded-2xl border border-pink-100 dark:border-gray-700 
              hover:border-pink-200 dark:hover:border-gray-600 transition-all duration-300 transform-gpu group-hover:[transform:rotateX(10deg)_rotateY(-10deg)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <div className="absolute -inset-2 bg-pink-100 dark:bg-pink-900 rounded-lg transform rotate-6 group-hover:rotate-12 transition-transform duration-300"></div>
                  <div className="relative p-3 bg-gradient-to-r from-pink-600 to-rose-400 rounded-lg shadow-lg">
                    <Award size={24} className="text-white" />
                  </div>
                </div>
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-400">{completedCourses}</span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Completed</p>
              <div className="mt-2 flex items-center text-xs text-pink-600 dark:text-pink-400">
                <Award className="w-4 h-4 mr-1" />
                +2 this month
              </div>
            </div>
          </div>
        </div>


        {/* Achievements Section */}
        <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Award className="mr-3 text-amber-500" />
              Achievements
            </h2>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800/50 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Your Progress</span>
              <span className="text-sm font-bold text-amber-500">50%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2.5 rounded-full" style={{ width: '50%' }}></div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              {[
                { icon: Award, title: 'Course Completer', description: 'Finish your first course', earned: true },
                { icon: Star, title: 'Perfect Score', description: 'Get 100% on a quiz', earned: true },
                { icon: TrendingUp, title: '5-Day Streak', description: 'Learn 5 days in a row', earned: true },
                { icon: Zap, title: 'Power Learner', description: 'Study for 5 hours in a day', earned: false },
                { icon: BookOpen, title: 'Weekend Warrior', description: 'Learn on a Saturday or Sunday', earned: false },
                { icon: Users, title: 'Community Helper', description: 'Help another student', earned: false },
              ].map((ach, index) => {
                const Icon = ach.icon;
                return (
                  <div key={index} className="group relative flex flex-col items-center animate-fade-in" style={{ animationDelay: `${700 + index * 100}ms` }}>
                    <div
                      className={`
                        w-16 h-16 rounded-full flex items-center justify-center relative
                        transition-all duration-300 transform group-hover:-translate-y-1
                        ${ach.earned
                          ? 'bg-yellow-400'
                          : 'bg-gray-100 dark:bg-gray-700'
                        }
                      `}
                    >
                      <div className={`
                        w-14 h-14 rounded-full flex items-center justify-center
                        ${ach.earned
                          ? 'bg-gradient-to-br from-yellow-300 to-orange-400 shadow-inner'
                          : 'bg-gray-200 dark:bg-gray-600'
                        }
                      `}>
                        <Icon 
                          size={28} 
                          className={`transition-all duration-300 group-hover:scale-110 ${
                            ach.earned ? 'text-white' : 'text-gray-400 dark:text-gray-500'
                          }`} 
                        />
                      </div>
                    </div>
                    <div 
                      className="absolute bottom-full mb-2 w-max max-w-xs left-1/2 -translate-x-1/2 px-4 py-2 
                      bg-gray-800 dark:bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 
                      transition-all duration-300 transform group-hover:-translate-y-1 pointer-events-none"
                    >
                      <p className="font-bold">{ach.title}</p>
                      <p className="text-xs text-gray-300">{ach.description}</p>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800 dark:border-t-black"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Learning Streak */}
        <div className="mb-12 relative group animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
          <div className="relative p-6 sm:p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl transform translate-x-32 -translate-y-16 animate-float-gentle"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl transform -translate-x-32 translate-y-16 animate-float-gentle" style={{ animationDelay: '1s' }}></div>
            
            <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
              <div className="mb-8 md:mb-0 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start mb-3">
                  <div className="relative">
                    <span className="text-6xl animate-pulse">🔥</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-4xl sm:text-5xl font-bold tracking-tight">
                      {currentStreak} Day Streak!
                    </h3>
                    <p className="text-lg text-gray-300">Keep the flame alive!</p>
                  </div>
                </div>
                <div className="mt-4 inline-flex items-center text-sm text-gray-400 bg-white/10 px-4 py-2 rounded-lg">
                  <Award className="w-4 h-4 mr-2 text-yellow-400" />
                  Best streak: {bestStreak} days
                </div>
              </div>
              
              <div className="flex items-end gap-3 sm:gap-4">
                {dailyProgress.map((day, index) => {
                  const isToday = new Date().toISOString().split('T')[0] === day.date;
                  return (
                    <div 
                      key={day.date}
                      className="group/day relative flex flex-col items-center animate-slide-up"
                      style={{ animationDelay: `${0.6 + index * 0.1}s` }}
                    >
                      <div 
                        className={`
                          w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center relative
                          transform transition-all duration-300 group-hover/day:scale-110
                          ${day.completed 
                            ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg' 
                            : 'bg-white/10 border-2 border-dashed border-white/20'
                          }
                          ${isToday && !day.completed ? 'animate-pulse-slow border-solid' : ''}
                        `}
                      >
                        {day.completed && <Check className="w-7 h-7 text-white" />}
                        {isToday && <div className="absolute -inset-1 rounded-full border-2 border-orange-400 animate-ping-slow opacity-75"></div>}
                      </div>
                      <span className="mt-2 text-xs font-medium text-gray-300">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <div 
                        className="absolute bottom-full mb-2 w-max max-w-xs left-1/2 -translate-x-1/2 px-3 py-1 
                        bg-black/80 text-white text-xs rounded-md opacity-0 group-hover/day:opacity-100 
                        transition-all duration-300 transform group-hover/day:-translate-y-1 pointer-events-none"
                      >
                        {day.date}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-black/80"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* My Learning Section */}
        <div id="my-learning" className="mb-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-['Aclonica'] tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 via-indigo-600 to-sky-500 mb-4 sm:mb-0">My Learning</h2>
            <Link
              to="/courses"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-sky-300 bg-sky-500 text-white text-sm font-medium shadow-sm hover:bg-sky-600 hover:border-sky-400 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 text-white group-hover:bg-white/30 transition-colors">
                <Plus size={14} />
              </span>
              <span className="tracking-wide">Find New Course</span>
            </Link>
          </div>

          {error && (
            <div className="mb-8 p-4 border border-red-200 bg-red-50 rounded">
              <p className="text-sm text-red-600 font-light">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-zara-lightsilver h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-zara-lightsilver rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-zara-lightsilver rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : enrollments.length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl border border-indigo-100/60 bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/40 py-16 px-6 text-center">
              <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-purple-400/20 to-indigo-400/20 blur-3xl" />
              <div className="relative">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-indigo-100">
                  <BookOpen size={28} className="text-indigo-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Start Your Learning Journey</h3>
                <p className="text-gray-600 mb-8 max-w-xl mx-auto">You haven't enrolled in any courses yet. Browse our catalog to find courses that match your interests.</p>
                <Link
                  to="/courses"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:shadow-indigo-500/25 transition-all"
                >
                  Browse Courses
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {enrollments.map((enrollment) => {
                const course = enrollment.courseId as Course
                return (
                  <div key={enrollment._id} className="group relative transform hover:-translate-y-2 transition-all duration-300 animate-slide-up magnetic-hover" style={{ animationDelay: `${Math.random() * 0.5}s` }}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-70 transition duration-300 animate-glow"></div>
                    <div className="relative bg-white/85 dark:bg-gray-800/85 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/60 dark:border-gray-700 transform-3d group-hover:[transform:rotateX(5deg)_rotateY(-5deg)]">
                      {/* Course Image */}
                      <div className="h-48 relative overflow-hidden group/image">
                        <img
                          src={(course.thumbnail as string) || '/level up.png'}
                          alt={`${course.title} thumbnail`}
                          className="w-full h-full object-cover transform transition-transform duration-500 group-hover/image:scale-110"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/level up.png' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent" />
                        <div className="pointer-events-none absolute inset-0 translate-x-[-120%] group-hover/image:translate-x-[120%] transition-transform duration-[900ms] ease-out bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-white/90 text-gray-800 shadow-sm">
                          {course.category}
                        </div>
                      </div>

                      {/* Course Info */}
                      <div className="p-8">
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">{course.category}</span>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-medium ${
                            enrollment.status === 'completed' ? 'bg-green-50 text-green-600' :
                            enrollment.status === 'active' ? 'bg-indigo-50 text-indigo-600' :
                            'bg-amber-50 text-amber-600'
                          }`}>
                            {enrollment.status}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">by {course.instructor?.name}</p>

                        <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                          {course.shortDescription}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-6">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="font-medium text-gray-700">Course Progress</span>
                            <span className="font-bold text-indigo-600">{enrollment.progress.overallPercentage}%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-full transition-all duration-300 relative"
                              style={{ width: `${enrollment.progress.overallPercentage}%` }}
                            >
                              <div className="absolute inset-0 bg-white/25 rounded-full"></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="font-medium">{enrollment.progress.videosCompleted} of {enrollment.progress.totalVideos} lessons</span>
                          </div>
                          <div className="flex items-center space-x-3 w-full sm:w-auto">
                            <Link
                              to={`/course/${course._id}/learn`}
                              className="group/btn flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300"
                            >
                              <span className="relative">
                                {enrollment.progress.overallPercentage > 0 ? 'Continue' : 'Start'}
                                <span className="absolute bottom-0 left-0 w-full h-px bg-white/50 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300"></span>
                              </span>
                              <svg className="w-4 h-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleUnenroll(course._id)}
                              disabled={removingId === course._id}
                              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-red-500 hover:text-red-600 transition-all duration-200 disabled:opacity-50"
                            >
                              {removingId === course._id ? 'Removing…' : 'Unenroll'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recommended Learning Paths */}
        <div id="learning-paths" className="mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Recommended Learning Paths</h3>
            <Link to="/paths" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View All Paths
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white p-6 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all duration-300">
                <div className="p-4 bg-blue-50 rounded-xl mb-4 inline-block">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Web Development</h4>
                <p className="text-gray-600 mb-4">Master modern web development with React, Node.js, and more</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    12 courses
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    48 hours
                  </div>
                </div>
                <Link to="/courses?category=Web%20Development" className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-500 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center">
                  Start Learning
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white p-6 rounded-2xl border border-purple-100 hover:border-purple-200 transition-all duration-300">
                <div className="p-4 bg-purple-50 rounded-xl mb-4 inline-block">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Data Science</h4>
                <p className="text-gray-600 mb-4">Learn Python, Machine Learning, and Statistical Analysis</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    8 courses
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    32 hours
                  </div>
                </div>
                <Link to="/courses?category=Data%20Science" className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-400 text-white rounded-xl text-sm font-medium hover:from-purple-700 hover:to-purple-500 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center">
                  Start Learning
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-green-400 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-white p-6 rounded-2xl border border-green-100 hover:border-green-200 transition-all duration-300">
                <div className="p-4 bg-green-50 rounded-xl mb-4 inline-block">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Mobile Development</h4>
                <p className="text-gray-600 mb-4">Build iOS and Android apps with React Native</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    6 courses
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    24 hours
                  </div>
                </div>
                <Link to="/courses?category=Mobile%20Development" className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-400 text-white rounded-xl text-sm font-medium hover:from-green-700 hover:to-green-500 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center">
                  Start Learning
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-700 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
              <Zap className="w-5 h-5 text-white animate-pulse-slow" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/courses"
              className="group flex items-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-400/10 transition-all duration-300 transform hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-600"
            >
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-blue-500/50">
                <Search size={24} className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Explore Courses</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Discover new learning opportunities</p>
              </div>
            </Link>

            <div className="group flex items-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:shadow-green-500/10 dark:hover:shadow-green-400/10 transition-all duration-300 transform hover:-translate-y-1 hover:border-green-300 dark:hover:border-green-600">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-green-500/50">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Track Progress</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Monitor your learning journey</p>
              </div>
            </div>

            <div className="group flex items-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-400/10 transition-all duration-300 transform hover:-translate-y-1 hover:border-purple-300 dark:hover:border-purple-600">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-purple-500/50">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Join Community</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">Connect with other learners</p>
              </div>
            </div>
          </div>
        </div>

        {/* This Week's Schedule */}
        <div className="mt-12 animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Clock className="mr-3 text-indigo-500" />
              This Week's Schedule
          </h2>
          <div className="space-y-4">
              {[
                  { day: 'Monday', course: 'Advanced React Patterns', time: '10:00 AM', duration: '1h 30m', color: 'bg-blue-500' },
                  { day: 'Tuesday', course: 'Live Q&A: Data Structures', time: '3:00 PM', duration: '1h', color: 'bg-green-500' },
                  { day: 'Thursday', course: 'Project Review: Node.js API', time: '4:00 PM', duration: '1h 30m', color: 'bg-purple-500' },
                  { day: 'Friday', course: 'Workshop: UI/UX Principles', time: '11:00 AM', duration: '2h', color: 'bg-pink-500' }
              ].map((schedule, index) => (
                  <div key={index} className="group flex items-center p-4 bg-white dark:bg-gray-800/50 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className={`w-1.5 h-16 rounded-full mr-4 ${schedule.color}`}></div>
                      <div className="flex-1">
                          <p className="font-bold text-gray-800 dark:text-white">{schedule.course}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{schedule.day} at {schedule.time} ({schedule.duration})</p>
                      </div>
                      <button className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Join
                      </button>
                  </div>
              ))}
          </div>
          <div className="mt-6 text-center">
              <Link to="/calendar" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                  View Full Calendar &rarr;
              </Link>
          </div>
         </div>

         {/* Complete Tasks for a Reward Section */}
         <div id="tasks" className="mt-12 animate-slide-up" style={{ animationDelay: '0.75s' }}>
           <div className="group relative transform hover:-translate-y-2 transition-all duration-300 magnetic-hover">
             <div className={`absolute -inset-0.5 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300 animate-glow ${tasksCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'}`}></div>
             <div className="relative p-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 transform-3d group-hover:[transform:rotateX(3deg)_rotateY(-3deg)]">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                 <div>
                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center mb-2">
                     <Gift className="mr-3 text-amber-500" />
                     Complete Tasks for a Reward!
                   </h2>
                   <p className="text-gray-600 dark:text-gray-300">Complete all tasks to unlock an exclusive course for free.</p>
                 </div>
                 <div className="mt-4 sm:mt-0 text-right">
                   <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{completedTasks}/{totalTasks}</span>
                   <p className="text-sm text-gray-500 dark:text-gray-400">Tasks Completed</p>
                 </div>
               </div>

               <div className="space-y-4 mb-6">
                 {tasks.map((task) => {
                   const Icon = task.icon;
                   const TaskContent = (
                     <div className={`flex items-center p-4 rounded-lg transition-all duration-300 ${task.completed ? 'bg-green-50 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-800 group-hover:bg-gray-100 dark:group-hover:bg-gray-700'}`}>
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 transition-all duration-300 ${task.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                         <Icon size={20} className={task.completed ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
                       </div>
                       <p className={`font-medium ${task.completed ? 'text-green-800 dark:text-green-300 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                         {task.text}
                       </p>
                       {!task.completed && (
                         <svg className="w-4 h-4 ml-auto text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                       )}
                     </div>
                   );

                   if (!task.completed && task.link) {
                     return (
                       <Link to={task.link} key={task.id} className="group">
                         {TaskContent}
                       </Link>
                     );
                   }
                   
                   return <div key={task.id}>{TaskContent}</div>;
                 })}
               </div>

               {tasksCompleted ? (
                 <button 
                   onClick={() => {
                     alert('Congratulations! You have unlocked a free course. We will add it to your account shortly.');
                   }}
                   className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
                 >
                   Claim Your Free Course!
                 </button>
               ) : (
                 <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                   <div
                     className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                     style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                   ></div>
                 </div>
               )}
             </div>
           </div>
         </div>

         {/* Refer and Earn Section */}
         <div id="refer" className="mt-12 animate-slide-up" style={{ animationDelay: '0.8s' }}>
           <div className="group relative transform hover:-translate-y-2 transition-all duration-300">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
             <div className="relative p-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                 <div className="mb-4 sm:mb-0">
                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center mb-2">
                     <Share2 className="mr-3 text-sky-500" />
                     Refer & Earn
                   </h2>
                   <p className="text-gray-600 dark:text-gray-300">Share your referral link and earn credits for each new user!</p>
                 </div>
                 <button 
                   onClick={() => {
                     const referralLink = `${window.location.origin}/register?ref=${user?._id ? user._id.slice(-6).toUpperCase() : ''}`;
                     navigator.clipboard.writeText(referralLink);
                     setCopied(true);
                     setTimeout(() => setCopied(false), 2000);
                   }}
                   className="px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-400 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-sky-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
                 >
                   {copied ? 'Link Copied!' : 'Get Referral Link'}
                 </button>
               </div>
               <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                 <p className="text-sm text-gray-600 dark:text-gray-400">Your referral code:</p>
                 <div className="mt-2 flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                   <p className="font-mono text-lg font-bold text-gray-800 dark:text-gray-200">
                     {user?._id ? `REF-${user._id.slice(-6).toUpperCase()}` : 'LOGIN-TO-SEE'}
                   </p>
                   <button
                     onClick={() => {
                       navigator.clipboard.writeText(`REF-${user?._id.slice(-6).toUpperCase()}`);
                       setCopied(true);
                       setTimeout(() => setCopied(false), 2000);
                     }}
                     className="ml-auto px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/40 rounded-md hover:bg-sky-200 dark:hover:bg-sky-900"
                   >
                     {copied ? 'Copied!' : 'Copy'}
                   </button>
                 </div>
               </div>
             </div>
           </div>
         </div>

         {/* Tips and Tricks Section */}
        <div className="mt-12 animate-slide-up" style={{ animationDelay: '0.85s' }}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Sparkles className="mr-3 text-green-500" />
              Tips for Success
          </h2>
          <div className="relative p-6 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-green-900/50 rounded-2xl shadow-md overflow-hidden">
              <div className="flex items-start">
                  <div className="p-3 bg-white dark:bg-gray-700 rounded-xl mr-4 shadow-sm">
                      <TipIcon size={24} className="text-green-500" />
                  </div>
                  <div>
                      <h4 className="font-bold text-gray-800 dark:text-white">{tipTitle}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{tipDescription}</p>
                  </div>
              </div>
              <button 
                  onClick={nextTip}
                  className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
              >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
          </div>
        </div>
      </div>
      </div> {/* Close main content container */}
      
      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.7; }
          25% { transform: translateY(-10px) translateX(5px); opacity: 1; }
          50% { transform: translateY(-20px) translateX(-5px); opacity: 0.8; }
          75% { transform: translateY(-10px) translateX(3px); opacity: 0.9; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        
        .animate-float-gentle {
          animation: float-gentle 6s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .magnetic-hover {
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .magnetic-hover:hover {
          transform: translateY(-8px) scale(1.02);
        }
        
        .transform-3d {
          transform-style: preserve-3d;
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      {/* AI Nova mounted globally */}
    </div>
  )
}

export default Dashboard;