// CryptoSense Dashboard - Application Configuration
// Centralized configuration management

import { APIConfig, AlertSettings } from '../types';

export const APP_CONFIG = {
  name: 'CryptoSense Dashboard - Core Edition',
  version: '1.0.0',
  description: 'Professional Crypto Monitoring Dashboard',
  supportedAssets: ['BTC', 'ETH', 'SOL'] as const,
  updateInterval: {
    prices: 1000,        // 1 second
    fundingRates: 60000, // 1 minute  
    sentiment: 3600000,  // 1 hour
    etfFlows: 300000,    // 5 minutes
    defi: 300000,        // 5 minutes
  },
  performance: {
    maxApiResponseTime: 500, // milliseconds
    maxMemoryUsage: 200,     // MB
    targetFPS: 60,
  },
};

export const API_CONFIG: APIConfig = {
  binance: {
    baseURL: 'https://api.binance.com',
    rateLimit: 1200, // requests per minute
  },
  coinbase: {
    baseURL: 'https://api.coinbase.com',
    rateLimit: 10000, // requests per hour
  },
  websocket: {
    url: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
  },
};

export const DEFAULT_ALERT_SETTINGS: AlertSettings = {
  priceMovement: {
    BTC: { rapid: 2.0, daily: 5.0, enabled: true },
    ETH: { rapid: 3.0, daily: 8.0, enabled: true },
    SOL: { rapid: 5.0, daily: 12.0, enabled: true },
  },
  fundingRate: {
    BTC: { high: 0.1, low: -0.05, enabled: true },
    ETH: { high: 0.15, low: -0.08, enabled: true },
    SOL: { high: 0.2, low: -0.1, enabled: true },
  },
  liquidation: {
    threshold: 1000000, // $1M
    enabled: true,
  },
  sentiment: {
    fearGreedExtreme: true,
    fearGreedRapidChange: true,
    etfFlowThreshold: 300000000, // $300M
    enabled: true,
  },
  notifications: {
    browser: true,
    sound: true,
    email: false,
  },
};

export const CHART_CONFIG = {
  defaultTimeframe: '1h' as const,
  maxDataPoints: 1000,
  colors: {
    bull: '#00d084',
    bear: '#ff4757',
    neutral: '#636e72',
    primary: '#1890ff',
    warning: '#faad14',
    danger: '#f5222d',
  },
  indicators: {
    rsi: {
      period: 14,
      overbought: 70,
      oversold: 30,
    },
    macd: {
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
    },
    bollinger: {
      period: 20,
      stdDev: 2,
    },
  },
};

export const FEAR_GREED_CONFIG = {
  zones: {
    extremeFear: { min: 0, max: 25, color: '#8B0000' },
    fear: { min: 26, max: 45, color: '#FF4757' },
    neutral: { min: 46, max: 55, color: '#FAAD14' },
    greed: { min: 56, max: 75, color: '#7ED321' },
    extremeGreed: { min: 76, max: 100, color: '#27AE60' },
  },
  updateInterval: 3600000, // 1 hour
};

export const ETF_CONFIG = {
  supportedETFs: [
    { symbol: 'IBIT', name: 'iShares Bitcoin Trust', provider: 'BlackRock' },
    { symbol: 'FBTC', name: 'Fidelity Wise Origin Bitcoin Fund', provider: 'Fidelity' },
    { symbol: 'ARKB', name: 'ARK 21Shares Bitcoin ETF', provider: 'ARK Invest' },
    { symbol: 'BITB', name: 'Bitwise Bitcoin ETF', provider: 'Bitwise' },
    { symbol: 'GBTC', name: 'Grayscale Bitcoin Trust', provider: 'Grayscale' },
  ],
  flowThresholds: {
    large: 100000000,    // $100M
    massive: 500000000,  // $500M
    extreme: 1000000000, // $1B
  },
};

export const DEFI_CONFIG = {
  protocols: {
    ethereum: [
      {
        id: 'aave_v3',
        name: 'Aave V3',
        url: 'https://aave.com/',
        supportedAssets: ['ETH', 'WBTC'],
      },
      {
        id: 'compound_v3',
        name: 'Compound V3',
        url: 'https://compound.finance/',
        supportedAssets: ['ETH', 'WBTC'],
      },
      {
        id: 'makerdao',
        name: 'MakerDAO',
        url: 'https://makerdao.com/',
        supportedAssets: ['ETH'],
      },
    ],
    solana: [
      {
        id: 'marinade',
        name: 'Marinade Finance',
        url: 'https://marinade.finance/',
        supportedAssets: ['SOL'],
      },
      {
        id: 'solend',
        name: 'Solend',
        url: 'https://solend.fi/',
        supportedAssets: ['SOL'],
      },
    ],
  },
  riskThresholds: {
    utilizationHigh: 0.8,    // 80%
    liquidationNear: 1.1,    // 110% health factor
    apyAbnormal: 2.0,        // 2x normal APY
  },
};

export const WEBSOCKET_EVENTS = {
  // Incoming events
  PRICE_UPDATE: 'price:update',
  FUNDING_UPDATE: 'funding:update',
  LIQUIDATION_ALERT: 'liquidation:alert',
  SENTIMENT_UPDATE: 'sentiment:update',
  ETF_FLOW_UPDATE: 'etf:flow_update',
  DEFI_UPDATE: 'defi:update',
  GENERAL_ALERT: 'alert:general',
  CONNECTION_STATUS: 'connection:status',
  
  // Outgoing events
  SUBSCRIBE_PRICES: 'subscribe:prices',
  SUBSCRIBE_FUNDING: 'subscribe:funding',
  SUBSCRIBE_LIQUIDATIONS: 'subscribe:liquidations',
  SUBSCRIBE_SENTIMENT: 'subscribe:sentiment',
  UNSUBSCRIBE: 'unsubscribe',
  PING: 'ping',
} as const;

export const ERROR_MESSAGES = {
  API_TIMEOUT: 'API request timed out',
  API_RATE_LIMIT: 'API rate limit exceeded',
  WEBSOCKET_CONNECTION_FAILED: 'WebSocket connection failed',
  INVALID_ASSET: 'Invalid asset symbol',
  INSUFFICIENT_DATA: 'Insufficient data for calculation',
  CONFIGURATION_ERROR: 'Configuration error',
  NETWORK_ERROR: 'Network connection error',
} as const;

export const LOCAL_STORAGE_KEYS = {
  USER_PREFERENCES: 'cryptosense_user_preferences',
  ALERT_SETTINGS: 'cryptosense_alert_settings',
  SELECTED_ASSET: 'cryptosense_selected_asset',
  CHART_SETTINGS: 'cryptosense_chart_settings',
} as const;

// Environment-specific configuration
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  apiBaseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api/v1',
  wsURL: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
  enableLogging: process.env.REACT_APP_ENABLE_LOGGING === 'true',
  logLevel: process.env.REACT_APP_LOG_LEVEL || 'info',
};

// Data validation constants
export const VALIDATION_RULES = {
  price: {
    min: 0,
    max: 10000000, // $10M max price (safety check)
    decimals: 8,
  },
  percentage: {
    min: -100,
    max: 1000, // 1000% max change (safety check) 
    decimals: 2,
  },
  volume: {
    min: 0,
    max: 100000000000, // $100B max volume
    decimals: 0,
  },
  fundingRate: {
    min: -1, // -100%
    max: 1,  // 100%
    decimals: 4,
  },
} as const;