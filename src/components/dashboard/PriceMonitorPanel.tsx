// CryptoSense Dashboard - Price Monitor Panel Component
import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Typography, Row, Col, Statistic } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  LineChartOutlined,
  TrendingUpOutlined,
} from '@ant-design/icons';
import { Socket } from 'socket.io-client';
import { AssetSymbol } from '../../types';
import { formatPrice, formatPercentage, formatVolume, formatRelativeTime } from '../../utils';
import { MiniKlineChart } from '../charts/MiniKlineChart';
import { TechnicalIndicators } from '../charts/TechnicalIndicators';

const { Title, Text } = Typography;

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  marketCap: number;
  lastUpdated: string;
  source: 'binance' | 'coinbase';
  bid: number;
  ask: number;
  spread: number;
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
}

interface PriceMonitorPanelProps {
  selectedAsset: AssetSymbol;
  socket: Socket | null;
}

export const PriceMonitorPanel: React.FC<PriceMonitorPanelProps> = ({
  selectedAsset,
  socket,
}) => {
  const [priceData, setPriceData] = useState<{ [key: string]: PriceData }>({
    BTC: {
      symbol: 'BTC',
      price: 43250.50,
      change24h: 1250.30,
      changePercent24h: 2.98,
      volume24h: 28500000000,
      high24h: 43800.00,
      low24h: 41900.50,
      marketCap: 848000000000,
      lastUpdated: new Date().toISOString(),
      source: 'binance',
      bid: 43249.50,
      ask: 43251.50,
      spread: 0.046,
      rsi: 67.5,
      macd: {
        macd: 125.30,
        signal: 118.75,
        histogram: 6.55,
      },
    },
    ETH: {
      symbol: 'ETH',
      price: 2545.80,
      change24h: 89.20,
      changePercent24h: 3.63,
      volume24h: 15200000000,
      high24h: 2580.00,
      low24h: 2456.50,
      marketCap: 306000000000,
      lastUpdated: new Date().toISOString(),
      source: 'binance',
      bid: 2545.20,
      ask: 2546.40,
      spread: 0.047,
      rsi: 72.1,
      macd: {
        macd: 18.45,
        signal: 15.20,
        histogram: 3.25,
      },
    },
    SOL: {
      symbol: 'SOL',
      price: 98.75,
      change24h: -3.45,
      changePercent24h: -3.38,
      volume24h: 3800000000,
      high24h: 103.20,
      low24h: 97.30,
      marketCap: 44000000000,
      lastUpdated: new Date().toISOString(),
      source: 'binance',
      bid: 98.70,
      ask: 98.80,
      spread: 0.10,
      rsi: 42.8,
      macd: {
        macd: -2.15,
        signal: -1.80,
        histogram: -0.35,
      },
    },
  });
  
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  
  useEffect(() => {
    if (!socket) return;
    
    // Listen for price updates
    socket.on('price:update', (data: any) => {
      setPriceData(prev => ({
        ...prev,
        [data.symbol]: {
          ...prev[data.symbol],
          price: data.price,
          change24h: data.change24h || prev[data.symbol].change24h,
          changePercent24h: data.changePercent24h || prev[data.symbol].changePercent24h,
          volume24h: data.volume24h || prev[data.symbol].volume24h,
          high24h: data.high24h || prev[data.symbol].high24h,
          low24h: data.low24h || prev[data.symbol].low24h,
          lastUpdated: new Date(data.timestamp).toISOString(),
          source: data.source,
          bid: data.bid || prev[data.symbol].bid,
          ask: data.ask || prev[data.symbol].ask,
          spread: data.ask && data.bid ? 
            Number(((data.ask - data.bid) / data.ask * 100).toFixed(3)) : 
            prev[data.symbol].spread,
        },
      }));
    });
    
    return () => {
      socket.off('price:update');
    };
  }, [socket]);
  
  const assets = Object.values(priceData);
  
  const columns = [
    {
      title: 'Asset',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (symbol: string) => (
        <Space>
          <div 
            className={`crypto-icon crypto-${symbol.toLowerCase()}`}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: symbol === 'BTC' ? '#f7931a' : 
                         symbol === 'ETH' ? '#627eea' : '#9945ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            {symbol[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#c9d1d9' }}>{symbol}</div>
            <div style={{ fontSize: '12px', color: '#8b949e' }}>
              {symbol === 'BTC' ? 'Bitcoin' : 
               symbol === 'ETH' ? 'Ethereum' : 'Solana'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number, record: PriceData) => (
        <div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#c9d1d9' }}>
            {formatPrice(price)}
          </div>
          <div style={{ fontSize: '12px', color: '#8b949e' }}>
            Spread: {record.spread.toFixed(3)}%
          </div>
        </div>
      ),
      sorter: (a: PriceData, b: PriceData) => a.price - b.price,
    },
    {
      title: '24h Change',
      dataIndex: 'changePercent24h',
      key: 'change',
      render: (changePercent: number, record: PriceData) => {
        const { formatted, color, isPositive } = formatPercentage(changePercent);
        return (
          <div>
            <Tag 
              color={color === 'bull' ? 'green' : color === 'bear' ? 'red' : 'default'}
              icon={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            >
              {formatted}
            </Tag>
            <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '2px' }}>
              {formatPrice(record.change24h, 'USD')}
            </div>
          </div>
        );
      },
      sorter: (a: PriceData, b: PriceData) => a.changePercent24h - b.changePercent24h,
    },
    {
      title: '24h Volume',
      dataIndex: 'volume24h',
      key: 'volume',
      render: (volume: number) => (
        <div>
          <div style={{ fontWeight: 500, color: '#c9d1d9' }}>
            ${formatVolume(volume)}
          </div>
        </div>
      ),
      sorter: (a: PriceData, b: PriceData) => a.volume24h - b.volume24h,
    },
    {
      title: '24h Range',
      key: 'range',
      render: (record: PriceData) => (
        <div>
          <div style={{ fontSize: '12px', color: '#8b949e' }}>
            L: {formatPrice(record.low24h)}
          </div>
          <div style={{ fontSize: '12px', color: '#8b949e' }}>
            H: {formatPrice(record.high24h)}
          </div>
        </div>
      ),
    },
    {
      title: 'RSI',
      dataIndex: 'rsi',
      key: 'rsi',
      render: (rsi: number) => {
        const color = rsi > 70 ? '#f5222d' : rsi < 30 ? '#52c41a' : '#faad14';
        const status = rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral';
        return (
          <div>
            <div style={{ color, fontWeight: 600 }}>
              {rsi.toFixed(1)}
            </div>
            <div style={{ fontSize: '10px', color: '#8b949e' }}>
              {status}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Chart',
      key: 'chart',
      width: 120,
      render: (record: PriceData) => (
        <MiniKlineChart 
          symbol={record.symbol}
          width={100}
          height={40}
          data={[]} // Will be populated with historical data
        />
      ),
    },
    {
      title: 'Last Update',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (timestamp: string, record: PriceData) => (
        <div>
          <div style={{ fontSize: '11px', color: '#8b949e' }}>
            {formatRelativeTime(timestamp)}
          </div>
          <div style={{ fontSize: '10px', color: '#484f58' }}>
            {record.source.toUpperCase()}
          </div>
        </div>
      ),
    },
  ];
  
  const selectedAssetData = priceData[selectedAsset];
  
  return (
    <div className="price-monitor-panel">
      <Title level={3}>
        <LineChartOutlined /> Real-time Price Monitoring
      </Title>
      
      {/* Selected Asset Spotlight */}
      <Card 
        className="selected-asset-card"
        style={{ marginBottom: '16px', background: 'rgba(24, 144, 255, 0.05)' }}
      >
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Space size="large" align="center">
              <div 
                className={`crypto-icon-large crypto-${selectedAsset.toLowerCase()}`}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: selectedAsset === 'BTC' ? '#f7931a' : 
                             selectedAsset === 'ETH' ? '#627eea' : '#9945ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              >
                {selectedAsset[0]}
              </div>
              <div>
                <Title level={4} style={{ margin: 0, color: '#c9d1d9' }}>
                  {selectedAsset}
                </Title>
                <Text type="secondary">
                  {selectedAsset === 'BTC' ? 'Bitcoin' : 
                   selectedAsset === 'ETH' ? 'Ethereum' : 'Solana'}
                </Text>
              </div>
            </Space>
          </Col>
          
          <Col xs={24} sm={8}>
            <Statistic
              title="Current Price"
              value={selectedAssetData.price}
              precision={2}
              prefix="$"
              valueStyle={{ 
                color: '#c9d1d9',
                fontSize: '28px',
                fontWeight: 700,
              }}
            />
            <div style={{ marginTop: '4px' }}>
              <Tag 
                color={selectedAssetData.changePercent24h > 0 ? 'green' : 'red'}
                icon={selectedAssetData.changePercent24h > 0 ? 
                     <ArrowUpOutlined /> : <ArrowDownOutlined />}
              >
                {formatPercentage(selectedAssetData.changePercent24h).formatted}
              </Tag>
            </div>
          </Col>
          
          <Col xs={24} sm={8}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="24h Volume"
                  value={formatVolume(selectedAssetData.volume24h)}
                  valueStyle={{ color: '#c9d1d9' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Market Cap"
                  value={formatVolume(selectedAssetData.marketCap)}
                  valueStyle={{ color: '#c9d1d9' }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
      
      {/* All Assets Table */}
      <Card 
        title="All Assets Overview" 
        extra={
          <Space>
            <TrendingUpOutlined />
            <Text type="secondary">Live Data</Text>
          </Space>
        }
      >
        <Table
          dataSource={assets}
          columns={columns}
          rowKey="symbol"
          pagination={false}
          size="small"
          scroll={{ x: 800 }}
          rowClassName={(record) => 
            record.symbol === selectedAsset ? 'selected-row' : ''
          }
          onRow={(record) => ({
            style: {
              cursor: 'pointer',
            },
          })}
        />
      </Card>
      
      {/* Technical Analysis for Selected Asset */}
      <Card 
        title={`${selectedAsset} Technical Analysis`}
        style={{ marginTop: '16px' }}
      >
        <TechnicalIndicators 
          symbol={selectedAsset}
          price={selectedAssetData.price}
          rsi={selectedAssetData.rsi}
          macd={selectedAssetData.macd}
          volume={selectedAssetData.volume24h}
        />
      </Card>
    </div>
  );
};