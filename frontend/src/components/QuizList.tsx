import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, AlertCircle, Play, RotateCcw, Trophy } from 'lucide-react'
import { quizAPI, APIError } from '../utils/api'
import type { Quiz } from '../utils/api'

interface QuizListProps {
  courseId: string
}

const QuizList: React.FC<QuizListProps> = ({ courseId }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadQuizzes()
  }, [courseId])

  const loadQuizzes = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await quizAPI.getCourseQuizzes(courseId)

      if (response.success) {
        setQuizzes(response.data.quizzes)
      }
    } catch (error) {
      console.error('Failed to load quizzes:', error)
      setError(error instanceof APIError ? error.message : 'Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (minutes: number) => {
    if (minutes === 0) return 'Unlimited'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getQuizStatusIcon = (quiz: Quiz) => {
    const userStats = quiz.userStats
    
    if (!userStats) return <Play size={20} className="text-zara-lightgray" />
    
    if (userStats.passed) {
      return <CheckCircle2 size={20} className="text-green-500" />
    } else if (userStats.attempts > 0) {
      return <RotateCcw size={20} className="text-yellow-500" />
    } else {
      return <Play size={20} className="text-zara-lightgray" />
    }
  }

  const getQuizStatusText = (quiz: Quiz) => {
    const userStats = quiz.userStats
    
    if (!userStats) return 'Not started'
    
    if (userStats.passed) {
      return `Passed (${userStats.bestPercentage}%)`
    } else if (userStats.attempts > 0) {
      return `${userStats.attempts} attempt${userStats.attempts > 1 ? 's' : ''} (${userStats.bestPercentage}%)`
    } else {
      return 'Not started'
    }
  }

  const getQuizStatusColor = (quiz: Quiz) => {
    const userStats = quiz.userStats
    
    if (!userStats) return 'text-zara-lightgray'
    
    if (userStats.passed) {
      return 'text-green-500'
    } else if (userStats.attempts > 0) {
      return 'text-yellow-500'
    } else {
      return 'text-zara-lightgray'
    }
  }

  const getActionButton = (quiz: Quiz) => {
    const userStats = quiz.userStats
    
    if (!userStats?.canAttempt) {
      return (
        <div className="px-4 py-2 text-sm font-light text-zara-lightgray border border-zara-lightgray rounded opacity-50">
          Max attempts reached
        </div>
      )
    }

    const buttonText = userStats?.attempts > 0 ? 'Retake' : 'Start Quiz'
    
    return (
      <Link
        to={`/quiz/${quiz._id}/take`}
        className="inline-block px-6 py-3 text-sm font-light tracking-wide uppercase bg-zara-white text-zara-black hover:bg-zara-lightgray transition-colors duration-200"
      >
        {buttonText}
      </Link>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-zara-charcoal p-6 rounded">
            <div className="h-4 bg-zara-gray rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-zara-gray rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 font-light mb-4">{error}</p>
        <button
          onClick={loadQuizzes}
          className="px-6 py-3 text-sm font-light tracking-wide uppercase border border-zara-gray text-zara-white hover:bg-zara-charcoal transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy size={48} className="mx-auto mb-6 text-zara-lightgray opacity-50" />
        <h3 className="text-xl font-light text-zara-white mb-4">No Quizzes Available</h3>
        <p className="text-zara-lightgray font-light">
          No quizzes have been published for this course yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-light text-zara-white">Course Quizzes</h3>
        <span className="text-sm font-light text-zara-lightgray">
          {quizzes.filter(q => q.userStats?.passed).length} of {quizzes.length} passed
        </span>
      </div>

      <div className="space-y-4">
        {quizzes.map((quiz, index) => (
          <div key={quiz._id} className="bg-zara-charcoal border border-zara-gray rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
            {/* Quiz Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    {getQuizStatusIcon(quiz)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-normal text-zara-white mb-2">
                      Quiz {index + 1}: {quiz.title}
                    </h4>
                    <p className="text-sm font-light text-zara-lightgray mb-4 leading-relaxed">
                      {quiz.description}
                    </p>
                  </div>
                </div>
                <div className="ml-6">
                  {getActionButton(quiz)}
                </div>
              </div>

              {/* Quiz Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm font-light text-zara-lightgray mb-1">Questions</div>
                  <div className="text-lg font-light text-zara-white">{quiz.totalQuestions}</div>
                </div>
                <div>
                  <div className="text-sm font-light text-zara-lightgray mb-1">Time Limit</div>
                  <div className="text-lg font-light text-zara-white">{formatTime(quiz.timeLimit)}</div>
                </div>
                <div>
                  <div className="text-sm font-light text-zara-lightgray mb-1">Passing Score</div>
                  <div className="text-lg font-light text-zara-white">{quiz.passingScore}%</div>
                </div>
                <div>
                  <div className="text-sm font-light text-zara-lightgray mb-1">Max Attempts</div>
                  <div className="text-lg font-light text-zara-white">
                    {quiz.maxAttempts === 0 ? 'Unlimited' : quiz.maxAttempts}
                  </div>
                </div>
              </div>

              {/* User Progress */}
              {quiz.userStats && (
                <div className="border-t border-zara-gray pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-light text-zara-lightgray mr-2">Status:</span>
                      <span className={`text-sm font-light ${getQuizStatusColor(quiz)}`}>
                        {getQuizStatusText(quiz)}
                      </span>
                    </div>
                    
                    {quiz.userStats.attempts > 0 && (
                      <Link
                        to={`/quiz/${quiz._id}/results`}
                        className="text-sm font-light text-zara-white hover:text-zara-lightgray transition-colors duration-200"
                      >
                        View Results →
                      </Link>
                    )}
                  </div>

                  {quiz.userStats.passed && (
                    <div className="mt-2 flex items-center text-green-500">
                      <CheckCircle2 size={16} className="mr-2" />
                      <span className="text-sm font-light">
                        Congratulations! You passed this quiz.
                      </span>
                    </div>
                  )}

                  {quiz.userStats.attempts > 0 && !quiz.userStats.passed && quiz.userStats.canAttempt && (
                    <div className="mt-2 flex items-center text-yellow-500">
                      <AlertCircle size={16} className="mr-2" />
                      <span className="text-sm font-light">
                        You can retake this quiz to improve your score.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions Preview */}
              {quiz.instructions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zara-gray">
                  <div className="text-sm font-light text-zara-lightgray mb-2">Instructions:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {quiz.instructions.slice(0, 2).map((instruction, index) => (
                      <li key={index} className="text-sm font-light text-zara-lightgray">
                        {instruction}
                      </li>
                    ))}
                    {quiz.instructions.length > 2 && (
                      <li className="text-sm font-light text-zara-lightgray italic">
                        ... and {quiz.instructions.length - 2} more instructions
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuizList
