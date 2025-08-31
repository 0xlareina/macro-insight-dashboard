// CryptoSense Dashboard - ETF Flow Chart Component
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface ETFFlowData {
  date: string;
  flow: number;
  cumulativeFlow: number;
}

interface ETFFlowChartProps {
  data: ETFFlowData[];
  height?: number;
}

export const ETFFlowChart: React.FC<ETFFlowChartProps> = ({
  data,
  height = 300,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark');
    }

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      title: {
        text: 'Bitcoin ETF Flow Analysis',
        left: 'center',
        textStyle: {
          color: '#c9d1d9',
          fontSize: 16,
          fontWeight: 'normal',
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: '#333',
        textStyle: {
          color: '#fff',
        },
        formatter: (params: any) => {
          const dataPoint = params[0];
          const cumDataPoint = params[1];
          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">
                ${dataPoint.axisValue}
              </div>
              <div>Daily Flow: <span style="color: ${dataPoint.value >= 0 ? '#26d0ce' : '#f85149'};">
                ${dataPoint.value >= 0 ? '+' : ''}${dataPoint.value.toLocaleString()} BTC
              </span></div>
              <div>Cumulative: <span style="color: #1890ff;">
                ${cumDataPoint.value.toLocaleString()} BTC
              </span></div>
            </div>
          `;
        },
      },
      legend: {
        data: ['Daily Flow', 'Cumulative Flow'],
        textStyle: {
          color: '#8b949e',
        },
        bottom: '5%',
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '20%',
        bottom: '20%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.date),
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
      },
      yAxis: [
        {
          type: 'value',
          name: 'Daily Flow (BTC)',
          nameTextStyle: { color: '#8b949e' },
          position: 'left',
          axisLine: {
            lineStyle: { color: '#30363d' },
          },
          axisTick: {
            lineStyle: { color: '#30363d' },
          },
          axisLabel: {
            color: '#8b949e',
            fontSize: 10,
            formatter: (value: number) => value.toLocaleString(),
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
          name: 'Cumulative (BTC)',
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
            formatter: (value: number) => value.toLocaleString(),
          },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: 'Daily Flow',
          type: 'bar',
          yAxisIndex: 0,
          data: data.map(d => ({
            value: d.flow,
            itemStyle: {
              color: d.flow >= 0 ? '#26d0ce' : '#f85149',
            },
          })),
          barWidth: '60%',
          z: 2,
        },
        {
          name: 'Cumulative Flow',
          type: 'line',
          yAxisIndex: 1,
          data: data.map(d => d.cumulativeFlow),
          lineStyle: {
            color: '#1890ff',
            width: 2,
          },
          itemStyle: {
            color: '#1890ff',
          },
          symbol: 'circle',
          symbolSize: 4,
          z: 3,
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          start: 70,
          end: 100,
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  return (
    <div className="etf-flow-chart">
      <div
        ref={chartRef}
        style={{ height: `${height}px`, width: '100%' }}
      />
    </div>
  );
};