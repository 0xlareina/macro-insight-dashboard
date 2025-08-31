// CryptoSense Dashboard - Cross Asset Performance Comparison Component
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Statistic, Tag, Progress, Space, Typography, Select, Radio } from 'antd';
import {
  TrendingUpOutlined,
  TrendingDownOutlined,
  SwapOutlined,
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { Socket } from 'socket.io-client';
import { AssetSymbol } from '../../types';
import { formatPrice, formatPercentage, formatVolume } from '../../utils';

const { Title, Text } = Typography;
const { Option } = Select;

interface AssetPerformance {
  symbol: AssetSymbol;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  change30d: number;
  volume24h: number;
  marketCap: number;
  dominance: number;
  volatility: number;
  rsi: number;
  correlation: { [key: string]: number };
}

interface CrossAssetComparisonProps {
  selectedAsset: AssetSymbol;
  socket: Socket | null;
}

export const CrossAssetComparison: React.FC<CrossAssetComparisonProps> = ({
  selectedAsset,
  socket,
}) => {
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [sortBy, setSortBy] = useState<'performance' | 'volume' | 'marketCap' | 'volatility'>('performance');
  
  const [assetPerformance, setAssetPerformance] = useState<AssetPerformance[]>([
    {
      symbol: 'BTC',
      price: 43250.50,
      change1h: 0.45,
      change24h: 2.98,
      change7d: -1.24,
      change30d: 8.77,
      volume24h: 28500000000,
      marketCap: 847000000000,
      dominance: 52.8,
      volatility: 3.2,
      rsi: 58.5,
      correlation: { ETH: 0.73, SOL: 0.65 },
    },
    {
      symbol: 'ETH',
      price: 2545.80,
      change1h: 0.72,
      change24h: 3.63,
      change7d: 2.18,
      change30d: 12.45,
      volume24h: 18200000000,
      marketCap: 306000000000,
      dominance: 19.1,
      volatility: 4.1,
      rsi: 62.3,
      correlation: { BTC: 0.73, SOL: 0.81 },
    },
    {
      symbol: 'SOL',
      price: 98.75,
      change1h: -0.35,
      change24h: -3.38,
      change7d: 5.92,
      change30d: 18.23,
      volume24h: 3800000000,
      marketCap: 42000000000,
      dominance: 2.6,
      volatility: 6.8,
      rsi: 45.2,
      correlation: { BTC: 0.65, ETH: 0.81 },
    },
  ]);
  
  useEffect(() => {
    if (!socket) return;
    
    socket.on('price:update', (data: any) => {
      setAssetPerformance(prev => 
        prev.map(asset => 
          asset.symbol === data.symbol 
            ? { ...asset, price: data.price, change24h: data.change24h, volume24h: data.volume24h }
            : asset
        )
      );
    });
    
    return () => {
      socket.off('price:update');
    };
  }, [socket]);
  
  const getChangeValue = (asset: AssetPerformance) => {
    switch (timeframe) {
      case '1h': return asset.change1h;
      case '24h': return asset.change24h;
      case '7d': return asset.change7d;
      case '30d': return asset.change30d;
      default: return asset.change24h;
    }
  };
  
  const getSortValue = (asset: AssetPerformance) => {
    switch (sortBy) {
      case 'performance': return getChangeValue(asset);
      case 'volume': return asset.volume24h;
      case 'marketCap': return asset.marketCap;
      case 'volatility': return asset.volatility;
      default: return getChangeValue(asset);
    }
  };
  
  const sortedAssets = [...assetPerformance].sort((a, b) => getSortValue(b) - getSortValue(a));
  
  const columns = [
    {
      title: 'Asset',
      key: 'asset',
      render: (record: AssetPerformance) => {
        const isSelected = record.symbol === selectedAsset;
        return (
          <Space>
            <div 
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: record.symbol === 'BTC' ? '#f7931a' : 
                           record.symbol === 'ETH' ? '#627eea' : '#9945ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              {record.symbol === 'BTC' ? '₿' : record.symbol === 'ETH' ? 'Ξ' : '◎'}
            </div>
            <div>
              <Text strong style={{ color: isSelected ? '#1890ff' : '#c9d1d9' }}>
                {record.symbol}
              </Text>
              {isSelected && (
                <Tag color="blue" size="small" style={{ marginLeft: '4px' }}>
                  ACTIVE
                </Tag>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Price',
      key: 'price',
      render: (record: AssetPerformance) => (
        <Text style={{ fontWeight: 600 }}>
          {formatPrice(record.price)}
        </Text>
      ),
      sorter: (a: AssetPerformance, b: AssetPerformance) => a.price - b.price,
    },
    {
      title: `${timeframe.toUpperCase()} Change`,
      key: 'change',
      render: (record: AssetPerformance) => {
        const change = getChangeValue(record);
        const { formatted, color } = formatPercentage(change);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {change > 0 ? (
              <RiseOutlined style={{ color: '#26d0ce', fontSize: '12px' }} />
            ) : change < 0 ? (
              <FallOutlined style={{ color: '#f85149', fontSize: '12px' }} />
            ) : null}
            <Text style={{ 
              color: color === 'bull' ? '#26d0ce' : color === 'bear' ? '#f85149' : '#8b949e',
              fontWeight: 600,
            }}>
              {formatted}
            </Text>
          </div>
        );
      },
      sorter: (a: AssetPerformance, b: AssetPerformance) => getChangeValue(a) - getChangeValue(b),
    },
    {
      title: 'Volume (24h)',
      key: 'volume',
      render: (record: AssetPerformance) => (
        <Text>{formatVolume(record.volume24h)}</Text>
      ),
      sorter: (a: AssetPerformance, b: AssetPerformance) => a.volume24h - b.volume24h,
    },
    {
      title: 'Market Cap',
      key: 'marketCap',
      render: (record: AssetPerformance) => (
        <Text>{formatVolume(record.marketCap)}</Text>
      ),
      sorter: (a: AssetPerformance, b: AssetPerformance) => a.marketCap - b.marketCap,
    },
    {
      title: 'Volatility',
      key: 'volatility',
      render: (record: AssetPerformance) => (
        <Tag color={record.volatility > 5 ? 'red' : record.volatility > 3 ? 'orange' : 'green'}>
          {record.volatility.toFixed(1)}%
        </Tag>
      ),
      sorter: (a: AssetPerformance, b: AssetPerformance) => a.volatility - b.volatility,
    },
    {
      title: 'RSI',
      key: 'rsi',
      render: (record: AssetPerformance) => {
        const color = record.rsi > 70 ? '#f85149' : record.rsi < 30 ? '#26d0ce' : '#faad14';
        return (
          <Progress
            percent={record.rsi}
            size="small"
            strokeColor={color}
            format={(percent) => `${percent?.toFixed(0)}`}
            style={{ width: '60px' }}
          />
        );
      },
      sorter: (a: AssetPerformance, b: AssetPerformance) => a.rsi - b.rsi,
    },
  ];
  
  // Calculate correlation matrix
  const correlationMatrix = assetPerformance.map(asset => ({
    symbol: asset.symbol,
    correlations: assetPerformance.map(otherAsset => ({
      symbol: otherAsset.symbol,
      value: asset.symbol === otherAsset.symbol ? 1 : 
             asset.correlation[otherAsset.symbol] || 0,
    })),
  }));
  
  return (
    <div className="cross-asset-comparison">
      <Title level={3}>
        <BarChartOutlined /> Cross-Asset Performance Comparison
      </Title>
      
      {/* Controls */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">Time Frame</Text>
              <Radio.Group 
                value={timeframe} 
                onChange={(e) => setTimeframe(e.target.value)}
                size="small"
              >
                <Radio.Button value="1h">1H</Radio.Button>
                <Radio.Button value="24h">24H</Radio.Button>
                <Radio.Button value="7d">7D</Radio.Button>
                <Radio.Button value="30d">30D</Radio.Button>
              </Radio.Group>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">Sort By</Text>
              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: '100%' }}
                size="small"
              >
                <Option value="performance">Performance</Option>
                <Option value="volume">Volume</Option>
                <Option value="marketCap">Market Cap</Option>
                <Option value="volatility">Volatility</Option>
              </Select>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} sm={24} md={8}>
          <Card size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">Market Overview</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Text style={{ fontSize: '12px', color: '#8b949e' }}>Total Cap</Text>
                  <div style={{ color: '#26d0ce', fontWeight: 600 }}>
                    ${formatVolume(assetPerformance.reduce((sum, a) => sum + a.marketCap, 0))}
                  </div>
                </div>
                <div>
                  <Text style={{ fontSize: '12px', color: '#8b949e' }}>Total Vol</Text>
                  <div style={{ color: '#1890ff', fontWeight: 600 }}>
                    ${formatVolume(assetPerformance.reduce((sum, a) => sum + a.volume24h, 0))}
                  </div>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
      
      {/* Performance Comparison Table */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Asset Performance Matrix">
            <Table
              dataSource={sortedAssets}
              columns={columns}
              rowKey="symbol"
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Correlation Matrix */}
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} lg={12}>
          <Card title="Asset Correlation Matrix" size="small">
            <div style={{ padding: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(3, 1fr)', gap: '8px', alignItems: 'center' }}>
                {/* Header */}
                <div></div>
                {assetPerformance.map(asset => (
                  <div key={asset.symbol} style={{ 
                    textAlign: 'center', 
                    fontWeight: 600, 
                    color: '#c9d1d9',
                    fontSize: '12px',
                  }}>
                    {asset.symbol}
                  </div>
                ))}
                
                {/* Correlation values */}
                {correlationMatrix.map(row => (
                  <React.Fragment key={row.symbol}>
                    <div style={{ 
                      fontWeight: 600, 
                      color: '#c9d1d9',
                      fontSize: '12px',
                    }}>
                      {row.symbol}
                    </div>
                    {row.correlations.map(corr => (
                      <div 
                        key={`${row.symbol}-${corr.symbol}`}
                        style={{
                          textAlign: 'center',
                          padding: '4px',
                          borderRadius: '4px',
                          background: corr.value === 1 ? '#1890ff20' : 
                                    corr.value > 0.7 ? '#26d0ce20' :
                                    corr.value > 0.5 ? '#faad1420' : '#f8514920',
                          color: corr.value === 1 ? '#1890ff' :
                                corr.value > 0.7 ? '#26d0ce' :
                                corr.value > 0.5 ? '#faad14' : '#f85149',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}
                      >
                        {corr.value.toFixed(2)}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
              
              <div style={{ marginTop: '12px', fontSize: '10px', color: '#8b949e' }}>
                <div>Correlation Scale: 1.0 = Perfect • 0.7+ = Strong • 0.5+ = Moderate • &lt;0.5 = Weak</div>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Market Dominance" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              {assetPerformance.map(asset => (
                <div key={asset.symbol} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <Text style={{ fontSize: '12px' }}>{asset.symbol}</Text>
                    <Text style={{ fontSize: '12px', fontWeight: 600 }}>{asset.dominance}%</Text>
                  </div>
                  <Progress
                    percent={asset.dominance}
                    strokeColor={
                      asset.symbol === 'BTC' ? '#f7931a' : 
                      asset.symbol === 'ETH' ? '#627eea' : '#9945ff'
                    }
                    size="small"
                    showInfo={false}
                  />
                </div>
              ))}
              
              <div style={{ marginTop: '16px', padding: '8px', background: 'rgba(33, 38, 45, 0.5)', borderRadius: '4px' }}>
                <Text style={{ fontSize: '11px', color: '#8b949e' }}>
                  Market dominance shows each asset's percentage of total market capitalization across the tracked portfolio.
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
      
      {/* Performance Summary */}
      <Row style={{ marginTop: '16px' }}>
        <Col span={24}>
          <Card title="Performance Insights" size="small">
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Best Performer"
                  value={sortedAssets[0]?.symbol || 'N/A'}
                  prefix={
                    sortedAssets[0] && getChangeValue(sortedAssets[0]) > 0 ? 
                    <TrendingUpOutlined style={{ color: '#26d0ce' }} /> : 
                    <TrendingDownOutlined style={{ color: '#f85149' }} />
                  }
                  valueStyle={{ 
                    color: sortedAssets[0] && getChangeValue(sortedAssets[0]) > 0 ? '#26d0ce' : '#f85149',
                    fontSize: '16px',
                  }}
                  suffix={
                    sortedAssets[0] ? 
                    formatPercentage(getChangeValue(sortedAssets[0])).formatted : 
                    ''
                  }
                />
              </Col>
              
              <Col xs={12} sm={6}>
                <Statistic
                  title="Worst Performer"
                  value={sortedAssets[sortedAssets.length - 1]?.symbol || 'N/A'}
                  prefix={<TrendingDownOutlined style={{ color: '#f85149' }} />}
                  valueStyle={{ color: '#f85149', fontSize: '16px' }}
                  suffix={
                    sortedAssets[sortedAssets.length - 1] ? 
                    formatPercentage(getChangeValue(sortedAssets[sortedAssets.length - 1])).formatted : 
                    ''
                  }
                />
              </Col>
              
              <Col xs={12} sm={6}>
                <Statistic
                  title="Highest Volume"
                  value={assetPerformance.reduce((max, asset) => 
                    asset.volume24h > max.volume24h ? asset : max
                  ).symbol}
                  prefix={<SwapOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff', fontSize: '16px' }}
                  suffix={formatVolume(Math.max(...assetPerformance.map(a => a.volume24h)))}
                />
              </Col>
              
              <Col xs={12} sm={6}>
                <Statistic
                  title="Most Volatile"
                  value={assetPerformance.reduce((max, asset) => 
                    asset.volatility > max.volatility ? asset : max
                  ).symbol}
                  valueStyle={{ color: '#faad14', fontSize: '16px' }}
                  suffix={`${Math.max(...assetPerformance.map(a => a.volatility)).toFixed(1)}%`}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};