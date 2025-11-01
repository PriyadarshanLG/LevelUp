import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { classroomAPI } from '../utils/api'
import AppHeader from '../components/AppHeader'
import { Plus, ArrowLeft, Copy, Check } from 'lucide-react'

const CreateClassroom = () => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [createdClassroom, setCreatedClassroom] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await classroomAPI.createClassroom(name, description)
      if (response.success && response.data) {
        setCreatedClassroom(response.data.classroom)
        setName('')
        setDescription('')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create classroom')
    } finally {
      setIsLoading(false)
    }
  }

  const copyPin = () => {
    if (createdClassroom?.pin) {
      navigator.clipboard.writeText(createdClassroom.pin)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Classroom</h1>
              <p className="text-gray-600 dark:text-gray-400">Set up a new classroom for your students</p>
            </div>
          </div>

          {!createdClassroom ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Classroom Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Mathematics 101"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add a description about this classroom..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? 'Creating...' : 'Create Classroom'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/my-classrooms')}
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
                    Classroom Created Successfully!
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Classroom Name</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{createdClassroom.name}</p>
                  </div>
                  
                  {createdClassroom.description && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Description</p>
                      <p className="text-gray-700 dark:text-gray-300">{createdClassroom.description}</p>
                    </div>
                  )}
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-dashed border-indigo-300 dark:border-indigo-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Classroom PIN</p>
                    <div className="flex items-center justify-between">
                      <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                        {createdClassroom.pin}
                      </p>
                      <button
                        onClick={copyPin}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy PIN
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Share this PIN with your students so they can join your classroom
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCreatedClassroom(null)}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Create Another Classroom
                </button>
                <button
                  onClick={() => navigate('/my-classrooms')}
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

export default CreateClassroom
