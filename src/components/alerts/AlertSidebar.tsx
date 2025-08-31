// CryptoSense Dashboard - Alert Sidebar Component
import React, { useState } from 'react';
import { 
  Card, 
  List, 
  Tag, 
  Button, 
  Typography, 
  Space, 
  Empty, 
  Badge,
  Tooltip,
  Divider,
  Progress,
} from 'antd';
import {
  BellOutlined,
  CloseOutlined,
  DeleteOutlined,
  ExclamationTriangleOutlined,
  ThunderboltOutlined,
  TrendingUpOutlined,
  TrendingDownOutlined,
  FundOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { MarketAlert } from '../../types';
import { formatRelativeTime, formatPrice, formatVolume } from '../../utils';

const { Title, Text } = Typography;

interface AlertSidebarProps {
  alerts: MarketAlert[];
  onClearAlert: (alertId: string) => void;
  onClearAll: () => void;
}

export const AlertSidebar: React.FC<AlertSidebarProps> = ({
  alerts,
  onClearAlert,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  
  const getAlertIcon = (type: string, severity: string) => {
    const iconProps = {
      style: { 
        fontSize: '16px',
        color: severity === 'critical' ? '#f5222d' : 
               severity === 'high' ? '#fa8c16' : 
               severity === 'medium' ? '#faad14' : '#52c41a'
      }
    };
    
    switch (type) {
      case 'price_movement':
        return <TrendingUpOutlined {...iconProps} />;
      case 'funding_rate':
        return <FundOutlined {...iconProps} />;
      case 'liquidation':
        return <ThunderboltOutlined {...iconProps} />;
      case 'sentiment':
        return <ExclamationTriangleOutlined {...iconProps} />;
      case 'etf_flow':
        return <DollarOutlined {...iconProps} />;
      default:
        return <BellOutlined {...iconProps} />;
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#f5222d';
      case 'high':
        return '#fa8c16';
      case 'medium':
        return '#faad14';
      case 'low':
        return '#52c41a';
      default:
        return '#8c8c8c';
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'price_movement':
        return 'Price Alert';
      case 'funding_rate':
        return 'Funding Rate';
      case 'liquidation':
        return 'Liquidation';
      case 'sentiment':
        return 'Sentiment';
      case 'etf_flow':
        return 'ETF Flow';
      default:
        return 'General';
    }
  };
  
  // Filter alerts
  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.severity === filter);
  
  // Alert statistics
  const alertStats = {
    total: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
  };
  
  return (
    <div className="alert-sidebar" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Card 
        size="small"
        style={{ marginBottom: '16px', flexShrink: 0 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <BellOutlined style={{ color: '#1890ff' }} />
            <Title level={5} style={{ margin: 0, color: '#c9d1d9' }}>
              Live Alerts
            </Title>
            <Badge count={alertStats.total} style={{ backgroundColor: '#1890ff' }} />
          </Space>
          
          {alerts.length > 0 && (
            <Button 
              type="text" 
              size="small"
              icon={<DeleteOutlined />}
              onClick={onClearAll}
              style={{ color: '#8b949e' }}
            >
              Clear All
            </Button>
          )}
        </div>
        
        {/* Alert Statistics */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>Alert Breakdown</Text>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8b949e' }}>Critical</span>
              <span style={{ color: '#f5222d', fontWeight: 600 }}>{alertStats.critical}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8b949e' }}>High</span>
              <span style={{ color: '#fa8c16', fontWeight: 600 }}>{alertStats.high}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8b949e' }}>Medium</span>
              <span style={{ color: '#faad14', fontWeight: 600 }}>{alertStats.medium}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#8b949e' }}>Low</span>
              <span style={{ color: '#52c41a', fontWeight: 600 }}>{alertStats.low}</span>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Filter Buttons */}
      <div style={{ marginBottom: '16px', flexShrink: 0 }}>
        <Space.Compact style={{ width: '100%' }}>
          <Button 
            size="small"
            type={filter === 'all' ? 'primary' : 'default'}
            onClick={() => setFilter('all')}
            style={{ flex: 1 }}
          >
            All
          </Button>
          <Button 
            size="small"
            type={filter === 'high' ? 'primary' : 'default'}
            onClick={() => setFilter('high')}
            style={{ flex: 1 }}
          >
            High
          </Button>
          <Button 
            size="small"
            type={filter === 'medium' ? 'primary' : 'default'}
            onClick={() => setFilter('medium')}
            style={{ flex: 1 }}
          >
            Medium
          </Button>
          <Button 
            size="small"
            type={filter === 'low' ? 'primary' : 'default'}
            onClick={() => setFilter('low')}
            style={{ flex: 1 }}
          >
            Low
          </Button>
        </Space.Compact>
      </div>
      
      {/* Alerts List */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {filteredAlerts.length === 0 ? (
          <Empty 
            description="No alerts"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ 
              marginTop: '60px',
              color: '#8b949e',
            }}
          />
        ) : (
          <List
            dataSource={filteredAlerts}
            renderItem={(alert) => (
              <List.Item
                key={alert.id}
                style={{
                  padding: '12px',
                  margin: '0 0 8px 0',
                  background: '#161b22',
                  border: `1px solid ${getSeverityColor(alert.severity)}30`,
                  borderRadius: '8px',
                  borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
                }}
              >
                <div style={{ width: '100%' }}>
                  {/* Alert Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getAlertIcon(alert.type, alert.severity)}
                      <Tag 
                        color={getSeverityColor(alert.severity)}
                        size="small"
                        style={{ margin: 0, fontSize: '10px' }}
                      >
                        {alert.severity.toUpperCase()}
                      </Tag>
                    </div>
                    
                    <Tooltip title="Dismiss alert">
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => onClearAlert(alert.id)}
                        style={{ 
                          color: '#8b949e',
                          padding: '2px',
                          minWidth: 'auto',
                          height: 'auto',
                        }}
                      />
                    </Tooltip>
                  </div>
                  
                  {/* Alert Content */}
                  <div style={{ marginBottom: '8px' }}>
                    <Text 
                      style={{ 
                        fontSize: '13px', 
                        color: '#c9d1d9',
                        fontWeight: 500,
                        display: 'block',
                        marginBottom: '4px',
                      }}
                    >
                      {alert.title}
                    </Text>
                    
                    <Text 
                      style={{ 
                        fontSize: '12px', 
                        color: '#8b949e',
                        lineHeight: '1.4',
                      }}
                    >
                      {alert.message}
                    </Text>
                  </div>
                  
                  {/* Alert Details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Tag size="small" color="blue">
                        {getTypeLabel(alert.type)}
                      </Tag>
                      
                      {alert.asset && (
                        <Tag size="small" color="cyan">
                          {alert.asset}
                        </Tag>
                      )}
                    </div>
                    
                    <Text 
                      type="secondary" 
                      style={{ fontSize: '10px' }}
                    >
                      {formatRelativeTime(alert.timestamp)}
                    </Text>
                  </div>
                  
                  {/* Additional Data */}
                  {(alert.value || alert.threshold) && (
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '6px 8px',
                      background: 'rgba(33, 38, 45, 0.5)',
                      borderRadius: '4px',
                      fontSize: '11px',
                    }}>
                      {alert.value && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#8b949e' }}>Current:</span>
                          <span style={{ color: '#c9d1d9', fontWeight: 600 }}>
                            {alert.type === 'price_movement' && typeof alert.value === 'number' 
                              ? formatPrice(alert.value)
                              : alert.value}
                          </span>
                        </div>
                      )}
                      
                      {alert.threshold && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#8b949e' }}>Threshold:</span>
                          <span style={{ color: getSeverityColor(alert.severity), fontWeight: 600 }}>
                            {alert.type === 'price_movement' && typeof alert.threshold === 'number'
                              ? formatPrice(alert.threshold) 
                              : alert.threshold}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
      
      {/* Footer - Alert Settings */}
      <Card 
        size="small"
        style={{ marginTop: '16px', flexShrink: 0 }}
      >
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '11px', marginBottom: '8px', display: 'block' }}>
            Alert System Status
          </Text>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '12px' }} />
            <Text style={{ fontSize: '12px', color: '#52c41a', fontWeight: 500 }}>
              Active & Monitoring
            </Text>
          </div>
          
          <div style={{ marginTop: '8px' }}>
            <Text type="secondary" style={{ fontSize: '10px' }}>
              {alertStats.total} alerts today
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};