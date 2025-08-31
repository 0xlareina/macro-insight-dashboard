// CryptoSense Dashboard - Market Sentiment Panel Component
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Divider, Space, Tag } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  FundOutlined,
  TrendingUpOutlined,
} from '@ant-design/icons';
import { Socket } from 'socket.io-client';
import { FearGreedGauge } from '../charts/FearGreedGauge';
import { ETFFlowChart } from '../charts/ETFFlowChart';
import { formatVolume, formatRelativeTime } from '../../utils';

const { Title, Text } = Typography;

interface MarketSentimentPanelProps {
  socket: Socket | null;
}

interface SentimentData {
  fearGreedIndex: number;
  fearGreedClassification: string;
  lastUpdate: string;
  etfNetFlow: number;
  etfCumulativeFlow: {
    '7d': number;
    '30d': number;
    total: number;
  };
  etfsByFlow: Array<{
    ticker: string;
    name: string;
    flow: number;
    holdings: number;
  }>;
  compositeScore: number;
  marketState: 'overbought' | 'oversold' | 'neutral';
  tradingSuggestion: string;
}

export const MarketSentimentPanel: React.FC<MarketSentimentPanelProps> = ({ socket }) => {
  const [sentimentData, setSentimentData] = useState<SentimentData>({
    fearGreedIndex: 50,
    fearGreedClassification: 'Neutral',
    lastUpdate: new Date().toISOString(),
    etfNetFlow: 0,
    etfCumulativeFlow: {
      '7d': 0,
      '30d': 0,
      total: 0,
    },
    etfsByFlow: [],
    compositeScore: 50,
    marketState: 'neutral',
    tradingSuggestion: 'Market conditions are neutral',
  });
  
  useEffect(() => {
    if (!socket) return;
    
    // Listen for sentiment updates
    socket.on('sentiment:update', (data: any) => {
      setSentimentData(prev => ({
        ...prev,
        fearGreedIndex: data.fearGreedIndex,
        fearGreedClassification: data.fearGreedClassification,
        lastUpdate: data.timestamp,
        etfNetFlow: data.etfNetFlow,
        etfCumulativeFlow: data.etfCumulativeFlow,
        compositeScore: data.compositeScore || prev.compositeScore,
      }));
    });
    
    return () => {
      socket.off('sentiment:update');
    };
  }, [socket]);
  
  const getMarketStateColor = (state: string) => {
    switch (state) {
      case 'overbought':
        return '#f5222d';
      case 'oversold':
        return '#52c41a';
      default:
        return '#faad14';
    }
  };
  
  const getFlowIcon = (flow: number) => {
    return flow > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  };
  
  const getFlowColor = (flow: number) => {
    return flow > 0 ? '#52c41a' : '#f5222d';
  };
  
  return (
    <div className="market-sentiment-panel">
      <Title level={3}>
        <FundOutlined /> Market Sentiment Analysis
      </Title>
      
      <Row gutter={[16, 16]}>
        {/* Fear & Greed Index */}
        <Col xs={24} lg={12}>
          <Card 
            title="Fear & Greed Index"
            extra={<Text type="secondary">{formatRelativeTime(sentimentData.lastUpdate)}</Text>}
          >
            <FearGreedGauge value={sentimentData.fearGreedIndex} />
            
            <Divider />
            
            <div className="sentiment-stats">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Current Index"
                    value={sentimentData.fearGreedIndex}
                    suffix="/ 100"
                    valueStyle={{
                      color: sentimentData.fearGreedIndex > 50 ? '#52c41a' : '#f5222d'
                    }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Classification"
                    value={sentimentData.fearGreedClassification}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
        
        {/* ETF Fund Flows */}
        <Col xs={24} lg={12}>
          <Card 
            title="US Bitcoin ETF Flows"
            extra={
              <Tag color={getFlowColor(sentimentData.etfNetFlow)}>
                {sentimentData.etfNetFlow > 0 ? 'INFLOW' : 'OUTFLOW'}
              </Tag>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Daily Net Flow */}
              <Statistic
                title="Today's Net Flow"
                value={Math.abs(sentimentData.etfNetFlow)}
                prefix={sentimentData.etfNetFlow > 0 ? '+$' : '-$'}
                suffix=""
                valueStyle={{
                  color: getFlowColor(sentimentData.etfNetFlow),
                  fontSize: '32px'
                }}
                formatter={(value) => formatVolume(value as number)}
              />
              
              <Divider style={{ margin: '12px 0' }} />
              
              {/* Cumulative Flows */}
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="7-Day Flow"
                    value={Math.abs(sentimentData.etfCumulativeFlow['7d'])}
                    prefix={sentimentData.etfCumulativeFlow['7d'] > 0 ? '+$' : '-$'}
                    valueStyle={{
                      color: getFlowColor(sentimentData.etfCumulativeFlow['7d']),
                      fontSize: '16px'
                    }}
                    formatter={(value) => formatVolume(value as number)}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="30-Day Flow"
                    value={Math.abs(sentimentData.etfCumulativeFlow['30d'])}
                    prefix={sentimentData.etfCumulativeFlow['30d'] > 0 ? '+$' : '-$'}
                    valueStyle={{
                      color: getFlowColor(sentimentData.etfCumulativeFlow['30d']),
                      fontSize: '16px'
                    }}
                    formatter={(value) => formatVolume(value as number)}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Total Flow"
                    value={Math.abs(sentimentData.etfCumulativeFlow.total)}
                    prefix={sentimentData.etfCumulativeFlow.total > 0 ? '+$' : '-$'}
                    valueStyle={{
                      color: getFlowColor(sentimentData.etfCumulativeFlow.total),
                      fontSize: '16px'
                    }}
                    formatter={(value) => formatVolume(value as number)}
                  />
                </Col>
              </Row>
              
              <Divider style={{ margin: '12px 0' }} />
              
              {/* ETF Flow Chart */}
              <ETFFlowChart data={sentimentData.etfsByFlow} />
            </Space>
          </Card>
        </Col>
      </Row>
      
      {/* Composite Market Score */}
      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card>
            <Row gutter={[32, 16]} align="middle">
              <Col xs={24} sm={8}>
                <Statistic
                  title="Composite Sentiment Score"
                  value={sentimentData.compositeScore}
                  suffix="/ 100"
                  prefix={<TrendingUpOutlined />}
                  valueStyle={{
                    color: getMarketStateColor(sentimentData.marketState)
                  }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <div className="market-state">
                  <Text type="secondary">Market State</Text>
                  <div style={{ marginTop: '8px' }}>
                    <Tag 
                      color={getMarketStateColor(sentimentData.marketState)}
                      style={{ fontSize: '16px', padding: '4px 12px' }}
                    >
                      {sentimentData.marketState.toUpperCase()}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="trading-suggestion">
                  <Text type="secondary">Trading Suggestion</Text>
                  <div style={{ marginTop: '8px' }}>
                    <Text strong>{sentimentData.tradingSuggestion}</Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};