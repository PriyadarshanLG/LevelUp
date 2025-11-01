import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { classroomAPI, type Classroom } from '../utils/api'
import AppHeader from '../components/AppHeader'
import { Users, Plus, ArrowLeft, GraduationCap, Calendar } from 'lucide-react'

const StudentClassrooms = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchClassrooms()
  }, [])

  const fetchClassrooms = async () => {
    try {
      const response = await classroomAPI.getStudentClassrooms()
      if (response.success && response.data) {
        setClassrooms(response.data.classrooms)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load classrooms')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <AppHeader />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <button
            onClick={() => navigate('/join-classroom')}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Join Classroom
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Classrooms</h1>
              <p className="text-gray-600 dark:text-gray-400">{classrooms.length} classroom{classrooms.length !== 1 ? 's' : ''} joined</p>
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
                <GraduationCap className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No classrooms yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Join a classroom using the PIN from your teacher</p>
              <button
                onClick={() => navigate('/join-classroom')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Join Classroom
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {classrooms.map((classroom) => (
                <div 
                  key={classroom._id} 
                  onClick={() => navigate(`/classroom/${classroom._id}`)}
                  className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-blue-200 dark:border-blue-900 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105 transform"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {classroom.name}
                  </h3>
                  
                  {classroom.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {classroom.description}
                    </p>
                  )}

                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Teacher</p>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-2">
                        {classroom.teacher.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {classroom.teacher.name}
                      </span>
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

                  {classroom.students.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-900">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Classmates:</p>
                      <div className="flex flex-wrap gap-2">
                        {classroom.students.slice(0, 5).map((student) => (
                          <div 
                            key={student._id} 
                            className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                            title={student.name}
                          >
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {classroom.students.length > 5 && (
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 text-xs font-semibold">
                            +{classroom.students.length - 5}
                          </div>
                        )}
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

export default StudentClassrooms
