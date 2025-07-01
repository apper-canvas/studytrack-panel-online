import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import ProgressRing from '@/components/atoms/ProgressRing'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import ApperIcon from '@/components/ApperIcon'
import { testResultService } from '@/services/api/testResultService'
import { mockTestService } from '@/services/api/mockTestService'
import { subjectService } from '@/services/api/subjectService'
import { format } from 'date-fns'

const TestResults = () => {
  const { resultId } = useParams()
  const navigate = useNavigate()
  
  const [result, setResult] = useState(null)
  const [test, setTest] = useState(null)
  const [subject, setSubject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAnswers, setShowAnswers] = useState(false)

  useEffect(() => {
    loadResultData()
  }, [resultId])

  const loadResultData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const resultData = await testResultService.getById(parseInt(resultId))
      setResult(resultData)
      
      const testData = await mockTestService.getById(resultData.testId)
      setTest(testData)
      
      const subjectData = await subjectService.getById(testData.subjectId)
      setSubject(subjectData)
    } catch (err) {
      setError('Failed to load test results')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadResultData} />
  if (!result || !test) return <Error message="Results not found" type="notfound" />

  const percentage = Math.round((result.score / result.totalQuestions) * 100)
  const timeInMinutes = Math.round(result.timeTaken / 60)
  
  const getPerformanceLevel = () => {
    if (percentage >= 90) return { level: 'Excellent', color: 'success', icon: 'Star' }
    if (percentage >= 80) return { level: 'Very Good', color: 'success', icon: 'ThumbsUp' }
    if (percentage >= 70) return { level: 'Good', color: 'warning', icon: 'CheckCircle' }
    if (percentage >= 60) return { level: 'Average', color: 'warning', icon: 'Circle' }
    return { level: 'Needs Improvement', color: 'error', icon: 'AlertCircle' }
  }

  const performance = getPerformanceLevel()

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4"
        >
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Test Results
          </h1>
          <p className="text-gray-600">
            {test.name} • {subject?.name || 'Unknown Subject'}
          </p>
        </motion.div>
      </div>

      {/* Score Overview */}
      <Card>
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <ProgressRing
              progress={percentage}
              size={150}
              strokeWidth={10}
              color={
                percentage >= 80 ? '#10B981' :
                percentage >= 60 ? '#F59E0B' : '#EF4444'
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-2">
              {percentage}%
            </h2>
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
              performance.color === 'success' ? 'bg-success/10 text-success' :
              performance.color === 'warning' ? 'bg-warning/10 text-warning' :
              'bg-error/10 text-error'
            }`}>
              <ApperIcon name={performance.icon} size={16} />
              <span className="font-medium">{performance.level}</span>
            </div>
          </motion.div>
        </div>
      </Card>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <ApperIcon name="CheckCircle" size={32} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{result.score}</div>
            <div className="text-gray-600">Correct Answers</div>
            <div className="text-sm text-gray-500 mt-1">
              out of {result.totalQuestions} questions
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-success to-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <ApperIcon name="Clock" size={32} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{timeInMinutes}m</div>
            <div className="text-gray-600">Time Taken</div>
            <div className="text-sm text-gray-500 mt-1">
              {formatTime(result.timeTaken)}
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-warning to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ApperIcon name="Calendar" size={32} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {format(new Date(result.completedDate), 'MMM dd')}
            </div>
            <div className="text-gray-600">Completed On</div>
            <div className="text-sm text-gray-500 mt-1">
              {format(new Date(result.completedDate), 'yyyy')}
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Analysis */}
      <Card>
        <h3 className="text-xl font-display font-semibold text-gray-900 mb-6">
          Performance Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Question Breakdown</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Correct</span>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-success rounded"></div>
                  <span className="font-medium">{result.score}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Incorrect</span>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-error rounded"></div>
                  <span className="font-medium">{result.totalQuestions - result.score}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Accuracy Rate</span>
                <span className="font-medium">{percentage}%</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Time Analysis</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Time</span>
                <span className="font-medium">{formatTime(result.timeTaken)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average per Question</span>
                <span className="font-medium">
                  {formatTime(Math.round(result.timeTaken / result.totalQuestions))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Time Remaining</span>
                <span className="font-medium">
                  {formatTime(test.duration * 60 - result.timeTaken)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-6 p-4 bg-gradient-to-r from-info/10 to-primary/10 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
          <div className="text-sm text-gray-700 space-y-1">
            {percentage >= 90 && (
              <p>• Excellent work! You've mastered this topic. Consider moving to advanced topics.</p>
            )}
            {percentage >= 70 && percentage < 90 && (
              <p>• Good performance! Review the incorrect answers to strengthen your understanding.</p>
            )}
            {percentage < 70 && (
              <p>• Focus on reviewing the fundamental concepts. Practice more questions on this topic.</p>
            )}
            {result.timeTaken < test.duration * 60 * 0.5 && (
              <p>• You completed the test quickly. Consider double-checking your answers next time.</p>
            )}
            {result.timeTaken > test.duration * 60 * 0.9 && (
              <p>• Work on improving your speed while maintaining accuracy.</p>
            )}
          </div>
        </div>
      </Card>

      {/* Answer Review */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-semibold text-gray-900">
            Answer Review
          </h3>
          <Button
            variant="outline"
            onClick={() => setShowAnswers(!showAnswers)}
            icon={showAnswers ? 'ChevronUp' : 'ChevronDown'}
          >
            {showAnswers ? 'Hide' : 'Show'} Answers
          </Button>
        </div>

        {showAnswers && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6"
          >
            {test.questions.map((question, index) => {
              const userAnswer = result.answers.find(a => a.questionIndex === index)
              const isCorrect = userAnswer?.isCorrect || false
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCorrect ? 'bg-success text-white' : 'bg-error text-white'
                    }`}>
                      <ApperIcon name={isCorrect ? 'Check' : 'X'} size={16} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Question {index + 1}
                      </h4>
                      <p className="text-gray-700">{question.question}</p>
                    </div>
                  </div>

                  <div className="ml-11 space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex}
                        className={`p-3 rounded-lg border ${
                          optIndex === question.correctAnswer 
                            ? 'border-success bg-success/5' 
                            : userAnswer?.selectedAnswer === optIndex && !isCorrect
                            ? 'border-error bg-error/5'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span className={
                            optIndex === question.correctAnswer 
                              ? 'text-success font-medium' 
                              : userAnswer?.selectedAnswer === optIndex && !isCorrect
                              ? 'text-error'
                              : 'text-gray-700'
                          }>
                            {option}
                          </span>
                          {optIndex === question.correctAnswer && (
                            <ApperIcon name="Check" size={16} className="text-success" />
                          )}
                          {userAnswer?.selectedAnswer === optIndex && !isCorrect && (
                            <ApperIcon name="X" size={16} className="text-error" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </Card>

      {/* Actions */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate('/mock-tests')}
            variant="outline"
            icon="ArrowLeft"
            className="flex-1"
          >
            Back to Tests
          </Button>
          <Button
            onClick={() => navigate(`/test/${test.Id}`)}
            icon="RotateCcw"
            className="flex-1"
          >
            Retake Test
          </Button>
          <Button
            onClick={() => navigate('/progress')}
            variant="success"
            icon="TrendingUp"
            className="flex-1"
          >
            View Progress
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default TestResults