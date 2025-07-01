import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Sidebar = ({ isCollapsed, onToggle }) => {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: 'LayoutDashboard', label: 'Dashboard' },
    { path: '/subjects', icon: 'BookOpen', label: 'Subjects' },
    { path: '/mock-tests', icon: 'FileText', label: 'Mock Tests' },
    { path: '/progress', icon: 'TrendingUp', label: 'Progress' },
    { path: '/timer', icon: 'Clock', label: 'Study Timer' },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
      className="bg-gradient-to-b from-primary to-secondary text-white flex flex-col shadow-xl"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <ApperIcon name="GraduationCap" size={24} className="text-white" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-xl font-display font-bold">StudyTrack Pro</h2>
              <p className="text-sm text-white/70">Smart Study Planner</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <ApperIcon name={item.icon} size={20} />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-white/20">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          <ApperIcon 
            name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} 
            size={20} 
          />
        </button>
      </div>
    </motion.aside>
  )
}

export default Sidebar