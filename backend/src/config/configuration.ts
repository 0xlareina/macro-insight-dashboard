// CryptoSense Dashboard - Application Configuration
export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // API Keys
  binance: {
    apiKey: process.env.BINANCE_API_KEY,
    secretKey: process.env.BINANCE_SECRET_KEY,
    baseUrl: 'https://api.binance.com',
    testnet: process.env.NODE_ENV === 'development',
  },
  
  coinbase: {
    apiKey: process.env.COINBASE_API_KEY,
    apiSecret: process.env.COINBASE_API_SECRET,
    baseUrl: 'https://api.coinbase.com',
  },
  
  alternativeMe: {
    apiKey: process.env.ALTERNATIVE_ME_API_KEY,
    baseUrl: 'https://api.alternative.me',
  },
  
  // Database Configuration
  database: {
    postgres: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'cryptosense',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
    },
    influxdb: {
      url: process.env.INFLUXDB_URL || 'http://localhost:8086',
      token: process.env.INFLUXDB_TOKEN,
      org: process.env.INFLUXDB_ORG || 'cryptosense',
      bucket: process.env.INFLUXDB_BUCKET || 'market_data',
    },
  },
  
  // WebSocket Configuration
  websocket: {
    port: parseInt(process.env.WS_PORT || '3001', 10),
    cors: {
      origin: process.env.WS_CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
  },
  
  // Data Update Intervals (milliseconds)
  intervals: {
    priceUpdate: 1000,         // 1 second
    fundingRateUpdate: 60000,  // 1 minute
    sentimentUpdate: 3600000,  // 1 hour
    etfFlowUpdate: 300000,     // 5 minutes
    defiUpdate: 300000,        // 5 minutes
  },
  
  // Alert Configuration
  alerts: {
    email: {
      smtp: process.env.ALERT_EMAIL_SMTP || 'smtp.gmail.com',
      port: parseInt(process.env.ALERT_EMAIL_PORT || '587', 10),
      user: process.env.ALERT_EMAIL_USER,
      pass: process.env.ALERT_EMAIL_PASS,
      from: process.env.ALERT_EMAIL_FROM || 'alerts@cryptosense.com',
    },
  },
  
  // Rate Limiting
  rateLimit: {
    binance: {
      weight: 1200,  // per minute
      orders: 50,    // per 10 seconds
      rawRequests: 6100, // per 5 minutes
    },
    coinbase: {
      public: 10000,  // per hour
      private: 10000, // per hour
    },
  },
  
  // Supported Assets
  assets: {
    crypto: ['BTC', 'ETH', 'SOL'],
    stablecoins: ['USDT', 'USDC'],
    pairs: [
      'BTCUSDT', 'ETHUSDT', 'SOLUSDT',
      'BTCUSDC', 'ETHUSDC', 'SOLUSDC',
    ],
  },
  
  // Performance Thresholds
  performance: {
    maxApiResponseTime: 500, // ms
    maxDbQueryTime: 100,     // ms
    maxMemoryUsage: 200,     // MB
    maxCpuUsage: 80,         // percentage
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableFile: process.env.LOG_FILE === 'true',
    enableConsole: process.env.LOG_CONSOLE !== 'false',
  },
});