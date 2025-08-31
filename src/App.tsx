// CryptoSense Dashboard - Main App Component
import React, { useEffect, useState } from 'react';
import { ConfigProvider, Layout, theme, message, Tabs } from 'antd';
import './App.css';
import { SimplePriceCard } from './components/dashboard/SimplePriceCard';
import { FearGreedGauge } from './components/charts/FearGreedGauge';
import { ETFFlowChart } from './components/charts/ETFFlowChart';
import { PriceMonitorPanel } from './components/dashboard/PriceMonitorPanel';
import { DerivativesPanel } from './components/dashboard/DerivativesPanel';
import { CrossAssetComparison } from './components/dashboard/CrossAssetComparison';
import { StablecoinLiquidityPanel } from './components/dashboard/StablecoinLiquidityPanel';

const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [alerts, setAlerts] = useState<any[]>([
    {
      id: '1',
      title: 'BTC Price Alert',
      message: 'Bitcoin surpassed $43,000',
      severity: 'high',
      timestamp: new Date().toISOString(),
      asset: 'BTC',
      type: 'price_movement',
    },
    {
      id: '2', 
      title: 'High Funding Rate',
      message: 'ETH funding rate at 0.15%',
      severity: 'medium',
      timestamp: new Date().toISOString(),
      asset: 'ETH',
      type: 'funding_rate',
    },
  ]);
  
  const { darkAlgorithm, defaultAlgorithm } = theme;
  
  // Mock ETF Flow Data
  const etfFlowData = [
    { date: '2024-01-01', flow: 234, cumulativeFlow: 234 },
    { date: '2024-01-02', flow: -156, cumulativeFlow: 78 },
    { date: '2024-01-03', flow: 389, cumulativeFlow: 467 },
    { date: '2024-01-04', flow: 122, cumulativeFlow: 589 },
    { date: '2024-01-05', flow: -67, cumulativeFlow: 522 },
    { date: '2024-01-06', flow: 445, cumulativeFlow: 967 },
    { date: '2024-01-07', flow: 298, cumulativeFlow: 1265 },
  ];
  
  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#f5222d',
          borderRadius: 6,
        },
      }}
    >
      <Layout className="app-layout" style={{ minHeight: '100vh' }}>
        <Header className="app-header" style={{ padding: 0, background: '#161b22' }}>
          <div style={{ padding: '16px 24px', color: '#c9d1d9', fontSize: '20px', fontWeight: 'bold' }}>
            🚀 CryptoSense Dashboard
          </div>
        </Header>
        
        <Layout>
          <Content className="app-content" style={{ padding: '24px', background: '#0d1117' }}>
            <Tabs 
              size="large"
              type="card"
              style={{ height: '100%' }}
            >
              <TabPane tab="Market Overview" key="market-overview">
                <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                  <div>
                    <FearGreedGauge value={72} />
                  </div>
                  <div>
                    <ETFFlowChart data={etfFlowData} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <PriceMonitorPanel selectedAsset={selectedAsset} socket={null} />
                  </div>
                </div>
              </TabPane>
              
              <TabPane tab="Derivatives" key="derivatives">
                <DerivativesPanel selectedAsset={selectedAsset} socket={null} />
              </TabPane>
              
              <TabPane tab="Cross-Asset Analysis" key="cross-asset">
                <CrossAssetComparison selectedAsset={selectedAsset} socket={null} />
              </TabPane>
              
              <TabPane tab="Stablecoin Markets" key="stablecoins">
                <StablecoinLiquidityPanel socket={null} />
              </TabPane>
            </Tabs>
          </Content>
          
          <Sider
            width={350}
            className="alert-sidebar"
            style={{
              background: '#161b22',
              borderLeft: `1px solid #30363d`,
            }}
          >
            <div style={{ padding: '20px', color: '#c9d1d9' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>🔔 Live Alerts</h3>
              
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  style={{
                    padding: '12px',
                    marginBottom: '12px',
                    background: '#21262d',
                    border: '1px solid #30363d',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${alert.severity === 'high' ? '#fa8c16' : '#faad14'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#e6edf3' }}>
                        {alert.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '8px' }}>
                        {alert.message}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ 
                          fontSize: '10px', 
                          padding: '2px 6px', 
                          background: alert.severity === 'high' ? '#fa8c16' : '#faad14',
                          color: 'white',
                          borderRadius: '4px',
                        }}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span style={{ 
                          fontSize: '10px', 
                          padding: '2px 6px', 
                          background: '#1890ff',
                          color: 'white',
                          borderRadius: '4px',
                        }}>
                          {alert.asset}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#8b949e',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '4px',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              
              {alerts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#8b949e' }}>
                  No active alerts
                </div>
              )}
            </div>
          </Sider>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;