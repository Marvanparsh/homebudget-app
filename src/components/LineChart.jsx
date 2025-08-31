import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../helpers';

const LineChart = ({ data, title, color = 'hsl(var(--accent))' }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  const { points, maxValue, minValue } = useMemo(() => {
    if (!data.length) return { points: [], maxValue: 0, minValue: 0 };
    
    // Add padding data points if only one data point
    let processedData = [...data];
    if (data.length === 1) {
      processedData = [
        { ...data[0], value: 0, label: 'Start' },
        ...data,
        { ...data[0], value: data[0].value * 0.8, label: 'Projected' }
      ];
    }
    
    const values = processedData.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || maxValue || 1;
    
    const points = processedData.map((item, index) => ({
      ...item,
      x: (index / Math.max(processedData.length - 1, 1)) * 80 + 10,
      y: 80 - ((item.value - minValue) / range) * 60 + 10
    }));
    
    return { points, maxValue, minValue };
  }, [data]);
  
  const pathData = points.length > 0 ? 
    `M ${points[0].x} ${points[0].y} ` + 
    points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') : '';
  
  const areaData = points.length > 0 ?
    pathData + ` L ${points[points.length - 1].x} 90 L ${points[0].x} 90 Z` : '';
  
  return (
    <div className="line-chart-container">
      <h3 className="chart-title">{title}</h3>
      
      <div className="line-chart-wrapper">
        <svg viewBox="0 0 100 100" className="line-chart">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(280, 70%, 60%)" />
              <stop offset="50%" stopColor={color} />
              <stop offset="100%" stopColor="hsl(120, 70%, 60%)" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[20, 40, 60, 80].map(y => (
            <line
              key={y}
              x1="10"
              y1={y}
              x2="90"
              y2={y}
              stroke="hsl(var(--light))"
              strokeWidth="0.3"
              opacity="0.3"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Area fill */}
          {areaData && (
            <path
              d={areaData}
              fill="url(#areaGradient)"
              className="line-area"
            />
          )}
          
          {/* Line */}
          {pathData && (
            <path
              d={pathData}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              className="line-path"
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            />
          )}
          
          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint === index ? "3" : "2"}
                fill="white"
                stroke={color}
                strokeWidth="2"
                className="line-point-bg"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint === index ? "1.5" : "1"}
                fill={color}
                className="line-point"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
          
          {/* Hover tooltip */}
          {hoveredPoint !== null && (
            <g>
              <rect
                x={points[hoveredPoint].x - 15}
                y={points[hoveredPoint].y - 8}
                width="30"
                height="6"
                fill="hsl(var(--text))"
                rx="1"
                opacity="0.9"
              />
              <text
                x={points[hoveredPoint].x}
                y={points[hoveredPoint].y - 5}
                textAnchor="middle"
                fontSize="2.5"
                fill="hsl(var(--bkg))"
                fontWeight="bold"
              >
                {formatCurrency(points[hoveredPoint].value)}
              </text>
            </g>
          )}
        </svg>
        
        <div className="chart-labels">
          <div className="y-axis-labels">
            <span>{formatCurrency(maxValue)}</span>
            <span>{formatCurrency((maxValue + minValue) / 2)}</span>
            <span>{formatCurrency(minValue)}</span>
          </div>
          <div className="x-axis-labels">
            {points.map((point, index) => (
              <span key={index} className="x-label">
                {point.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineChart;