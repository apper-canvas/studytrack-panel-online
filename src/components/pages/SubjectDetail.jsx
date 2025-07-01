import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import TopicItem from '@/components/molecules/TopicItem'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Card from '@/components/atoms/Card'
import ProgressRing from '@/components/atoms/ProgressRing'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import { subjectService } from '@/services/api/subjectService'
import { topicService } from '@/services/api/topicService'
import { toast } from 'react-toastify'

const TopicModal = ({ isOpen, onClose, onSave, topic = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    notes: ''
  })

  useEffect(() => {
    if (topic) {
      setFormData({
        name: topic.name,
        notes: topic.notes || ''
      })
    } else {
      setFormData({ name: '', notes: '' })
    }
  }, [topic, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    onSave(formData)
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
          {topic ? 'Edit Topic' : 'Add New Topic'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Topic Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Calculus, Derivatives"
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors duration-200"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {topic ? 'Update' : 'Add'} Topic
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const SubjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [subject, setSubject] = useState(null)
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTopic, setEditingTopic] = useState(null)

  useEffect(() => {
    loadSubjectAndTopics()
  }, [id])

  const loadSubjectAndTopics = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [subjectData, topicsData] = await Promise.all([
        subjectService.getById(parseInt(id)),
        topicService.getBySubjectId(parseInt(id))
      ])
      
      setSubject(subjectData)
      setTopics(topicsData)
    } catch (err) {
      setError('Failed to load subject details')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleTopic = async (topicId) => {
    try {
      const topic = topics.find(t => t.Id === topicId)
      const updatedTopic = {
        ...topic,
        isCompleted: !topic.isCompleted,
        completionDate: !topic.isCompleted ? new Date().toISOString() : null
      }
      
      await topicService.update(topicId, updatedTopic)
      
      // Update subject completion count
      const completedCount = topics.filter(t => 
        t.Id === topicId ? !topic.isCompleted : t.isCompleted
      ).length
      
      await subjectService.update(parseInt(id), {
        ...subject,
        completedTopics: completedCount,
        lastStudied: new Date().toISOString()
      })
      
      toast.success(
        !topic.isCompleted ? 'Topic marked as completed!' : 'Topic marked as incomplete'
      )
      
      loadSubjectAndTopics()
    } catch (err) {
      toast.error('Failed to update topic')
    }
  }

  const handleSaveTopic = async (topicData) => {
    try {
      const newTopic = {
        ...topicData,
        subjectId: parseInt(id),
        isCompleted: false,
        completionDate: null
      }
      
      if (editingTopic) {
        await topicService.update(editingTopic.Id, {
          ...editingTopic,
          ...topicData
        })
        toast.success('Topic updated successfully!')
      } else {
        await topicService.create(newTopic)
        
        // Update subject total topics count
        await subjectService.update(parseInt(id), {
          ...subject,
          totalTopics: subject.totalTopics + 1
        })
        
        toast.success('Topic added successfully!')
      }
      
      setShowModal(false)
      setEditingTopic(null)
      loadSubjectAndTopics()
    } catch (err) {
      toast.error('Failed to save topic')
    }
  }

  const handleEditTopic = (topic) => {
    setEditingTopic(topic)
    setShowModal(true)
  }

  if (loading) return <Loading type="list" />
  if (error) return <Error message={error} onRetry={loadSubjectAndTopics} />
  if (!subject) return <Error message="Subject not found" type="notfound" />

  const progress = subject.totalTopics > 0 
    ? (subject.completedTopics / subject.totalTopics) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button 
          variant="outline" 
          size="small" 
          icon="ArrowLeft"
          onClick={() => navigate('/subjects')}
        >
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-display font-bold text-gray-900">
            {subject.name}
          </h1>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <ProgressRing
              progress={progress}
              size={100}
              color={subject.color}
            />
            <div>
              <h3 className="text-2xl font-display font-bold text-gray-900">
                {Math.round(progress)}% Complete
              </h3>
              <p className="text-gray-600">
                {subject.completedTopics} of {subject.totalTopics} topics completed
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <ApperIcon name="CheckCircle" size={14} className="text-success" />
                  <span>{subject.completedTopics} completed</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ApperIcon name="Circle" size={14} className="text-gray-400" />
                  <span>{subject.totalTopics - subject.completedTopics} remaining</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button onClick={() => setShowModal(true)} icon="Plus">
            Add Topic
          </Button>
        </div>
      </Card>

      {/* Topics List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-semibold text-gray-900">
            Topics & Chapters
          </h3>
          <p className="text-sm text-gray-500">
            Click to mark as complete
          </p>
        </div>

        {topics.length === 0 ? (
          <Empty
            type="topics"
            action={() => setShowModal(true)}
          />
        ) : (
          <div className="space-y-3">
            {topics.map((topic, index) => (
              <motion.div
                key={topic.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TopicItem
                  topic={topic}
                  onToggle={handleToggleTopic}
                  onEdit={handleEditTopic}
                />
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Topic Modal */}
      <TopicModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingTopic(null)
        }}
        onSave={handleSaveTopic}
        topic={editingTopic}
      />
    </div>
  )
}

export default SubjectDetail