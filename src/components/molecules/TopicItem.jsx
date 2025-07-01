import React from 'react'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import { format } from 'date-fns'

const TopicItem = ({ topic, onToggle, onEdit }) => {
  const handleToggle = () => {
    onToggle(topic.Id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={handleToggle}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            topic.isCompleted
              ? 'bg-success border-success text-white'
              : 'border-gray-300 hover:border-success'
          }`}
        >
          {topic.isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="animate-confetti"
            >
              <ApperIcon name="Check" size={14} />
            </motion.div>
          )}
        </button>

        <div className="flex-1">
          <h4 className={`font-medium ${
            topic.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
          }`}>
            {topic.name}
          </h4>
          
          {topic.notes && (
            <p className="text-sm text-gray-600 mt-1">{topic.notes}</p>
          )}
          
          {topic.isCompleted && topic.completionDate && (
            <p className="text-xs text-success mt-1">
              Completed on {format(new Date(topic.completionDate), 'MMM dd, yyyy')}
            </p>
          )}
        </div>

        <button
          onClick={() => onEdit(topic)}
          className="p-2 text-gray-400 hover:text-primary transition-colors duration-200"
        >
          <ApperIcon name="Edit2" size={16} />
        </button>
      </div>
    </motion.div>
  )
}

export default TopicItem