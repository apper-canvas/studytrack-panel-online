import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Chart from 'react-apexcharts'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import { analyticsService } from '@/services/analyticsService'

const AnalyticsCharts = () => {
  const [topicPerformance, setTopicPerformance] = useState([])
  const [heatmapData, setHeatmapData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [chartType, setChartType] = useState('bar')

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [performanceData, heatmapData] = await Promise.all([
        analyticsService.getTopicPerformance(),
        analyticsService.getPerformanceHeatmap()
      ])
      
      setTopicPerformance(performanceData)
      setHeatmapData(heatmapData)
    } catch (err) {
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading type="dashboard" />
  if (error) return <Error message={error} onRetry={loadAnalyticsData} />

  if (topicPerformance.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-900">
              Analytics Charts
            </h2>
            <p className="text-gray-600 mt-1">
              Visualize your topic-wise performance and identify areas for improvement
            </p>
          </div>
        </div>
        
        <Empty
          type="analytics"
          message="No test data available for analytics"
          action={() => window.location.href = '/mock-tests'}
        />
      </div>
    )
  }

  // Prepare bar chart data
  const barChartOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return Math.round(val) + '%'
      },
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['#304758']
      }
    },
    xaxis: {
      categories: topicPerformance.map(item => item.topic),
      position: 'bottom',
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        show: true,
        formatter: function (val) {
          return Math.round(val) + '%'
        },
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        }
      }
    },
    colors: ['#4F46E5'],
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 3
    }
  }

  const barChartSeries = [{
    name: 'Average Score',
    data: topicPerformance.map(item => Math.round(item.averageScore))
  }]

  // Prepare heatmap data
  const heatmapOptions = {
    chart: {
      height: 250,
      type: 'heatmap',
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ['#fff'],
        fontSize: '12px',
        fontWeight: 'bold'
      }
    },
    colors: ['#10B981'],
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: 8,
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 39,
              name: 'Poor',
              color: '#EF4444'
            },
            {
              from: 40,
              to: 59,
              name: 'Needs Improvement',
              color: '#F59E0B'
            },
            {
              from: 60,
              to: 79,
              name: 'Good',
              color: '#3B82F6'
            },
            {
              from: 80,
              to: 100,
              name: 'Excellent',
              color: '#10B981'
            }
          ]
        }
      }
    },
    grid: {
      padding: {
        right: 20
      }
    },
    xaxis: {
      type: 'category',
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        }
      }
    }
  }

  const heatmapSeries = [{
    name: 'Performance',
    data: heatmapData.map(item => ({
      x: item.topic,
      y: item.score
    }))
  }]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">
            Analytics Charts
          </h2>
          <p className="text-gray-600 mt-1">
            Visualize your topic-wise performance and identify areas for improvement
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={chartType === 'bar' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setChartType('bar')}
            icon="BarChart3"
          >
            Bar Chart
          </Button>
          <Button
            variant={chartType === 'heatmap' ? 'primary' : 'outline'}
            size="small"
            onClick={() => setChartType('heatmap')}
            icon="Grid3x3"
          >
            Heatmap
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Performance Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-semibold text-gray-900">
                Topic Average Scores
              </h3>
              <ApperIcon name="BarChart3" size={24} className="text-primary" />
            </div>
            
            <div className="h-80">
              <Chart
                options={barChartOptions}
                series={barChartSeries}
                type="bar"
                height="100%"
              />
            </div>
            
            <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
              <div className="flex items-center space-x-2">
                <ApperIcon name="TrendingUp" size={16} className="text-primary" />
                <span className="text-sm font-medium text-gray-900">
                  Average Performance: {Math.round(topicPerformance.reduce((sum, item) => sum + item.averageScore, 0) / topicPerformance.length)}%
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Performance Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-semibold text-gray-900">
                Performance Heatmap
              </h3>
              <ApperIcon name="Grid3x3" size={24} className="text-primary" />
            </div>
            
            <div className="h-80">
              <Chart
                options={heatmapOptions}
                series={heatmapSeries}
                type="heatmap"
                height="100%"
              />
            </div>
            
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs text-gray-600">Poor (0-39%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-xs text-gray-600">Needs Work (40-59%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-xs text-gray-600">Good (60-79%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-xs text-gray-600">Excellent (80-100%)</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <h3 className="text-xl font-display font-semibold text-gray-900 mb-6">
            Performance Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {heatmapData.map((item, index) => {
              const getColorClasses = (category) => {
                switch (category) {
                  case 'excellent': return 'from-green-500 to-green-600 text-white'
                  case 'good': return 'from-blue-500 to-blue-600 text-white'
                  case 'needs-improvement': return 'from-yellow-500 to-yellow-600 text-white'
                  case 'poor': return 'from-red-500 to-red-600 text-white'
                  default: return 'from-gray-500 to-gray-600 text-white'
                }
              }
              
              return (
                <motion.div
                  key={item.topic}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-4 rounded-lg bg-gradient-to-r ${getColorClasses(item.category)}`}
                >
                  <h4 className="font-semibold text-sm mb-2">{item.topic}</h4>
                  <div className="text-2xl font-bold mb-1">{item.score}%</div>
                  <div className="text-xs opacity-90 capitalize">
                    {item.category.replace('-', ' ')}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default AnalyticsCharts