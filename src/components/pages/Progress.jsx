import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Card from '@/components/atoms/Card'
import StatsCard from '@/components/molecules/StatsCard'
import ProgressRing from '@/components/atoms/ProgressRing'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import ApperIcon from '@/components/ApperIcon'
import { subjectService } from '@/services/api/subjectService'
import { testResultService } from '@/services/api/testResultService'
import { studySessionService } from '@/services/api/studySessionService'
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns'

const Progress = () => {
  const [subjects, setSubjects] = useState([])
  const [results, setResults] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeFrame, setTimeFrame] = useState('week')

  useEffect(() => {
    loadProgressData()
  }, [])

  const loadProgressData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [subjectsData, resultsData, sessionsData] = await Promise.all([
        subjectService.getAll(),
        testResultService.getAll(),
        studySessionService.getAll()
      ])
      
      setSubjects(subjectsData)
      setResults(resultsData)
      setSessions(sessionsData)
    } catch (err) {
      setError('Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading type="dashboard" />
  if (error) return <Error message={error} onRetry={loadProgressData} />

  // Calculate overall stats
  const totalTopics = subjects.reduce((sum, subject) => sum + subject.totalTopics, 0)
  const completedTopics = subjects.reduce((sum, subject) => sum + subject.completedTopics, 0)
  const overallProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0

  const totalStudyTime = sessions.reduce((sum, session) => sum + session.duration, 0)
  const averageScore = results.length > 0 
    ? results.reduce((sum, result) => sum + (result.score / result.totalQuestions) * 100, 0) / results.length 
    : 0

  // Get recent data based on timeframe
  const getRecentData = (data, dateField) => {
    const now = new Date()
    const cutoff = timeFrame === 'week' 
      ? startOfWeek(now) 
      : subDays(now, timeFrame === 'month' ? 30 : 7)
    
    return data.filter(item => new Date(item[dateField]) >= cutoff)
  }

  const recentResults = getRecentData(results, 'completedDate')
  const recentSessions = getRecentData(sessions, 'date')

  // Calculate streak
  const calculateStreak = () => {
    const today = new Date()
    let streak = 0
    
    for (let i = 0; i < 30; i++) {
      const checkDate = subDays(today, i)
      const hasActivity = sessions.some(session => 
        format(new Date(session.date), 'yyyy-MM-dd') === format(checkDate, 'yyyy-MM-dd')
      )
      
      if (hasActivity) {
        streak++
      } else if (i > 0) {
        break
      }
    }
    
    return streak
  }

  const studyStreak = calculateStreak()

  // Weekly study data for chart
  const getWeeklyStudyData = () => {
    const weekStart = startOfWeek(new Date())
    const weekData = []
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(date.getDate() + i)
      
      const dayTotal = sessions
        .filter(session => 
          format(new Date(session.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )
        .reduce((sum, session) => sum + session.duration, 0)
      
      weekData.push({
        day: format(date, 'EEE'),
        minutes: dayTotal
      })
    }
    
    return weekData
  }

  const weeklyData = getWeeklyStudyData()
  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">
            Progress Overview
          </h2>
          <p className="text-gray-600 mt-1">
            Track your study progress and performance
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {['week', 'month'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeFrame(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                timeFrame === period
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
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
          subtitle="Total recorded"
        />
        <StatsCard
          title="Average Score"
          value={`${Math.round(averageScore)}%`}
          icon="Award"
          color="warning"
          subtitle="All tests"
        />
        <StatsCard
          title="Study Streak"
          value={`${studyStreak} days`}
          icon="Flame"
          color="info"
          subtitle="Keep it up!"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Progress */}
        <Card>
          <h3 className="text-xl font-display font-semibold text-gray-900 mb-6">
            Subject Progress
          </h3>
          
          <div className="space-y-6">
            {subjects.map(subject => {
              const progress = subject.totalTopics > 0 
                ? (subject.completedTopics / subject.totalTopics) * 100 
                : 0
              
              return (
                <motion.div
                  key={subject.Id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-4"
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: subject.color }}
                  >
                    {subject.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{subject.name}</h4>
                      <span className="text-sm font-semibold text-gray-600">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-2 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {subject.completedTopics} of {subject.totalTopics} topics
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Card>

        {/* Weekly Study Chart */}
        <Card>
          <h3 className="text-xl font-display font-semibold text-gray-900 mb-6">
            Weekly Study Time
          </h3>
          
          <div className="space-y-4">
            {weeklyData.map((day, index) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4"
              >
                <div className="w-12 text-sm font-medium text-gray-600">
                  {day.day}
                </div>
                
                <div className="flex-1 bg-gray-200 rounded-full h-3 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: maxMinutes > 0 ? `${(day.minutes / maxMinutes) * 100}%` : '0%' 
                    }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
                    className="h-3 bg-gradient-to-r from-success to-accent rounded-full"
                  />
                </div>
                
                <div className="w-16 text-sm font-medium text-gray-900 text-right">
                  {Math.round(day.minutes)}m
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-success/10 to-accent/10 rounded-lg">
            <div className="flex items-center space-x-2">
              <ApperIcon name="TrendingUp" size={20} className="text-success" />
              <span className="font-medium text-gray-900">
                Total this week: {Math.round(weeklyData.reduce((sum, day) => sum + day.minutes, 0) / 60)}h {weeklyData.reduce((sum, day) => sum + day.minutes, 0) % 60}m
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Test Results */}
        <Card>
          <h3 className="text-xl font-display font-semibold text-gray-900 mb-6">
            Recent Test Results
          </h3>
          
          {recentResults.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="FileText" size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent test results</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentResults.slice(0, 5).map(result => {
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

        {/* Achievement Summary */}
        <Card>
          <h3 className="text-xl font-display font-semibold text-gray-900 mb-6">
            Achievements
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                <ApperIcon name="Target" size={24} className="text-white" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Study Consistency</h4>
                <p className="text-sm text-gray-600">
                  {studyStreak} day streak - Keep going!
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-success/10 to-accent/10 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-success to-accent rounded-full flex items-center justify-center">
                <ApperIcon name="Award" size={24} className="text-white" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Topics Mastered</h4>
                <p className="text-sm text-gray-600">
                  {completedTopics} topics completed successfully
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-warning/10 to-orange-500/10 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-warning to-orange-500 rounded-full flex items-center justify-center">
                <ApperIcon name="Clock" size={24} className="text-white" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Study Hours</h4>
                <p className="text-sm text-gray-600">
                  {Math.round(totalStudyTime / 60)} hours of focused studying
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Progress