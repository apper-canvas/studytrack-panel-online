import { studySessionService } from '@/services/api/studySessionService'
import moment from 'moment'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Achievement milestones
const ACHIEVEMENT_MILESTONES = [3, 7, 14, 30, 60, 100]

const calculateStreakData = (sessions) => {
  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  )

  // Get unique study dates
  const studyDates = [...new Set(
    sortedSessions.map(session => 
      moment(session.date).format('YYYY-MM-DD')
    )
  )].sort((a, b) => new Date(b) - new Date(a))

  // Calculate current streak
  let currentStreak = 0
  const today = moment().format('YYYY-MM-DD')
  const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD')

  // Start from today or yesterday if studied
  let checkDate = studyDates.includes(today) ? today : 
                  studyDates.includes(yesterday) ? yesterday : null

  if (checkDate) {
    let dateToCheck = moment(checkDate)
    
    while (studyDates.includes(dateToCheck.format('YYYY-MM-DD'))) {
      currentStreak++
      dateToCheck = dateToCheck.subtract(1, 'day')
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 0
  let previousDate = null

  for (const dateStr of studyDates.reverse()) {
    const currentDate = moment(dateStr)
    
    if (previousDate === null || currentDate.diff(previousDate, 'days') === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
    
    previousDate = currentDate
  }

  // Get achievements (milestones reached by longest streak)
  const achievements = ACHIEVEMENT_MILESTONES.filter(milestone => 
    longestStreak >= milestone
  )

  // Get activity for last 30 days
  const activityDays = []
  for (let i = 0; i < 30; i++) {
    const date = moment().subtract(i, 'days').format('YYYY-MM-DD')
    if (studyDates.includes(date)) {
      activityDays.push(date)
    }
  }

  return {
    currentStreak,
    longestStreak,
    achievements,
    activityDays: activityDays.reverse() // Return in chronological order
  }
}

export const streakService = {
  async getStreakData() {
    await delay(300)
    
    try {
      // Get all study sessions
      const sessions = await studySessionService.getAll()
      
      // Calculate streak data
      const streakData = calculateStreakData(sessions)
      
      return streakData
    } catch (error) {
      throw new Error('Failed to calculate streak data')
    }
  },

  async getAchievements() {
    await delay(200)
    
    try {
      const streakData = await this.getStreakData()
      return streakData.achievements
    } catch (error) {
      throw new Error('Failed to get achievements')
    }
  },

  async getCurrentStreak() {
    await delay(200)
    
    try {
      const streakData = await this.getStreakData()
      return streakData.currentStreak
    } catch (error) {
      throw new Error('Failed to get current streak')
    }
  },

  // Utility function to check if user studied today
  async hasStudiedToday() {
    await delay(200)
    
    try {
      const sessions = await studySessionService.getAll()
      const today = moment().format('YYYY-MM-DD')
      
      return sessions.some(session => 
        moment(session.date).format('YYYY-MM-DD') === today
      )
    } catch (error) {
      throw new Error('Failed to check today\'s study status')
    }
  }
}