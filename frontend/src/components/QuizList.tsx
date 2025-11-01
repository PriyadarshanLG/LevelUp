import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
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
          <div key={quiz._id} className="bg-zara-charcoal border border-zara-gray rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-normal text-zara-white mb-2">
                  Quiz {index + 1}: {quiz.title}
                </h4>
                <p className="text-sm font-light text-zara-lightgray leading-relaxed">
                  {quiz.description}
                </p>
              </div>
              <div className="ml-6">
                {getActionButton(quiz)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuizList
