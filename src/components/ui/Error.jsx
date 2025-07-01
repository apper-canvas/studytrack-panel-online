import React from 'react'
import ApperIcon from '@/components/ApperIcon'

const Error = ({ message = "Something went wrong", onRetry, type = 'default' }) => {
  const getErrorContent = () => {
    switch (type) {
      case 'network':
        return {
          icon: 'WifiOff',
          title: 'Connection Error',
          message: 'Please check your internet connection and try again.',
          actionText: 'Retry Connection'
        }
      case 'notfound':
        return {
          icon: 'FileX',
          title: 'Not Found',
          message: 'The resource you\'re looking for doesn\'t exist.',
          actionText: 'Go Back'
        }
      case 'permission':
        return {
          icon: 'Lock',
          title: 'Access Denied',
          message: 'You don\'t have permission to access this resource.',
          actionText: 'Request Access'
        }
      default:
        return {
          icon: 'AlertTriangle',
          title: 'Oops! Something went wrong',
          message: message,
          actionText: 'Try Again'
        }
    }
  }

  const errorContent = getErrorContent()

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-error/10 to-error/5 rounded-full flex items-center justify-center mb-6">
        <ApperIcon 
          name={errorContent.icon} 
          size={40} 
          className="text-error"
        />
      </div>
      
      <h3 className="text-xl font-display font-semibold text-gray-900 mb-3">
        {errorContent.title}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md leading-relaxed">
        {errorContent.message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-medium hover:from-primary/90 hover:to-secondary/90 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <ApperIcon name="RefreshCw" size={18} />
          <span>{errorContent.actionText}</span>
        </button>
      )}
    </div>
  )
}

export default Error