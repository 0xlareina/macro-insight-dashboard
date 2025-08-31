// CryptoSense Dashboard - Derivatives Panel Component
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Statistic, Tag, Progress, Space, Typography, Alert } from 'antd';
import {
  FundOutlined,
  PieChartOutlined,
  ThunderboltOutlined,
  ExclamationTriangleOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
} from '@ant-design/icons';
import { Socket } from 'socket.io-client';
import { AssetSymbol } from '../../types';
import { formatFundingRate, formatVolume, formatRelativeTime } from '../../utils';
import { LiquidationWaterfall } from '../charts/LiquidationWaterfall';

const { Title, Text } = Typography;

interface FundingRateData {
  symbol: string;
  rate: number;
  nextFundingTime: number;
  markPrice: number;
  annualizedRate: number;
  exchange: 'binance' | 'coinbase';
  timestamp: number;
  historicalRates: number[];
}

interface OpenInterestData {
  symbol: string;
  value: number;
  change24h: number;
  changePercent24h: number;
  longShortRatio: number;
  dominance: number;
  timestamp: number;
}

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

interface DerivativesPanelProps {
  selectedAsset: AssetSymbol;
  socket: Socket | null;
}

export const DerivativesPanel: React.FC<DerivativesPanelProps> = ({
  selectedAsset,
  socket,
}) => {
  const [fundingRates, setFundingRates] = useState<{ [key: string]: FundingRateData }>({
    BTC: {
      symbol: 'BTC',
      rate: 0.0012,
      nextFundingTime: Date.now() + 3600000,
      markPrice: 43250.50,
      annualizedRate: 1.314,
      exchange: 'binance',
      timestamp: Date.now(),
      historicalRates: [0.0008, 0.0015, 0.0012, 0.0009, 0.0012],
    },
    ETH: {
      symbol: 'ETH', 
      rate: 0.0018,
      nextFundingTime: Date.now() + 3600000,
      markPrice: 2545.80,
      annualizedRate: 1.971,
      exchange: 'binance',
      timestamp: Date.now(),
      historicalRates: [0.0021, 0.0018, 0.0024, 0.0016, 0.0018],
    },
    SOL: {
      symbol: 'SOL',
      rate: -0.0005,
      nextFundingTime: Date.now() + 3600000,
      markPrice: 98.75,
      annualizedRate: -0.547,
      exchange: 'binance',
      timestamp: Date.now(),
      historicalRates: [0.0003, -0.0002, -0.0005, 0.0001, -0.0005],
    },
  });
  
  const [openInterest, setOpenInterest] = useState<{ [key: string]: OpenInterestData }>({
    BTC: {
      symbol: 'BTC',
      value: 12500000000,
      change24h: 350000000,
      changePercent24h: 2.88,
      longShortRatio: 1.15,
      dominance: 42.8,
      timestamp: Date.now(),
    },
    ETH: {
      symbol: 'ETH',
      value: 8200000000,
      change24h: -120000000,
      changePercent24h: -1.44,
      longShortRatio: 0.94,
      dominance: 28.1,
      timestamp: Date.now(),
    },
    SOL: {
      symbol: 'SOL',
      value: 2800000000,
      change24h: 45000000,
      changePercent24h: 1.63,
      longShortRatio: 1.08,
      dominance: 9.6,
      timestamp: Date.now(),
    },
  });
  
  const [recentLiquidations, setRecentLiquidations] = useState<LiquidationData[]>([
    {
      id: '1',
      symbol: 'BTC',
      side: 'long',
      price: 43180.00,
      quantity: 2.5,
      totalValue: 107950,
      timestamp: Date.now() - 300000,
      exchange: 'binance',
    },
    {
      id: '2',
      symbol: 'ETH',
      side: 'short',
      price: 2558.50,
      quantity: 8.2,
      totalValue: 20980,
      timestamp: Date.now() - 180000,
      exchange: 'binance',
    },
    {
      id: '3',
      symbol: 'BTC',
      side: 'long',
      price: 43200.00,
      quantity: 1.8,
      totalValue: 77760,
      timestamp: Date.now() - 120000,
      exchange: 'binance',
    },
  ]);
  
  useEffect(() => {
    if (!socket) return;
    
    // Listen for funding rate updates
    socket.on('funding:update', (data: any) => {
      setFundingRates(prev => ({
        ...prev,
        [data.symbol]: {
          ...prev[data.symbol],
          rate: data.fundingRate,
          markPrice: data.markPrice,
          nextFundingTime: data.nextFundingTime,
          timestamp: data.timestamp,
          annualizedRate: data.fundingRate * 365 * 3 * 100, // 3 times daily
        },
      }));
    });
    
    // Listen for liquidation alerts
    socket.on('liquidation:alert', (data: any) => {
      const newLiquidation: LiquidationData = {
        id: Math.random().toString(36).substr(2, 9),
        symbol: data.symbol,
        side: data.side,
        price: data.price,
        quantity: data.quantity,
        totalValue: data.totalValue,
        timestamp: data.timestamp,
        exchange: 'binance',
      };
      
      setRecentLiquidations(prev => [newLiquidation, ...prev].slice(0, 10));
    });
    
    return () => {
      socket.off('funding:update');
      socket.off('liquidation:alert');
    };
  }, [socket]);
  
  const fundingRateColumns = [
    {
      title: 'Asset',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (symbol: string) => (
        <Space>
          <div 
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: symbol === 'BTC' ? '#f7931a' : 
                         symbol === 'ETH' ? '#627eea' : '#9945ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
            }}
          >
            {symbol[0]}
          </div>
          <Text strong>{symbol}</Text>
        </Space>
      ),
    },
    {
      title: 'Funding Rate',
      key: 'rate',
      render: (record: FundingRateData) => {
        const { formatted, color } = formatFundingRate(record.rate);
        return (
          <div>
            <div style={{ color: color === 'bull' ? '#26d0ce' : color === 'bear' ? '#f85149' : '#faad14', fontWeight: 600 }}>
              {formatted}
            </div>
            <div style={{ fontSize: '11px', color: '#8b949e' }}>
              APR: {record.annualizedRate > 0 ? '+' : ''}{record.annualizedRate.toFixed(2)}%
            </div>
          </div>
        );
      },
      sorter: (a: FundingRateData, b: FundingRateData) => a.rate - b.rate,
    },
    {
      title: 'Mark Price',
      dataIndex: 'markPrice',
      key: 'markPrice',
      render: (price: number) => (
        <Text>${price.toLocaleString()}</Text>
      ),
    },
    {
      title: 'Next Funding',
      dataIndex: 'nextFundingTime',
      key: 'nextFunding',
      render: (time: number) => {
        const remaining = Math.max(0, time - Date.now());
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        
        return (
          <Text type="secondary">
            {hours}h {minutes}m
          </Text>
        );
      },
    },
    {
      title: 'Arbitrage',
      key: 'arbitrage',
      render: (record: FundingRateData) => {
        // Check for potential arbitrage opportunities
        const isHighRate = Math.abs(record.rate) > 0.001; // 0.1%
        
        if (isHighRate) {
          return (
            <Tag color={record.rate > 0 ? 'red' : 'green'} size="small">
              {record.rate > 0 ? 'SHORT PERP' : 'LONG PERP'}
            </Tag>
          );
        }
        
        return <Tag size="small">NEUTRAL</Tag>;
      },
    },
  ];
  
  const liquidationColumns = [
    {
      title: 'Asset',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (symbol: string) => <Text strong>{symbol}</Text>,
    },
    {
      title: 'Side',
      dataIndex: 'side',
      key: 'side',
      render: (side: string) => (
        <Tag 
          color={side === 'long' ? 'green' : 'red'}
          icon={side === 'long' ? <TrendingUpOutlined /> : <TrendingDownOutlined />}
        >
          {side.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <Text>${price.toLocaleString()}</Text>,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty: number) => <Text>{qty}</Text>,
    },
    {
      title: 'Value',
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value: number) => (
        <Text style={{ 
          color: value > 100000 ? '#f85149' : value > 50000 ? '#faad14' : '#c9d1d9' 
        }}>
          ${value.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: number) => (
        <Text type="secondary" style={{ fontSize: '11px' }}>
          {formatRelativeTime(new Date(timestamp).toISOString())}
        </Text>
      ),
    },
  ];
  
  // Calculate total liquidations in last hour
  const totalLiquidations24h = recentLiquidations.reduce((sum, liq) => sum + liq.totalValue, 0);
  const longLiquidations = recentLiquidations.filter(l => l.side === 'long').reduce((sum, l) => sum + l.totalValue, 0);
  const shortLiquidations = recentLiquidations.filter(l => l.side === 'short').reduce((sum, l) => sum + l.totalValue, 0);
  
  return (
    <div className="derivatives-panel">
      <Title level={3}>
        <FundOutlined /> Derivatives Market Intelligence
      </Title>
      
      {/* Funding Rates Analysis */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card 
            title="Funding Rates Analysis"
            extra={
              <Space>
                <ThunderboltOutlined />
                <Text type="secondary">Real-time</Text>
              </Space>
            }
          >
            <Table
              dataSource={Object.values(fundingRates)}
              columns={fundingRateColumns}
              rowKey="symbol"
              pagination={false}
              size="small"
            />
            
            {/* Funding Rate Alerts */}
            {Object.values(fundingRates).some(rate => Math.abs(rate.rate) > 0.001) && (
              <Alert
                style={{ marginTop: '16px' }}
                message="Arbitrage Opportunities Detected"
                description="High funding rates detected. Consider arbitrage strategies between spot and perpetual markets."
                type="warning"
                icon={<ExclamationTriangleOutlined />}
                showIcon
              />
            )}
          </Card>
        </Col>
      </Row>
      
      {/* Open Interest Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title="Open Interest Analysis">
            <Row gutter={16}>
              {Object.values(openInterest).map((oi) => (
                <Col xs={24} sm={8} key={oi.symbol}>
                  <Card size="small" style={{ textAlign: 'center' }}>
                    <Statistic
                      title={oi.symbol}
                      value={formatVolume(oi.value)}
                      prefix="$"
                      valueStyle={{ 
                        color: oi.changePercent24h > 0 ? '#26d0ce' : '#f85149',
                        fontSize: '18px',
                      }}
                      suffix={
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>
                          <Tag 
                            color={oi.changePercent24h > 0 ? 'green' : 'red'}
                            size="small"
                          >
                            {oi.changePercent24h > 0 ? '+' : ''}{oi.changePercent24h.toFixed(2)}%
                          </Tag>
                        </div>
                      }
                    />
                    
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '4px' }}>
                        Long/Short Ratio
                      </div>
                      <Progress
                        percent={oi.longShortRatio > 1 ? 
                                (oi.longShortRatio / (oi.longShortRatio + 1)) * 100 : 
                                50}
                        strokeColor={oi.longShortRatio > 1 ? '#26d0ce' : '#f85149'}
                        size="small"
                        format={() => oi.longShortRatio.toFixed(2)}
                      />
                    </div>
                    
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#8b949e' }}>
                      Market Dominance: {oi.dominance}%
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Liquidation Overview" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic
                title="24h Total Liquidations"
                value={formatVolume(totalLiquidations24h)}
                prefix="$"
                valueStyle={{ color: '#f85149' }}
              />
              
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Long Liquidations"
                    value={formatVolume(longLiquidations)}
                    prefix="$"
                    valueStyle={{ color: '#f85149', fontSize: '14px' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Short Liquidations"
                    value={formatVolume(shortLiquidations)}
                    prefix="$"
                    valueStyle={{ color: '#f85149', fontSize: '14px' }}
                  />
                </Col>
              </Row>
              
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <Progress
                  percent={(longLiquidations / (longLiquidations + shortLiquidations)) * 100}
                  strokeColor="#f85149"
                  trailColor="#26d0ce"
                  size="small"
                  format={(percent) => `${percent?.toFixed(0)}% Long`}
                />
                <div style={{ fontSize: '10px', color: '#8b949e', marginTop: '4px' }}>
                  Long vs Short Liquidations
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
      
      {/* Recent Liquidations */}
      <Row>
        <Col span={24}>
          <Card 
            title="Recent Liquidations"
            extra={
              <Space>
                <PieChartOutlined />
                <Text type="secondary">Live Feed</Text>
              </Space>
            }
          >
            <Table
              dataSource={recentLiquidations}
              columns={liquidationColumns}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 600 }}
            />
            
            {/* Liquidation Waterfall Chart */}
            <div style={{ marginTop: '16px' }}>
              <LiquidationWaterfall data={recentLiquidations} />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};