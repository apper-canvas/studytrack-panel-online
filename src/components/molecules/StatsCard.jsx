import React from 'react'
import Card from '@/components/atoms/Card'
import ApperIcon from '@/components/ApperIcon'

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'primary', 
  trend, 
  trendValue,
  subtitle 
}) => {
  const colorClasses = {
    primary: 'from-primary to-secondary',
    success: 'from-success to-accent',
    warning: 'from-warning to-orange-500',
    info: 'from-info to-blue-600'
  }

  const iconColors = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    info: 'text-info'
  }

  return (
    <Card gradient>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <ApperIcon name={icon} size={24} className="text-white" />
        </div>
        
        {trend && (
          <div className={`flex items-center space-x-1 text-sm ${
            trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-gray-500'
          }`}>
            <ApperIcon 
              name={trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus'} 
              size={14} 
            />
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-3xl font-display font-bold text-gray-900 mb-1">
          {value}
        </h3>
        <p className="text-gray-600 font-medium">{title}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </Card>
  )
}

export default StatsCard