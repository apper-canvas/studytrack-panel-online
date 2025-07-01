import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SubjectCard from '@/components/molecules/SubjectCard'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import { subjectService } from '@/services/api/subjectService'
import { toast } from 'react-toastify'

const SubjectModal = ({ isOpen, onClose, onSave, subject = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    totalTopics: '',
    color: '#4F46E5'
  })

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name,
        totalTopics: subject.totalTopics.toString(),
        color: subject.color
      })
    } else {
      setFormData({ name: '', totalTopics: '', color: '#4F46E5' })
    }
  }, [subject, isOpen])

  const colors = [
    '#4F46E5', '#7C3AED', '#10B981', '#F59E0B', 
    '#EF4444', '#3B82F6', '#8B5CF6', '#06B6D4'
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.totalTopics) return

    const subjectData = {
      ...formData,
      totalTopics: parseInt(formData.totalTopics),
      completedTopics: subject?.completedTopics || 0,
      lastStudied: subject?.lastStudied || null
    }

    onSave(subjectData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-md"
      >
        <h3 className="text-xl font-display font-semibold mb-6">
          {subject ? 'Edit Subject' : 'Add New Subject'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Subject Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Mathematics, Physics"
            required
          />

          <Input
            label="Total Topics"
            type="number"
            value={formData.totalTopics}
            onChange={(e) => setFormData({ ...formData, totalTopics: e.target.value })}
            placeholder="e.g. 25"
            min="1"
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-12 h-12 rounded-lg border-2 ${
                    formData.color === color ? 'border-gray-400' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {subject ? 'Update' : 'Add'} Subject
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const Subjects = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadSubjects()
  }, [])

  const loadSubjects = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await subjectService.getAll()
      setSubjects(data)
    } catch (err) {
      setError('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSubject = async (subjectData) => {
    try {
      if (editingSubject) {
        await subjectService.update(editingSubject.Id, subjectData)
        toast.success('Subject updated successfully!')
      } else {
        await subjectService.create(subjectData)
        toast.success('Subject added successfully!')
      }
      
      setShowModal(false)
      setEditingSubject(null)
      loadSubjects()
    } catch (err) {
      toast.error('Failed to save subject')
    }
  }

  const handleEditSubject = (subject) => {
    setEditingSubject(subject)
    setShowModal(true)
  }

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <Loading type="cards" />
  if (error) return <Error message={error} onRetry={loadSubjects} />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">
            Your Subjects
          </h2>
          <p className="text-gray-600 mt-1">
            Organize and track your study materials
          </p>
        </div>
        
        <Button onClick={() => setShowModal(true)} icon="Plus">
          Add Subject
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          icon="Search"
          placeholder="Search subjects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <Empty
          type="subjects"
          action={() => setShowModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject, index) => (
            <motion.div
              key={subject.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SubjectCard subject={subject} onEdit={handleEditSubject} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Subject Modal */}
      <SubjectModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingSubject(null)
        }}
        onSave={handleSaveSubject}
        subject={editingSubject}
      />
    </div>
  )
}

export default Subjects