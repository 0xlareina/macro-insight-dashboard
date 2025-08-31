// CryptoSense Dashboard - Top Navigation Component
import React from 'react';
import { Layout, Space, Button, Badge, Switch, Typography, Divider, Tag } from 'antd';
import {
  MoonOutlined,
  SunOutlined,
  BellOutlined,
  SettingOutlined,
  WifiOutlined,
  DisconnectOutlined,
  DollarOutlined,
  TrophyOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { AssetSymbol } from '../../types';
import { formatPrice, formatPercentage } from '../../utils';

const { Header } = Layout;
const { Text, Title } = Typography;

interface TopNavigationProps {
  selectedAsset: AssetSymbol;
  onAssetChange: (asset: AssetSymbol) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  isConnected: boolean;
  alertCount?: number;
}

// Mock real-time price data for header
const mockPrices = {
  BTC: { price: 43250.50, change: 2.98 },
  ETH: { price: 2545.80, change: 3.63 },
  SOL: { price: 98.75, change: -3.38 },
};

export const TopNavigation: React.FC<TopNavigationProps> = ({
  selectedAsset,
  onAssetChange,
  isDarkMode,
  onToggleTheme,
  isConnected,
  alertCount = 3,
}) => {
  const assets: AssetSymbol[] = ['BTC', 'ETH', 'SOL'];
  
  const handleAssetClick = (asset: AssetSymbol) => {
    onAssetChange(asset);
  };
  
  const getAssetIcon = (asset: AssetSymbol) => {
    const icons = {
      BTC: '₿',
      ETH: 'Ξ',
      SOL: '◎',
    };
    return icons[asset];
  };
  
  const getAssetColor = (asset: AssetSymbol) => {
    const colors = {
      BTC: '#f7931a',
      ETH: '#627eea', 
      SOL: '#9945ff',
    };
    return colors[asset];
  };
  
  return (
    <Header 
      style={{
        background: '#161b22',
        borderBottom: '1px solid #30363d',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}
    >
      {/* Left Section - Logo & Asset Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #1890ff, #26d0ce)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            ₿
          </div>
          <Title 
            level={4} 
            style={{ 
              margin: 0, 
              color: '#c9d1d9',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            CryptoSense
          </Title>
          <Tag color="blue" size="small">CORE</Tag>
        </div>
        
        <Divider type="vertical" style={{ height: '30px', borderColor: '#30363d' }} />
        
        {/* Asset Quick Selector */}
        <Space size="large">
          {assets.map((asset) => {
            const priceData = mockPrices[asset];
            const isSelected = asset === selectedAsset;
            const { formatted, color } = formatPercentage(priceData.change);
            
            return (
              <Button
                key={asset}
                type={isSelected ? 'primary' : 'text'}
                size="large"
                onClick={() => handleAssetClick(asset)}
                style={{
                  height: '48px',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid #1890ff' : '1px solid #30363d',
                  background: isSelected ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
                  minWidth: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span 
                    style={{
                      fontSize: '14px',
                      color: getAssetColor(asset),
                      fontWeight: 'bold',
                    }}
                  >
                    {getAssetIcon(asset)}
                  </span>
                  <Text strong style={{ color: isSelected ? '#1890ff' : '#c9d1d9' }}>
                    {asset}
                  </Text>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                  <Text style={{ color: '#c9d1d9' }}>
                    {formatPrice(priceData.price)}
                  </Text>
                  <Text 
                    style={{ 
                      color: color === 'bull' ? '#26d0ce' : color === 'bear' ? '#f85149' : '#8b949e',
                      fontWeight: 500,
                    }}
                  >
                    {formatted}
                  </Text>
                </div>
              </Button>
            );
          })}
        </Space>
      </div>
      
      {/* Center Section - Market Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Fear & Greed Index */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '2px' }}>
            Fear & Greed
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#faad14', // Neutral color
              }}
            />
            <Text style={{ color: '#faad14', fontWeight: 600, fontSize: '14px' }}>
              72 - Greed
            </Text>
          </div>
        </div>
        
        <Divider type="vertical" style={{ height: '30px', borderColor: '#30363d' }} />
        
        {/* ETF Flow */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '2px' }}>
            ETF Net Flow
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrophyOutlined style={{ color: '#26d0ce', fontSize: '12px' }} />
            <Text style={{ color: '#26d0ce', fontWeight: 600, fontSize: '14px' }}>
              +$234M
            </Text>
          </div>
        </div>
        
        <Divider type="vertical" style={{ height: '30px', borderColor: '#30363d' }} />
        
        {/* Market Heat */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '2px' }}>
            Market Heat
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FireOutlined style={{ color: '#f85149', fontSize: '12px' }} />
            <Text style={{ color: '#f85149', fontWeight: 600, fontSize: '14px' }}>
              High
            </Text>
          </div>
        </div>
      </div>
      
      {/* Right Section - Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Connection Status */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '4px',
            background: isConnected ? 'rgba(38, 208, 206, 0.1)' : 'rgba(248, 81, 73, 0.1)',
          }}
        >
          {isConnected ? (
            <WifiOutlined style={{ color: '#26d0ce', fontSize: '12px' }} />
          ) : (
            <DisconnectOutlined style={{ color: '#f85149', fontSize: '12px' }} />
          )}
          <Text 
            style={{ 
              fontSize: '11px', 
              color: isConnected ? '#26d0ce' : '#f85149',
              fontWeight: 500,
            }}
          >
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </Text>
        </div>
        
        {/* Alerts */}
        <Badge count={alertCount} size="small">
          <Button 
            type="text" 
            icon={<BellOutlined />}
            style={{
              color: '#8b949e',
              border: '1px solid #30363d',
              borderRadius: '6px',
            }}
          />
        </Badge>
        
        {/* Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SunOutlined 
            style={{ 
              color: isDarkMode ? '#8b949e' : '#faad14',
              fontSize: '14px',
            }} 
          />
          <Switch
            checked={isDarkMode}
            onChange={onToggleTheme}
            size="small"
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
          <MoonOutlined 
            style={{ 
              color: isDarkMode ? '#1890ff' : '#8b949e',
              fontSize: '14px',
            }} 
          />
        </div>
        
        {/* Settings */}
        <Button 
          type="text" 
          icon={<SettingOutlined />}
          style={{
            color: '#8b949e',
            border: '1px solid #30363d',
            borderRadius: '6px',
          }}
        />
      </div>
    </Header>
  );
};