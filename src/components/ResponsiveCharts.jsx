import { useState, useEffect, useRef } from 'react'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'
import { 
  ChartBarIcon, 
  ChartPieIcon, 
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
)

const ResponsiveChart = ({ 
  type = 'bar', 
  data, 
  options = {}, 
  title,
  subtitle,
  className = "",
  allowFullscreen = true,
  height = 300
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const chartRef = useRef(null)
  const containerRef = useRef(null)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }
  
  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])
  
  // Responsive chart options
  const responsiveOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          usePointStyle: true,
          padding: isMobile ? 15 : 20,
          font: {
            size: isMobile ? 12 : 14
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || ''
            const value = context.parsed.y || context.parsed
            return `${label}: $${value.toLocaleString()}`
          }
        }
      }
    },
    scales: type !== 'pie' ? {
      x: {
        grid: {
          display: !isMobile,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          maxRotation: isMobile ? 45 : 0
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          callback: function(value) {
            return '$' + value.toLocaleString()
          }
        }
      }
    } : undefined,
    ...options
  }
  
  const getChartComponent = () => {
    switch (type) {
      case 'pie':
        return <Pie ref={chartRef} data={data} options={responsiveOptions} />
      case 'line':
        return <Line ref={chartRef} data={data} options={responsiveOptions} />
      case 'bar':
      default:
        return <Bar ref={chartRef} data={data} options={responsiveOptions} />
    }
  }
  
  const getChartIcon = () => {
    switch (type) {
      case 'pie':
        return <ChartPieIcon width={20} />
      case 'line':
        return <ChartBarIcon width={20} />
      case 'bar':
      default:
        return <ChartBarIcon width={20} />
    }
  }
  
  if (!data || !data.datasets || data.datasets.length === 0) {
    return (
      <div className={`chart-container chart-container--empty ${className}`}>
        <div className="chart-header">
          <div className="chart-title-section">
            {getChartIcon()}
            <div>
              <h3 className="chart-title">{title || 'Chart'}</h3>
              {subtitle && <p className="chart-subtitle">{subtitle}</p>}
            </div>
          </div>
        </div>
        <div className="chart-empty-state">
          <div className="empty-icon">📊</div>
          <h4>No data available</h4>
          <p>Add some expenses to see your spending patterns.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div 
      ref={containerRef}
      className={`
        chart-container 
        ${isFullscreen ? 'chart-container--fullscreen' : ''} 
        ${className}
      `}
    >
      <div className="chart-header">
        <div className="chart-title-section">
          {getChartIcon()}
          <div>
            <h3 className="chart-title">{title || 'Chart'}</h3>
            {subtitle && <p className="chart-subtitle">{subtitle}</p>}
          </div>
        </div>
        
        <div className="chart-actions">
          {allowFullscreen && !isMobile && (
            <button
              onClick={toggleFullscreen}
              className="chart-action-btn"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? 
                <ArrowsPointingInIcon width={20} /> : 
                <ArrowsPointingOutIcon width={20} />
              }
            </button>
          )}
        </div>
      </div>
      
      <div 
        className="chart-wrapper"
        style={{ 
          height: isFullscreen ? '80vh' : isMobile ? '250px' : `${height}px` 
        }}
      >
        {getChartComponent()}
      </div>
      
      {/* Chart Legend for Mobile */}
      {isMobile && type === 'pie' && data.labels && (
        <div className="mobile-chart-legend">
          {data.labels.map((label, index) => (
            <div key={index} className="legend-item">
              <div 
                className="legend-color"
                style={{ 
                  backgroundColor: data.datasets[0]?.backgroundColor?.[index] || '#ccc' 
                }}
              />
              <span className="legend-label">{label}</span>
              <span className="legend-value">
                ${data.datasets[0]?.data?.[index]?.toLocaleString() || '0'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Specialized chart components
export const ResponsiveBarChart = (props) => (
  <ResponsiveChart type="bar" {...props} />
)

export const ResponsivePieChart = (props) => (
  <ResponsiveChart type="pie" {...props} />
)

export const ResponsiveLineChart = (props) => (
  <ResponsiveChart type="line" {...props} />
)

// Chart grid component for multiple charts
export const ChartGrid = ({ children, columns = 2 }) => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return (
    <div 
      className="charts-grid"
      style={{
        gridTemplateColumns: isMobile ? '1fr' : `repeat(${columns}, 1fr)`
      }}
    >
      {children}
    </div>
  )
}

// Chart with data summary
export const ChartWithSummary = ({ 
  chart, 
  summary, 
  title,
  className = "" 
}) => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return (
    <div className={`chart-with-summary ${className}`}>
      {title && <h2 className="section-title">{title}</h2>}
      
      <div className={`chart-summary-layout ${isMobile ? 'mobile' : 'desktop'}`}>
        <div className="chart-section">
          {chart}
        </div>
        
        <div className="summary-section">
          {summary}
        </div>
      </div>
    </div>
  )
}

export default ResponsiveChart