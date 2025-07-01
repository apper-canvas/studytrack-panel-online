const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let mockTests = [
  {
    Id: 1,
    subjectId: 1,
    name: "Calculus Fundamentals Quiz",
    duration: 30,
    createdDate: "2024-01-10T09:00:00Z",
    questions: [
      {
        question: "What is the derivative of x²?",
        options: ["2x", "x", "2", "x²"],
        correctAnswer: 0,
        type: "multiple"
      },
      {
        question: "What is the integral of 2x?",
        options: ["x²", "x² + C", "2", "2x + C"],
        correctAnswer: 1,
        type: "multiple"
      },
      {
        question: "What is the limit of (x² - 1)/(x - 1) as x approaches 1?",
        options: ["0", "1", "2", "undefined"],
        correctAnswer: 2,
        type: "multiple"
      }
    ]
  },
  {
    Id: 2,
    subjectId: 2,
    name: "Mechanics Basics",
    duration: 25,
    createdDate: "2024-01-12T11:30:00Z",
    questions: [
      {
        question: "What is Newton's first law of motion?",
        options: [
          "F = ma",
          "An object at rest stays at rest unless acted upon by a force",
          "For every action, there is an equal and opposite reaction",
          "Energy cannot be created or destroyed"
        ],
        correctAnswer: 1,
        type: "multiple"
      },
      {
        question: "What is the unit of force in SI system?",
        options: ["Joule", "Newton", "Watt", "Pascal"],
        correctAnswer: 1,
        type: "multiple"
      }
    ]
  },
  {
    Id: 3,
    subjectId: 3,
    name: "Organic Chemistry Test",
    duration: 40,
    createdDate: "2024-01-14T15:45:00Z",
    questions: [
      {
        question: "What is the molecular formula of methane?",
        options: ["CH₄", "C₂H₆", "C₃H₈", "C₄H₁₀"],
        correctAnswer: 0,
        type: "multiple"
      },
      {
        question: "Which functional group characterizes alcohols?",
        options: ["-COOH", "-OH", "-NH₂", "-CHO"],
        correctAnswer: 1,
        type: "multiple"
      },
      {
        question: "What type of bond exists between carbon atoms in alkenes?",
        options: ["Single bond", "Double bond", "Triple bond", "Ionic bond"],
        correctAnswer: 1,
        type: "multiple"
      }
    ]
  }
]

export const mockTestService = {
  async getAll() {
    await delay(350)
    return [...mockTests]
  },

  async getById(id) {
    await delay(200)
    const test = mockTests.find(t => t.Id === id)
    if (!test) {
      throw new Error('Test not found')
    }
    return { ...test }
  },

  async getBySubjectId(subjectId) {
    await delay(300)
    return mockTests.filter(t => t.subjectId === subjectId).map(t => ({ ...t }))
  },

  async create(testData) {
    await delay(400)
    const newId = Math.max(...mockTests.map(t => t.Id), 0) + 1
    const newTest = {
      Id: newId,
      ...testData,
      createdDate: new Date().toISOString()
    }
    mockTests.push(newTest)
    return { ...newTest }
  },

  async update(id, testData) {
    await delay(350)
    const index = mockTests.findIndex(t => t.Id === id)
    if (index === -1) {
      throw new Error('Test not found')
    }
    mockTests[index] = { ...mockTests[index], ...testData }
    return { ...mockTests[index] }
  },

  async delete(id) {
    await delay(250)
    const index = mockTests.findIndex(t => t.Id === id)
    if (index === -1) {
      throw new Error('Test not found')
    }
    mockTests.splice(index, 1)
    return true
  }
}