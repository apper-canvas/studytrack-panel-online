const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let testResults = [
  {
    Id: 1,
    testId: 1,
    score: 2,
    totalQuestions: 3,
    timeTaken: 1200, // seconds
    completedDate: "2024-01-15T14:30:00Z",
    answers: [
      { questionIndex: 0, selectedAnswer: 0, isCorrect: true },
      { questionIndex: 1, selectedAnswer: 1, isCorrect: true },
      { questionIndex: 2, selectedAnswer: 1, isCorrect: false }
    ]
  },
  {
    Id: 2,
    testId: 2,
    score: 2,
    totalQuestions: 2,
    timeTaken: 900,
    completedDate: "2024-01-14T16:20:00Z",
    answers: [
      { questionIndex: 0, selectedAnswer: 1, isCorrect: true },
      { questionIndex: 1, selectedAnswer: 1, isCorrect: true }
    ]
  },
  {
    Id: 3,
    testId: 3,
    score: 1,
    totalQuestions: 3,
    timeTaken: 1800,
    completedDate: "2024-01-16T10:15:00Z",
    answers: [
      { questionIndex: 0, selectedAnswer: 0, isCorrect: true },
      { questionIndex: 1, selectedAnswer: 0, isCorrect: false },
      { questionIndex: 2, selectedAnswer: 0, isCorrect: false }
    ]
  }
]

export const testResultService = {
  async getAll() {
    await delay(300)
    return [...testResults]
  },

  async getById(id) {
    await delay(200)
    const result = testResults.find(r => r.Id === id)
    if (!result) {
      throw new Error('Test result not found')
    }
    return { ...result }
  },

  async getByTestId(testId) {
    await delay(250)
    return testResults.filter(r => r.testId === testId).map(r => ({ ...r }))
  },

  async create(resultData) {
    await delay(400)
    const newId = Math.max(...testResults.map(r => r.Id), 0) + 1
    const newResult = {
      Id: newId,
      ...resultData,
      completedDate: new Date().toISOString()
    }
    testResults.push(newResult)
    return { ...newResult }
  },

  async update(id, resultData) {
    await delay(300)
    const index = testResults.findIndex(r => r.Id === id)
    if (index === -1) {
      throw new Error('Test result not found')
    }
    testResults[index] = { ...testResults[index], ...resultData }
    return { ...testResults[index] }
  },

  async delete(id) {
    await delay(200)
    const index = testResults.findIndex(r => r.Id === id)
    if (index === -1) {
      throw new Error('Test result not found')
}
    testResults.splice(index, 1)
    return true
  },

  async getTopicPerformance() {
    await delay(300)
    // Calculate performance by topic based on test results
    const topicPerformance = {}
    
    testResults.forEach(result => {
      result.answers?.forEach((answer, questionIndex) => {
        const topicId = questionIndex + 1 // Simplified topic mapping
        const topicName = `Topic ${topicId}`
        
        if (!topicPerformance[topicName]) {
          topicPerformance[topicName] = {
            totalQuestions: 0,
            correctAnswers: 0,
            attempts: 0
          }
        }
        
        topicPerformance[topicName].totalQuestions++
        topicPerformance[topicName].attempts++
        if (answer.isCorrect) {
          topicPerformance[topicName].correctAnswers++
        }
      })
    })
    
    return Object.entries(topicPerformance).map(([topic, data]) => ({
      topic,
      averageScore: (data.correctAnswers / data.totalQuestions) * 100,
      totalAttempts: data.attempts
    }))
  },

  async getPerformanceHeatmap() {
    await delay(250)
    const performance = await this.getTopicPerformance()
    
    return performance.map(item => ({
      topic: item.topic,
      score: Math.round(item.averageScore),
      category: item.averageScore >= 80 ? 'excellent' : 
                item.averageScore >= 60 ? 'good' : 
                item.averageScore >= 40 ? 'needs-improvement' : 'poor'
    }))
  }
}