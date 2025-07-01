import React from 'react'

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  gradient = false,
  padding = 'normal',
  ...props 
}) => {
  const baseClasses = "bg-white rounded-xl shadow-lg transition-all duration-200"
  
  const hoverClasses = hover ? "hover:shadow-xl hover:scale-105 cursor-pointer" : ""
  
  const gradientClasses = gradient ? "bg-gradient-to-br from-white to-gray-50" : ""
  
  const paddingClasses = {
    none: '',
    small: 'p-4',
    normal: 'p-6',
    large: 'p-8'
  }

  const classes = `${baseClasses} ${hoverClasses} ${gradientClasses} ${paddingClasses[padding]} ${className}`

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}

export default Card