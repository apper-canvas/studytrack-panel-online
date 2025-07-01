const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let subjects = [
  {
    Id: 1,
    name: "Mathematics",
    totalTopics: 15,
    completedTopics: 8,
    lastStudied: "2024-01-15T10:30:00Z",
    color: "#4F46E5"
  },
  {
    Id: 2,
    name: "Physics",
    totalTopics: 12,
    completedTopics: 5,
    lastStudied: "2024-01-14T14:20:00Z",
    color: "#7C3AED"
  },
  {
    Id: 3,
    name: "Chemistry",
    totalTopics: 18,
    completedTopics: 12,
    lastStudied: "2024-01-16T09:15:00Z",
    color: "#10B981"
  },
  {
    Id: 4,
    name: "Biology",
    totalTopics: 20,
    completedTopics: 6,
    lastStudied: "2024-01-13T16:45:00Z",
    color: "#F59E0B"
  }
]

export const subjectService = {
  async getAll() {
    await delay(300)
    return [...subjects]
  },

  async getById(id) {
    await delay(200)
    const subject = subjects.find(s => s.Id === id)
    if (!subject) {
      throw new Error('Subject not found')
    }
    return { ...subject }
  },

  async create(subjectData) {
    await delay(400)
    const newId = Math.max(...subjects.map(s => s.Id), 0) + 1
    const newSubject = {
      Id: newId,
      ...subjectData,
      completedTopics: 0,
      lastStudied: null
    }
    subjects.push(newSubject)
    return { ...newSubject }
  },

  async update(id, subjectData) {
    await delay(300)
    const index = subjects.findIndex(s => s.Id === id)
    if (index === -1) {
      throw new Error('Subject not found')
    }
    subjects[index] = { ...subjects[index], ...subjectData }
    return { ...subjects[index] }
  },

  async delete(id) {
    await delay(200)
    const index = subjects.findIndex(s => s.Id === id)
    if (index === -1) {
      throw new Error('Subject not found')
    }
    subjects.splice(index, 1)
    return true
  }
}