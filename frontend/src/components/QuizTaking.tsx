import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, AlertCircle, CheckCircle2, X, ArrowLeft, ArrowRight } from 'lucide-react'
import { quizAPI, certificateAPI, APIError } from '../utils/api'
import type { Quiz, QuizResult } from '../utils/api'

interface QuizAnswer {
  questionId: string
  selectedOptions: string[]
  textAnswer?: string
}

const QuizTaking: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()

  // Quiz data
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)

  // UI state
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  // Quiz results
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [downloadingCert, setDownloadingCert] = useState(false)

  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (quizId) {
      loadQuiz()
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [quizId])

  // Timer effect
  useEffect(() => {
    if (quiz && timeLeft !== null && timeLeft > 0 && !showResults) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev !== null && prev <= 1) {
            handleAutoSubmit()
            return 0
          }
          return prev !== null ? prev - 1 : null
        })
      }, 1000)

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }, [quiz, timeLeft, showResults])

  const loadQuiz = async () => {
    if (!quizId) return

    try {
      setLoading(true)
      setError(null)

      const response = await quizAPI.getQuiz(quizId)

      if (response.success) {
        const quizData = response.data.quiz
        setQuiz(quizData)
        
        // Initialize timer if quiz has time limit
        if (quizData.timeLimit > 0) {
          setTimeLeft(quizData.timeLimit * 60) // Convert minutes to seconds
        }
        
        setStartTime(new Date())
        
        // Initialize answers array
        const initialAnswers: QuizAnswer[] = quizData.questions.map(question => ({
          questionId: question.id,
          selectedOptions: [],
          textAnswer: ''
        }))
        setAnswers(initialAnswers)
      }
    } catch (error) {
      console.error('Failed to load quiz:', error)
      setError(error instanceof APIError ? error.message : 'Failed to load quiz')
    } finally {
      setLoading(false)
    }
  }

  const updateAnswer = (questionId: string, selectedOptions?: string[], textAnswer?: string) => {
    setAnswers(prev => prev.map(answer => 
      answer.questionId === questionId 
        ? { 
            ...answer, 
            ...(selectedOptions !== undefined && { selectedOptions }),
            ...(textAnswer !== undefined && { textAnswer })
          }
        : answer
    ))
  }

  const handleOptionSelect = (questionId: string, optionId: string, questionType: string) => {
    const currentAnswer = answers.find(a => a.questionId === questionId)
    
    if (questionType === 'multiple_choice') {
      // Multiple selection allowed
      const currentSelections = currentAnswer?.selectedOptions || []
      const newSelections = currentSelections.includes(optionId)
        ? currentSelections.filter(id => id !== optionId)
        : [...currentSelections, optionId]
      
      updateAnswer(questionId, newSelections)
    } else {
      // Single selection only
      updateAnswer(questionId, [optionId])
    }
  }

  const handleTextAnswer = (questionId: string, text: string) => {
    updateAnswer(questionId, undefined, text)
  }

  const getTimeSpent = (): number => {
    if (!startTime) return 0
    return Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
  }

  const handleAutoSubmit = async () => {
    if (submitting) return
    await submitQuiz()
  }

  const submitQuiz = async () => {
    if (!quiz || submitting) return

    try {
      setSubmitting(true)
      setError(null)

      const timeSpent = getTimeSpent()
      const response = await quizAPI.submitQuizAttempt(quiz._id, answers, timeSpent)

      if (response.success) {
        setQuizResult(response.data.result)
        setShowResults(true)
        setShowSubmitConfirm(false)
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error)
      setError(error instanceof APIError ? error.message : 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDownloadCertificate = async () => {
    if (!quiz || !quizResult?.passed) return
    try {
      setDownloadingCert(true)
      // Generate (or reuse existing) certificate
      const genRes = await certificateAPI.generateCertificate(quiz.courseId)
      const certificate = genRes.data.certificate
      // Download the image
      const blob = await certificateAPI.downloadCertificate(certificate._id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${certificate.courseName.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to download certificate:', err)
      alert('Failed to download certificate. Please try again later.')
    } finally {
      setDownloadingCert(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getQuestionProgress = (): { answered: number; total: number } => {
    const answered = answers.filter(answer => 
      answer.selectedOptions.length > 0 || answer.textAnswer?.trim()
    ).length
    return { answered, total: quiz?.questions.length || 0 }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zara-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zara-white mx-auto mb-4"></div>
          <p className="text-zara-white font-light">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-zara-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-zara-white font-light mb-4">{error || 'Quiz not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 text-sm font-light tracking-wide uppercase bg-zara-white text-zara-black hover:bg-zara-lightgray transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (showResults && quizResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        {/* Results Header */}
        <div className="bg-slate-900/90 backdrop-blur border-b border-slate-700 py-6">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-2xl font-semibold mb-2">Quiz Completed</h1>
            <p className="text-slate-300">{quiz.title}</p>
          </div>
        </div>

        {/* Results Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Score Summary */}
          <div className="text-center mb-12">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 shadow-lg ${
              quizResult.passed ? 'bg-emerald-500' : 'bg-rose-500'
            }`}>
              {quizResult.passed ? (
                <CheckCircle2 size={40} className="text-white" />
              ) : (
                <X size={40} className="text-white" />
              )}
            </div>
            
            <h2 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500">
              {quizResult.percentage}%
            </h2>
            
            <p className="text-lg font-medium mb-2">
              {quizResult.passed ? (
                <span className="text-emerald-400">Congratulations! You passed!</span>
              ) : (
                <span className="text-rose-400">You didn't pass this time</span>
              )}
            </p>
            
            <p className="text-slate-300">
              You scored {quizResult.score} out of {quizResult.maxScore} points
            </p>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-900/70 border border-slate-700 p-6 rounded-xl text-center">
              <div className="text-2xl font-semibold mb-2">
                {quizResult.score}/{quizResult.maxScore}
              </div>
              <p className="text-sm text-slate-300">Points Earned</p>
            </div>
            
            <div className="bg-slate-900/70 border border-slate-700 p-6 rounded-xl text-center">
              <div className="text-2xl font-semibold mb-2">
                {formatTime(quizResult.timeSpent)}
              </div>
              <p className="text-sm text-slate-300">Time Spent</p>
            </div>
            
            <div className="bg-slate-900/70 border border-slate-700 p-6 rounded-xl text-center">
              <div className="text-2xl font-semibold mb-2">
                {quiz.passingScore}%
              </div>
              <p className="text-sm text-slate-300">Passing Score</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-3 text-sm font-medium tracking-wide uppercase rounded-lg border border-slate-600 text-white hover:bg-slate-800 transition-colors duration-200"
            >
              Back to Course
            </button>
            
            {quizResult.canRetake && (
              <button
                onClick={() => {
                  setShowResults(false)
                  setQuizResult(null)
                  setCurrentQuestionIndex(0)
                  setStartTime(new Date())
                  
                  if (quiz.timeLimit > 0) {
                    setTimeLeft(quiz.timeLimit * 60)
                  }
                  
                  const initialAnswers: QuizAnswer[] = quiz.questions.map(question => ({
                    questionId: question.id,
                    selectedOptions: [],
                    textAnswer: ''
                  }))
                  setAnswers(initialAnswers)
                }}
                className="px-8 py-3 text-sm font-medium tracking-wide uppercase rounded-lg bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 text-white hover:brightness-110 transition-colors duration-200"
              >
                Retake Quiz
              </button>
            )}

            {quizResult.passed && (
              <button
                onClick={handleDownloadCertificate}
                disabled={downloadingCert}
                className="px-8 py-3 text-sm font-medium tracking-wide uppercase rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors duration-200 disabled:opacity-50"
              >
                {downloadingCert ? 'Preparing...' : 'Download Certificate'}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id)
  const progress = getQuestionProgress()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-zara-white">
      {/* Quiz Header */}
      <div className="bg-slate-900/90 backdrop-blur border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">{quiz.title}</h1>
              <p className="text-sm font-light text-slate-300">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Timer */}
              {timeLeft !== null && (
                <div className={`flex items-center ${timeLeft < 300 ? 'text-rose-400' : 'text-slate-300'}`}>
                  <Clock size={16} className="mr-2" />
                  <span className="font-mono">{formatTime(timeLeft)}</span>
                </div>
              )}
              
              {/* Progress */}
              <div className="text-sm font-light text-slate-300">
                {progress.answered}/{progress.total} answered
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-medium text-white mb-6 leading-relaxed">
            {currentQuestion.question}
          </h2>
          
          <div className="text-sm font-light text-slate-300 mb-8">
            Worth {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
          </div>

          {/* Question Options */}
          <div className="space-y-4">
            {currentQuestion.type === 'fill_in_blank' ? (
              <div>
                <input
                  type="text"
                  value={currentAnswer?.textAnswer || ''}
                  onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 bg-zara-charcoal border border-zara-gray rounded text-zara-white placeholder-zara-lightgray focus:outline-none focus:border-zara-white transition-colors duration-200"
                />
              </div>
            ) : (
              currentQuestion.options.map((option) => {
                const isSelected = currentAnswer?.selectedOptions.includes(option.id) || false
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(currentQuestion.id, option.id, currentQuestion.type)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? 'bg-white text-slate-900 border-transparent shadow'
                        : 'bg-slate-900/70 text-white border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded border-2 mr-4 flex items-center justify-center ${
                        currentQuestion.type === 'multiple_choice' ? 'rounded' : 'rounded-full'
                      } ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900'
                          : 'border-slate-400'
                      }`}>
                        {isSelected && (
                          <div className={`w-2 h-2 ${
                            currentQuestion.type === 'multiple_choice' ? 'rounded' : 'rounded-full'
                          } bg-white`} />
                        )}
                      </div>
                      <span className="font-light">{option.text}</span>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center px-6 py-3 text-sm font-medium tracking-wide uppercase rounded-lg border border-slate-600 text-white hover:bg-slate-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={16} className="mr-2" />
            Previous
          </button>

          <div className="flex space-x-4">
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="px-8 py-3 text-sm font-medium tracking-wide uppercase rounded-lg bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 text-white hover:brightness-110 transition-colors duration-200"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(Math.min(quiz.questions.length - 1, currentQuestionIndex + 1))}
                className="flex items-center px-6 py-3 text-sm font-medium tracking-wide uppercase rounded-lg bg-white text-slate-900 hover:bg-slate-100 transition-colors duration-200"
              >
                Next
                <ArrowRight size={16} className="ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-6">
              <AlertCircle size={24} className="text-amber-400 mr-4" />
              <h3 className="text-lg font-semibold text-white">Submit Quiz?</h3>
            </div>
            
            <p className="text-slate-300 font-light mb-6">
              Are you sure you want to submit your quiz? You have answered {progress.answered} out of {progress.total} questions.
              {progress.answered < progress.total && " You can't change your answers after submitting."}
            </p>
            
            <div className="flex space-x-4">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-3 text-sm font-medium tracking-wide uppercase rounded-lg border border-slate-600 text-white hover:bg-slate-800 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={submitQuiz}
                disabled={submitting}
                className="flex-1 px-4 py-3 text-sm font-medium tracking-wide uppercase rounded-lg bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 text-white hover:brightness-110 transition-colors duration-200 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizTaking
