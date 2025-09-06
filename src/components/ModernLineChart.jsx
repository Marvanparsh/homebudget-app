import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../helpers';

const ModernLineChart = ({ data, title, color = 'hsl(183, 74%, 54%)', type = 'monthly' }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  const { points, maxValue, minValue, gridLines } = useMemo(() => {
    if (!data.length) return { points: [], maxValue: 0, minValue: 0, gridLines: [] };
    
    const values = data.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = 0; // Always start from 0 for proper alignment
    const range = maxValue || 1;
    
    // Calculate points with proper margins
    const chartWidth = 85; // Leave 15% margin (7.5% on each side)
    const chartHeight = 70; // Leave 30% margin (15% top, 15% bottom)
    const startX = 7.5;
    const startY = 15;
    
    const points = data.map((item, index) => ({
      ...item,
      x: startX + (index / Math.max(data.length - 1, 1)) * chartWidth,
      y: startY + chartHeight - ((item.value - minValue) / range) * chartHeight
    }));
    
    // Generate horizontal grid lines
    const gridLines = [];
    const numLines = 4;
    for (let i = 0; i <= numLines; i++) {
      const y = startY + (i / numLines) * chartHeight;
      const value = maxValue - (i / numLines) * (maxValue - minValue);
      gridLines.push({ y, value });
    }
    
    return { points, maxValue, minValue, gridLines };
  }, [data]);
  
  // Create smooth path using cubic bezier curves
  const createSmoothPath = (points) => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      // Calculate control points for smooth curves
      const cp1x = prev.x + (curr.x - prev.x) * 0.3;
      const cp1y = prev.y;
      const cp2x = curr.x - (next ? (next.x - curr.x) * 0.3 : (curr.x - prev.x) * 0.3);
      const cp2y = curr.y;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    
    return path;
  };
  
  const pathData = createSmoothPath(points);
  const areaData = pathData ? 
    `${pathData} L ${points[points.length - 1].x} 85 L ${points[0].x} 85 Z` : '';
  
  return (
    <div className="modern-line-chart">
      <h3 className="chart-title">{title}</h3>
      
      <div className="chart-container">
        <svg viewBox="0 0 100 100" className="line-chart-svg">
          <defs>
            <linearGradient id={`gradient-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Dotted grid lines */}
          {gridLines.map((line, index) => (
            <line
              key={index}
              x1="7.5"
              y1={line.y}
              x2="92.5"
              y2={line.y}
              stroke="hsl(var(--muted))"
              strokeWidth="0.2"
              strokeDasharray="1,2"
              opacity="0.4"
            />
          ))}
          
          {/* Vertical hover line */}
          {hoveredPoint !== null && (
            <line
              x1={points[hoveredPoint].x}
              y1="15"
              x2={points[hoveredPoint].x}
              y2="85"
              stroke={color}
              strokeWidth="1"
              strokeDasharray="3,3"
              opacity="0.6"
            />
          )}
          
          {/* Area fill */}
          {areaData && (
            <path
              d={areaData}
              fill={`url(#gradient-${type})`}
              className="chart-area"
            />
          )}
          
          {/* Main line */}
          {pathData && (
            <path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              className="chart-line"
              filter="url(#glow)"
            />
          )}
          
          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              {/* Outer ring for hover effect */}
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint === index ? "4" : "0"}
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity="0.3"
                className="point-ring"
              />
              
              {/* Main point */}
              <circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint === index ? "3" : "2"}
                fill="white"
                stroke={color}
                strokeWidth="2"
                className="chart-point"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer' }}
              />
              
              {/* Value tooltip */}
              {hoveredPoint === index && (
                <g>
                  <rect
                    x={point.x - 20}
                    y={point.y - 12}
                    width="40"
                    height="8"
                    fill="hsl(var(--text))"
                    rx="2"
                    opacity="0.9"
                  />
                  <text
                    x={point.x}
                    y={point.y - 6}
                    textAnchor="middle"
                    fontSize="3"
                    fill="hsl(var(--bkg))"
                    fontWeight="bold"
                  >
                    {formatCurrency(point.value)}
                  </text>
                  
                  {/* Date tooltip */}
                  <rect
                    x={point.x - 15}
                    y={point.y + 4}
                    width="30"
                    height="6"
                    fill="hsl(var(--accent))"
                    rx="1"
                    opacity="0.8"
                  />
                  <text
                    x={point.x}
                    y={point.y + 8}
                    textAnchor="middle"
                    fontSize="2.5"
                    fill="white"
                    fontWeight="500"
                  >
                    {point.label}
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>
        
        {/* Axis labels */}
        <div className="chart-labels">
          <div className="y-axis">
            {gridLines.map((line, index) => (
              <span key={index} className="y-label">
                {formatCurrency(line.value)}
              </span>
            ))}
          </div>
          <div className="x-axis">
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

export default ModernLineChart;