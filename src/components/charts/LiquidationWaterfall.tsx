// CryptoSense Dashboard - Liquidation Waterfall Chart Component
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { formatVolume } from '../../utils';

interface LiquidationData {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  price: number;
  quantity: number;
  totalValue: number;
  timestamp: number;
  exchange: string;
}

interface LiquidationWaterfallProps {
  data: LiquidationData[];
  height?: number;
}

export const LiquidationWaterfall: React.FC<LiquidationWaterfallProps> = ({
  data,
  height = 300,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    // Initialize chart
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark');
    }
    
    // Process data for waterfall visualization
    const processedData = data
      .sort((a, b) => b.timestamp - a.timestamp) // Most recent first
      .slice(0, 20) // Show last 20 liquidations
      .map((item, index) => ({
        name: `${item.symbol}-${item.side}`,
        value: item.totalValue,
        symbol: item.symbol,
        side: item.side,
        price: item.price,
        quantity: item.quantity,
        timestamp: item.timestamp,
        exchange: item.exchange,
        index: index,
      }));
    
    // Create scatter plot data for bubble chart
    const scatterData = processedData.map(item => ({
      value: [
        item.index,
        item.price,
        item.totalValue,
        item.symbol,
        item.side,
        item.quantity,
      ],
      itemStyle: {
        color: item.side === 'long' ? 'rgba(248, 81, 73, 0.8)' : 'rgba(38, 208, 206, 0.8)',
        borderColor: item.side === 'long' ? '#f85149' : '#26d0ce',
        borderWidth: 2,
      },
    }));
    
    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      title: {
        text: 'Recent Liquidations Flow',
        left: 'center',
        textStyle: {
          color: '#c9d1d9',
          fontSize: 16,
          fontWeight: 'normal',
        },
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '15%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: processedData.map((_, index) => `T-${index}`),
        axisLine: {
          lineStyle: { color: '#30363d' },
        },
        axisTick: {
          lineStyle: { color: '#30363d' },
        },
        axisLabel: {
          color: '#8b949e',
          fontSize: 10,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#21262d',
            type: 'dashed',
          },
        },
      },
      yAxis: [
        {
          type: 'value',
          name: 'Price ($)',
          nameTextStyle: { color: '#8b949e' },
          axisLine: {
            lineStyle: { color: '#30363d' },
          },
          axisTick: {
            lineStyle: { color: '#30363d' },
          },
          axisLabel: {
            color: '#8b949e',
            fontSize: 10,
            formatter: (value: number) => `$${(value / 1000).toFixed(0)}K`,
          },
          splitLine: {
            lineStyle: {
              color: '#21262d',
              type: 'dashed',
            },
          },
        },
        {
          type: 'value',
          name: 'Value ($)',
          nameTextStyle: { color: '#8b949e' },
          position: 'right',
          axisLine: {
            lineStyle: { color: '#30363d' },
          },
          axisTick: {
            lineStyle: { color: '#30363d' },
          },
          axisLabel: {
            color: '#8b949e',
            fontSize: 10,
            formatter: (value: number) => formatVolume(value),
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'Liquidation Flow',
          type: 'scatter',
          yAxisIndex: 0,
          data: scatterData,
          symbolSize: (data: any) => {
            // Scale bubble size based on liquidation value
            const value = data[2]; // totalValue
            const minSize = 8;
            const maxSize = 50;
            const scaledSize = Math.max(
              minSize,
              Math.min(maxSize, (value / 200000) * 30 + minSize)
            );
            return scaledSize;
          },
          emphasis: {
            focus: 'series',
            scale: 1.2,
          },
          animationDelay: (idx: number) => idx * 100,
        },
        {
          name: 'Liquidation Volume',
          type: 'bar',
          yAxisIndex: 1,
          data: processedData.map(item => ({
            value: item.totalValue,
            itemStyle: {
              color: item.side === 'long' 
                ? 'rgba(248, 81, 73, 0.3)' 
                : 'rgba(38, 208, 206, 0.3)',
              borderColor: item.side === 'long' ? '#f85149' : '#26d0ce',
              borderWidth: 1,
            },
          })),
          barWidth: '60%',
          z: 1,
        },
      ],
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: '#333',
        borderWidth: 1,
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
        formatter: (params: any) => {
          if (params.seriesName === 'Liquidation Flow') {
            const [index, price, totalValue, symbol, side, quantity] = params.data.value;
            const time = new Date(processedData[index].timestamp).toLocaleTimeString();
            
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; margin-bottom: 4px;">
                  ${symbol} ${side.toUpperCase()} Liquidation
                </div>
                <div>Time: ${time}</div>
                <div>Price: $${price.toLocaleString()}</div>
                <div>Quantity: ${quantity}</div>
                <div>Total Value: $${totalValue.toLocaleString()}</div>
                <div style="margin-top: 4px; font-size: 10px; color: #8b949e;">
                  ${processedData[index].exchange.toUpperCase()}
                </div>
              </div>
            `;
          } else {
            const item = processedData[params.dataIndex];
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold;">Volume: $${formatVolume(params.value)}</div>
                <div>${item.symbol} ${item.side.toUpperCase()}</div>
              </div>
            `;
          }
        },
      },
      legend: {
        data: ['Liquidation Flow', 'Liquidation Volume'],
        textStyle: {
          color: '#8b949e',
        },
        bottom: '5%',
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          start: 0,
          end: 100,
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
  }, [data]);
  
  return (
    <div className="liquidation-waterfall">
      <div 
        ref={chartRef}
        style={{ height: `${height}px`, width: '100%' }}
      />
      
      {/* Summary Statistics */}
      <div 
        style={{ 
          display: 'flex',
          justifyContent: 'space-around',
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(33, 38, 45, 0.5)',
          borderRadius: '6px',
          fontSize: '12px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#f85149', fontWeight: 600 }}>
            {data.filter(d => d.side === 'long').length}
          </div>
          <div style={{ color: '#8b949e' }}>Long Liq.</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#26d0ce', fontWeight: 600 }}>
            {data.filter(d => d.side === 'short').length}
          </div>
          <div style={{ color: '#8b949e' }}>Short Liq.</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#c9d1d9', fontWeight: 600 }}>
            {formatVolume(data.reduce((sum, d) => sum + d.totalValue, 0))}
          </div>
          <div style={{ color: '#8b949e' }}>Total Volume</div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#c9d1d9', fontWeight: 600 }}>
            ${Math.max(...data.map(d => d.price)).toLocaleString()}
          </div>
          <div style={{ color: '#8b949e' }}>Highest Price</div>
        </div>
      </div>
    </div>
  );
};