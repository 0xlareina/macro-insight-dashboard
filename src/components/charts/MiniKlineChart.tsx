// CryptoSense Dashboard - Mini K-line Chart Component
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface KlineData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface MiniKlineChartProps {
  symbol: string;
  data: KlineData[];
  width?: number;
  height?: number;
  showVolume?: boolean;
}

export const MiniKlineChart: React.FC<MiniKlineChartProps> = ({
  symbol,
  data,
  width = 120,
  height = 60,
  showVolume = false,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  // Generate mock data if no data provided
  const mockData = data.length === 0 ? generateMockKlineData() : data;
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Initialize chart
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark');
    }
    
    // Prepare data for ECharts
    const chartData = mockData.map(item => [
      item.timestamp,
      item.open,
      item.close,
      item.low,
      item.high,
      item.volume,
    ]);
    
    const xAxisData = mockData.map(item => new Date(item.timestamp));
    
    // Calculate trend color based on first and last price
    const firstPrice = mockData[0]?.close || 0;
    const lastPrice = mockData[mockData.length - 1]?.close || 0;
    const trend = lastPrice >= firstPrice ? 'up' : 'down';
    
    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      animation: false,
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: showVolume ? 20 : 0,
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        show: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        scale: true,
        show: false,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
      series: [
        {
          type: 'candlestick',
          data: chartData,
          itemStyle: {
            color: trend === 'up' ? '#26d0ce' : '#f85149',
            color0: trend === 'up' ? '#f85149' : '#26d0ce',
            borderColor: trend === 'up' ? '#26d0ce' : '#f85149',
            borderColor0: trend === 'up' ? '#f85149' : '#26d0ce',
          },
          barWidth: '60%',
        },
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#333',
        textStyle: {
          color: '#fff',
          fontSize: 10,
        },
        formatter: (params: any) => {
          const data = params[0];
          if (!data) return '';
          
          const [timestamp, open, close, low, high] = data.data;
          const date = new Date(timestamp).toLocaleTimeString();
          
          return `
            <div style="font-size: 10px;">
              <div>${symbol} - ${date}</div>
              <div>Open: $${open.toFixed(2)}</div>
              <div>High: $${high.toFixed(2)}</div>
              <div>Low: $${low.toFixed(2)}</div>
              <div>Close: $${close.toFixed(2)}</div>
            </div>
          `;
        },
      },
    };
    
    // Add volume series if requested
    if (showVolume) {
      option.series?.push({
        type: 'bar',
        data: mockData.map(item => item.volume),
        yAxisIndex: 1,
        itemStyle: {
          color: trend === 'up' ? 'rgba(38, 208, 206, 0.3)' : 'rgba(248, 81, 73, 0.3)',
        },
        barWidth: '60%',
      });
      
      // Add second y-axis for volume
      (option as any).yAxis = [
        option.yAxis,
        {
          type: 'value',
          scale: true,
          show: false,
          splitNumber: 2,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
        },
      ];
      
      // Adjust grid for volume
      (option.grid as any).bottom = 15;
    }
    
    chartInstance.current.setOption(option);
    
    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mockData, symbol, showVolume]);
  
  return (
    <div 
      ref={chartRef}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        cursor: 'pointer',
      }}
      className="mini-kline-chart"
    />
  );
};

// Generate mock K-line data for demonstration
function generateMockKlineData(): KlineData[] {
  const data: KlineData[] = [];
  const now = Date.now();
  const interval = 5 * 60 * 1000; // 5 minutes
  let basePrice = 100 + Math.random() * 50; // Random base price
  
  for (let i = 20; i >= 0; i--) {
    const timestamp = now - i * interval;
    const volatility = 0.02; // 2% volatility
    
    // Generate OHLC data with realistic price movement
    const priceChange = (Math.random() - 0.5) * 2 * volatility;
    const open = basePrice;
    const close = basePrice * (1 + priceChange);
    
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    
    const volume = 1000000 + Math.random() * 2000000;
    
    data.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
    });
    
    basePrice = close; // Update base price for next candle
  }
  
  return data;
}