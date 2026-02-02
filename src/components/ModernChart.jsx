import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { formatCurrency } from '../helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

const ModernChart = ({ data, color, type, yAxisMax }) => {
  const [theme, setTheme] = React.useState(document.documentElement.getAttribute('data-theme'));
  
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  
  const chartData = useMemo(() => {
    if (!data?.length) return null;
    
    return {
      labels: data.map(item => item.label),
      datasets: [{
        data: data.map(item => item.value),
        borderColor: color,
        backgroundColor: color.replace('hsl(', 'hsla(').replace(')', ', 0.1)'),
        borderWidth: 3,
        pointBackgroundColor: color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        tension: 0.4,
      }]
    };
  }, [data, color]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(128, 128, 128, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: color,
        borderWidth: 1,
        callbacks: {
          label: (context) => `${formatCurrency(context.parsed.y)}`
        }
      }
    },
    scales: {
      x: {
        type: 'category',
        grid: {
          display: false
        },
        ticks: {
          color: theme === 'dark' ? '#ffffff' : '#000000',
          maxTicksLimit: 6
        }
      },
      y: {
        beginAtZero: true,
        max: yAxisMax,
        grid: {
          color: 'hsl(var(--light) / 0.2)',
          drawBorder: false
        },
        ticks: {
          color: theme === 'dark' ? '#ffffff' : '#000000',
          callback: (value) => formatCurrency(value)
        }
      }
    }
  }), [color, type, yAxisMax, theme]);

  if (!chartData) {
    return (
      <div className="modern-chart-container">
        <div className="no-chart-data">No data available</div>
      </div>
    );
  }

  return (
    <div className="modern-chart-container">
      <div className="chart-wrapper">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ModernChart;