const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let topics = [
  {
    Id: 1,
    subjectId: 1,
    name: "Calculus Basics",
    isCompleted: true,
    completionDate: "2024-01-10T14:30:00Z",
    notes: "Derivatives and integrals"
  },
  {
    Id: 2,
    subjectId: 1,
    name: "Linear Algebra",
    isCompleted: true,
    completionDate: "2024-01-12T16:20:00Z",
    notes: "Matrices and vectors"
  },
  {
    Id: 3,
    subjectId: 1,
    name: "Differential Equations",
    isCompleted: false,
    completionDate: null,
    notes: ""
  },
  {
    Id: 4,
    subjectId: 2,
    name: "Mechanics",
    isCompleted: true,
    completionDate: "2024-01-08T11:15:00Z",
    notes: "Newton's laws and motion"
  },
  {
    Id: 5,
    subjectId: 2,
    name: "Thermodynamics",
    isCompleted: false,
    completionDate: null,
    notes: ""
  },
  {
    Id: 6,
    subjectId: 3,
    name: "Organic Chemistry",
    isCompleted: true,
    completionDate: "2024-01-14T13:45:00Z",
    notes: "Carbon compounds"
  }
]

export const topicService = {
  async getAll() {
    await delay(200)
    return [...topics]
  },

  async getById(id) {
    await delay(150)
    const topic = topics.find(t => t.Id === id)
    if (!topic) {
      throw new Error('Topic not found')
    }
    return { ...topic }
  },

  async getBySubjectId(subjectId) {
    await delay(250)
    return topics.filter(t => t.subjectId === subjectId).map(t => ({ ...t }))
  },

  async create(topicData) {
    await delay(300)
    const newId = Math.max(...topics.map(t => t.Id), 0) + 1
    const newTopic = {
      Id: newId,
      ...topicData,
      isCompleted: false,
      completionDate: null
    }
    topics.push(newTopic)
    return { ...newTopic }
  },

  async update(id, topicData) {
    await delay(250)
    const index = topics.findIndex(t => t.Id === id)
    if (index === -1) {
      throw new Error('Topic not found')
    }
    topics[index] = { ...topics[index], ...topicData }
    return { ...topics[index] }
  },

  async delete(id) {
    await delay(200)
    const index = topics.findIndex(t => t.Id === id)
    if (index === -1) {
      throw new Error('Topic not found')
    }
    topics.splice(index, 1)
    return true
  }
}