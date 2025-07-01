import React from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const TestCard = ({ test, subject, onEdit, onDelete }) => {
  const navigate = useNavigate()

  const handleStartTest = () => {
    navigate(`/test/${test.Id}`)
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <Card hover>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-display font-semibold text-lg text-gray-900 mb-2">
            {test.name}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <ApperIcon name="BookOpen" size={14} />
              <span>{subject?.name || 'Unknown Subject'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ApperIcon name="Clock" size={14} />
              <span>{formatDuration(test.duration)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ApperIcon name="FileText" size={14} />
              <span>{test.questions?.length || 0} questions</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(test)}
            className="p-2 text-gray-400 hover:text-primary transition-colors duration-200"
          >
            <ApperIcon name="Edit2" size={16} />
          </button>
          <button
            onClick={() => onDelete(test.Id)}
            className="p-2 text-gray-400 hover:text-error transition-colors duration-200"
          >
            <ApperIcon name="Trash2" size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Created {format(new Date(test.createdDate), 'MMM dd, yyyy')}
        </p>
        
        <Button onClick={handleStartTest} size="small">
          Start Test
        </Button>
      </div>
    </Card>
  )
}

export default TestCard