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

  // Get start time for video (start from beginning or last watched position)
  const getSkipOffsetSeconds = (video: Video) => {
    // If video has progress, start from last watched position
    if (video.progress && video.progress.watchedDuration > 0 && !video.progress.isCompleted) {
      return Math.floor(video.progress.watchedDuration)
    }
    // Otherwise start from the beginning
    return 0
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

      console.log('=== Loading Course Data ===')
      console.log('Course ID:', courseId)
      console.log('User:', user)
      
      const response = await courseAPI.getCourse(courseId)
      console.log('=== API Response ===')
      console.log('Full response:', JSON.stringify(response, null, 2))
      
      if (response.success && response.data) {
        console.log('✅ Success - Setting course data')
        console.log('Course:', response.data.course?.title)
        console.log('Videos count:', response.data.videos?.length)
        console.log('Is enrolled:', response.data.isEnrolled)
        
        setCourse(response.data.course)
        setVideos(response.data.videos || [])
        setEnrollment(response.data.enrollment)
        
        if (!response.data.isEnrolled) {
          console.log('❌ User not enrolled, redirecting...')
          navigate(`/course/${courseId}`)
          return
        }

        if (!response.data.videos || response.data.videos.length === 0) {
          console.log('⚠️ No lesson videos found in course')
          // Check if there's a preview video we can use instead
          if (response.data.course.previewVideo) {
            console.log('✅ Using preview video as fallback:', response.data.course.previewVideo)
            // Create a temporary video object from the preview
            const previewVideoObj: Video = {
              _id: 'preview-' + response.data.course._id,
              title: 'Course Preview',
              description: 'Preview video for ' + response.data.course.title,
              videoUrl: response.data.course.previewVideo,
              courseId: response.data.course._id,
              order: 0,
              duration: 0,
              isPublished: true,
              isPreview: true,
              thumbnail: '',
              resources: []
            }
            setVideos([previewVideoObj])
          } else {
            setError('This course has no videos yet. Please add videos to the course first.')
          }
        }
      } else {
        console.error('❌ API returned success: false or no data')
        console.error('Response:', response)
        setError(response.message || 'Failed to load course data')
      }
    } catch (error) {
      console.error('❌ Error loading course:', error)
      if (error instanceof APIError) {
        console.error('API Error details:', error.message, error.statusCode, error.errors)
        setError(`API Error: ${error.message}`)
      } else {
        console.error('Unknown error:', error)
        setError('Failed to load course. Please check the console for details.')
      }
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
      // Check if it's a local file path (uploaded video)
      if (url.startsWith('/uploads/') || url.startsWith('http://localhost') || url.startsWith('blob:')) {
        return null // Not a YouTube video
      }
      
      const urlObj = new URL(url)
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1)
      }
      return urlObj.searchParams.get('v')
    } catch (e) {
      // If URL parsing fails, it might be a relative path
      return null
    }
  }

  // Check if current video is a local uploaded file
  const isLocalVideo = (video: Video) => {
    if (!video.videoUrl) return false
    return video.videoUrl.startsWith('/uploads/') || 
           video.videoUrl.startsWith('http://localhost') ||
           video.videoUrl.startsWith('blob:') ||
           !video.videoUrl.includes('youtube.com') && !video.videoUrl.includes('youtu.be')
  }

  // Get full video URL for local videos
  const getLocalVideoUrl = (video: Video) => {
    if (video.videoUrl.startsWith('http')) {
      return video.videoUrl
    }
    // Prepend the backend URL for relative paths
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    return `${baseUrl}${video.videoUrl}`
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

  if (error || !course) {
    return (
      <div className="min-h-screen bg-zara-black flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="mb-6 text-6xl">😔</div>
          <h2 className="text-2xl font-light text-zara-white mb-4">
            {error ? 'Error Loading Course' : 'Course Not Found'}
          </h2>
          <p className="text-zara-lightgray font-light mb-6">
            {error || 'The course you are trying to access does not exist or you do not have permission to view it.'}
          </p>
          <div className="space-y-3">
            <Link
              to="/courses"
              className="block px-6 py-3 text-sm font-light tracking-wide uppercase bg-zara-white text-zara-black hover:bg-zara-lightgray transition-colors duration-200"
            >
              Browse Courses
            </Link>
            <Link
              to="/dashboard"
              className="block px-6 py-3 text-sm font-light tracking-wide uppercase bg-transparent border border-zara-white text-zara-white hover:bg-zara-white hover:text-zara-black transition-colors duration-200"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!currentVideo || videos.length === 0) {
    return (
      <div className="min-h-screen bg-zara-black flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="mb-6 text-6xl">📹</div>
          <h2 className="text-2xl font-light text-zara-white mb-4">No Videos Available</h2>
          <p className="text-zara-lightgray font-light mb-6">
            This course doesn't have any lesson videos yet. The instructor needs to add videos before you can start learning.
          </p>
          <div className="space-y-3">
            <Link
              to={`/course/${courseId}`}
              className="block px-6 py-3 text-sm font-light tracking-wide uppercase bg-zara-white text-zara-black hover:bg-zara-lightgray transition-colors duration-200"
            >
              Back to Course Details
            </Link>
            <Link
              to="/dashboard"
              className="block px-6 py-3 text-sm font-light tracking-wide uppercase bg-transparent border border-zara-white text-zara-white hover:bg-zara-white hover:text-zara-black transition-colors duration-200"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zara-black text-zara-white">
      {/* Header */}
      <header className="z-40 bg-slate-900/90 backdrop-blur border-b border-slate-700 shadow-lg">
        <div className="px-4 sm:px-6 py-2">
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
                <img src="/level up.png" alt="LevelUp Logo" className="h-10 sm:h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105" />
                <span className="hidden sm:block text-base font-righteous font-semibold"><span className="text-black">Level</span><span className="text-orange-500">Up</span></span>
              </Link>
              <div className="hidden md:block">
                <h1 className="text-base font-semibold text-white">{course.title}</h1>
                <p className="text-xs font-light text-slate-300">
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
          <div className="h-0.5 mt-2 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500"></div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)]">
        {/* Video Player */}
        <div className={`flex-1 flex flex-col transition-all duration-300 overflow-y-auto`}>
          {/* Player Container */}
          <div className="relative bg-black aspect-video">
            {isLocalVideo(currentVideo) ? (
              /* Local uploaded video player */
              <video
                key={currentVideo._id}
                className="w-full h-full"
                controls
                autoPlay
                src={getLocalVideoUrl(currentVideo)}
                onError={(e) => {
                  console.error('Video load error:', e)
                  setError('Failed to load video. Please check if the video file exists.')
                }}
              >
                <source src={getLocalVideoUrl(currentVideo)} type="video/mp4" />
                <source src={getLocalVideoUrl(currentVideo)} type="video/webm" />
                <source src={getLocalVideoUrl(currentVideo)} type="video/ogg" />
                Your browser does not support the video tag.
              </video>
            ) : (
              /* YouTube video player */
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
            )}
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
