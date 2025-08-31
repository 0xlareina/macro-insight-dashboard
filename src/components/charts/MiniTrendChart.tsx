import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MiniTrendChartProps {
  data: Array<{ date: string; value: number }>;
  color?: string;
  height?: number;
  strokeWidth?: number;
  showDots?: boolean;
}

export const MiniTrendChart: React.FC<MiniTrendChartProps> = ({
  data,
  color = '#1890ff',
  height = 24,
  strokeWidth = 1.5,
  showDots = false,
}) => {
  if (!data || data.length === 0) {
    return (
      <div 
        style={{ 
          width: '100%', 
          height: height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#8b949e',
          fontSize: '10px'
        }}
      >
        No data
      </div>
    );
  }

  // Determine trend direction for color
  const firstValue = data[0]?.value || 0;
  const lastValue = data[data.length - 1]?.value || 0;
  const isPositiveTrend = lastValue >= firstValue;
  const trendColor = color === 'auto' ? (isPositiveTrend ? '#52c41a' : '#f5222d') : color;

  return (
    <div style={{ width: '100%', height: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={trendColor}
            strokeWidth={strokeWidth}
            dot={showDots ? { r: 1, fill: trendColor } : false}
            activeDot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};