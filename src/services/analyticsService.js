import { testResultService } from '@/services/api/testResultService'
import { topicService } from '@/services/api/topicService'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const analyticsService = {
  async getTopicPerformance() {
    await delay(300)
    
    try {
      const [testResults, topics] = await Promise.all([
        testResultService.getAll(),
        topicService.getAll()
      ])
      
      // Create a map of topic performance
      const topicPerformance = {}
      
      // Initialize topics
      topics.forEach(topic => {
        topicPerformance[topic.name] = {
          totalQuestions: 0,
          correctAnswers: 0,
          attempts: 0,
          scores: []
        }
      })
      
      // Process test results
      testResults.forEach(result => {
        if (result.answers && Array.isArray(result.answers)) {
          result.answers.forEach((answer, questionIndex) => {
            // Map questions to topics (simplified mapping)
            const topicIndex = questionIndex % topics.length
            const topic = topics[topicIndex]
            
            if (topic && topicPerformance[topic.name]) {
              topicPerformance[topic.name].totalQuestions++
              topicPerformance[topic.name].attempts++
              
              if (answer.isCorrect) {
                topicPerformance[topic.name].correctAnswers++
              }
            }
          })
          
          // Calculate overall test score for each topic
          const testScore = (result.score / result.totalQuestions) * 100
          topics.forEach(topic => {
            if (topicPerformance[topic.name]) {
              topicPerformance[topic.name].scores.push(testScore)
            }
          })
        }
      })
      
      // Convert to array format with calculated averages
      return Object.entries(topicPerformance)
        .filter(([_, data]) => data.totalQuestions > 0)
        .map(([topicName, data]) => ({
          topic: topicName,
          averageScore: data.totalQuestions > 0 
            ? (data.correctAnswers / data.totalQuestions) * 100 
            : 0,
          totalAttempts: data.attempts,
          totalQuestions: data.totalQuestions,
          correctAnswers: data.correctAnswers
        }))
        .sort((a, b) => b.averageScore - a.averageScore)
    } catch (error) {
      console.error('Error calculating topic performance:', error)
      return []
    }
  },

  async getPerformanceHeatmap() {
    await delay(250)
    
    try {
      const performance = await this.getTopicPerformance()
      
      return performance.map(item => {
        const score = Math.round(item.averageScore)
        let category = 'poor'
        
        if (score >= 80) category = 'excellent'
        else if (score >= 60) category = 'good'
        else if (score >= 40) category = 'needs-improvement'
        
        return {
          topic: item.topic,
          score: score,
          category: category,
          attempts: item.totalAttempts
        }
      })
    } catch (error) {
      console.error('Error generating performance heatmap:', error)
      return []
    }
  },

  async getTopicStrengthsAndWeaknesses() {
    await delay(200)
    
    try {
      const performance = await this.getTopicPerformance()
      
      const strengths = performance
        .filter(item => item.averageScore >= 80)
        .sort((a, b) => b.averageScore - a.averageScore)
        .slice(0, 3)
      
      const weaknesses = performance
        .filter(item => item.averageScore < 60)
        .sort((a, b) => a.averageScore - b.averageScore)
        .slice(0, 3)
      
      return {
        strengths: strengths.map(item => ({
          topic: item.topic,
          score: Math.round(item.averageScore),
          improvement: 'Keep up the excellent work!'
        })),
        weaknesses: weaknesses.map(item => ({
          topic: item.topic,
          score: Math.round(item.averageScore),
          improvement: item.averageScore < 40 
            ? 'Needs significant improvement' 
            : 'Focus on practice and review'
        }))
      }
    } catch (error) {
      console.error('Error analyzing strengths and weaknesses:', error)
      return { strengths: [], weaknesses: [] }
    }
  },

  async getOverallAnalytics() {
    await delay(350)
    
    try {
      const [performance, heatmap, strengthsWeaknesses] = await Promise.all([
        this.getTopicPerformance(),
        this.getPerformanceHeatmap(),
        this.getTopicStrengthsAndWeaknesses()
      ])
      
      const totalTopics = performance.length
      const excellentTopics = heatmap.filter(item => item.category === 'excellent').length
      const needsImprovementTopics = heatmap.filter(item => 
        item.category === 'needs-improvement' || item.category === 'poor'
      ).length
      
      const overallAverage = totalTopics > 0 
        ? performance.reduce((sum, item) => sum + item.averageScore, 0) / totalTopics 
        : 0
      
      return {
        totalTopics,
        excellentTopics,
        needsImprovementTopics,
        overallAverage: Math.round(overallAverage),
        topPerformer: performance[0]?.topic || 'N/A',
        topPerformerScore: performance[0]?.averageScore || 0,
        ...strengthsWeaknesses
      }
    } catch (error) {
      console.error('Error generating overall analytics:', error)
      return {
        totalTopics: 0,
        excellentTopics: 0,
        needsImprovementTopics: 0,
        overallAverage: 0,
        topPerformer: 'N/A',
        topPerformerScore: 0,
        strengths: [],
        weaknesses: []
      }
    }
  }
}