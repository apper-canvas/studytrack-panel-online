const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let studySessions = [
  {
    Id: 1,
    subjectId: 1,
    topicId: 1,
    duration: 45, // minutes
    date: "2024-01-15T09:00:00Z"
  },
  {
    Id: 2,
    subjectId: 1,
    topicId: 2,
    duration: 30,
    date: "2024-01-15T14:30:00Z"
  },
  {
    Id: 3,
    subjectId: 2,
    topicId: 4,
    duration: 60,
    date: "2024-01-14T10:15:00Z"
  },
  {
    Id: 4,
    subjectId: 3,
    topicId: 6,
    duration: 25,
    date: "2024-01-16T16:45:00Z"
  },
  {
    Id: 5,
    subjectId: 1,
    topicId: null,
    duration: 35,
    date: "2024-01-16T11:20:00Z"
  }
]

export const studySessionService = {
  async getAll() {
    await delay(250)
    return [...studySessions]
  },

  async getById(id) {
    await delay(150)
    const session = studySessions.find(s => s.Id === id)
    if (!session) {
      throw new Error('Study session not found')
    }
    return { ...session }
  },

  async getBySubjectId(subjectId) {
    await delay(200)
    return studySessions.filter(s => s.subjectId === subjectId).map(s => ({ ...s }))
  },

  async getByDateRange(startDate, endDate) {
    await delay(300)
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return studySessions.filter(s => {
      const sessionDate = new Date(s.date)
      return sessionDate >= start && sessionDate <= end
    }).map(s => ({ ...s }))
  },

  async create(sessionData) {
    await delay(350)
    const newId = Math.max(...studySessions.map(s => s.Id), 0) + 1
    const newSession = {
      Id: newId,
      ...sessionData,
      date: new Date().toISOString()
    }
    studySessions.push(newSession)
    return { ...newSession }
  },

  async update(id, sessionData) {
    await delay(250)
    const index = studySessions.findIndex(s => s.Id === id)
    if (index === -1) {
      throw new Error('Study session not found')
    }
    studySessions[index] = { ...studySessions[index], ...sessionData }
    return { ...studySessions[index] }
  },

  async delete(id) {
    await delay(200)
    const index = studySessions.findIndex(s => s.Id === id)
    if (index === -1) {
      throw new Error('Study session not found')
    }
    studySessions.splice(index, 1)
    return true
  }
}