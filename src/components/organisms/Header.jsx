import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const Header = ({ onTimerStart }) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard'
      case '/subjects':
        return 'Subjects'
      case '/mock-tests':
        return 'Mock Tests'
      case '/progress':
        return 'Progress'
      case '/timer':
        return 'Study Timer'
      default:
        if (location.pathname.startsWith('/subjects/')) {
          return 'Subject Details'
        }
        if (location.pathname.startsWith('/test/')) {
          return 'Test Session'
        }
        return 'StudyTrack Pro'
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleQuickTimer = () => {
    if (onTimerStart) {
      onTimerStart()
    }
    setIsTimerRunning(!isTimerRunning)
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">
            {getPageTitle()}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {formatDate(currentTime)}
          </p>
        </div>

        <div className="flex items-center space-x-6">
          {/* Current Time */}
          <div className="text-right">
            <div className="text-lg font-mono font-semibold text-gray-900">
              {formatTime(currentTime)}
            </div>
            <div className="text-xs text-gray-500">
              Local Time
            </div>
          </div>

          {/* Quick Timer Button */}
          <Button
            variant={isTimerRunning ? 'success' : 'outline'}
            size="small"
            icon={isTimerRunning ? 'Pause' : 'Play'}
            onClick={handleQuickTimer}
          >
            {isTimerRunning ? 'Pause' : 'Quick Timer'}
          </Button>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-primary transition-colors duration-200">
            <ApperIcon name="Bell" size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header