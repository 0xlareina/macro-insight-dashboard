// CryptoSense Dashboard - Stablecoin Liquidity Analysis Panel Component
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Statistic, Tag, Progress, Space, Typography, Select, Alert } from 'antd';
import {
  DollarOutlined,
  BankOutlined,
  SwapOutlined,
  ExclamationTriangleOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { Socket } from 'socket.io-client';
import { formatVolume, formatPercentage } from '../../utils';

const { Title, Text } = Typography;
const { Option } = Select;

interface StablecoinData {
  symbol: string;
  name: string;
  price: number;
  deviation: number; // Deviation from $1.00
  marketCap: number;
  volume24h: number;
  liquidity: {
    totalLiquidity: number;
    bidLiquidity: number;
    askLiquidity: number;
    spread: number;
  };
  backing: {
    type: 'fiat' | 'crypto' | 'algorithmic';
    collateralizationRatio: number;
    auditStatus: 'verified' | 'pending' | 'unknown';
  };
  exchanges: {
    binance: { volume: number; spread: number };
    coinbase: { volume: number; spread: number };
    uniswap: { volume: number; spread: number };
  };
  riskMetrics: {
    depegRisk: 'low' | 'medium' | 'high';
    liquidityRisk: 'low' | 'medium' | 'high';
    overallRisk: 'low' | 'medium' | 'high';
  };
}

interface StablecoinLiquidityPanelProps {
  socket: Socket | null;
}

export const StablecoinLiquidityPanel: React.FC<StablecoinLiquidityPanelProps> = ({
  socket,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'liquidity' | 'volume' | 'deviation' | 'risk'>('liquidity');
  
  const [stablecoinData, setStablecoinData] = useState<StablecoinData[]>([
    {
      symbol: 'USDT',
      name: 'Tether USD',
      price: 1.0002,
      deviation: 0.02,
      marketCap: 83500000000,
      volume24h: 45200000000,
      liquidity: {
        totalLiquidity: 2800000000,
        bidLiquidity: 1400000000,
        askLiquidity: 1400000000,
        spread: 0.01,
      },
      backing: {
        type: 'fiat',
        collateralizationRatio: 1.04,
        auditStatus: 'verified',
      },
      exchanges: {
        binance: { volume: 18500000000, spread: 0.008 },
        coinbase: { volume: 12300000000, spread: 0.012 },
        uniswap: { volume: 8900000000, spread: 0.015 },
      },
      riskMetrics: {
        depegRisk: 'low',
        liquidityRisk: 'low',
        overallRisk: 'low',
      },
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      price: 0.9998,
      deviation: -0.02,
      marketCap: 52800000000,
      volume24h: 28900000000,
      liquidity: {
        totalLiquidity: 1850000000,
        bidLiquidity: 925000000,
        askLiquidity: 925000000,
        spread: 0.008,
      },
      backing: {
        type: 'fiat',
        collateralizationRatio: 1.0,
        auditStatus: 'verified',
      },
      exchanges: {
        binance: { volume: 11200000000, spread: 0.006 },
        coinbase: { volume: 13400000000, spread: 0.008 },
        uniswap: { volume: 4300000000, spread: 0.012 },
      },
      riskMetrics: {
        depegRisk: 'low',
        liquidityRisk: 'low',
        overallRisk: 'low',
      },
    },
    {
      symbol: 'BUSD',
      name: 'Binance USD',
      price: 1.0001,
      deviation: 0.01,
      marketCap: 17200000000,
      volume24h: 8900000000,
      liquidity: {
        totalLiquidity: 580000000,
        bidLiquidity: 290000000,
        askLiquidity: 290000000,
        spread: 0.012,
      },
      backing: {
        type: 'fiat',
        collateralizationRatio: 1.0,
        auditStatus: 'verified',
      },
      exchanges: {
        binance: { volume: 6200000000, spread: 0.010 },
        coinbase: { volume: 1800000000, spread: 0.015 },
        uniswap: { volume: 900000000, spread: 0.020 },
      },
      riskMetrics: {
        depegRisk: 'low',
        liquidityRisk: 'medium',
        overallRisk: 'low',
      },
    },
    {
      symbol: 'DAI',
      name: 'MakerDAO',
      price: 0.9995,
      deviation: -0.05,
      marketCap: 5200000000,
      volume24h: 2800000000,
      liquidity: {
        totalLiquidity: 180000000,
        bidLiquidity: 90000000,
        askLiquidity: 90000000,
        spread: 0.025,
      },
      backing: {
        type: 'crypto',
        collateralizationRatio: 1.58,
        auditStatus: 'verified',
      },
      exchanges: {
        binance: { volume: 850000000, spread: 0.020 },
        coinbase: { volume: 780000000, spread: 0.025 },
        uniswap: { volume: 1170000000, spread: 0.030 },
      },
      riskMetrics: {
        depegRisk: 'medium',
        liquidityRisk: 'medium',
        overallRisk: 'medium',
      },
    },
  ]);
  
  useEffect(() => {
    if (!socket) return;
    
    // Listen for stablecoin updates
    socket.on('stablecoin:update', (data: any) => {
      setStablecoinData(prev => 
        prev.map(stable => 
          stable.symbol === data.symbol 
            ? { 
                ...stable, 
                price: data.price,
                deviation: ((data.price - 1.0) * 100).toFixed(2),
                volume24h: data.volume24h,
                liquidity: { ...stable.liquidity, totalLiquidity: data.liquidity }
              }
            : stable
        )
      );
    });
    
    return () => {
      socket.off('stablecoin:update');
    };
  }, [socket]);
  
  const getDeviationColor = (deviation: number) => {
    const abs = Math.abs(deviation);
    if (abs > 0.5) return '#f5222d'; // High deviation - red
    if (abs > 0.1) return '#fa8c16'; // Medium deviation - orange
    return '#52c41a'; // Low deviation - green
  };
  
  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return '#52c41a';
      case 'medium': return '#fa8c16';
      case 'high': return '#f5222d';
      default: return '#8c8c8c';
    }
  };
  
  const getBackingIcon = (type: 'fiat' | 'crypto' | 'algorithmic') => {
    switch (type) {
      case 'fiat': return <BankOutlined />;
      case 'crypto': return <DollarOutlined />;
      case 'algorithmic': return <SwapOutlined />;
      default: return <DollarOutlined />;
    }
  };
  
  const columns = [
    {
      title: 'Stablecoin',
      key: 'stablecoin',
      render: (record: StablecoinData) => (
        <Space>
          <div 
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: record.symbol === 'USDT' ? '#26a17b' : 
                         record.symbol === 'USDC' ? '#2775ca' : 
                         record.symbol === 'BUSD' ? '#f0b90b' : '#ff6747',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
            }}
          >
            $
          </div>
          <div>
            <Text strong>{record.symbol}</Text>
            <div style={{ fontSize: '11px', color: '#8b949e' }}>
              {record.name}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Price',
      key: 'price',
      render: (record: StablecoinData) => (
        <div>
          <Text style={{ fontWeight: 600 }}>${record.price.toFixed(4)}</Text>
          <div style={{ 
            fontSize: '11px', 
            color: getDeviationColor(record.deviation),
            fontWeight: 600,
          }}>
            {record.deviation > 0 ? '+' : ''}{record.deviation.toFixed(2)}%
          </div>
        </div>
      ),
      sorter: (a: StablecoinData, b: StablecoinData) => a.price - b.price,
    },
    {
      title: 'Market Cap',
      key: 'marketCap',
      render: (record: StablecoinData) => (
        <Text>{formatVolume(record.marketCap)}</Text>
      ),
      sorter: (a: StablecoinData, b: StablecoinData) => a.marketCap - b.marketCap,
    },
    {
      title: 'Volume (24h)',
      key: 'volume',
      render: (record: StablecoinData) => (
        <Text>{formatVolume(record.volume24h)}</Text>
      ),
      sorter: (a: StablecoinData, b: StablecoinData) => a.volume24h - b.volume24h,
    },
    {
      title: 'Liquidity',
      key: 'liquidity',
      render: (record: StablecoinData) => (
        <div>
          <Text style={{ fontWeight: 600 }}>
            {formatVolume(record.liquidity.totalLiquidity)}
          </Text>
          <div style={{ fontSize: '11px', color: '#8b949e' }}>
            Spread: {record.liquidity.spread.toFixed(3)}%
          </div>
        </div>
      ),
      sorter: (a: StablecoinData, b: StablecoinData) => a.liquidity.totalLiquidity - b.liquidity.totalLiquidity,
    },
    {
      title: 'Backing',
      key: 'backing',
      render: (record: StablecoinData) => (
        <div>
          <Tag 
            icon={getBackingIcon(record.backing.type)}
            color={record.backing.type === 'fiat' ? 'green' : 
                   record.backing.type === 'crypto' ? 'blue' : 'orange'}
          >
            {record.backing.type.toUpperCase()}
          </Tag>
          <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '2px' }}>
            CR: {record.backing.collateralizationRatio.toFixed(2)}x
          </div>
        </div>
      ),
    },
    {
      title: 'Risk Level',
      key: 'risk',
      render: (record: StablecoinData) => (
        <div>
          <Tag color={getRiskColor(record.riskMetrics.overallRisk)}>
            {record.riskMetrics.overallRisk.toUpperCase()}
          </Tag>
          <div style={{ fontSize: '10px', color: '#8b949e', marginTop: '2px' }}>
            <div>Depeg: {record.riskMetrics.depegRisk}</div>
            <div>Liquidity: {record.riskMetrics.liquidityRisk}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Audit Status',
      key: 'audit',
      render: (record: StablecoinData) => {
        const { auditStatus } = record.backing;
        return (
          <Tag 
            color={auditStatus === 'verified' ? 'green' : 
                   auditStatus === 'pending' ? 'orange' : 'red'}
            icon={auditStatus === 'verified' ? <CheckCircleOutlined /> : <WarningOutlined />}
          >
            {auditStatus.toUpperCase()}
          </Tag>
        );
      },
    },
  ];
  
  // Calculate aggregate metrics
  const totalMarketCap = stablecoinData.reduce((sum, s) => sum + s.marketCap, 0);
  const totalVolume = stablecoinData.reduce((sum, s) => sum + s.volume24h, 0);
  const avgDeviation = stablecoinData.reduce((sum, s) => sum + Math.abs(s.deviation), 0) / stablecoinData.length;
  const highRiskCount = stablecoinData.filter(s => s.riskMetrics.overallRisk === 'high').length;
  
  return (
    <div className="stablecoin-liquidity-panel">
      <Title level={3}>
        <DollarOutlined /> Stablecoin Liquidity Analysis
      </Title>
      
      {/* Alert for high risk stablecoins */}
      {highRiskCount > 0 && (
        <Alert
          style={{ marginBottom: '16px' }}
          message={`${highRiskCount} High-Risk Stablecoin${highRiskCount > 1 ? 's' : ''} Detected`}
          description="Monitor these stablecoins closely for potential depegging events or liquidity issues."
          type="warning"
          icon={<ExclamationTriangleOutlined />}
          showIcon
          closable
        />
      )}
      
      {/* Market Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Market Cap"
              value={formatVolume(totalMarketCap)}
              prefix="$"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="24h Volume"
              value={formatVolume(totalVolume)}
              prefix="$"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Avg Deviation"
              value={avgDeviation.toFixed(3)}
              suffix="%"
              valueStyle={{ color: getDeviationColor(avgDeviation) }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Tracked Assets"
              value={stablecoinData.length}
              valueStyle={{ color: '#faad14' }}
              suffix="stablecoins"
            />
          </Card>
        </Col>
      </Row>
      
      {/* Stablecoin Analysis Table */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title="Stablecoin Market Analysis"
            extra={
              <Space>
                <Text type="secondary">Sort by:</Text>
                <Select
                  value={selectedMetric}
                  onChange={setSelectedMetric}
                  size="small"
                  style={{ width: 120 }}
                >
                  <Option value="liquidity">Liquidity</Option>
                  <Option value="volume">Volume</Option>
                  <Option value="deviation">Deviation</Option>
                  <Option value="risk">Risk Level</Option>
                </Select>
              </Space>
            }
          >
            <Table
              dataSource={stablecoinData}
              columns={columns}
              rowKey="symbol"
              pagination={false}
              size="small"
              scroll={{ x: 1000 }}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Market Dominance and Exchange Analysis */}
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} lg={12}>
          <Card title="Market Dominance" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              {stablecoinData.map(stable => {
                const dominance = (stable.marketCap / totalMarketCap) * 100;
                return (
                  <div key={stable.symbol} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <Text style={{ fontSize: '12px' }}>{stable.symbol}</Text>
                      <Text style={{ fontSize: '12px', fontWeight: 600 }}>{dominance.toFixed(1)}%</Text>
                    </div>
                    <Progress
                      percent={dominance}
                      strokeColor={
                        stable.symbol === 'USDT' ? '#26a17b' : 
                        stable.symbol === 'USDC' ? '#2775ca' : 
                        stable.symbol === 'BUSD' ? '#f0b90b' : '#ff6747'
                      }
                      size="small"
                      showInfo={false}
                    />
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Exchange Volume Distribution" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              {['binance', 'coinbase', 'uniswap'].map(exchange => {
                const totalExchangeVolume = stablecoinData.reduce(
                  (sum, stable) => sum + stable.exchanges[exchange as keyof typeof stable.exchanges].volume, 0
                );
                const avgSpread = stablecoinData.reduce(
                  (sum, stable) => sum + stable.exchanges[exchange as keyof typeof stable.exchanges].spread, 0
                ) / stablecoinData.length;
                
                return (
                  <div key={exchange} style={{ 
                    padding: '12px', 
                    border: '1px solid #30363d', 
                    borderRadius: '6px',
                    marginBottom: '8px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <Text strong style={{ textTransform: 'capitalize' }}>{exchange}</Text>
                      <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                        {formatVolume(totalExchangeVolume)}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1, marginRight: '8px' }}>
                        <Progress
                          percent={(totalExchangeVolume / totalVolume) * 100}
                          size="small"
                          strokeColor={exchange === 'binance' ? '#f0b90b' : 
                                     exchange === 'coinbase' ? '#0052ff' : '#ff007a'}
                          format={() => ''}
                        />
                      </div>
                      <Text style={{ fontSize: '11px', color: '#8b949e' }}>
                        Spread: {avgSpread.toFixed(3)}%
                      </Text>
                    </div>
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>
      </Row>
      
      {/* Liquidity Depth Analysis */}
      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="Liquidity Depth Analysis" size="small">
            <Row gutter={16}>
              {stablecoinData.map(stable => (
                <Col xs={24} sm={12} lg={6} key={stable.symbol}>
                  <div style={{ 
                    padding: '12px', 
                    border: '1px solid #30363d', 
                    borderRadius: '6px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                      {stable.symbol}
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <Text style={{ fontSize: '12px', color: '#8b949e' }}>Total Liquidity</Text>
                      <div style={{ color: '#1890ff', fontWeight: 600 }}>
                        {formatVolume(stable.liquidity.totalLiquidity)}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <Text style={{ fontSize: '11px', color: '#26d0ce' }}>Bid</Text>
                        <div style={{ color: '#26d0ce', fontSize: '12px', fontWeight: 600 }}>
                          {formatVolume(stable.liquidity.bidLiquidity)}
                        </div>
                      </div>
                      <div>
                        <Text style={{ fontSize: '11px', color: '#f85149' }}>Ask</Text>
                        <div style={{ color: '#f85149', fontSize: '12px', fontWeight: 600 }}>
                          {formatVolume(stable.liquidity.askLiquidity)}
                        </div>
                      </div>
                    </div>
                    
                    <Tag 
                      size="small"
                      color={stable.liquidity.spread < 0.01 ? 'green' : 
                             stable.liquidity.spread < 0.02 ? 'orange' : 'red'}
                    >
                      {stable.liquidity.spread.toFixed(3)}% spread
                    </Tag>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};