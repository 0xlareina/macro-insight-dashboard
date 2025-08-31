import React, { useState } from 'react';
import { ConfigProvider, Layout, theme, Tabs } from 'antd';

const { Header, Content, Sider } = Layout;
const { TabPane } = Tabs;

export const SimpleApp: React.FC = () => {
  const [isDarkMode] = useState(true);
  const [alerts, setAlerts] = useState([
    { id: '1', title: 'BTC Price Alert', message: 'Bitcoin surpassed $43,000', severity: 'high', asset: 'BTC' },
    { id: '2', title: 'High Funding Rate', message: 'ETH funding rate at 0.15%', severity: 'medium', asset: 'ETH' },
    { id: '3', title: 'Liquidation Alert', message: '$12M BTC longs liquidated', severity: 'high', asset: 'BTC' },
  ]);
  const { darkAlgorithm, defaultAlgorithm } = theme;
  
  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ padding: 0, background: '#161b22' }}>
          <div style={{ padding: '16px 24px', color: '#c9d1d9', fontSize: '20px', fontWeight: 'bold' }}>
            🚀 CryptoSense Dashboard
          </div>
        </Header>
        
        <Layout>
          <Content style={{ padding: '24px', background: '#0d1117' }}>
            <Tabs size="large" type="card">
              <TabPane tab="Market Overview" key="1">
                <div style={{ padding: '20px' }}>
                  {/* Price Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                      <div style={{ fontSize: '14px', color: '#8b949e', marginBottom: '8px' }}>Bitcoin</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c9d1d9' }}>$43,250</div>
                      <div style={{ fontSize: '14px', color: '#3fb950', marginTop: '8px' }}>↑ 2.98%</div>
                    </div>
                    
                    <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                      <div style={{ fontSize: '14px', color: '#8b949e', marginBottom: '8px' }}>Ethereum</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c9d1d9' }}>$2,545</div>
                      <div style={{ fontSize: '14px', color: '#3fb950', marginTop: '8px' }}>↑ 3.63%</div>
                    </div>
                    
                    <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                      <div style={{ fontSize: '14px', color: '#8b949e', marginBottom: '8px' }}>Solana</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c9d1d9' }}>$98.75</div>
                      <div style={{ fontSize: '14px', color: '#f85149', marginTop: '8px' }}>↓ 3.38%</div>
                    </div>
                  </div>
                  
                  {/* Charts Section */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d', height: '300px' }}>
                      <h3 style={{ color: '#c9d1d9', marginBottom: '16px' }}>Fear & Greed Index</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#faad14' }}>72</div>
                        <div style={{ fontSize: '18px', color: '#faad14', marginTop: '8px' }}>Greed</div>
                        <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '12px' }}>Yesterday: 68 • Week Ago: 55</div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d', height: '300px' }}>
                      <h3 style={{ color: '#c9d1d9', marginBottom: '16px' }}>ETF Flow</h3>
                      <div style={{ color: '#8b949e', fontSize: '14px' }}>
                        <div style={{ marginBottom: '12px' }}>Daily Flow: <span style={{ color: '#3fb950' }}>+$445M</span></div>
                        <div style={{ marginBottom: '12px' }}>Cumulative: <span style={{ color: '#c9d1d9' }}>$1.27B</span></div>
                        <div style={{ marginTop: '20px', padding: '12px', background: '#0d1117', borderRadius: '6px' }}>
                          <div style={{ fontSize: '12px', marginBottom: '8px' }}>Top ETFs Today:</div>
                          <div style={{ fontSize: '11px' }}>GBTC: +$234M</div>
                          <div style={{ fontSize: '11px' }}>IBIT: +$156M</div>
                          <div style={{ fontSize: '11px' }}>FBTC: +$55M</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Market Depth & Volume */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                      <h4 style={{ color: '#c9d1d9', marginBottom: '12px', fontSize: '14px' }}>24h Volume</h4>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#c9d1d9' }}>$47.8B</div>
                      <div style={{ fontSize: '12px', color: '#3fb950', marginTop: '4px' }}>↑ 12.3%</div>
                    </div>
                    
                    <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                      <h4 style={{ color: '#c9d1d9', marginBottom: '12px', fontSize: '14px' }}>Market Cap</h4>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#c9d1d9' }}>$1.68T</div>
                      <div style={{ fontSize: '12px', color: '#3fb950', marginTop: '4px' }}>↑ 2.1%</div>
                    </div>
                    
                    <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                      <h4 style={{ color: '#c9d1d9', marginBottom: '12px', fontSize: '14px' }}>BTC Dominance</h4>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#c9d1d9' }}>52.3%</div>
                      <div style={{ fontSize: '12px', color: '#f85149', marginTop: '4px' }}>↓ 0.5%</div>
                    </div>
                  </div>
                  
                  {/* Liquidations & Funding */}
                  <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d', marginBottom: '24px' }}>
                    <h3 style={{ color: '#c9d1d9', marginBottom: '16px' }}>Market Activity</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '4px' }}>24h Liquidations</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f85149' }}>$127M</div>
                        <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '4px' }}>Longs: $89M • Shorts: $38M</div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '4px' }}>Open Interest</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#c9d1d9' }}>$18.7B</div>
                        <div style={{ fontSize: '11px', color: '#3fb950', marginTop: '4px' }}>↑ 5.2% from yesterday</div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '4px' }}>Funding Rate (8h)</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#faad14' }}>0.042%</div>
                        <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '4px' }}>Annualized: 45.99%</div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '4px' }}>Long/Short Ratio</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3fb950' }}>1.34</div>
                        <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '4px' }}>57% Long • 43% Short</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Top Movers */}
                  <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                    <h3 style={{ color: '#c9d1d9', marginBottom: '16px' }}>Top Movers (24h)</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                      <div>
                        <h4 style={{ fontSize: '12px', color: '#3fb950', marginBottom: '12px' }}>🔥 Gainers</h4>
                        <div style={{ fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#c9d1d9' }}>INJ</span>
                            <span style={{ color: '#3fb950' }}>+18.7%</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#c9d1d9' }}>AVAX</span>
                            <span style={{ color: '#3fb950' }}>+12.3%</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#c9d1d9' }}>NEAR</span>
                            <span style={{ color: '#3fb950' }}>+9.8%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 style={{ fontSize: '12px', color: '#f85149', marginBottom: '12px' }}>📉 Losers</h4>
                        <div style={{ fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#c9d1d9' }}>ARB</span>
                            <span style={{ color: '#f85149' }}>-8.4%</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#c9d1d9' }}>OP</span>
                            <span style={{ color: '#f85149' }}>-6.2%</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#c9d1d9' }}>MATIC</span>
                            <span style={{ color: '#f85149' }}>-5.1%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPane>
              
              <TabPane tab="Derivatives" key="2">
                <div style={{ padding: '20px' }}>
                  {/* Futures Overview */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                      <h4 style={{ color: '#c9d1d9', marginBottom: '16px', fontSize: '16px' }}>BTC Perpetual</h4>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#8b949e' }}>Mark Price</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#c9d1d9' }}>$43,285.50</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                        <div>
                          <div style={{ color: '#8b949e' }}>Funding</div>
                          <div style={{ color: '#faad14' }}>0.0425%</div>
                        </div>
                        <div>
                          <div style={{ color: '#8b949e' }}>OI</div>
                          <div style={{ color: '#c9d1d9' }}>$8.7B</div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                      <h4 style={{ color: '#c9d1d9', marginBottom: '16px', fontSize: '16px' }}>ETH Perpetual</h4>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#8b949e' }}>Mark Price</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#c9d1d9' }}>$2,548.75</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                        <div>
                          <div style={{ color: '#8b949e' }}>Funding</div>
                          <div style={{ color: '#3fb950' }}>0.0155%</div>
                        </div>
                        <div>
                          <div style={{ color: '#8b949e' }}>OI</div>
                          <div style={{ color: '#c9d1d9' }}>$4.2B</div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                      <h4 style={{ color: '#c9d1d9', marginBottom: '16px', fontSize: '16px' }}>SOL Perpetual</h4>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#8b949e' }}>Mark Price</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#c9d1d9' }}>$98.85</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                        <div>
                          <div style={{ color: '#8b949e' }}>Funding</div>
                          <div style={{ color: '#f85149' }}>-0.0087%</div>
                        </div>
                        <div>
                          <div style={{ color: '#8b949e' }}>OI</div>
                          <div style={{ color: '#c9d1d9' }}>$780M</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Options Data */}
                  <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d', marginBottom: '24px' }}>
                    <h3 style={{ color: '#c9d1d9', marginBottom: '16px' }}>BTC Options Overview</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '4px' }}>24h Volume</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#c9d1d9' }}>$2.3B</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '4px' }}>Put/Call Ratio</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#faad14' }}>0.68</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '4px' }}>Max Pain</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#c9d1d9' }}>$42,000</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '4px' }}>IV (30d)</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>68%</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Term Structure */}
                  <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                    <h3 style={{ color: '#c9d1d9', marginBottom: '16px' }}>Funding Rate History</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                      {['8h ago', '16h ago', '24h ago', '2d ago', '3d ago'].map((time, i) => (
                        <div key={time} style={{ textAlign: 'center', padding: '12px', background: '#0d1117', borderRadius: '6px' }}>
                          <div style={{ fontSize: '11px', color: '#8b949e', marginBottom: '4px' }}>{time}</div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: i < 2 ? '#faad14' : '#3fb950' }}>
                            {i < 2 ? '+' : ''}{(0.04 - i * 0.008).toFixed(3)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabPane>
              
              <TabPane tab="Cross-Asset Analysis" key="3">
                <div style={{ padding: '20px' }}>
                  {/* Correlation Matrix */}
                  <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d', marginBottom: '24px' }}>
                    <h3 style={{ color: '#c9d1d9', marginBottom: '16px' }}>30-Day Correlation Matrix</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'separate', borderSpacing: '2px' }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '8px', color: '#8b949e' }}></th>
                            <th style={{ padding: '8px', color: '#c9d1d9' }}>BTC</th>
                            <th style={{ padding: '8px', color: '#c9d1d9' }}>ETH</th>
                            <th style={{ padding: '8px', color: '#c9d1d9' }}>SOL</th>
                            <th style={{ padding: '8px', color: '#c9d1d9' }}>SPX</th>
                            <th style={{ padding: '8px', color: '#c9d1d9' }}>GOLD</th>
                            <th style={{ padding: '8px', color: '#c9d1d9' }}>DXY</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ padding: '8px', color: '#c9d1d9', fontWeight: 'bold' }}>BTC</td>
                            <td style={{ padding: '8px', background: '#1890ff', color: 'white', textAlign: 'center' }}>1.00</td>
                            <td style={{ padding: '8px', background: '#52c41a', color: 'white', textAlign: 'center' }}>0.82</td>
                            <td style={{ padding: '8px', background: '#52c41a', color: 'white', textAlign: 'center' }}>0.74</td>
                            <td style={{ padding: '8px', background: '#faad14', color: 'white', textAlign: 'center' }}>0.42</td>
                            <td style={{ padding: '8px', background: '#fa8c16', color: 'white', textAlign: 'center' }}>0.18</td>
                            <td style={{ padding: '8px', background: '#f5222d', color: 'white', textAlign: 'center' }}>-0.35</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '8px', color: '#c9d1d9', fontWeight: 'bold' }}>ETH</td>
                            <td style={{ padding: '8px', background: '#52c41a', color: 'white', textAlign: 'center' }}>0.82</td>
                            <td style={{ padding: '8px', background: '#1890ff', color: 'white', textAlign: 'center' }}>1.00</td>
                            <td style={{ padding: '8px', background: '#52c41a', color: 'white', textAlign: 'center' }}>0.88</td>
                            <td style={{ padding: '8px', background: '#faad14', color: 'white', textAlign: 'center' }}>0.38</td>
                            <td style={{ padding: '8px', background: '#fa8c16', color: 'white', textAlign: 'center' }}>0.12</td>
                            <td style={{ padding: '8px', background: '#f5222d', color: 'white', textAlign: 'center' }}>-0.28</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Performance Comparison */}
                  <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d', marginBottom: '24px' }}>
                    <h3 style={{ color: '#c9d1d9', marginBottom: '16px' }}>Performance Comparison</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      {[
                        { asset: 'BTC', '24h': '+2.98%', '7d': '+8.2%', '30d': '+24.5%', ytd: '+156%' },
                        { asset: 'ETH', '24h': '+3.63%', '7d': '+12.1%', '30d': '+31.2%', ytd: '+98%' },
                        { asset: 'S&P 500', '24h': '+0.42%', '7d': '+1.8%', '30d': '+3.2%', ytd: '+18%' },
                        { asset: 'Gold', '24h': '-0.18%', '7d': '+0.5%', '30d': '+2.1%', ytd: '+12%' },
                      ].map(data => (
                        <div key={data.asset} style={{ padding: '16px', background: '#0d1117', borderRadius: '6px' }}>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#c9d1d9', marginBottom: '12px' }}>{data.asset}</div>
                          <div style={{ fontSize: '11px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ color: '#8b949e' }}>24h:</span>
                              <span style={{ color: data['24h'].startsWith('+') ? '#3fb950' : '#f85149' }}>{data['24h']}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ color: '#8b949e' }}>7d:</span>
                              <span style={{ color: data['7d'].startsWith('+') ? '#3fb950' : '#f85149' }}>{data['7d']}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ color: '#8b949e' }}>30d:</span>
                              <span style={{ color: data['30d'].startsWith('+') ? '#3fb950' : '#f85149' }}>{data['30d']}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#8b949e' }}>YTD:</span>
                              <span style={{ color: data.ytd.startsWith('+') ? '#3fb950' : '#f85149' }}>{data.ytd}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Risk Metrics */}
                  <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                    <h3 style={{ color: '#c9d1d9', marginBottom: '16px' }}>Risk Metrics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                      <div>
                        <h4 style={{ fontSize: '14px', color: '#c9d1d9', marginBottom: '12px' }}>Volatility (30d)</h4>
                        <div style={{ fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: '#8b949e' }}>BTC:</span>
                            <span style={{ color: '#faad14' }}>68.5%</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: '#8b949e' }}>ETH:</span>
                            <span style={{ color: '#fa8c16' }}>82.3%</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#8b949e' }}>S&P:</span>
                            <span style={{ color: '#3fb950' }}>14.2%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 style={{ fontSize: '14px', color: '#c9d1d9', marginBottom: '12px' }}>Sharpe Ratio</h4>
                        <div style={{ fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: '#8b949e' }}>BTC:</span>
                            <span style={{ color: '#3fb950' }}>2.34</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: '#8b949e' }}>ETH:</span>
                            <span style={{ color: '#3fb950' }}>1.98</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#8b949e' }}>S&P:</span>
                            <span style={{ color: '#faad14' }}>1.42</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 style={{ fontSize: '14px', color: '#c9d1d9', marginBottom: '12px' }}>Max Drawdown</h4>
                        <div style={{ fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: '#8b949e' }}>BTC:</span>
                            <span style={{ color: '#f85149' }}>-18.5%</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: '#8b949e' }}>ETH:</span>
                            <span style={{ color: '#f85149' }}>-22.1%</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#8b949e' }}>S&P:</span>
                            <span style={{ color: '#faad14' }}>-5.8%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPane>
              
              <TabPane tab="Stablecoin Markets" key="4">
                <div style={{ padding: '20px' }}>
                  {/* Stablecoin Overview */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    {[
                      { name: 'USDT', mcap: '$91.2B', supply: '+$2.1B', apy: '8.2%' },
                      { name: 'USDC', mcap: '$34.8B', supply: '-$450M', apy: '6.8%' },
                      { name: 'DAI', mcap: '$5.3B', supply: '+$120M', apy: '7.5%' },
                      { name: 'BUSD', mcap: '$2.1B', supply: '-$890M', apy: '5.2%' },
                    ].map(stable => (
                      <div key={stable.name} style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                        <h4 style={{ color: '#c9d1d9', marginBottom: '12px', fontSize: '16px' }}>{stable.name}</h4>
                        <div style={{ fontSize: '12px' }}>
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ color: '#8b949e' }}>Market Cap</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#c9d1d9' }}>{stable.mcap}</div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ color: '#8b949e' }}>7d Supply</div>
                              <div style={{ color: stable.supply.startsWith('+') ? '#3fb950' : '#f85149' }}>{stable.supply}</div>
                            </div>
                            <div>
                              <div style={{ color: '#8b949e' }}>APY</div>
                              <div style={{ color: '#1890ff' }}>{stable.apy}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* DeFi Pools */}
                  <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d', marginBottom: '24px' }}>
                    <h3 style={{ color: '#c9d1d9', marginBottom: '16px' }}>Top DeFi Pools</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                      {[
                        { pool: 'USDC/USDT (Curve)', tvl: '$3.2B', apy: '4.8%', volume: '$892M' },
                        { pool: 'DAI/USDC (Uniswap V3)', tvl: '$1.8B', apy: '6.2%', volume: '$567M' },
                        { pool: 'FRAX/USDC (Curve)', tvl: '$890M', apy: '8.9%', volume: '$234M' },
                        { pool: 'USDT/DAI (Balancer)', tvl: '$567M', apy: '5.4%', volume: '$178M' },
                      ].map(pool => (
                        <div key={pool.pool} style={{ padding: '12px', background: '#0d1117', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#c9d1d9' }}>{pool.pool}</div>
                            <div style={{ fontSize: '11px', color: '#8b949e', marginTop: '4px' }}>24h Vol: {pool.volume}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', color: '#c9d1d9' }}>TVL: {pool.tvl}</div>
                            <div style={{ fontSize: '12px', color: '#3fb950', marginTop: '2px' }}>APY: {pool.apy}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Peg Status */}
                  <div style={{ padding: '20px', background: '#161b22', borderRadius: '8px', border: '1px solid #30363d' }}>
                    <h3 style={{ color: '#c9d1d9', marginBottom: '16px' }}>Peg Status</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      {[
                        { stable: 'USDT', price: '$1.0002', status: '✅' },
                        { stable: 'USDC', price: '$0.9998', status: '✅' },
                        { stable: 'DAI', price: '$1.0001', status: '✅' },
                        { stable: 'FRAX', price: '$0.9995', status: '⚠️' },
                      ].map(item => (
                        <div key={item.stable} style={{ padding: '12px', background: '#0d1117', borderRadius: '6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#c9d1d9', marginBottom: '4px' }}>{item.stable}</div>
                          <div style={{ fontSize: '16px', color: '#1890ff' }}>{item.price}</div>
                          <div style={{ fontSize: '20px', marginTop: '4px' }}>{item.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </Content>
          
          <Sider width={350} style={{ background: '#161b22', borderLeft: '1px solid #30363d', overflow: 'auto' }}>
            <div style={{ padding: '20px', color: '#c9d1d9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>🔔 Live Alerts ({alerts.length})</h3>
                {alerts.length > 0 && (
                  <button 
                    onClick={() => setAlerts([])}
                    style={{ background: 'none', border: '1px solid #30363d', color: '#8b949e', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {alerts.map((alert) => (
                <div 
                  key={alert.id}
                  style={{ 
                    marginBottom: '12px', 
                    padding: '12px', 
                    background: '#21262d', 
                    borderRadius: '8px', 
                    borderLeft: `4px solid ${alert.severity === 'high' ? '#fa8c16' : '#faad14'}` 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>{alert.title}</div>
                      <div style={{ fontSize: '12px', color: '#8b949e', marginBottom: '8px' }}>{alert.message}</div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 6px', background: alert.severity === 'high' ? '#fa8c16' : '#faad14', color: 'white', borderRadius: '4px' }}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '10px', padding: '2px 6px', background: '#1890ff', color: 'white', borderRadius: '4px' }}>
                          {alert.asset}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                      style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}
                    >
                      ×
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