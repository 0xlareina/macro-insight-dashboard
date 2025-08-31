// CryptoSense Dashboard - Technical Indicators Component
import React from 'react';
import { Row, Col, Progress, Card, Statistic, Space, Tag } from 'antd';
import {
  TrendingUpOutlined,
  TrendingDownOutlined,
  MinusOutlined,
  SignalFilled,
} from '@ant-design/icons';
import { formatVolume } from '../../utils';

interface TechnicalIndicatorsProps {
  symbol: string;
  price: number;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  volume: number;
}

export const TechnicalIndicators: React.FC<TechnicalIndicatorsProps> = ({
  symbol,
  price,
  rsi,
  macd,
  volume,
}) => {
  // RSI Analysis
  const getRsiAnalysis = (rsi: number) => {
    if (rsi > 70) {
      return {
        status: 'Overbought',
        color: '#f5222d',
        icon: <TrendingDownOutlined />,
        signal: 'SELL',
        strength: 'Strong',
      };
    } else if (rsi < 30) {
      return {
        status: 'Oversold',
        color: '#52c41a',
        icon: <TrendingUpOutlined />,
        signal: 'BUY',
        strength: 'Strong',
      };
    } else if (rsi > 60) {
      return {
        status: 'Bullish',
        color: '#1890ff',
        icon: <TrendingUpOutlined />,
        signal: 'BUY',
        strength: 'Weak',
      };
    } else if (rsi < 40) {
      return {
        status: 'Bearish',
        color: '#fa8c16',
        icon: <TrendingDownOutlined />,
        signal: 'SELL',
        strength: 'Weak',
      };
    } else {
      return {
        status: 'Neutral',
        color: '#8c8c8c',
        icon: <MinusOutlined />,
        signal: 'HOLD',
        strength: 'Neutral',
      };
    }
  };
  
  // MACD Analysis
  const getMacdAnalysis = (macd: any) => {
    const { macd: macdLine, signal, histogram } = macd;
    
    if (macdLine > signal && histogram > 0) {
      return {
        status: 'Bullish Crossover',
        color: '#52c41a',
        icon: <TrendingUpOutlined />,
        signal: 'BUY',
        strength: Math.abs(histogram) > 5 ? 'Strong' : 'Moderate',
      };
    } else if (macdLine < signal && histogram < 0) {
      return {
        status: 'Bearish Crossover',
        color: '#f5222d',
        icon: <TrendingDownOutlined />,
        signal: 'SELL',
        strength: Math.abs(histogram) > 5 ? 'Strong' : 'Moderate',
      };
    } else {
      return {
        status: 'Sideways',
        color: '#8c8c8c',
        icon: <MinusOutlined />,
        signal: 'HOLD',
        strength: 'Neutral',
      };
    }
  };
  
  // Support and Resistance levels (simplified calculation)
  const getSupportResistance = (price: number) => {
    // Simple calculation based on price ranges
    const support = price * 0.95; // 5% below current price
    const resistance = price * 1.05; // 5% above current price
    
    return {
      support: support.toFixed(2),
      resistance: resistance.toFixed(2),
      nextSupport: (price * 0.90).toFixed(2),
      nextResistance: (price * 1.10).toFixed(2),
    };
  };
  
  const rsiAnalysis = getRsiAnalysis(rsi);
  const macdAnalysis = getMacdAnalysis(macd);
  const levels = getSupportResistance(price);
  
  // Volume analysis (mock calculation)
  const volumeAnalysis = {
    status: volume > 20000000000 ? 'High' : volume > 10000000000 ? 'Normal' : 'Low',
    color: volume > 20000000000 ? '#52c41a' : volume > 10000000000 ? '#1890ff' : '#fa8c16',
    trend: 'Increasing', // This would be calculated from historical data
  };
  
  return (
    <div className="technical-indicators">
      <Row gutter={[16, 16]}>
        {/* RSI Analysis */}
        <Col xs={24} sm={12} lg={8}>
          <Card size="small" title="RSI Analysis">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <Progress
                  type="dashboard"
                  percent={rsi}
                  size={80}
                  strokeColor={rsiAnalysis.color}
                  format={(percent) => `${percent?.toFixed(1)}`}
                />
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <Tag 
                  color={rsiAnalysis.color}
                  icon={rsiAnalysis.icon}
                  style={{ marginBottom: '8px' }}
                >
                  {rsiAnalysis.signal}
                </Tag>
                <div>
                  <div style={{ color: rsiAnalysis.color, fontWeight: 600 }}>
                    {rsiAnalysis.status}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b949e' }}>
                    Strength: {rsiAnalysis.strength}
                  </div>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        
        {/* MACD Analysis */}
        <Col xs={24} sm={12} lg={8}>
          <Card size="small" title="MACD Analysis">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Row gutter={8}>
                <Col span={8}>
                  <Statistic
                    title="MACD"
                    value={macd.macd}
                    precision={2}
                    valueStyle={{ fontSize: '14px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Signal"
                    value={macd.signal}
                    precision={2}
                    valueStyle={{ fontSize: '14px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Histogram"
                    value={macd.histogram}
                    precision={2}
                    valueStyle={{ 
                      fontSize: '14px',
                      color: macd.histogram > 0 ? '#52c41a' : '#f5222d'
                    }}
                  />
                </Col>
              </Row>
              
              <div style={{ textAlign: 'center' }}>
                <Tag 
                  color={macdAnalysis.color}
                  icon={macdAnalysis.icon}
                  style={{ marginBottom: '8px' }}
                >
                  {macdAnalysis.signal}
                </Tag>
                <div>
                  <div style={{ color: macdAnalysis.color, fontWeight: 600 }}>
                    {macdAnalysis.status}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b949e' }}>
                    Strength: {macdAnalysis.strength}
                  </div>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        
        {/* Support & Resistance */}
        <Col xs={24} sm={12} lg={8}>
          <Card size="small" title="Key Levels">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#8b949e', fontSize: '12px' }}>Next Resistance</span>
                  <span style={{ color: '#f5222d', fontWeight: 600 }}>
                    ${levels.nextResistance}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#8b949e', fontSize: '12px' }}>Resistance</span>
                  <span style={{ color: '#fa8c16', fontWeight: 600 }}>
                    ${levels.resistance}
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '4px',
                  padding: '4px',
                  background: 'rgba(24, 144, 255, 0.1)',
                  borderRadius: '4px',
                }}>
                  <span style={{ color: '#1890ff', fontSize: '12px', fontWeight: 600 }}>Current</span>
                  <span style={{ color: '#1890ff', fontWeight: 700 }}>
                    ${price.toFixed(2)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#8b949e', fontSize: '12px' }}>Support</span>
                  <span style={{ color: '#52c41a', fontWeight: 600 }}>
                    ${levels.support}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#8b949e', fontSize: '12px' }}>Next Support</span>
                  <span style={{ color: '#52c41a', fontWeight: 600 }}>
                    ${levels.nextSupport}
                  </span>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
      
      {/* Volume Analysis */}
      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card size="small" title="Volume Analysis">
            <Row gutter={16} align="middle">
              <Col xs={24} sm={8}>
                <Statistic
                  title="24h Volume"
                  value={formatVolume(volume)}
                  prefix="$"
                  valueStyle={{ color: volumeAnalysis.color }}
                />
              </Col>
              
              <Col xs={24} sm={8}>
                <div>
                  <div style={{ marginBottom: '4px', color: '#8b949e', fontSize: '14px' }}>
                    Volume Status
                  </div>
                  <Tag color={volumeAnalysis.color} icon={<SignalFilled />}>
                    {volumeAnalysis.status} VOLUME
                  </Tag>
                </div>
              </Col>
              
              <Col xs={24} sm={8}>
                <div>
                  <div style={{ marginBottom: '4px', color: '#8b949e', fontSize: '14px' }}>
                    Volume Trend
                  </div>
                  <div style={{ color: '#52c41a', fontWeight: 600 }}>
                    {volumeAnalysis.trend}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      
      {/* Overall Signal */}
      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card size="small" title={`${symbol} Overall Signal`}>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              {(() => {
                const signals = [rsiAnalysis.signal, macdAnalysis.signal];
                const buySignals = signals.filter(s => s === 'BUY').length;
                const sellSignals = signals.filter(s => s === 'SELL').length;
                
                let overallSignal: string;
                let signalColor: string;
                let signalIcon: React.ReactNode;
                
                if (buySignals > sellSignals) {
                  overallSignal = 'BULLISH';
                  signalColor = '#52c41a';
                  signalIcon = <TrendingUpOutlined />;
                } else if (sellSignals > buySignals) {
                  overallSignal = 'BEARISH';
                  signalColor = '#f5222d';
                  signalIcon = <TrendingDownOutlined />;
                } else {
                  overallSignal = 'NEUTRAL';
                  signalColor = '#8c8c8c';
                  signalIcon = <MinusOutlined />;
                }
                
                return (
                  <Tag 
                    color={signalColor}
                    icon={signalIcon}
                    style={{ 
                      fontSize: '16px',
                      padding: '8px 16px',
                      borderRadius: '6px',
                    }}
                  >
                    {overallSignal}
                  </Tag>
                );
              })()}
              
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#8b949e' }}>
                Based on RSI and MACD analysis
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};