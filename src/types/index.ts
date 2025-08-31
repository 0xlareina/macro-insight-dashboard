// CryptoSense Dashboard - Type Definitions
// Core TypeScript interfaces and types for the application

export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: string;
}

export interface AssetPriceData {
  BTC: Asset;
  ETH: Asset;
  SOL: Asset;
}

export interface FearGreedIndex {
  value: number;
  classification: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  timestamp: string;
  components: {
    volatility: number;
    marketMomentum: number;
    socialMedia: number;
    surveys: number;
    btcDominance: number;
    googleTrends: number;
  };
}

export interface ETFFlowData {
  totalNetFlow: number;
  date: string;
  flows: ETFFlow[];
  cumulativeFlows: {
    '7d': number;
    '30d': number;
    'total': number;
  };
}

export interface ETFFlow {
  etfSymbol: 'IBIT' | 'FBTC' | 'ARKB' | 'BITB' | 'GBTC' | 'Others';
  name: string;
  netFlow: number;
  netFlowUSD: number;
  holdings: number;
  marketShare: number;
}

export interface FundingRate {
  symbol: string;
  rate: number;
  timestamp: string;
  exchange: 'binance' | 'coinbase';
  nextFundingTime: string;
}

export interface OpenInterest {
  symbol: string;
  value: number;
  change24h: number;
  changePercent24h: number;
  timestamp: string;
  longShortRatio: number;
}

export interface LiquidationData {
  symbol: string;
  side: 'long' | 'short';
  size: number;
  sizeUSD: number;
  price: number;
  timestamp: string;
  exchange: string;
}

export interface DeFiProtocolData {
  protocol: 'aave_v3' | 'compound_v3' | 'makerdao' | 'marinade' | 'solend';
  name: string;
  chain: 'ethereum' | 'solana';
  assets: DeFiAssetData[];
  tvl: number;
  tvlChange24h: number;
}

export interface DeFiAssetData {
  symbol: string;
  supplyAPY: number;
  borrowAPY: number;
  utilization: number;
  totalSupply: number;
  totalBorrow: number;
  liquidationThreshold: number;
}

export interface MarketAlert {
  id: string;
  type: 'price_movement' | 'funding_rate' | 'liquidation' | 'sentiment' | 'etf_flow' | 'defi_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  asset?: string;
  value?: number;
  threshold?: number;
  timestamp: string;
  acknowledged: boolean;
}

export interface AlertSettings {
  priceMovement: {
    BTC: { rapid: number; daily: number; enabled: boolean };
    ETH: { rapid: number; daily: number; enabled: boolean };
    SOL: { rapid: number; daily: number; enabled: boolean };
  };
  fundingRate: {
    BTC: { high: number; low: number; enabled: boolean };
    ETH: { high: number; low: number; enabled: boolean };
    SOL: { high: number; low: number; enabled: boolean };
  };
  liquidation: {
    threshold: number; // USD amount
    enabled: boolean;
  };
  sentiment: {
    fearGreedExtreme: boolean;
    fearGreedRapidChange: boolean;
    etfFlowThreshold: number; // USD amount
    enabled: boolean;
  };
  notifications: {
    browser: boolean;
    sound: boolean;
    email: boolean;
  };
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface WebSocketMessage {
  type: 'price_update' | 'funding_update' | 'liquidation_alert' | 'sentiment_update' | 'general_alert';
  data: any;
  timestamp: string;
}

// Chart and visualization types
export interface ChartDataPoint {
  timestamp: string;
  value: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
}

export interface TechnicalIndicator {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
  volume: number;
}

// Application state types
export interface AppState {
  selectedAsset: 'BTC' | 'ETH' | 'SOL';
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  isConnected: boolean;
  lastUpdate: string;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  layout: 'compact' | 'standard' | 'expanded';
  defaultAsset: 'BTC' | 'ETH' | 'SOL';
  autoRefresh: boolean;
  alertSound: boolean;
}

// API configuration types
export interface APIConfig {
  binance: {
    baseURL: string;
    apiKey?: string;
    rateLimit: number;
  };
  coinbase: {
    baseURL: string;
    apiKey?: string;
    rateLimit: number;
  };
  websocket: {
    url: string;
    reconnectInterval: number;
    maxReconnectAttempts: number;
  };
}

// Error types
export interface APIError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Utility types
export type AssetSymbol = 'BTC' | 'ETH' | 'SOL';
export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w' | '1M';
export type Exchange = 'binance' | 'coinbase';
export type DeFiProtocol = 'aave_v3' | 'compound_v3' | 'makerdao' | 'marinade' | 'solend';
export type Chain = 'ethereum' | 'solana';

// Performance monitoring types
export interface PerformanceMetrics {
  apiResponseTime: number;
  websocketLatency: number;
  chartRenderTime: number;
  memoryUsage: number;
  errorRate: number;
  timestamp: string;
}