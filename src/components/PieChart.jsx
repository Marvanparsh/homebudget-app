import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../helpers';

const PieChart = ({ data, title, onSegmentClick }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  
  const total = useMemo(() => 
    data.reduce((sum, item) => sum + item.value, 0), [data]
  );
  
  const segments = useMemo(() => {
    let currentAngle = 0;
    return data.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const angle = (item.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      const startAngleRad = (startAngle - 90) * Math.PI / 180;
      const endAngleRad = (endAngle - 90) * Math.PI / 180;
      
      const x1 = 50 + 40 * Math.cos(startAngleRad);
      const y1 = 50 + 40 * Math.sin(startAngleRad);
      const x2 = 50 + 40 * Math.cos(endAngleRad);
      const y2 = 50 + 40 * Math.sin(endAngleRad);
      
      const largeArc = angle > 180 ? 1 : 0;
      const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
      
      currentAngle += angle;
      
      return {
        ...item,
        pathData,
        percentage,
        startAngle,
        endAngle,
        color: item.color || `hsl(${index * 45}, 70%, 60%)`
      };
    });
  }, [data, total]);
  
  const handleSegmentClick = (segment, index) => {
    setSelectedSegment(selectedSegment === index ? null : index);
    onSegmentClick?.(segment);
  };
  
  return (
    <div className="piechart-container">
      <h3 className="chart-title">{title}</h3>
      
      <div className="piechart-wrapper">
        {/* Pie Chart Viewbox First */}
        <svg viewBox="0 0 100 100" className="pie-chart">
          {segments.map((segment, index) => (
            <g key={index}>
              <path
                d={segment.pathData}
                fill={segment.color}
                stroke="#fff"
                strokeWidth="0.5"
                className={`pie-segment ${hoveredSegment === index ? 'hovered' : ''} ${selectedSegment === index ? 'selected' : ''}`}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => handleSegmentClick(segment, index)}
                style={{
                  filter: hoveredSegment === index ? 'brightness(1.1)' : 'none',
                  transform: selectedSegment === index ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: '50% 50%'
                }}
              />
              
              {segment.percentage > 5 && (
                <text
                  x={50 + 25 * Math.cos(((segment.startAngle + segment.endAngle) / 2 - 90) * Math.PI / 180)}
                  y={50 + 25 * Math.sin(((segment.startAngle + segment.endAngle) / 2 - 90) * Math.PI / 180)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pie-label"
                  fontSize="3"
                  fill="white"
                  fontWeight="bold"
                >
                  {segment.percentage.toFixed(0)}%
                </text>
              )}
            </g>
          ))}
          
          {hoveredSegment !== null && (
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="middle"
              className="pie-center-text"
              fontSize="4"
              fontWeight="bold"
              fill="hsl(var(--text))"
            >
              {formatCurrency(segments[hoveredSegment].value)}
            </text>
          )}
        </svg>
        
        {/* Pie Legend Below */}
        <div className="pie-legend">
          {segments.map((segment, index) => (
            <div 
              key={index} 
              className={`legend-item ${selectedSegment === index ? 'selected' : ''}`}
              onClick={() => handleSegmentClick(segment, index)}
            >
              <div 
                className="legend-color" 
                style={{ backgroundColor: segment.color }}
              ></div>
              <span className="legend-label">{segment.label}</span>
              <span className="legend-value">{formatCurrency(segment.value)}</span>
              <span className="legend-percentage">({segment.percentage.toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PieChart;