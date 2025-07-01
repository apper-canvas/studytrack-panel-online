import React, { useState } from 'react'
import Header from '@/components/organisms/Header'
import Sidebar from '@/components/organisms/Sidebar'

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [timerActive, setTimerActive] = useState(false)

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleTimerStart = () => {
    setTimerActive(!timerActive)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={handleToggleSidebar}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onTimerStart={handleTimerStart} />
        
        <main className={`flex-1 overflow-auto p-6 ${timerActive ? 'focus-mode' : 'focus-mode-active'}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout