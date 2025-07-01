import React, { useState, useEffect } from 'react'
import Card from '@/components/atoms/Card'
import ApperIcon from '@/components/ApperIcon'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import { streakService } from '@/services/api/streakService'
import moment from 'moment'

const StudyStreakVisualization = () => {
  const [streakData, setStreakData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStreakData()
  }, [])

  const loadStreakData = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await streakService.getStreakData()
      setStreakData(data)
    } catch (err) {
      setError('Failed to load streak data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading type="component" />
  if (error) return <Error message={error} onRetry={loadStreakData} />
  if (!streakData) return null

  const { currentStreak, longestStreak, achievements, activityDays } = streakData

  // Generate calendar grid for last 30 days
  const generateCalendarDays = () => {
    const days = []
    const today = moment()
    
    for (let i = 29; i >= 0; i--) {
      const date = moment().subtract(i, 'days')
      const dateStr = date.format('YYYY-MM-DD')
      const hasActivity = activityDays.includes(dateStr)
      const isToday = date.isSame(today, 'day')
      
      days.push({
        date: dateStr,
        day: date.format('D'),
        hasActivity,
        isToday,
        dayOfWeek: date.format('ddd')
      })
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()

  // Achievement badge configuration
  const achievementLevels = [
    { days: 3, icon: 'Flame', color: 'text-orange-500', name: 'Getting Started' },
    { days: 7, icon: 'Star', color: 'text-yellow-500', name: 'Week Warrior' },
    { days: 14, icon: 'Award', color: 'text-blue-500', name: 'Two Week Champion' },
    { days: 30, icon: 'Crown', color: 'text-purple-500', name: 'Monthly Master' },
    { days: 60, icon: 'Trophy', color: 'text-green-500', name: 'Consistency King' },
    { days: 100, icon: 'Diamond', color: 'text-cyan-500', name: 'Legendary Learner' }
  ]

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-semibold text-gray-900">
            Study Streak
          </h3>
          <div className="flex items-center space-x-2">
            <ApperIcon name="Flame" size={20} className="text-orange-500" />
            <span className="text-sm text-gray-600">Keep it going!</span>
          </div>
        </div>

        {/* Streak Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white">
            <div className="flex items-center justify-center mb-2">
              <ApperIcon name="Flame" size={24} className="text-white" />
            </div>
            <div className="text-3xl font-bold mb-1">{currentStreak}</div>
            <div className="text-sm opacity-90">Current Streak</div>
            <div className="text-xs opacity-75">
              {currentStreak === 1 ? 'day' : 'days'} in a row
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl text-white">
            <div className="flex items-center justify-center mb-2">
              <ApperIcon name="Trophy" size={24} className="text-white" />
            </div>
            <div className="text-3xl font-bold mb-1">{longestStreak}</div>
            <div className="text-sm opacity-90">Longest Streak</div>
            <div className="text-xs opacity-75">Personal best</div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {achievementLevels.map((level) => {
              const isUnlocked = achievements.includes(level.days)
              const isNext = !isUnlocked && level.days <= (currentStreak + 3)
              
              return (
                <div
                  key={level.days}
                  className={`
                    relative p-3 rounded-lg border-2 transition-all duration-200
                    ${isUnlocked 
                      ? 'border-primary bg-primary/5 shadow-sm' 
                      : isNext
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className={`
                      flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full
                      ${isUnlocked ? 'bg-primary/10' : 'bg-gray-200'}
                    `}>
                      <ApperIcon 
                        name={level.icon} 
                        size={16} 
                        className={isUnlocked ? level.color : 'text-gray-400'} 
                      />
                    </div>
                    <div className="text-xs font-medium text-gray-900 mb-1">
                      {level.days} days
                    </div>
                    <div className="text-xs text-gray-600 leading-tight">
                      {level.name}
                    </div>
                  </div>
                  
                  {isUnlocked && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                      <ApperIcon name="Check" size={10} className="text-white" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity Calendar */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Last 30 Days Activity
          </h4>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-10 gap-1 md:gap-2">
            {calendarDays.map((day, index) => (
              <div
                key={day.date}
                className={`
                  relative aspect-square rounded flex items-center justify-center text-xs font-medium
                  transition-all duration-200 hover:scale-110
                  ${day.hasActivity 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-400'
                  }
                  ${day.isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
                `}
                title={`${moment(day.date).format('MMM DD, YYYY')} - ${day.hasActivity ? 'Studied' : 'No activity'}`}
              >
                {day.day}
                {day.hasActivity && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full" />
                )}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-gray-100" />
              <span>No activity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span>Study session</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded border-2 border-primary" />
              <span>Today</span>
            </div>
          </div>
        </div>

        {/* Motivation Message */}
        <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
          <p className="text-gray-700 font-medium">
            {currentStreak === 0 
              ? "Start your study streak today! Every expert was once a beginner." 
              : currentStreak < 7
                ? `Great start! You're ${7 - currentStreak} days away from your Week Warrior badge.`
                : currentStreak < 30
                  ? `Amazing consistency! Keep going to earn your Monthly Master badge.`
                  : "Incredible dedication! You're a true study champion! 🏆"
            }
          </p>
        </div>
      </div>
    </Card>
  )
}

export default StudyStreakVisualization