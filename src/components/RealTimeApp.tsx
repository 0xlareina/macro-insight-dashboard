import React, { useState, useEffect } from 'react';
import { ConfigProvider, Layout, theme, Button, Spin, Alert, Typography, Table, Progress, Card, Row, Col, Statistic, Space, Divider } from 'antd';
import { ReloadOutlined, ApiOutlined, ArrowUpOutlined, ArrowDownOutlined, TrendingUpOutlined, TrendingDownOutlined } from '@ant-design/icons';
import { useMarketData } from '../hooks/useMarketData';
import { useDerivativesData } from '../hooks/useDerivativesData';
import { useCrossAssetData } from '../hooks/useCrossAssetData';
import { useStablecoinData } from '../hooks/useStablecoinData';

const { Header, Content } = Layout;
const { Text, Title } = Typography;

export const RealTimeApp: React.FC = () => {
  const [isDarkMode] = useState(true);
  const [alerts, setAlerts] = useState([
    { id: '1', title: 'BTC Price Alert', message: 'Bitcoin surpassed $43,000', severity: 'high', asset: 'BTC' },
    { id: '2', title: 'High Funding Rate', message: 'ETH funding rate at 0.15%', severity: 'medium', asset: 'ETH' },
    { id: '3', title: 'Liquidation Alert', message: '$12M BTC longs liquidated', severity: 'high', asset: 'BTC' },
  ]);

  const { data: marketData, loading, error, lastUpdate, refresh } = useMarketData();
  const { data: derivativesData, loading: derivLoading, error: derivError, refresh: refreshDerivatives } = useDerivativesData();
  const { data: crossAssetData, loading: crossLoading, error: crossError, refresh: refreshCrossAsset } = useCrossAssetData();
  const { data: stablecoinData, loading: stableLoading, error: stableError, refresh: refreshStablecoin } = useStablecoinData();
  const { darkAlgorithm, defaultAlgorithm } = theme;

  // Show connection status
  const showConnectionStatus = () => {
    if (loading) return <Spin size="small" />;
    if (error) return <Text type="danger">API Error</Text>;
    if (lastUpdate) return <Text type="success">Live • {lastUpdate.toLocaleTimeString()}</Text>;
    return <Text type="secondary">Connecting...</Text>;
  };

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
        <Header style={{ padding: 0, background: '#161b22', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ padding: '16px 24px', color: '#c9d1d9', fontSize: '20px', fontWeight: 'bold' }}>
            🚀 CryptoSense Dashboard
          </div>
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ApiOutlined style={{ color: error ? '#f85149' : '#3fb950' }} />
            {showConnectionStatus()}
            <Button 
              type="text" 
              icon={<ReloadOutlined />} 
              onClick={refresh}
              loading={loading}
              style={{ color: '#c9d1d9' }}
            />
          </div>
        </Header>
        
        <Layout>
          <Content style={{ padding: '24px', background: '#0d1117' }}>
            {error && (
              <Alert
                message="API Connection Issue"
                description={`Unable to fetch real-time data: ${error}. Showing cached data.`}
                type="warning"
                showIcon
                closable
                style={{ marginBottom: '16px' }}
              />
            )}
            
            {/* 整合的单页面仪表板 */}
            <div>
              {/* 顶部关键指标区域 */}
              <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Card style={{ background: '#161b22', borderColor: '#30363d', height: '100%' }}>
                    <Statistic
                      title={<span style={{ color: '#8b949e' }}>总市值</span>}
                      value={marketData?.marketCap / 1e12}
                      prefix="$"
                      suffix="T"
                      precision={2}
                      valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Card style={{ background: '#161b22', borderColor: '#30363d', height: '100%' }}>
                    <Statistic
                      title={<span style={{ color: '#8b949e' }}>24h 交易量</span>}
                      value={marketData?.volume24h / 1e9}
                      prefix="$"
                      suffix="B"
                      precision={1}
                      valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Card style={{ background: '#161b22', borderColor: '#30363d', height: '100%' }}>
                    <Statistic
                      title={<span style={{ color: '#8b949e' }}>BTC 主导率</span>}
                      value={marketData?.btcDominance}
                      suffix="%"
                      precision={1}
                      valueStyle={{ color: '#faad14', fontSize: '20px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Card style={{ background: '#161b22', borderColor: '#30363d', height: '100%' }}>
                    <Statistic
                      title={<span style={{ color: '#8b949e' }}>恐慌贪婪指数</span>}
                      value={marketData?.fearGreedIndex || 72}
                      valueStyle={{ color: '#faad14', fontSize: '20px' }}
                      suffix={
                        <span style={{ fontSize: '12px', color: '#8b949e', marginLeft: '4px' }}>
                          {marketData?.fearGreedClassification || 'Greed'}
                        </span>
                      }
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Card style={{ background: '#161b22', borderColor: '#30363d', height: '100%' }}>
                    <Statistic
                      title={<span style={{ color: '#8b949e' }}>稳定币市值</span>}
                      value={(stablecoinData?.totalMarketCap || 0) / 1e9}
                      prefix="$"
                      suffix="B"
                      precision={1}
                      valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                  <Card style={{ background: '#161b22', borderColor: '#30363d', height: '100%' }}>
                    <Statistic
                      title={<span style={{ color: '#8b949e' }}>活跃币种</span>}
                      value={stablecoinData?.stablecoins?.length || 0}
                      valueStyle={{ color: '#f5222d', fontSize: '20px' }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* 主要价格展示区域 */}
              <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                {marketData?.prices.map((asset) => (
                  <Col xs={24} sm={8} md={8} lg={8} xl={8} key={asset.symbol}>
                    <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text style={{ color: '#8b949e', fontSize: '14px' }}>
                            {asset.symbol === 'BTC' ? 'Bitcoin' : asset.symbol === 'ETH' ? 'Ethereum' : 'Solana'}
                          </Text>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c9d1d9' }}>
                            ${asset.price.toLocaleString()}
                          </div>
                          <div style={{ 
                            fontSize: '14px', 
                            color: asset.change24h >= 0 ? '#3fb950' : '#f85149',
                            display: 'flex', 
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {asset.change24h >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                            {Math.abs(asset.change24h).toFixed(2)}%
                          </div>
                        </div>
                        <div style={{ fontSize: '32px' }}>
                          {asset.symbol === 'BTC' ? '₿' : asset.symbol === 'ETH' ? 'Ξ' : '◎'}
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* 主要数据区域 - 三列布局 */}
              <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                {/* 左列 - 衍生品数据 */}
                <Col xs={24} lg={8}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {/* 资金费率 */}
                    <Card title="🔄 资金费率" style={{ background: '#161b22', borderColor: '#30363d' }} size="small">
                      {derivLoading ? (
                        <Spin />
                      ) : (
                        <div>
                          {derivativesData?.fundingRates.slice(0, 3).map((rate) => (
                            <div key={rate.symbol} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ color: '#c9d1d9' }}>{rate.symbol}</span>
                              <span style={{ color: rate.fundingRate >= 0 ? '#3fb950' : '#f85149' }}>
                                {(rate.fundingRate * 100).toFixed(4)}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>

                    {/* 未平仓合约 */}
                    <Card title="📊 未平仓合约" style={{ background: '#161b22', borderColor: '#30363d' }} size="small">
                      {derivLoading ? (
                        <Spin />
                      ) : (
                        <div>
                          {derivativesData?.openInterest.slice(0, 3).map((oi) => (
                            <div key={oi.symbol} style={{ marginBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ color: '#c9d1d9' }}>{oi.symbol}</span>
                                <span style={{ color: '#c9d1d9', fontWeight: 'bold' }}>
                                  ${(oi.openInterestValue / 1e9).toFixed(2)}B
                                </span>
                              </div>
                              <Progress 
                                percent={(oi.openInterestValue / 10e9) * 100} 
                                strokeColor="#1890ff"
                                showInfo={false}
                                size="small"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </Space>
                </Col>

                {/* 中列 - 市场分析 */}
                <Col xs={24} lg={8}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {/* 热门币种 */}
                    <Card title="🔥 热门币种" style={{ background: '#161b22', borderColor: '#30363d' }} size="small">
                      {crossLoading ? (
                        <Spin />
                      ) : (
                        <div>
                          {crossAssetData?.trending.coins?.slice(0, 5).map((coin, index) => (
                            <div key={coin.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: '#8b949e', fontSize: '12px' }}>#{index + 1}</span>
                                <span style={{ color: '#c9d1d9' }}>{coin.symbol}</span>
                              </div>
                              <span style={{ 
                                color: coin.priceChange24h >= 0 ? '#3fb950' : '#f85149',
                                fontSize: '12px'
                              }}>
                                {coin.priceChange24h >= 0 ? '+' : ''}{coin.priceChange24h?.toFixed(2) || 0}%
                              </span>
                            </div>
                          )) || <span style={{ color: '#8b949e' }}>暂无数据</span>}
                        </div>
                      )}
                    </Card>

                    {/* 清算数据 */}
                    <Card title="💥 24h 清算" style={{ background: '#161b22', borderColor: '#30363d' }} size="small">
                      {derivLoading ? (
                        <Spin />
                      ) : (
                        <div>
                          <Statistic
                            title="总清算"
                            value={derivativesData?.liquidations.total24h || 0}
                            prefix="$"
                            suffix="M"
                            precision={2}
                            valueStyle={{ color: '#f85149', fontSize: '18px' }}
                          />
                          <Row style={{ marginTop: '12px' }}>
                            <Col span={12}>
                              <Text style={{ color: '#8b949e', fontSize: '12px' }}>多单: </Text>
                              <Text style={{ color: '#f85149' }}>
                                ${(derivativesData?.liquidations.longs || 0).toFixed(1)}M
                              </Text>
                            </Col>
                            <Col span={12}>
                              <Text style={{ color: '#8b949e', fontSize: '12px' }}>空单: </Text>
                              <Text style={{ color: '#3fb950' }}>
                                ${(derivativesData?.liquidations.shorts || 0).toFixed(1)}M
                              </Text>
                            </Col>
                          </Row>
                        </div>
                      )}
                    </Card>
                  </Space>
                </Col>

                {/* 右列 - 稳定币数据 */}
                <Col xs={24} lg={8}>
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {/* 主要稳定币 */}
                    <Card title="💵 主要稳定币" style={{ background: '#161b22', borderColor: '#30363d' }} size="small">
                      {stableLoading ? (
                        <Spin />
                      ) : (
                        <div>
                          {stablecoinData?.stablecoins?.slice(0, 5).map((stable) => (
                            <div key={stable.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <div>
                                <span style={{ color: '#c9d1d9' }}>{stable.symbol}</span>
                                <span style={{ color: '#8b949e', marginLeft: '8px', fontSize: '12px' }}>
                                  ${(stable.marketCap / 1e9).toFixed(1)}B
                                </span>
                              </div>
                              <span style={{ 
                                color: Math.abs(1 - stable.price) > 0.01 ? '#f85149' : '#3fb950',
                                fontSize: '12px'
                              }}>
                                ${stable.price.toFixed(4)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>

                    {/* 相关性分析 */}
                    <Card title="🔗 相关性分析" style={{ background: '#161b22', borderColor: '#30363d' }} size="small">
                      <div>
                        {crossAssetData?.correlations && Object.entries(crossAssetData.correlations).slice(0, 3).map(([asset, correlations]) => (
                          <div key={asset} style={{ marginBottom: '8px' }}>
                            <Text style={{ color: '#c9d1d9', fontSize: '12px' }}>{asset}:</Text>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                              {Object.entries(correlations).slice(0, 3).map(([target, value]) => (
                                <div key={target} style={{ fontSize: '10px' }}>
                                  <span style={{ color: '#8b949e' }}>{target}</span>
                                  <span style={{ 
                                    color: value > 0.7 ? '#3fb950' : value > 0.3 ? '#faad14' : '#f85149',
                                    marginLeft: '2px'
                                  }}>
                                    {value.toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </Space>
                </Col>
              </Row>

              {/* 底部补充信息 */}
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12} lg={6}>
                  <Card style={{ background: '#161b22', borderColor: '#30363d' }} size="small">
                    <Statistic
                      title="DeFi 市值"
                      value={50}
                      prefix="$"
                      suffix="B"
                      precision={1}
                      valueStyle={{ color: '#1890ff', fontSize: '16px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={12} lg={6}>
                  <Card style={{ background: '#161b22', borderColor: '#30363d' }} size="small">
                    <Statistic
                      title="稳定币健康度"
                      value={98}
                      suffix="%"
                      precision={1}
                      valueStyle={{ color: '#3fb950', fontSize: '16px' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={12} lg={6}>
                  <Card style={{ background: '#161b22', borderColor: '#30363d' }} size="small">
                    <Text style={{ color: '#8b949e', fontSize: '12px' }}>
                      最后更新: {lastUpdate?.toLocaleTimeString() || 'N/A'}
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} md={12} lg={6}>
                  <Card style={{ background: '#161b22', borderColor: '#30363d' }} size="small">
                    <Text style={{ color: '#8b949e', fontSize: '12px' }}>
                      数据源: CoinGecko, Binance, CoinGlass
                    </Text>
                  </Card>
                </Col>
              </Row>
            </div>
          </Content>
                    <Alert
                      message="Derivatives API Issue"
                      description={`Unable to fetch derivatives data: ${derivError}. Showing cached data.`}
                      type="warning"
                      showIcon
                      closable
                      style={{ marginBottom: '16px' }}
                    />
                  )}
                  
                  {/* Funding Rates Section */}
                  <Card title="🔄 Perpetual Funding Rates" style={{ marginBottom: '16px', background: '#161b22', borderColor: '#30363d' }}>
                    {derivLoading ? (
                      <Spin />
                    ) : (
                      <Table
                        dataSource={derivativesData?.fundingRates}
                        columns={[
                          { title: 'Symbol', dataIndex: 'symbol', key: 'symbol' },
                          { 
                            title: 'Funding Rate', 
                            dataIndex: 'fundingRate', 
                            key: 'fundingRate',
                            render: (val: number) => (
                              <span style={{ color: val >= 0 ? '#3fb950' : '#f85149' }}>
                                {(val * 100).toFixed(4)}%
                              </span>
                            )
                          },
                          { 
                            title: 'Mark Price', 
                            dataIndex: 'markPrice', 
                            key: 'markPrice',
                            render: (val: number) => `$${val.toLocaleString()}`
                          },
                          { 
                            title: 'Index Price', 
                            dataIndex: 'indexPrice', 
                            key: 'indexPrice',
                            render: (val: number) => `$${val.toLocaleString()}`
                          },
                          { 
                            title: 'Next Funding', 
                            dataIndex: 'nextFundingTime', 
                            key: 'nextFundingTime',
                            render: (val: string) => new Date(val).toLocaleTimeString()
                          },
                        ]}
                        pagination={false}
                        size="small"
                      />
                    )}
                  </Card>

                  {/* Open Interest Section */}
                  <Row gutter={16} style={{ marginBottom: '16px' }}>
                    <Col span={12}>
                      <Card title="📊 Open Interest" style={{ background: '#161b22', borderColor: '#30363d' }}>
                        {derivativesData?.openInterest.map((oi) => (
                          <div key={oi.symbol} style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span>{oi.symbol}</span>
                              <span style={{ fontWeight: 'bold' }}>${(oi.openInterestValue / 1e9).toFixed(2)}B</span>
                            </div>
                            <Progress 
                              percent={(oi.openInterestValue / 10e9) * 100} 
                              strokeColor="#1890ff"
                              showInfo={false}
                            />
                          </div>
                        ))}
                      </Card>
                    </Col>
                    
                    <Col span={12}>
                      <Card title="💥 24h Liquidations" style={{ background: '#161b22', borderColor: '#30363d' }}>
                        <Statistic
                          title="Total Liquidations"
                          value={derivativesData?.liquidations.total24h || 0}
                          prefix="$"
                          suffix="M"
                          precision={2}
                          valueStyle={{ color: '#f85149' }}
                        />
                        <Row style={{ marginTop: '16px' }}>
                          <Col span={12}>
                            <Statistic
                              title="Longs"
                              value={derivativesData?.liquidations.longs || 0}
                              prefix="$"
                              suffix="M"
                              precision={2}
                              valueStyle={{ color: '#f85149', fontSize: '16px' }}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic
                              title="Shorts"
                              value={derivativesData?.liquidations.shorts || 0}
                              prefix="$"
                              suffix="M"
                              precision={2}
                              valueStyle={{ color: '#3fb950', fontSize: '16px' }}
                            />
                          </Col>
                        </Row>
                        <div style={{ marginTop: '12px', padding: '8px', background: '#21262d', borderRadius: '4px' }}>
                          <span style={{ color: '#8b949e' }}>Long/Short Ratio: </span>
                          <span style={{ color: derivativesData?.liquidations.ratio && derivativesData.liquidations.ratio > 1 ? '#3fb950' : '#f85149', fontWeight: 'bold' }}>
                            {derivativesData?.liquidations.ratio?.toFixed(2)}
                          </span>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              <TabPane tab="Cross-Asset Analysis" key="3">
                <div style={{ padding: '20px' }}>
                  {crossError && (
                    <Alert
                      message="Cross-Asset API Issue"
                      description={`Unable to fetch cross-asset data: ${crossError}. Showing cached data.`}
                      type="warning"
                      showIcon
                      closable
                      style={{ marginBottom: '16px' }}
                    />
                  )}
                  
                  {/* Top Tokens Performance */}
                  <Card title="📈 Top Tokens Performance" style={{ marginBottom: '16px', background: '#161b22', borderColor: '#30363d' }}>
                    {crossLoading ? (
                      <Spin />
                    ) : (
                      <Table
                        dataSource={crossAssetData?.tokens}
                        columns={[
                          { title: 'Rank', render: (_, __, index) => index + 1, width: 60 },
                          { 
                            title: 'Token', 
                            render: (record: any) => (
                              <div>
                                <span style={{ fontWeight: 'bold' }}>{record.symbol}</span>
                                <span style={{ color: '#8b949e', marginLeft: '8px', fontSize: '12px' }}>{record.name}</span>
                              </div>
                            )
                          },
                          { 
                            title: 'Price', 
                            dataIndex: 'price', 
                            key: 'price',
                            render: (val: number) => `$${val < 1 ? val.toFixed(8) : val.toLocaleString()}`
                          },
                          { 
                            title: 'Market Cap', 
                            dataIndex: 'marketCap', 
                            key: 'marketCap',
                            render: (val: number) => `$${(val / 1e9).toFixed(2)}B`
                          },
                          { 
                            title: '1h %', 
                            dataIndex: 'priceChange1h', 
                            key: 'priceChange1h',
                            render: (val: number) => (
                              <span style={{ color: val >= 0 ? '#3fb950' : '#f85149' }}>
                                {val >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(val).toFixed(2)}%
                              </span>
                            )
                          },
                          { 
                            title: '24h %', 
                            dataIndex: 'priceChange24h', 
                            key: 'priceChange24h',
                            render: (val: number) => (
                              <span style={{ color: val >= 0 ? '#3fb950' : '#f85149' }}>
                                {val >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(val).toFixed(2)}%
                              </span>
                            )
                          },
                          { 
                            title: '7d %', 
                            dataIndex: 'priceChange7d', 
                            key: 'priceChange7d',
                            render: (val: number) => (
                              <span style={{ color: val >= 0 ? '#3fb950' : '#f85149' }}>
                                {val >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(val).toFixed(2)}%
                              </span>
                            )
                          },
                        ]}
                        pagination={false}
                        size="small"
                      />
                    )}
                  </Card>

                  {/* Trending and Correlations */}
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card title="🔥 Trending Coins" style={{ background: '#161b22', borderColor: '#30363d' }}>
                        {crossAssetData?.trending.coins.map((coin, index) => (
                          <div key={coin.id} style={{ 
                            padding: '12px', 
                            marginBottom: '8px', 
                            background: '#21262d', 
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div>
                              <span style={{ color: '#faad14', marginRight: '8px' }}>#{index + 1}</span>
                              <span style={{ fontWeight: 'bold' }}>{coin.symbol}</span>
                              <span style={{ color: '#8b949e', marginLeft: '8px', fontSize: '12px' }}>Rank #{coin.marketCapRank}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '14px' }}>${coin.price < 1 ? coin.price.toFixed(8) : coin.price.toFixed(2)}</div>
                              <div style={{ color: coin.priceChange24h >= 0 ? '#3fb950' : '#f85149', fontSize: '12px' }}>
                                {coin.priceChange24h >= 0 ? '+' : ''}{coin.priceChange24h.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </Card>
                    </Col>
                    
                    <Col span={12}>
                      <Card title="🔗 Asset Correlations" style={{ background: '#161b22', borderColor: '#30363d' }}>
                        <div style={{ padding: '8px' }}>
                          <h4 style={{ color: '#c9d1d9', marginBottom: '12px' }}>BTC Correlations</h4>
                          {Object.entries(crossAssetData?.correlations?.BTC || {}).map(([asset, correlation]) => (
                            <div key={asset} style={{ marginBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span>BTC/{asset}</span>
                                <span style={{ fontWeight: 'bold', color: correlation > 0.7 ? '#3fb950' : '#faad14' }}>
                                  {correlation.toFixed(2)}
                                </span>
                              </div>
                              <Progress 
                                percent={correlation * 100} 
                                strokeColor={correlation > 0.7 ? '#3fb950' : '#faad14'}
                                showInfo={false}
                              />
                            </div>
                          ))}
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              <TabPane tab="Stablecoin Markets" key="4">
                <div style={{ padding: '20px' }}>
                  {stableError && (
                    <Alert
                      message="Stablecoin API Issue"
                      description={`Unable to fetch stablecoin data: ${stableError}. Showing cached data.`}
                      type="warning"
                      showIcon
                      closable
                      style={{ marginBottom: '16px' }}
                    />
                  )}
                  
                  {/* Stablecoin Market Overview */}
                  <Row gutter={16} style={{ marginBottom: '16px' }}>
                    <Col span={8}>
                      <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
                        <Statistic
                          title="Total Stablecoin Market Cap"
                          value={(stablecoinData?.totalMarketCap || 0) / 1e9}
                          prefix="$"
                          suffix="B"
                          precision={2}
                          valueStyle={{ color: '#1890ff' }}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
                        <Statistic
                          title="24h Trading Volume"
                          value={(stablecoinData?.stablecoins?.reduce((sum, s) => sum + s.volume24h, 0) || 0) / 1e9}
                          prefix="$"
                          suffix="B"
                          precision={2}
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card style={{ background: '#161b22', borderColor: '#30363d' }}>
                        <Statistic
                          title="Active Stablecoins"
                          value={stablecoinData?.stablecoins?.length || 0}
                          valueStyle={{ color: '#faad14' }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  {/* Stablecoin Details Table */}
                  <Card title="💵 Stablecoin Details" style={{ background: '#161b22', borderColor: '#30363d' }}>
                    {stableLoading ? (
                      <Spin />
                    ) : (
                      <Table
                        dataSource={stablecoinData?.stablecoins}
                        columns={[
                          { 
                            title: 'Stablecoin', 
                            render: (record: any) => (
                              <div>
                                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{record.symbol}</span>
                                <span style={{ color: '#8b949e', marginLeft: '8px' }}>{record.name}</span>
                              </div>
                            )
                          },
                          { 
                            title: 'Price', 
                            dataIndex: 'price', 
                            key: 'price',
                            render: (val: number) => (
                              <span style={{ 
                                color: Math.abs(1 - val) > 0.01 ? '#f85149' : '#3fb950',
                                fontWeight: 'bold'
                              }}>
                                ${val.toFixed(4)}
                              </span>
                            )
                          },
                          { 
                            title: 'Peg Deviation', 
                            dataIndex: 'pegDeviation', 
                            key: 'pegDeviation',
                            render: (val: number) => (
                              <span style={{ 
                                color: Math.abs(val) > 0.5 ? '#f85149' : Math.abs(val) > 0.1 ? '#faad14' : '#3fb950'
                              }}>
                                {val >= 0 ? '+' : ''}{val.toFixed(2)}%
                              </span>
                            )
                          },
                          { 
                            title: 'Market Cap', 
                            dataIndex: 'marketCap', 
                            key: 'marketCap',
                            render: (val: number) => `$${(val / 1e9).toFixed(2)}B`,
                            sorter: (a: any, b: any) => b.marketCap - a.marketCap,
                            defaultSortOrder: 'descend' as const
                          },
                          { 
                            title: '24h Volume', 
                            dataIndex: 'volume24h', 
                            key: 'volume24h',
                            render: (val: number) => `$${(val / 1e9).toFixed(2)}B`
                          },
                          { 
                            title: '24h Change', 
                            dataIndex: 'marketCapChangePercentage24h', 
                            key: 'marketCapChangePercentage24h',
                            render: (val: number) => (
                              <span style={{ color: val >= 0 ? '#3fb950' : '#f85149' }}>
                                {val >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(val).toFixed(2)}%
                              </span>
                            )
                          },
                          { 
                            title: 'Supply', 
                            dataIndex: 'circulatingSupply', 
                            key: 'circulatingSupply',
                            render: (val: number) => `${(val / 1e9).toFixed(2)}B`
                          },
                        ]}
                        pagination={false}
                        size="small"
                      />
                    )}
                  </Card>

                  {/* Stablecoin Health Indicators */}
                  <Card title="🏥 Stablecoin Health" style={{ marginTop: '16px', background: '#161b22', borderColor: '#30363d' }}>
                    <Row gutter={16}>
                      {stablecoinData?.stablecoins?.slice(0, 3).map((stable) => (
                        <Col span={8} key={stable.id}>
                          <div style={{ textAlign: 'center', padding: '16px' }}>
                            <h3 style={{ color: '#c9d1d9' }}>{stable.symbol}</h3>
                            <div style={{ marginBottom: '12px' }}>
                              <Progress
                                type="circle"
                                percent={100 - Math.abs(stable.pegDeviation * 100)}
                                strokeColor={Math.abs(stable.pegDeviation) > 0.5 ? '#f85149' : '#3fb950'}
                                format={() => `${stable.price.toFixed(4)}`}
                              />
                            </div>
                            <div style={{ fontSize: '12px', color: '#8b949e' }}>
                              Peg Stability: {(100 - Math.abs(stable.pegDeviation * 100)).toFixed(1)}%
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Card>
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