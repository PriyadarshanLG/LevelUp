import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, PlayCircle, CheckCircle, Clock, FileText, 
  ExternalLink, Menu, X 
} from 'lucide-react'
// ReactPlayer removed; using native YouTube iframe for reliability
import { courseAPI, APIError } from '../utils/api'
import type { Course, Video, Enrollment } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
// Chatbot is mounted globally in App
import QuizList from '../components/QuizList'
import YouTube from 'react-youtube'

const CourseLearningPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Course and video state
  const [course, setCourse] = useState<Course | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [, setEnrollment] = useState<Enrollment | null>(null)
  const [player, setPlayer] = useState<any>(null)
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<'videos' | 'quizzes'>('videos')

  // playerRef not used; relying on react-youtube callbacks

  useEffect(() => {
    if (courseId) {
      loadCourseData()
    }
  }, [courseId])

  // Update AI Nova context when course or current video changes
  useEffect(() => {
    if (!course || !currentVideo) return
    const detail = {
      courseId: course._id,
      courseTitle: course.title,
      currentTopic: currentVideo.title
    }
    window.dispatchEvent(new CustomEvent('ainova-set-context', { detail }))
  }, [course?._id, course?.title, currentVideo?.title])

  useEffect(() => {
    if (videos.length > 0 && !currentVideo) {
      // Start with first incomplete video or first video
      const firstIncompleteVideo = videos.find(v => !v.progress?.isCompleted)
      const videoToStart = firstIncompleteVideo || videos[0]
      setCurrentVideo(videoToStart)
      setCurrentVideoIndex(videos.findIndex(v => v._id === videoToStart._id))
    }
  }, [videos, currentVideo])

  // Compute skip offset: always jump 60 minutes ahead, clamped to video duration
  const getSkipOffsetSeconds = (video: Video) => {
    const sixtyMinutes = 60 * 60
    const maxSafeStart = Math.max(0, (video.duration || 0) - 15)
    return Math.min(sixtyMinutes, maxSafeStart)
  }

  // Ensure the player updates when the selected video changes
  useEffect(() => {
    if (!player || !currentVideo) return
    const id = getVideoId(currentVideo.videoUrl)
    if (id && typeof player.loadVideoById === 'function') {
      try {
        const startSeconds = getSkipOffsetSeconds(currentVideo)
        player.loadVideoById({ videoId: id, startSeconds })
      } catch (e) {
        // Swallow errors from player while switching videos to avoid UI breaks
      }
    }
  }, [player, currentVideo])

  const loadCourseData = async () => {
    if (!courseId) return

    try {
      setLoading(true)
      setError(null)

      console.log('Loading course data for courseId:', courseId)
      const response = await courseAPI.getCourse(courseId)
      console.log('Course API response:', response)
      
      if (response.success) {
        setCourse(response.data.course)
        setVideos(response.data.videos)
        setEnrollment(response.data.enrollment)
        
        console.log('Course loaded successfully:', response.data.course.title)
        console.log('Videos count:', response.data.videos.length)
        console.log('Is enrolled:', response.data.isEnrolled)
        
        if (!response.data.isEnrolled) {
          console.log('User not enrolled, redirecting to course detail page')
          navigate(`/course/${courseId}`)
          return
        }

        // Initialize video progress
        const progressMap: { [key: string]: number } = {}
        response.data.videos.forEach(video => {
          if (video.progress?.watchedDuration) {
            progressMap[video._id] = video.progress.watchedDuration / video.duration
          }
        })
        // setVideoProgress(progressMap) // This line is removed as per the edit hint
      } else {
        console.error('API returned success: false', response)
        setError(response.message || 'Failed to load course data')
      }
    } catch (error) {
      console.error('Failed to load course:', error)
      setError(error instanceof APIError ? error.message : 'Failed to load course')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoSelect = (video: Video, index: number) => {
    setCurrentVideo(video)
    setCurrentVideoIndex(index)
    if (player) {
      const id = getVideoId(video.videoUrl)
      const startSeconds = getSkipOffsetSeconds(video)
      try {
        if (id && typeof player.loadVideoById === 'function') {
          player.loadVideoById({ videoId: id, startSeconds })
        } else if (typeof player.seekTo === 'function') {
          player.seekTo(startSeconds)
          player.playVideo && player.playVideo()
        }
      } catch {}
    }
  }

  const onPlayerReady = (event: any) => {
    setPlayer(event.target)
    try {
      if (currentVideo) {
        const startSeconds = getSkipOffsetSeconds(currentVideo)
        if (typeof event.target.seekTo === 'function') {
          event.target.seekTo(startSeconds, true)
          event.target.playVideo && event.target.playVideo()
        }
      }
    } catch {}
  }

  const getVideoId = (url: string) => {
    try {
      const urlObj = new URL(url)
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1)
      }
      return urlObj.searchParams.get('v')
    } catch (e) {
      console.error('Invalid video URL', url)
      return null
    }
  }

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000)
    const hh = date.getUTCHours()
    const mm = date.getUTCMinutes()
    const ss = date.getUTCSeconds().toString().padStart(2, '0')
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`
    }
    return `${mm}:${ss}`
  }

  const getVideoCompletionPercentage = () => {
    // NOTE: This is temporarily disabled until iframe progress tracking is added
    return 0
    // const completedVideos = videos.filter(v => v.progress?.isCompleted).length
    // return videos.length > 0 ? Math.round((completedVideos / videos.length) * 100) : 0
  }

  // toEmbedUrl not used with react-youtube; keeping logic in player options

  if (loading) {
    return (
      <div className="min-h-screen bg-zara-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zara-white mx-auto mb-4"></div>
          <p className="text-zara-white font-light">Loading course...</p>
        </div>
      </div>
    )
  }

  if (error || !course || !currentVideo) {
    return (
      <div className="min-h-screen bg-zara-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-zara-white font-light mb-4">{error || 'Course not found'}</p>
          <Link
            to="/dashboard"
            className="inline-block px-6 py-3 text-sm font-light tracking-wide uppercase bg-zara-white text-zara-black hover:bg-zara-lightgray transition-colors duration-200"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zara-black text-zara-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-700 shadow-lg">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to={`/course/${courseId}`}
                className="text-zara-lightgray hover:text-zara-white transition-colors duration-200"
              >
                <ArrowLeft size={20} />
              </Link>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-zara-lightgray hover:text-zara-white transition-colors duration-200"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <Link to="/dashboard" className="flex-shrink-0 group flex items-center -space-x-1">
                <img src="/level up.png" alt="LevelUp Logo" className="h-16 sm:h-[70px] lg:h-[110px] w-auto object-contain transition-all duration-300 group-hover:scale-105" />
                <span className="hidden sm:block text-lg md:text-xl font-righteous font-semibold"><span className="text-black">Level</span><span className="text-orange-500">Up</span></span>
              </Link>
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-white">{course.title}</h1>
                <p className="text-sm font-light text-slate-300">
                  {currentVideoIndex + 1} of {videos.length} • {getVideoCompletionPercentage()}% Complete
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-light text-slate-300 hidden sm:block">
                {user?.name}
              </span>
            </div>
          </div>
          {/* Accent bar */}
          <div className="h-1 mt-3 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500"></div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Video Player */}
        <div className={`flex-1 flex flex-col transition-all duration-300 overflow-y-auto`}>
          {/* Player Container */}
          <div className="relative bg-black aspect-video">
            <YouTube
              key={getVideoId(currentVideo.videoUrl) || currentVideo._id}
              videoId={getVideoId(currentVideo.videoUrl) || ''}
              onReady={onPlayerReady}
              className="w-full h-full"
              opts={{
                width: '100%',
                height: '100%',
                playerVars: {
                  autoplay: 1,
                  controls: 1,
                  rel: 0,
                  modestbranding: 1,
                  // Set start time so initial mount jumps to 60min as well
                  start: getSkipOffsetSeconds(currentVideo)
                }
              }}
            />
          </div>

          {/* Video Info */}
          <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-light text-zara-white mb-2">
                    {currentVideo.title}
                  </h2>
                  <p className="text-zara-lightgray font-light mb-4">
                    {currentVideo.description}
                  </p>
                  <div className="flex items-center space-x-6 text-sm font-light text-zara-lightgray">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2" />
                      {formatTime(currentVideo.duration)}
                    </div>
                    <div className="flex items-center">
                      <PlayCircle size={16} className="mr-2" />
                      Lesson {currentVideoIndex + 1}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mb-8">
                <button
                  onClick={() => currentVideoIndex > 0 && handleVideoSelect(videos[currentVideoIndex - 1], currentVideoIndex - 1)}
                  disabled={currentVideoIndex === 0}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium tracking-wide uppercase rounded-lg border border-zara-gray text-zara-white hover:bg-zara-charcoal/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous Lesson
                </button>
                <button
                  onClick={() => currentVideoIndex < videos.length - 1 && handleVideoSelect(videos[currentVideoIndex + 1], currentVideoIndex + 1)}
                  disabled={currentVideoIndex === videos.length - 1}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium tracking-wide uppercase rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Lesson
                </button>
              </div>

              {/* Resources */}
              {currentVideo.resources && currentVideo.resources.filter(r => r.type !== 'download' && r.title.toLowerCase() !== 'source code').length > 0 && (
                <div className="border-t border-zara-gray pt-6">
                  <h3 className="text-lg font-light text-zara-white mb-4">Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentVideo.resources
                      .filter(r => r.type !== 'download' && r.title.toLowerCase() !== 'source code')
                      .map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 rounded-xl border border-zara-gray/60 bg-zara-charcoal/60 hover:bg-zara-charcoal/80 hover:border-zara-lightgray transition-all duration-200"
                        >
                          <div className="flex items-center">
                            {resource.type === 'pdf' ? (
                              <FileText size={20} className="mr-3 text-zara-white/80" />
                            ) : (
                              <ExternalLink size={20} className="mr-3 text-zara-white/80" />
                            )}
                            <span className="text-sm font-light text-zara-white">
                              {resource.title}
                            </span>
                          </div>
                          <svg className="w-4 h-4 text-zara-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Sidebar */}
        <div className={`fixed lg:relative top-0 lg:top-auto right-0 w-full sm:w-96 h-full bg-zara-charcoal border-l border-zara-gray transform lg:transform-none transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:w-96 lg:translate-x-0 flex-shrink-0`}>
          <div className="p-4 sm:p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-normal text-zara-white">Course Content</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-zara-lightgray hover:text-zara-white transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress Overview */}
            <div className="mb-6 p-4 bg-zara-black rounded-lg border border-zara-gray/60">
              <div className="flex justify-between items-center text-sm font-light text-zara-lightgray mb-2">
                <span>Progress</span>
                <span>{getVideoCompletionPercentage()}%</span>
              </div>
              <div className="w-full h-2 rounded bg-zara-gray overflow-hidden">
                <div 
                  className="h-2 rounded bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
                  style={{ width: `${getVideoCompletionPercentage()}%` }}
                />
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex mb-6">
              <button
                onClick={() => setActiveTab('videos')}
                className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-l-lg transition-all duration-200 ${
                  activeTab === 'videos'
                    ? 'bg-zara-white text-zara-black'
                    : 'bg-zara-black text-zara-white hover:bg-zara-charcoal'
                }`}
              >
                Videos
              </button>
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-r-lg transition-all duration-200 ${
                  activeTab === 'quizzes'
                    ? 'bg-zara-white text-zara-black'
                    : 'bg-zara-black text-zara-white hover:bg-zara-charcoal'
                }`}
              >
                Quizzes
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'videos' ? (
                /* Video List */
                <div className="space-y-2">
                  {videos.map((video, index) => (
                    <button
                      key={video._id}
                      onClick={() => handleVideoSelect(video, index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors duration-200 border ${
                        currentVideo._id === video._id 
                          ? 'bg-zara-white text-zara-black border-transparent' 
                          : 'hover:bg-zara-black text-zara-white border-zara-gray/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {video.progress?.isCompleted ? (
                            <CheckCircle size={16} className="mr-3 text-green-500" />
                          ) : (
                            <PlayCircle size={16} className="mr-3 opacity-60" />
                          )}
                          <div>
                            <p className="text-sm font-light">
                              {index + 1}. {video.title}
                            </p>
                            <p className="text-xs opacity-60">
                              {formatTime(video.duration)}
                            </p>
                          </div>
                        </div>
                        {/* videoProgress[video._id] > 0 && !video.progress?.isCompleted && ( // This line is removed as per the edit hint */}
                        {/*   <div className="w-8 h-1 bg-gray-600 rounded"> // This line is removed as per the edit hint */}
                        {/*     <div  // This line is removed as per the edit hint */}
                        {/*       className="h-1 bg-white rounded transition-all duration-300" // This line is removed as per the edit hint */}
                        {/*       style={{ width: `${(videoProgress[video._id] || 0) * 100}%` }} // This line is removed as per the edit hint */}
                        {/*     /> // This line is removed as per the edit hint */}
                        {/*   </div> // This line is removed as per the edit hint */}
                        {/* ) // This line is removed as per the edit hint */}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* Quiz List */
                <div className="h-full">
                  <QuizList courseId={courseId!} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* AI Nova is mounted globally */}
    </div>
  )
}

export default CourseLearningPage
