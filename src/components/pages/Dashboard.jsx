import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StatsCard from '@/components/molecules/StatsCard'
import SubjectCard from '@/components/molecules/SubjectCard'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import { subjectService } from '@/services/api/subjectService'
import { testResultService } from '@/services/api/testResultService'
import { studySessionService } from '@/services/api/studySessionService'
import { format } from 'date-fns'

const Dashboard = () => {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [recentResults, setRecentResults] = useState([])
  const [recentSessions, setRecentSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [subjectsData, resultsData, sessionsData] = await Promise.all([
        subjectService.getAll(),
        testResultService.getAll(),
        studySessionService.getAll()
      ])
      
      setSubjects(subjectsData)
      setRecentResults(resultsData.slice(0, 5))
      setRecentSessions(sessionsData.slice(0, 5))
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading type="dashboard" />
  if (error) return <Error message={error} onRetry={loadDashboardData} />

  const totalTopics = subjects.reduce((sum, subject) => sum + subject.totalTopics, 0)
  const completedTopics = subjects.reduce((sum, subject) => sum + subject.completedTopics, 0)
  const overallProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0

  const totalStudyTime = recentSessions.reduce((sum, session) => sum + session.duration, 0)
  const averageScore = recentResults.length > 0 
    ? recentResults.reduce((sum, result) => sum + (result.score / result.totalQuestions) * 100, 0) / recentResults.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white">
        <h2 className="text-2xl font-display font-bold mb-2">
          Welcome back! Ready to study?
        </h2>
        <p className="text-white/90 mb-4">
          Track your progress, take mock tests, and achieve your goals.
        </p>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/timer')}
          icon="Play"
        >
          Start Study Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Overall Progress"
          value={`${Math.round(overallProgress)}%`}
          icon="Target"
          color="primary"
          subtitle={`${completedTopics} of ${totalTopics} topics`}
        />
        <StatsCard
          title="Study Time"
          value={`${Math.round(totalStudyTime / 60)}h`}
          icon="Clock"
          color="success"
          subtitle="This week"
        />
        <StatsCard
          title="Average Score"
          value={`${Math.round(averageScore)}%`}
          icon="Award"
          color="warning"
          subtitle="Recent tests"
        />
        <StatsCard
          title="Active Subjects"
          value={subjects.length}
          icon="BookOpen"
          color="info"
          subtitle="Currently studying"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Subjects */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-semibold text-gray-900">
              Your Subjects
            </h3>
            <Button 
              variant="outline" 
              size="small" 
              onClick={() => navigate('/subjects')}
            >
              View All
            </Button>
          </div>

          {subjects.length === 0 ? (
            <Empty
              type="subjects"
              action={() => navigate('/subjects')}
            />
          ) : (
            <div className="space-y-4">
              {subjects.slice(0, 3).map(subject => (
                <div 
                  key={subject.Id} 
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => navigate(`/subjects/${subject.Id}`)}
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: subject.color }}
                  >
                    {subject.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{subject.name}</h4>
                    <p className="text-sm text-gray-500">
                      {subject.completedTopics} of {subject.totalTopics} topics completed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {Math.round((subject.completedTopics / subject.totalTopics) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Test Results */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-semibold text-gray-900">
              Recent Test Results
            </h3>
            <Button 
              variant="outline" 
              size="small" 
              onClick={() => navigate('/mock-tests')}
            >
              Take Test
            </Button>
          </div>

          {recentResults.length === 0 ? (
            <Empty
              type="results"
              action={() => navigate('/mock-tests')}
            />
          ) : (
            <div className="space-y-3">
              {recentResults.map(result => {
                const percentage = Math.round((result.score / result.totalQuestions) * 100)
                return (
                  <div key={result.Id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        percentage >= 80 ? 'bg-success' : 
                        percentage >= 60 ? 'bg-warning' : 'bg-error'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">Test #{result.Id}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(result.completedDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{percentage}%</div>
                      <div className="text-sm text-gray-500">
                        {result.score}/{result.totalQuestions}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-xl font-display font-semibold text-gray-900 mb-6">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/subjects')}
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200"
          >
            <ApperIcon name="Plus" size={20} className="text-primary" />
            <span className="font-medium text-gray-900">Add Subject</span>
          </button>
          
          <button
            onClick={() => navigate('/mock-tests')}
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200"
          >
            <ApperIcon name="FileText" size={20} className="text-primary" />
            <span className="font-medium text-gray-900">Create Test</span>
          </button>
          
          <button
            onClick={() => navigate('/timer')}
            className="flex items-center space-x-3 p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all duration-200"
          >
            <ApperIcon name="Play" size={20} className="text-primary" />
            <span className="font-medium text-gray-900">Start Timer</span>
          </button>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard