import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { courseAPI, classroomAPI, type Course } from '../utils/api'

const TeacherDashboard = () => {
  const { user } = useAuth()
  const [myCourses, setMyCourses] = useState<Course[]>([])
  const [classroomCount, setClassroomCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        // Fetch published courses and filter by instructor id (client-side)
        const res = await courseAPI.getCourses({ limit: 200 })
        const courses = res.data.courses || []
        const mine = user?._id ? courses.filter(c => c.instructor?.id === user._id) : []
        setMyCourses(mine)

        // Fetch teacher classrooms (if teacher)
        try {
          const cRes = await classroomAPI.getTeacherClassrooms()
          setClassroomCount(cRes.data.count || cRes.data.classrooms?.length || 0)
        } catch {
          // Not a teacher or endpoint restricted; ignore quietly
          setClassroomCount(0)
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load teacher data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?._id])

  if (loading) {
    return (
      <div className="min-h-screen bg-zara-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zara-black mx-auto mb-4"></div>
          <p className="text-zara-gray font-light">Loading teacher panel...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zara-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-zara-black mb-2">Teacher Panel</h2>
          <p className="text-red-600 text-sm">{error}</p>
          <div className="mt-4">
            <Link to="/dashboard" className="underline text-zara-black">Back to Dashboard</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zara-white">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/level up.png" alt="LevelUp" className="h-10 w-auto" />
            <div>
              <h1 className="text-lg font-semibold text-zara-black">Teacher Panel</h1>
              <p className="text-xs text-slate-500">Welcome{user?.name ? `, ${user.name}` : ''}</p>
            </div>
          </div>
          <Link to="/dashboard" className="text-sm underline text-slate-700">Back to Dashboard</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Create Course */}
          <Link to="/admin/courses/new" className="group rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition">
            <h3 className="font-semibold text-zara-black">Create Course</h3>
            <p className="text-sm text-slate-600">Upload thumbnail and preview, set details.</p>
            <div className="mt-3 text-xs text-slate-500">Opens course creator</div>
          </Link>

          {/* My Courses */}
          <Link to="/courses" className="group rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition">
            <h3 className="font-semibold text-zara-black">My Courses</h3>
            <p className="text-sm text-slate-600">Manage your published courses</p>
            <div className="mt-3 text-xs text-slate-500">{myCourses.length} owned</div>
          </Link>

          {/* Classrooms */}
          <Link to="/my-classrooms" className="group rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition">
            <h3 className="font-semibold text-zara-black">My Classrooms</h3>
            <p className="text-sm text-slate-600">Create, manage, and view stats</p>
            <div className="mt-3 text-xs text-slate-500">{classroomCount} classrooms</div>
          </Link>

          {/* Add Video to a Course (instructions) */}
          <Link to="/courses" className="group rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition">
            <h3 className="font-semibold text-zara-black">Add Videos to Course</h3>
            <p className="text-sm text-slate-600">Open a course, then use "Add Video" action</p>
            <div className="mt-3 text-xs text-slate-500">Uses local uploads or YouTube</div>
          </Link>

          {/* Announcements */}
          <Link to="/dashboard" className="group rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition">
            <h3 className="font-semibold text-zara-black">Announcements</h3>
            <p className="text-sm text-slate-600">Post updates for your students</p>
            <div className="mt-3 text-xs text-slate-500">Via dashboard widgets</div>
          </Link>

          {/* Assignments */}
          <Link to="/dashboard" className="group rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition">
            <h3 className="font-semibold text-zara-black">Assignments</h3>
            <p className="text-sm text-slate-600">Create and review submissions</p>
            <div className="mt-3 text-xs text-slate-500">See assignment pages</div>
          </Link>

          {/* Quizzes */}
          <Link to="/dashboard" className="group rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition">
            <h3 className="font-semibold text-zara-black">Quizzes</h3>
            <p className="text-sm text-slate-600">Build quizzes and manage status</p>
            <div className="mt-3 text-xs text-slate-500">Course page → Quizzes</div>
          </Link>

          {/* Reports */}
          <a href="/reports/" target="_blank" className="group rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition">
            <h3 className="font-semibold text-zara-black">Reports</h3>
            <p className="text-sm text-slate-600">Download project/report PDFs</p>
            <div className="mt-3 text-xs text-slate-500">Opens public reports folder</div>
          </a>
        </div>
      </main>
    </div>
  )
}

export default TeacherDashboard
