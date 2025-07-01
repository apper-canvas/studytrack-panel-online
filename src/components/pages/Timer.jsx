import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import ProgressRing from '@/components/atoms/ProgressRing'
import ApperIcon from '@/components/ApperIcon'
import { subjectService } from '@/services/api/subjectService'
import { studySessionService } from '@/services/api/studySessionService'
import { toast } from 'react-toastify'

const Timer = () => {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [customTime, setCustomTime] = useState('25')
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [totalStudyTime, setTotalStudyTime] = useState(0)
  const [startTime, setStartTime] = useState(null)
  
  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  const presetTimes = [
    { label: 'Pomodoro', minutes: 25, icon: 'Clock' },
    { label: 'Short Focus', minutes: 15, icon: 'Zap' },
    { label: 'Deep Work', minutes: 45, icon: 'Brain' },
    { label: 'Quick Review', minutes: 10, icon: 'Eye' }
  ]

  useEffect(() => {
    loadSubjects()
    
    // Create audio context for notification sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgdBznA1/LNeSsFJnnI8N2QQAoUX7Pp6qhVFApGnt/yvmgdBzrC1/LMeSsFJnfH792PQAoUXrPp66hVFApHnt/yv2gdBzrC1/LMeSsFJnfH792QQAoUXrTp6qhWFApHnd/yv2gdBzjC1/LMeSsFJnfH792QQAoUXrTp6qhWFApGnt/yv2gdBzjC1/LMeSwFJnfH8N2QQAoUXrPp66hWFApGnt/yv2gdBzjC1/LNeSsFJnfH8N2QQAkUXrTp6ahVFApGn9/yv2kdBzjC1/LNeSsFJXfH8N2QQAkUXrTp6qhVFApGn9/yv2kdBzjC1/LNeSsFJXfH8N2QQAkUXrTp6qhVFApGn9/yv2kdBzjC1/LNeSsFJXfH8N2QQAkUXrTp6qhVFApGn9/yv2kdBzjC1/LNeSsFJXfH8N2QQAkUXrTp6qhVFApGn9/yv2kdBzjC1/LNeSsFJXfH8N2QQAkUXrTp6qhVFApGn9/yv2kdBzjC1/LNeSsFJXfH8N2QQAkUXrTp6qhVFApGn9/yv2kdBzjC1/LNeSsFJXfH8N2QQAkUXrTp6qhVFApGn9/yv2kdBzjC1/LNeSsFJXfH8N2QQAkUXrTp6qhVFApGn9/yv2kdBzjC1/LNeSsFJXfH8N2QQAkUXrTp6qhVFApGn9/yv2kdBzjC1/LNeSsFJXfH8N2QQAkUXrTp6qhVFApGn9/yv2kdBzjC1/LNeSsFJXfH8N2QQAkUXrTp6qhVFApGn9/yv2kdBzjC1/LNeSsFJXfH8N2QQAkUXrTp6qhVFApGn9/yv2kdBzjC1/LNeSsFJXfH8N2QQAkUXrTp6qhVFApGn9/yv2kdBzjC1/LNeSsFJXfH8N')

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  const loadSubjects = async () => {
    try {
      const data = await subjectService.getAll()
      setSubjects(data)
    } catch (err) {
      toast.error('Failed to load subjects')
    }
  }

  const handleTimerComplete = () => {
    setIsRunning(false)
    
    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(() => {})
    }

    if (!isBreak) {
      // Study session completed
      handleSessionComplete()
      setIsBreak(true)
      setTimeLeft(5 * 60) // 5 minute break
      toast.success('Study session complete! Take a 5-minute break.')
    } else {
      // Break completed
      setIsBreak(false)
      setTimeLeft(parseInt(customTime) * 60)
      toast.success('Break over! Ready for another study session?')
    }
  }

  const handleSessionComplete = async () => {
    if (!selectedSubject || !startTime) return

    try {
      const duration = Math.round((Date.now() - startTime) / 1000 / 60) // minutes
      
      const sessionData = {
        subjectId: parseInt(selectedSubject),
        topicId: selectedTopic ? parseInt(selectedTopic) : null,
        duration: duration,
        date: new Date().toISOString()
      }

      await studySessionService.create(sessionData)
      
      setSessions(prev => prev + 1)
      setTotalStudyTime(prev => prev + duration)
      
      // Update subject last studied date
      const subject = subjects.find(s => s.Id === parseInt(selectedSubject))
      if (subject) {
        await subjectService.update(subject.Id, {
          ...subject,
          lastStudied: new Date().toISOString()
        })
      }
    } catch (err) {
      console.error('Failed to save study session:', err)
    }
  }

  const startTimer = () => {
    setIsRunning(true)
    setStartTime(Date.now())
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsBreak(false)
    setTimeLeft(parseInt(customTime) * 60)
    setStartTime(null)
  }

  const setPresetTime = (minutes) => {
    setCustomTime(minutes.toString())
    setTimeLeft(minutes * 60)
    setIsRunning(false)
    setIsBreak(false)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((parseInt(customTime) * 60 - timeLeft) / (parseInt(customTime) * 60)) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Study Timer
        </h2>
        <p className="text-gray-600">
          Focus on your studies with the Pomodoro technique
        </p>
      </div>

      {/* Main Timer */}
      <div className="flex justify-center">
        <Card className="w-full max-w-md text-center">
          <div className="mb-8">
            <ProgressRing
              progress={isBreak ? 0 : progress}
              size={200}
              strokeWidth={12}
              color={isBreak ? '#F59E0B' : '#4F46E5'}
              showPercentage={false}
            />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {isBreak ? 'Break Time' : 'Study Time'}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              {!isRunning ? (
                <Button
                  onClick={startTimer}
                  size="large"
                  icon="Play"
                  className="px-8"
                >
                  Start
                </Button>
              ) : (
                <Button
                  onClick={pauseTimer}
                  size="large"
                  icon="Pause"
                  variant="warning"
                  className="px-8"
                >
                  Pause
                </Button>
              )}
              
              <Button
                onClick={resetTimer}
                size="large"
                icon="RotateCcw"
                variant="outline"
              >
                Reset
              </Button>
            </div>

            {isBreak && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-warning/10 to-orange-500/10 rounded-lg"
              >
                <div className="flex items-center justify-center space-x-2">
                  <ApperIcon name="Coffee" size={20} className="text-warning" />
                  <span className="font-medium text-gray-900">
                    Take a break! Relax and recharge.
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </div>

      {/* Preset Times */}
      <Card>
        <h3 className="text-xl font-display font-semibold text-gray-900 mb-6">
          Quick Start
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {presetTimes.map(preset => (
            <button
              key={preset.minutes}
              onClick={() => setPresetTime(preset.minutes)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                parseInt(customTime) === preset.minutes
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
            >
              <ApperIcon 
                name={preset.icon} 
                size={24} 
                className={`mx-auto mb-2 ${
                  parseInt(customTime) === preset.minutes ? 'text-primary' : 'text-gray-400'
                }`}
              />
              <div className="font-medium text-gray-900">{preset.label}</div>
              <div className="text-sm text-gray-500">{preset.minutes} min</div>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              label="Custom Time (minutes)"
              type="number"
              value={customTime}
              onChange={(e) => {
                setCustomTime(e.target.value)
                if (!isRunning) {
                  setTimeLeft(parseInt(e.target.value || 0) * 60)
                }
              }}
              min="1"
              max="120"
            />
          </div>
          <Button
            onClick={() => setPresetTime(parseInt(customTime))}
            variant="outline"
            className="mt-8"
          >
            Set Timer
          </Button>
        </div>
      </Card>

      {/* Session Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-display font-semibold text-gray-900 mb-6">
            Study Session Setup
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Subject (Optional)
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors duration-200"
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject.Id} value={subject.Id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Topic/Chapter (Optional)"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              placeholder="e.g. Calculus, Chapter 5"
            />

            <div className="p-4 bg-gradient-to-r from-info/10 to-primary/10 rounded-lg">
              <div className="flex items-start space-x-3">
                <ApperIcon name="Lightbulb" size={20} className="text-info mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">Pro Tips:</p>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Take 5-15 minute breaks between sessions</li>
                    <li>• Stay hydrated and maintain good posture</li>
                    <li>• Remove distractions from your study area</li>
                    <li>• Set specific goals for each session</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Session Stats */}
        <Card>
          <h3 className="text-xl font-display font-semibold text-gray-900 mb-6">
            Today's Progress
          </h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-success/10 to-accent/10 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{sessions}</div>
                <div className="text-sm text-gray-600">Sessions</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(totalStudyTime / 60)}h {totalStudyTime % 60}m
                </div>
                <div className="text-sm text-gray-600">Study Time</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Daily Goal</span>
                <span className="font-medium text-gray-900">2 hours</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((totalStudyTime / 120) * 100, 100)}%` }}
                  className="h-2 bg-gradient-to-r from-success to-accent rounded-full"
                />
              </div>
              
              <div className="text-xs text-gray-500 text-center">
                {Math.round((totalStudyTime / 120) * 100)}% of daily goal completed
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-warning/10 to-orange-500/10 rounded-lg">
              <div className="flex items-center space-x-2">
                <ApperIcon name="Target" size={20} className="text-warning" />
                <div>
                  <p className="font-medium text-gray-900">Keep Going!</p>
                  <p className="text-sm text-gray-600">
                    You're building great study habits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Timer