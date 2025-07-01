import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import ApperIcon from '@/components/ApperIcon'
import { mockTestService } from '@/services/api/mockTestService'
import { testResultService } from '@/services/api/testResultService'
import { toast } from 'react-toastify'

const TestSession = () => {
  const { testId } = useParams()
  const navigate = useNavigate()
  
  const [test, setTest] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  useEffect(() => {
    loadTest()
  }, [testId])

  useEffect(() => {
    if (test && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [test, timeLeft])

  const loadTest = async () => {
    try {
      setLoading(true)
      setError('')
      
      const testData = await mockTestService.getById(parseInt(testId))
      setTest(testData)
      setTimeLeft(testData.duration * 60) // Convert to seconds
    } catch (err) {
      setError('Failed to load test')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setAnswers({
      ...answers,
      [questionIndex]: answerIndex
    })
  }

  const handleSubmitTest = async () => {
    if (isSubmitting) return
    
    try {
      setIsSubmitting(true)
      
      const score = test.questions.reduce((score, question, index) => {
        return answers[index] === question.correctAnswer ? score + 1 : score
      }, 0)

      const timeTaken = test.duration * 60 - timeLeft // in seconds
      
      const resultData = {
        testId: test.Id,
        score: score,
        totalQuestions: test.questions.length,
        timeTaken: timeTaken,
        completedDate: new Date().toISOString(),
        answers: Object.keys(answers).map(questionIndex => ({
          questionIndex: parseInt(questionIndex),
          selectedAnswer: answers[questionIndex],
          isCorrect: answers[questionIndex] === test.questions[questionIndex].correctAnswer
        }))
      }

      const result = await testResultService.create(resultData)
      
      toast.success('Test submitted successfully!')
      navigate(`/test-results/${result.Id}`)
    } catch (err) {
      toast.error('Failed to submit test')
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    return ((currentQuestion + 1) / test.questions.length) * 100
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadTest} />
  if (!test) return <Error message="Test not found" type="notfound" />

  const question = test.questions[currentQuestion]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Test Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">
              {test.name}
            </h1>
            <p className="text-gray-600 mt-1">
              Question {currentQuestion + 1} of {test.questions.length}
            </p>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-mono font-bold ${
              timeLeft < 300 ? 'text-error' : 'text-gray-900'
            }`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-gray-600">Time remaining</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(getProgress())}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getProgress()}%` }}
              className="h-2 bg-gradient-to-r from-primary to-secondary rounded-full"
            />
          </div>
        </div>
      </Card>

      {/* Question */}
      <Card>
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <h2 className="text-xl font-display font-semibold text-gray-900 mb-6">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleAnswerChange(currentQuestion, index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                  answers[currentQuestion] === index
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion] === index
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion] === index && (
                      <ApperIcon name="Check" size={14} />
                    )}
                  </div>
                  <span className="font-medium text-gray-900">
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </Card>

      {/* Navigation */}
      <Card>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            icon="ChevronLeft"
          >
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Answered: {Object.keys(answers).length} / {test.questions.length}
            </span>
          </div>

          {currentQuestion < test.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              icon="ChevronRight"
              iconPosition="right"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={() => setShowSubmitModal(true)}
              variant="success"
              icon="Check"
            >
              Submit Test
            </Button>
          )}
        </div>
      </Card>

      {/* Question Navigator */}
      <Card>
        <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
          Question Navigator
        </h3>
        
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {test.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                currentQuestion === index
                  ? 'bg-primary text-white'
                  : answers[index] !== undefined
                  ? 'bg-success text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-6 mt-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span className="text-gray-600">Current</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-success rounded"></div>
            <span className="text-gray-600">Answered</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span className="text-gray-600">Not answered</span>
          </div>
        </div>
      </Card>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-display font-semibold mb-4">
              Submit Test?
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Questions:</span>
                <span className="font-medium">{test.questions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Answered:</span>
                <span className="font-medium">{Object.keys(answers).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Unanswered:</span>
                <span className="font-medium text-warning">
                  {test.questions.length - Object.keys(answers).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Time Remaining:</span>
                <span className="font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {test.questions.length - Object.keys(answers).length > 0 && (
              <div className="p-4 bg-warning/10 rounded-lg mb-6">
                <div className="flex items-start space-x-2">
                  <ApperIcon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
                  <p className="text-sm text-gray-700">
                    You have unanswered questions. Are you sure you want to submit?
                  </p>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1"
              >
                Continue Test
              </Button>
              <Button
                onClick={handleSubmitTest}
                loading={isSubmitting}
                variant="success"
                className="flex-1"
              >
                Submit
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default TestSession