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
    
    const chartPoints = data.map(item => {
      const date = new Date();
      if (type === 'monthly') {
        const monthIndex = data.indexOf(item);
        date.setMonth(date.getMonth() - (data.length - 1 - monthIndex));
        date.setDate(1);
      } else {
        const weekIndex = data.indexOf(item);
        const daysBack = (data.length - 1 - weekIndex) * 7;
        date.setDate(date.getDate() - daysBack - date.getDay());
      }
      
      return {
        x: date.toISOString().split('T')[0],
        y: item.value
      };
    });
    
    return {
      datasets: [{
        data: chartPoints,
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
  }, [data, color, type]);

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
        backgroundColor: 'hsl(var(--text))',
        titleColor: 'hsl(var(--bkg))',
        bodyColor: 'hsl(var(--bkg))',
        borderColor: color,
        borderWidth: 1,
        callbacks: {
          label: (context) => `${formatCurrency(context.parsed.y)}`
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: type === 'monthly' ? 'month' : 'week',
          displayFormats: {
            month: 'MMM yy',
            week: 'MMM dd'
          }
        },
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