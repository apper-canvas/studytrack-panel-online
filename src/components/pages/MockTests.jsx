import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import TestCard from '@/components/molecules/TestCard'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Card from '@/components/atoms/Card'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import { mockTestService } from '@/services/api/mockTestService'
import { subjectService } from '@/services/api/subjectService'
import { toast } from 'react-toastify'

const TestModal = ({ isOpen, onClose, onSave, test = null, subjects = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    subjectId: '',
    duration: '',
    questions: []
  })
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswer: 0, type: 'multiple' }
  ])

  useEffect(() => {
    if (test) {
      setFormData({
        name: test.name,
        subjectId: test.subjectId.toString(),
        duration: test.duration.toString(),
        questions: test.questions || []
      })
      setQuestions(test.questions || [
        { question: '', options: ['', '', '', ''], correctAnswer: 0, type: 'multiple' }
      ])
    } else {
      setFormData({ name: '', subjectId: '', duration: '', questions: [] })
      setQuestions([
        { question: '', options: ['', '', '', ''], correctAnswer: 0, type: 'multiple' }
      ])
    }
  }, [test, isOpen])

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      type: 'multiple'
    }])
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const updateOption = (questionIndex, optionIndex, value) => {
    const updated = [...questions]
    updated[questionIndex].options[optionIndex] = value
    setQuestions(updated)
  }

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.subjectId || !formData.duration) return

    const validQuestions = questions.filter(q => 
      q.question.trim() && q.options.every(opt => opt.trim())
    )

    if (validQuestions.length === 0) {
      toast.error('Please add at least one complete question')
      return
    }

    const testData = {
      ...formData,
      subjectId: parseInt(formData.subjectId),
      duration: parseInt(formData.duration),
      questions: validQuestions,
      createdDate: test?.createdDate || new Date().toISOString()
    }

    onSave(testData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-xl font-display font-semibold mb-6">
          {test ? 'Edit Test' : 'Create New Test'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Test Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Chapter 1 Quiz"
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors duration-200"
                required
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject.Id} value={subject.Id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Duration (minutes)"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="e.g. 30"
            min="1"
            required
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-gray-900">Questions</h4>
              <Button type="button" size="small" onClick={addQuestion} icon="Plus">
                Add Question
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <Card key={qIndex} className="border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <h5 className="font-medium text-gray-900">Question {qIndex + 1}</h5>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="text-error hover:bg-error/10 p-1 rounded"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <Input
                    label="Question"
                    value={question.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    placeholder="Enter your question here..."
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={question.correctAnswer === oIndex}
                          onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                          className="text-primary"
                        />
                        <Input
                          placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                          value={option}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {test ? 'Update' : 'Create'} Test
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const MockTests = () => {
  const [tests, setTests] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [testsData, subjectsData] = await Promise.all([
        mockTestService.getAll(),
        subjectService.getAll()
      ])
      
      setTests(testsData)
      setSubjects(subjectsData)
    } catch (err) {
      setError('Failed to load tests')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTest = async (testData) => {
    try {
      if (editingTest) {
        await mockTestService.update(editingTest.Id, testData)
        toast.success('Test updated successfully!')
      } else {
        await mockTestService.create(testData)
        toast.success('Test created successfully!')
      }
      
      setShowModal(false)
      setEditingTest(null)
      loadData()
    } catch (err) {
      toast.error('Failed to save test')
    }
  }

  const handleEditTest = (test) => {
    setEditingTest(test)
    setShowModal(true)
  }

  const handleDeleteTest = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return

    try {
      await mockTestService.delete(testId)
      toast.success('Test deleted successfully!')
      loadData()
    } catch (err) {
      toast.error('Failed to delete test')
    }
  }

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = !selectedSubject || test.subjectId.toString() === selectedSubject
    return matchesSearch && matchesSubject
  })

  if (loading) return <Loading type="cards" />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">
            Mock Tests
          </h2>
          <p className="text-gray-600 mt-1">
            Create and practice with custom tests
          </p>
        </div>
        
        <Button onClick={() => setShowModal(true)} icon="Plus">
          Create Test
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <Input
            icon="Search"
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="sm:w-48">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors duration-200"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject.Id} value={subject.Id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tests Grid */}
      {filteredTests.length === 0 ? (
        <Empty
          type="tests"
          action={() => setShowModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test, index) => (
            <motion.div
              key={test.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <TestCard
                test={test}
                subject={subjects.find(s => s.Id === test.subjectId)}
                onEdit={handleEditTest}
                onDelete={handleDeleteTest}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Test Modal */}
      <TestModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingTest(null)
        }}
        onSave={handleSaveTest}
        test={editingTest}
        subjects={subjects}
      />
    </div>
  )
}

export default MockTests