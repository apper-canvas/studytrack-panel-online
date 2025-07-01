import React from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import Card from '@/components/atoms/Card'
import ProgressRing from '@/components/atoms/ProgressRing'
import ApperIcon from '@/components/ApperIcon'

const SubjectCard = ({ subject }) => {
  const navigate = useNavigate()
  
  const progress = subject.totalTopics > 0 
    ? (subject.completedTopics / subject.totalTopics) * 100 
    : 0

  const handleClick = () => {
    navigate(`/subjects/${subject.Id}`)
  }

  return (
    <Card hover className="cursor-pointer" onClick={handleClick}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: subject.color }}
          >
            {subject.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-gray-900">
              {subject.name}
            </h3>
            <p className="text-sm text-gray-500">
              {subject.completedTopics} of {subject.totalTopics} topics
            </p>
          </div>
        </div>
        
        <ProgressRing 
          progress={progress}
          size={60}
          strokeWidth={4}
          color={subject.color}
          showPercentage={false}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold text-gray-900">{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-500"
            style={{ 
              backgroundColor: subject.color,
              width: `${progress}%` 
            }}
          />
        </div>

        {subject.lastStudied && (
          <div className="flex items-center text-sm text-gray-500 mt-4">
            <ApperIcon name="Clock" size={14} className="mr-1" />
            Last studied {format(new Date(subject.lastStudied), 'MMM dd, yyyy')}
          </div>
        )}
      </div>
    </Card>
  )
}

export default SubjectCard