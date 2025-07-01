import React, { useState, useEffect } from 'react'
import Calendar from 'react-calendar'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import { studySessionService } from '@/services/api/studySessionService'
import 'react-calendar/dist/Calendar.css'

const CalendarWidget = ({ isCollapsed }) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showScheduler, setShowScheduler] = useState(false)
  const [showReminder, setShowReminder] = useState(false)
  const [upcomingEvents, setUpcomingEvents] = useState({ sessions: [], reminders: [] })
  const [loading, setLoading] = useState(false)
  const [schedulerData, setSchedulerData] = useState({
    subjectId: '',
    duration: 30,
    title: ''
  })
  const [reminderData, setReminderData] = useState({
    title: '',
    type: 'test',
    subjectId: '',
    reminderTime: ''
  })

  const subjects = [
    { Id: 1, name: 'Mathematics' },
    { Id: 2, name: 'Physics' },
    { Id: 3, name: 'Chemistry' }
  ]

  useEffect(() => {
    fetchUpcomingEvents()
  }, [])

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true)
      const events = await studySessionService.getUpcomingEvents(7)
      setUpcomingEvents(events)
    } catch (error) {
      toast.error('Failed to load upcoming events')
    } finally {
      setLoading(false)
    }
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
    if (!isCollapsed) {
      setShowScheduler(true)
    }
  }

  const handleScheduleStudySession = async (e) => {
    e.preventDefault()
    try {
      const sessionData = {
        subjectId: parseInt(schedulerData.subjectId),
        duration: parseInt(schedulerData.duration),
        date: selectedDate.toISOString(),
        title: schedulerData.title || 'Study Session'
      }

      await studySessionService.create(sessionData)
      toast.success('Study session scheduled successfully!')
      setShowScheduler(false)
      setSchedulerData({ subjectId: '', duration: 30, title: '' })
      fetchUpcomingEvents()
    } catch (error) {
      toast.error('Failed to schedule study session')
    }
  }

  const handleCreateReminder = async (e) => {
    e.preventDefault()
    try {
      const reminder = {
        title: reminderData.title,
        type: reminderData.type,
        subjectId: parseInt(reminderData.subjectId),
        date: selectedDate.toISOString(),
        reminderTime: new Date(selectedDate.getTime() - 30 * 60 * 1000).toISOString()
      }

      await studySessionService.createReminder(reminder)
      toast.success('Reminder created successfully!')
      setShowReminder(false)
      setReminderData({ title: '', type: 'test', subjectId: '', reminderTime: '' })
      fetchUpcomingEvents()
    } catch (error) {
      toast.error('Failed to create reminder')
    }
  }

  const hasEventsOnDate = (date) => {
    const dateStr = date.toDateString()
    return upcomingEvents.sessions.some(s => new Date(s.date).toDateString() === dateStr) ||
           upcomingEvents.reminders.some(r => new Date(r.date).toDateString() === dateStr)
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (isCollapsed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/10 rounded-lg p-2"
      >
        <div className="flex flex-col items-center space-y-2">
          <ApperIcon name="Calendar" size={20} className="text-white/70" />
          <div className="text-xs text-white/70 font-medium">
            {selectedDate.getDate()}
          </div>
          <div className="text-xs text-white/50">
            {selectedDate.toLocaleDateString('en-US', { month: 'short' })}
          </div>
          {(upcomingEvents.sessions.length > 0 || upcomingEvents.reminders.length > 0) && (
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="bg-white/10 rounded-lg p-3 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ApperIcon name="Calendar" size={16} className="text-white" />
          <span className="text-sm font-medium text-white">Calendar</span>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => setShowScheduler(true)}
            className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Schedule Study Session"
          >
            <ApperIcon name="Plus" size={14} />
          </button>
          <button
            onClick={() => setShowReminder(true)}
            className="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Create Reminder"
          >
            <ApperIcon name="Bell" size={14} />
          </button>
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="text-xs">
        <Calendar
          onChange={handleDateClick}
          value={selectedDate}
          className="react-calendar-custom"
          tileClassName={({ date }) => 
            hasEventsOnDate(date) ? 'has-events' : null
          }
          formatShortWeekday={(locale, date) => 
            date.toLocaleDateString('en-US', { weekday: 'narrow' })
          }
          showNeighboringMonth={false}
          prev2Label={null}
          next2Label={null}
        />
      </div>

      {/* Upcoming Events */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-white/90">Upcoming</div>
        <div className="max-h-24 overflow-y-auto space-y-1">
          {loading ? (
            <div className="text-xs text-white/60">Loading...</div>
          ) : (
            <>
              {upcomingEvents.sessions.slice(0, 3).map(session => (
                <div key={`session-${session.Id}`} className="flex items-center space-x-2 text-xs text-white/80">
                  <ApperIcon name="BookOpen" size={10} />
                  <div className="flex-1 truncate">
                    <div className="truncate">{session.title || 'Study Session'}</div>
                    <div className="text-white/60">{formatDate(session.date)} • {formatTime(session.date)}</div>
                  </div>
                </div>
              ))}
              {upcomingEvents.reminders.slice(0, 3).map(reminder => (
                <div key={`reminder-${reminder.Id}`} className="flex items-center space-x-2 text-xs text-white/80">
                  <ApperIcon name="Bell" size={10} />
                  <div className="flex-1 truncate">
                    <div className="truncate">{reminder.title}</div>
                    <div className="text-white/60">{formatDate(reminder.date)} • {formatTime(reminder.date)}</div>
                  </div>
                </div>
              ))}
              {upcomingEvents.sessions.length === 0 && upcomingEvents.reminders.length === 0 && (
                <div className="text-xs text-white/60">No upcoming events</div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Schedule Study Session Modal */}
      <AnimatePresence>
        {showScheduler && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowScheduler(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-80 mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Schedule Study Session</h3>
                <button
                  onClick={() => setShowScheduler(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>
              
              <form onSubmit={handleScheduleStudySession} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <div className="text-sm text-gray-600">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={schedulerData.title}
                    onChange={(e) => setSchedulerData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Study Session"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    value={schedulerData.subjectId}
                    onChange={(e) => setSchedulerData(prev => ({ ...prev, subjectId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject.Id} value={subject.Id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={schedulerData.duration}
                    onChange={(e) => setSchedulerData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="15"
                    max="180"
                    step="15"
                    required
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowScheduler(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Reminder Modal */}
      <AnimatePresence>
        {showReminder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowReminder(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-80 mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create Reminder</h3>
                <button
                  onClick={() => setShowReminder(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreateReminder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <div className="text-sm text-gray-600">
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={reminderData.title}
                    onChange={(e) => setReminderData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Test Reminder"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={reminderData.type}
                    onChange={(e) => setReminderData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="test">Test</option>
                    <option value="study">Study</option>
                    <option value="assignment">Assignment</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    value={reminderData.subjectId}
                    onChange={(e) => setReminderData(prev => ({ ...prev, subjectId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject.Id} value={subject.Id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReminder(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .react-calendar-custom {
          background: transparent !important;
          border: none !important;
          color: white !important;
          font-size: 10px !important;
        }
        
        .react-calendar-custom .react-calendar__navigation {
          margin-bottom: 8px !important;
        }
        
        .react-calendar-custom .react-calendar__navigation button {
          color: white !important;
          background: transparent !important;
          border: none !important;
          font-size: 12px !important;
          padding: 4px !important;
        }
        
        .react-calendar-custom .react-calendar__navigation button:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-radius: 4px !important;
        }
        
        .react-calendar-custom .react-calendar__month-view__weekdays {
          color: rgba(255, 255, 255, 0.7) !important;
          font-size: 9px !important;
        }
        
        .react-calendar-custom .react-calendar__tile {
          background: transparent !important;
          color: rgba(255, 255, 255, 0.8) !important;
          border: none !important;
          font-size: 9px !important;
          padding: 2px !important;
          height: 20px !important;
        }
        
        .react-calendar-custom .react-calendar__tile:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-radius: 4px !important;
        }
        
        .react-calendar-custom .react-calendar__tile--active {
          background: rgba(255, 255, 255, 0.2) !important;
          color: white !important;
          border-radius: 4px !important;
        }
        
        .react-calendar-custom .react-calendar__tile.has-events {
          background: rgba(255, 193, 7, 0.3) !important;
          border-radius: 4px !important;
        }
        
        .react-calendar-custom .react-calendar__tile--now {
          background: rgba(255, 255, 255, 0.15) !important;
          border-radius: 4px !important;
        }
      `}</style>
    </motion.div>
  )
}

export default CalendarWidget