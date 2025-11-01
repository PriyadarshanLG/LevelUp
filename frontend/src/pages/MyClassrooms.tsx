import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { classroomAPI, type Classroom } from '../utils/api'
import AppHeader from '../components/AppHeader'
import { Users, Plus, ArrowLeft, Copy, Check, Trash2, Calendar, BookOpen } from 'lucide-react'

const MyClassrooms = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedPin, setCopiedPin] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchClassrooms()
  }, [])

  const fetchClassrooms = async () => {
    try {
      const response = await classroomAPI.getTeacherClassrooms()
      if (response.success && response.data) {
        setClassrooms(response.data.classrooms)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load classrooms')
    } finally {
      setIsLoading(false)
    }
  }

  const copyPin = (pin: string) => {
    navigator.clipboard.writeText(pin)
    setCopiedPin(pin)
    setTimeout(() => setCopiedPin(null), 2000)
  }

  const handleDelete = async (classroomId: string) => {
    try {
      await classroomAPI.deleteClassroom(classroomId)
      setClassrooms(classrooms.filter(c => c._id !== classroomId))
      setDeleteConfirm(null)
    } catch (err: any) {
      setError(err.message || 'Failed to delete classroom')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <button
            onClick={() => navigate('/create-classroom')}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create New Classroom
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Classrooms</h1>
              <p className="text-gray-600 dark:text-gray-400">{classrooms.length} classroom{classrooms.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {classrooms.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No classrooms yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first classroom to get started</p>
              <button
                onClick={() => navigate('/create-classroom')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Create Classroom
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {classrooms.map((classroom) => (
                <div key={classroom._id} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 relative group">
                  <button
                    onClick={() => setDeleteConfirm(classroom._id)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete classroom"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 pr-8">
                    {classroom.name}
                  </h3>
                  
                  {classroom.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {classroom.description}
                    </p>
                  )}

                  <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Classroom PIN</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                        {classroom.pin}
                      </span>
                      <button
                        onClick={() => copyPin(classroom.pin)}
                        className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                        title="Copy PIN"
                      >
                        {copiedPin === classroom.pin ? (
                          <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{classroom.students.length} student{classroom.students.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center text-gray-500 dark:text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-xs">{new Date(classroom.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Link
                    to={`/classroom/${classroom._id}`}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
                  >
                    <BookOpen className="w-4 h-4" />
                    Manage Lessons & Assignments
                  </Link>

                  {classroom.students.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Students:</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {classroom.students.map((student) => (
                          <div key={student._id} className="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs mr-2">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            {student.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {deleteConfirm === classroom._id && (
                    <div className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 rounded-xl p-6 flex flex-col items-center justify-center">
                      <p className="text-center text-gray-900 dark:text-white font-semibold mb-4">
                        Delete this classroom?
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleDelete(classroom._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyClassrooms
