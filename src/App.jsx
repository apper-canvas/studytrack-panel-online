import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Layout from '@/components/organisms/Layout'
import Dashboard from '@/components/pages/Dashboard'
import Subjects from '@/components/pages/Subjects'
import SubjectDetail from '@/components/pages/SubjectDetail'
import MockTests from '@/components/pages/MockTests'
import TestSession from '@/components/pages/TestSession'
import TestResults from '@/components/pages/TestResults'
import Progress from '@/components/pages/Progress'
import AnalyticsCharts from '@/components/pages/AnalyticsCharts'
import Timer from '@/components/pages/Timer'
function App() {
  return (
    <Router>
      <div className="App">
        <Layout>
          <Routes>
<Route path="/" element={<Dashboard />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/subjects/:id" element={<SubjectDetail />} />
            <Route path="/mock-tests" element={<MockTests />} />
            <Route path="/test/:testId" element={<TestSession />} />
            <Route path="/test-results/:resultId" element={<TestResults />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/analytics" element={<AnalyticsCharts />} />
            <Route path="/timer" element={<Timer />} />
          </Routes>
        </Layout>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 9999 }}
        />
      </div>
    </Router>
  )
}

export default App