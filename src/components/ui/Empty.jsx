import React from 'react'
import ApperIcon from '@/components/ApperIcon'

const Empty = ({ 
  title = "No data found", 
  message = "Get started by adding your first item", 
  action,
  actionText = "Add Item",
  icon = "Plus",
  type = 'default' 
}) => {
  const getEmptyContent = () => {
    switch (type) {
      case 'subjects':
        return {
          icon: 'BookOpen',
          title: 'No subjects yet',
          message: 'Start your study journey by adding your first subject. Organize your syllabus and track your progress effectively.',
          actionText: 'Add Subject',
          gradient: 'from-primary/10 to-secondary/5'
        }
      case 'tests':
        return {
          icon: 'FileText',
          title: 'No mock tests available',
          message: 'Create your first mock test to practice and assess your knowledge. Build confidence for your exams.',
          actionText: 'Create Test',
          gradient: 'from-accent/10 to-primary/5'
        }
      case 'topics':
        return {
          icon: 'CheckSquare',
          title: 'No topics added',
          message: 'Break down your syllabus into manageable topics. Track completion and stay organized.',
          actionText: 'Add Topics',
          gradient: 'from-success/10 to-accent/5'
        }
      case 'results':
        return {
          icon: 'BarChart3',
          title: 'No test results yet',
          message: 'Take your first mock test to see detailed results and track your performance over time.',
          actionText: 'Take Test',
          gradient: 'from-info/10 to-primary/5'
        }
      case 'sessions':
        return {
          icon: 'Clock',
          title: 'No study sessions',
          message: 'Start your first study session with the timer. Build consistent study habits and track your progress.',
          actionText: 'Start Session',
          gradient: 'from-warning/10 to-accent/5'
        }
      default:
        return {
          icon: icon,
          title: title,
          message: message,
          actionText: actionText,
          gradient: 'from-gray-100 to-gray-50'
        }
    }
  }

  const emptyContent = getEmptyContent()

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className={`w-24 h-24 bg-gradient-to-br ${emptyContent.gradient} rounded-full flex items-center justify-center mb-6 shadow-lg`}>
        <ApperIcon 
          name={emptyContent.icon} 
          size={48} 
          className="text-gray-600"
        />
      </div>
      
      <h3 className="text-2xl font-display font-semibold text-gray-900 mb-4">
        {emptyContent.title}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-lg leading-relaxed text-lg">
        {emptyContent.message}
      </p>
      
      {action && (
        <button
          onClick={action}
          className="inline-flex items-center space-x-3 bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl font-medium hover:from-primary/90 hover:to-secondary/90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <ApperIcon name={emptyContent.icon} size={20} />
          <span className="text-lg">{emptyContent.actionText}</span>
        </button>
      )}
    </div>
  )
}

export default Empty