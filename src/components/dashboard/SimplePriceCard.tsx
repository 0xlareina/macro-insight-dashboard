import React from 'react';
import { Card, Statistic, Row, Col, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
}

export const SimplePriceCard: React.FC = () => {
  const mockData: PriceData[] = [
    { symbol: 'BTC', price: 43250.50, change24h: 2.98, volume24h: 28500000000 },
    { symbol: 'ETH', price: 2545.80, change24h: 3.63, volume24h: 18200000000 },
    { symbol: 'SOL', price: 98.75, change24h: -3.38, volume24h: 3800000000 },
  ];

  return (
    <Row gutter={16}>
      {mockData.map((asset) => (
        <Col span={8} key={asset.symbol}>
          <Card>
            <Statistic
              title={asset.symbol}
              value={asset.price}
              precision={2}
              prefix="$"
              suffix={
                <Tag color={asset.change24h > 0 ? 'green' : 'red'}>
                  {asset.change24h > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(asset.change24h).toFixed(2)}%
                </Tag>
              }
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#8b949e' }}>
              Vol: ${(asset.volume24h / 1000000000).toFixed(2)}B
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};