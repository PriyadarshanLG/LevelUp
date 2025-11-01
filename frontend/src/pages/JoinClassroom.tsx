import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { classroomAPI } from '../utils/api'
import AppHeader from '../components/AppHeader'
import { LogIn, ArrowLeft, Check } from 'lucide-react'

const JoinClassroom = () => {
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [joinedClassroom, setJoinedClassroom] = useState<any>(null)
  const navigate = useNavigate()

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setPin(value)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (pin.length !== 6) {
      setError('Please enter a valid 6-digit PIN')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const response = await classroomAPI.joinClassroom(pin)
      if (response.success && response.data) {
        setJoinedClassroom(response.data.classroom)
        setPin('')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join classroom')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Join Classroom</h1>
              <p className="text-gray-600 dark:text-gray-400">Enter the PIN provided by your teacher</p>
            </div>
          </div>

          {!joinedClassroom ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Classroom PIN *
                </label>
                <input
                  type="text"
                  id="pin"
                  value={pin}
                  onChange={handlePinChange}
                  required
                  maxLength={6}
                  className="w-full px-6 py-4 text-center text-3xl font-bold tracking-widest border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="000000"
                  autoComplete="off"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Enter the 6-digit PIN shared by your teacher
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading || pin.length !== 6}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? 'Joining...' : 'Join Classroom'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/student-classrooms')}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white ml-4">
                    Successfully Joined!
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Classroom Name</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{joinedClassroom.name}</p>
                  </div>
                  
                  {joinedClassroom.description && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Description</p>
                      <p className="text-gray-700 dark:text-gray-300">{joinedClassroom.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Teacher</p>
                    <p className="text-gray-900 dark:text-white font-medium">{joinedClassroom.teacher.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Students</p>
                    <p className="text-gray-700 dark:text-gray-300">{joinedClassroom.students.length} member{joinedClassroom.students.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setJoinedClassroom(null)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Join Another Classroom
                </button>
                <button
                  onClick={() => navigate('/student-classrooms')}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  View My Classrooms
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JoinClassroom
