import React, { useMemo, useState, useEffect } from 'react'
import { chatbotAPI } from '../utils/api'

// Simple quiz types
export type QuizDifficulty = 'easy' | 'intermediate' | 'advanced'

type QuizOption = {
  id: string
  text: string
}

type QuizQuestion = {
  id: string
  question: string
  options: QuizOption[]
  correctOptionId: string
  explanation?: string
}

type AIQuizModalProps = {
  isOpen: boolean
  onClose: () => void
}

// Very lightweight quiz generator that creates topic-themed questions client-side
function generateQuiz(topic: string, difficulty: QuizDifficulty, numQuestions: number = 5, seedSalt: string = ''): QuizQuestion[] {
  const seed = `${topic}:${difficulty}:${seedSalt}`
  const rng = mulberry32(hashString(seed))

  const difficultyPhrasing: Record<QuizDifficulty, string[]> = {
    easy: [
      `basic idea of`,
      `primary goal of`,
      `simple definition of`,
      `common use of`,
      `main benefit of`
    ],
    intermediate: [
      `key principle behind`,
      `difference between concepts in`,
      `best practice for`,
      `typical workflow in`,
      `important trade-off in`
    ],
    advanced: [
      `edge case consideration in`,
      `time/space complexity aspect of`,
      `optimization strategy for`,
      `security implication of`,
      `scalability concern with`
    ],
  }

  const optionsTemplates = [
    `Is closely related to`,
    `Is the opposite of`,
    `Is an example of`,
    `Is not related to`,
  ]

  const questions: QuizQuestion[] = []

  for (let i = 0; i < numQuestions; i++) {
    const phraseSet = difficultyPhrasing[difficulty]
    const phrase = phraseSet[Math.floor(rng() * phraseSet.length)]

    const qText = `What is the ${phrase} ${topic}?`

    // Build four options and pick one as correct deterministically
    const shuffled = shuffleArray(optionsTemplates.slice(), rng)
    const correctIndex = Math.floor(rng() * 4)

    const opts = new Array(4).fill(0).map((_, idx) => {
      const isCorrect = idx === correctIndex
      const base = shuffled[idx % shuffled.length]
      const text = isCorrect
        ? `${base} ${topic}`
        : `${base} ${topic} (distractor)`
      return {
        id: `${i}-${idx}`,
        text
      }
    })

    questions.push({
      id: `q-${i}`,
      question: qText,
      options: opts,
      correctOptionId: `${i}-${correctIndex}`
    })
  }

  return questions
}

// Deterministic PRNG helpers for stable quizzes per (topic, difficulty)
function hashString(input: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(a: number) {
  return function() {
    let t = (a += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
  return arr
}

const AIQuizModal: React.FC<AIQuizModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('easy')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [score, setScore] = useState<number | null>(null)
  const [openSalt, setOpenSalt] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      // Reset all state when modal opens and generate a fresh salt
      setStep(1)
      setTopic('')
      setDifficulty('easy')
      setQuestions([])
      setAnswers({})
      setScore(null)
      setOpenSalt(`${Date.now()}-${Math.random()}`)
    }
  }, [isOpen])

  const canStart = useMemo(() => topic.trim().length >= 3, [topic])

  const [isLoading, setIsLoading] = useState(false)

  const startQuiz = async () => {
    setIsLoading(true)
    try {
      // Prefer backend concept-aware generation; fallback to local if unavailable
      const resp = await chatbotAPI.generateQuiz({ topic: topic.trim(), difficulty, numQuestions: 12 })
      if (resp?.success && resp.data?.questions?.length) {
        setQuestions(resp.data.questions as any)
      } else {
        const qs = generateQuiz(topic.trim(), difficulty, 12, openSalt)
        setQuestions(qs)
      }
    } catch (err) {
      console.error('AI quiz generation failed, using local generator.', err)
      const qs = generateQuiz(topic.trim(), difficulty, 12, openSalt)
      setQuestions(qs)
    } finally {
      setAnswers({})
      setScore(null)
      setStep(3)
      setIsLoading(false)
    }
  }

  const submit = () => {
    let s = 0
    for (const q of questions) {
      if (answers[q.id] === q.correctOptionId) s++
    }
    setScore(s)
    setStep(4)
  }

  const reset = () => {
    setStep(1)
    setTopic('')
    setDifficulty('easy')
    setQuestions([])
    setAnswers({})
    setScore(null)
    setOpenSalt(`${Date.now()}-${Math.random()}`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg mx-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Quiz</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">×</button>
        </div>

        <div className="p-5">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-gray-600 dark:text-gray-300">Enter any topic to generate a quiz.</p>
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g., Sorting Algorithms"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <div className="flex justify-end">
                <button
                  disabled={!canStart}
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-sm text-gray-600 dark:text-gray-300">Choose difficulty:</p>
              <div className="grid grid-cols-3 gap-3">
                {(['easy','intermediate','advanced'] as QuizDifficulty[]).map(level => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-3 py-2 rounded-lg border text-sm ${difficulty === level ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200'}`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700">Back</button>
                <button onClick={startQuiz} disabled={isLoading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50">{isLoading ? 'Generating...' : 'Start'}</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-slide-up">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Topic: <span className="text-indigo-600">{topic}</span></h4>
                <span className="text-xs px-2 py-1 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">{difficulty}</span>
              </div>
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {questions.map((q, idx) => (
                  <div key={q.id} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {idx + 1}. {q.question}
                    </div>
                    <div className="grid gap-2">
                      {q.options.map(opt => (
                        <label key={opt.id} className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer ${answers[q.id] === opt.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-800'}`}>
                          <input
                            type="radio"
                            name={q.id}
                            checked={answers[q.id] === opt.id}
                            onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                          />
                          <span className="text-sm text-gray-800 dark:text-gray-200">{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700">Back</button>
                <button onClick={submit} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Submit</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">Score: {score} / {questions.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Great job! Review your answers below.</div>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {questions.map((q, idx) => (
                  <div key={q.id} className="border border-gray-200 dark:border-gray-800 rounded-xl p-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {idx + 1}. {q.question}
                    </div>
                    <ul className="space-y-2">
                      {q.options.map(opt => {
                        const isChosen = answers[q.id] === opt.id
                        const isCorrect = q.correctOptionId === opt.id
                        return (
                          <li key={opt.id} className={`text-sm rounded-lg p-2 border ${isCorrect ? 'border-green-400 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300' : isChosen ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300' : 'border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200'}`}>
                            {opt.text}
                          </li>
                        )
                      })}
                    </ul>
                    {q.explanation && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                        Explanation: {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button onClick={reset} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700">New Quiz</button>
                <button onClick={onClose} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIQuizModal
