// CryptoSense Dashboard - Fear & Greed Index Gauge Component
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { getFearGreedColor, getFearGreedClassification } from '../../utils';

interface FearGreedGaugeProps {
  value: number;
  height?: number;
  showHistory?: boolean;
  historicalData?: Array<{ date: string; value: number }>;
}

export const FearGreedGauge: React.FC<FearGreedGaugeProps> = ({
  value,
  height = 300,
  showHistory = false,
  historicalData = [],
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Initialize chart
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark');
    }
    
    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      series: [
        {
          type: 'gauge',
          center: ['50%', '60%'],
          radius: '90%',
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 100,
          splitNumber: 5,
          axisLine: {
            lineStyle: {
              width: 30,
              color: [
                [0.25, '#8B0000'], // Extreme Fear (0-25)
                [0.45, '#FF4757'], // Fear (26-45)
                [0.55, '#FAAD14'], // Neutral (46-55)
                [0.75, '#7ED321'], // Greed (56-75)
                [1, '#27AE60'],     // Extreme Greed (76-100)
              ],
            },
          },
          pointer: {
            icon: 'path://M2090.36389,615.30999 L2090.36389,615.30999 C2091.48372,615.30999 2092.40383,616.194028 2092.44859,617.312956 L2096.90698,728.755929 C2097.05155,732.369577 2094.2393,735.416212 2090.62566,735.56078 C2090.53845,735.564269 2090.45117,735.566014 2090.36389,735.566014 L2090.36389,735.566014 C2086.74736,735.566014 2083.81557,732.63423 2083.81557,729.017692 C2083.81557,728.930412 2083.81732,728.843149 2083.82081,728.755929 L2088.2792,617.312956 C2088.32401,616.194028 2089.24407,615.30999 2090.36389,615.30999 Z',
            length: '75%',
            width: 16,
            offsetCenter: [0, '-10%'],
            itemStyle: {
              color: 'auto',
            },
          },
          axisTick: {
            length: 12,
            lineStyle: {
              color: 'auto',
              width: 2,
            },
          },
          splitLine: {
            length: 20,
            lineStyle: {
              color: 'auto',
              width: 5,
            },
          },
          axisLabel: {
            color: '#999',
            fontSize: 12,
            distance: -60,
            formatter: (value: number) => {
              if (value === 0) return 'Extreme\nFear';
              if (value === 25) return 'Fear';
              if (value === 50) return 'Neutral';
              if (value === 75) return 'Greed';
              if (value === 100) return 'Extreme\nGreed';
              return '';
            },
          },
          title: {
            offsetCenter: [0, '30%'],
            fontSize: 24,
            color: '#999',
          },
          detail: {
            fontSize: 48,
            offsetCenter: [0, '0%'],
            valueAnimation: true,
            color: getFearGreedColor(value),
            formatter: '{value}',
          },
          data: [
            {
              value: value,
              name: getFearGreedClassification(value),
            },
          ],
        },
      ],
    };
    
    chartInstance.current.setOption(option);
    
    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [value]);
  
  return (
    <div className="fear-greed-gauge">
      <div 
        ref={chartRef}
        style={{ height: `${height}px`, width: '100%' }}
      />
      
      <div className="gauge-components">
        <h4>Index Components</h4>
        <div className="component-list">
          <div className="component-item">
            <span className="component-name">Volatility</span>
            <span className="component-weight">25%</span>
          </div>
          <div className="component-item">
            <span className="component-name">Market Momentum</span>
            <span className="component-weight">25%</span>
          </div>
          <div className="component-item">
            <span className="component-name">Social Media</span>
            <span className="component-weight">15%</span>
          </div>
          <div className="component-item">
            <span className="component-name">Surveys</span>
            <span className="component-weight">15%</span>
          </div>
          <div className="component-item">
            <span className="component-name">BTC Dominance</span>
            <span className="component-weight">10%</span>
          </div>
          <div className="component-item">
            <span className="component-name">Google Trends</span>
            <span className="component-weight">10%</span>
          </div>
        </div>
      </div>
    </div>
  );
};