# CryptoSense Dashboard - Core Edition

> Professional crypto monitoring dashboard focused on BTC, ETH, and SOL with real-time market sentiment analysis and advanced trading insights.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://semver.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Quality Gate](https://img.shields.io/badge/quality-gemini--cli-brightgreen.svg)](scripts/quality-check.sh)
[![Frontend](https://img.shields.io/badge/frontend-running-success.svg)](http://localhost:3000)
[![Backend](https://img.shields.io/badge/backend-running-success.svg)](http://localhost:3001)

## 🎯 Core Features

### Market Sentiment Monitoring
- **Fear & Greed Index**: Real-time sentiment gauge with color-coded zones
- **ETF Fund Flows**: US Spot Bitcoin ETF tracking with institutional money movement
- **Comprehensive Scoring**: Multi-factor sentiment analysis with trading recommendations

### Multi-Asset Monitoring (BTC/ETH/SOL)
- **Real-time Prices**: Sub-second price updates with technical indicators
- **Cross-Asset Analysis**: Relative strength comparison and correlation metrics
- **Stablecoin Liquidity**: USDT/USDC flow monitoring and exchange reserves

### Derivatives Intelligence
- **Funding Rate Analysis**: Real-time rates with arbitrage opportunity detection
- **Open Interest Tracking**: OI correlations and large holder position changes
- **Liquidation Monitoring**: Real-time cascade effect analysis

### DeFi Ecosystem Health
- **Lending Rates**: Multi-protocol APY monitoring (Aave V3, Compound V3, Solana DeFi)
- **Liquidation Risks**: Health factor distributions and risk assessment
- **TVL Tracking**: Protocol-level total value locked monitoring

### Advanced Alert System
- **Price Movement Alerts**: Customizable thresholds for rapid market changes
- **Market Anomaly Detection**: Automated extreme condition identification
- **Multi-channel Notifications**: WebSocket, email, and push notifications

## 🏗️ Architecture

```
Frontend (React 18 + TypeScript)
├── Integrated Dashboard (Single Page Layout)
├── Real-time Dashboard Components
├── TradingView Chart Integration  
├── Ant Design UI Components
└── WebSocket Real-time Updates

Backend (NestJS + Node.js)
├── Multi-source Data Aggregation
├── Real-time Processing Pipeline
├── WebSocket Broadcasting Service
└── RESTful API Layer

Data Layer
├── PostgreSQL (Relational Data)
├── Redis (Caching & Sessions)
├── InfluxDB (Time Series Data)
└── Real-time Streaming (Kafka/RabbitMQ)
```

## 🎨 Dashboard Layout (Updated v1.1)

**New Integrated Dashboard**: All market data consolidated into a single high-density view

```
┌─────────────────────────────────────────────────────────────────┐
│ 📊 Key Metrics (6 Cards)                                        │
│ [Market Cap] [24h Vol] [BTC Dom] [Fear Index] [Stablecoins] [Active]  │
├─────────────────────────────────────────────────────────────────┤
│ 💰 Main Prices                                                  │
│ BTC: $43,234 (+2.5%)  ETH: $2,567 (-1.2%)  SOL: $98.7 (+4.1%) │
├─────────────────────────────────────────────────────────────────┤
│ 📈 Three-Column Data Layout                                     │
│ ┌─────────────┬─────────────┬─────────────┐                    │
│ │ Derivatives │ Market      │ Stablecoins │                    │
│ │ Funding Rate│ Analysis    │ Liquidity   │                    │
│ │ Liquidations│ Trend Anal. │ Exchange Bal│                    │
│ │ Open Interest│ Correlation │ Market Share│                    │
│ └─────────────┴─────────────┴─────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

**Key Improvements**:
- ✅ **Eliminated Tab Switching**: All data displayed on single page
- ✅ **Optimized Information Density**: Avoid single data occupying large widgets
- ✅ **Responsive Layout**: Mobile-adaptive single column display
- ✅ **Maximized Space Utilization**: Compact layout reduces white space

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/cryptape/cryptosense-dashboard.git
cd "Macro Insight"

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Start the application
# Terminal 1 - Backend server
cd backend
npm run start:dev

# Terminal 2 - Frontend development server
npm run dev
```

### Access the Dashboard
- **Frontend**: http://localhost:3002 (Vite dev server)
- **Backend API**: http://localhost:3001
- **WebSocket**: ws://localhost:3001

> **Note**: Frontend port may vary (3000-3002) based on availability. Check console output after running `npm run dev`.

### Environment Configuration

Create a `.env` file in the project root:

```env
# API Keys (Required)
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key
COINBASE_API_KEY=your_coinbase_api_key
ALTERNATIVE_ME_API_KEY=your_alternative_me_api_key

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/cryptosense
REDIS_URL=redis://localhost:6379
INFLUXDB_URL=http://localhost:8086

# WebSocket Configuration
WS_PORT=3001
WS_ORIGINS=http://localhost:3000

# Alert Configuration
ALERT_EMAIL_SMTP=smtp.gmail.com
ALERT_EMAIL_USER=your_email@gmail.com
ALERT_EMAIL_PASS=your_app_password
```

## 📊 Data Sources

### Primary Sources
- **Binance API**: Spot, futures, funding rates, liquidations, depth data
- **Coinbase API**: Institutional data, ETF flows, spot prices
- **Alternative.me**: Fear & Greed Index with component factors

### DeFi Protocols
- **Ethereum**: Aave V3, Compound V3, MakerDAO
- **Solana**: Marinade Finance, Solend

### Traditional Markets
- **VIX Index**: Market volatility sentiment
- **ETF Data**: US Spot Bitcoin ETF flows
- **Economic Data**: USD Index, Treasury yields

## 🛠️ Development

### Project Structure
```
src/
├── components/          # React components
│   ├── IntegratedDashboard.tsx  # 🆕 Main integrated dashboard
│   ├── RealTimeApp.tsx          # Legacy tab-based dashboard
│   ├── charts/         # Chart components (TradingView, ECharts)
│   ├── dashboard/      # Dashboard modules
│   ├── alerts/         # Alert system components
│   └── navigation/     # Navigation components
├── hooks/              # 🆕 Custom React hooks for data fetching
│   ├── useMarketData.ts     # Market overview data
│   ├── useDerivativesData.ts # Derivatives and funding rates
│   ├── useCrossAssetData.ts  # Cross-asset analysis
│   └── useStablecoinData.ts  # Stablecoin liquidity data
├── services/           # API and data services
│   ├── api.service.ts  # Centralized API service
│   ├── websocket.ts    # Real-time data handling
│   └── alerts.ts       # Alert management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── config/             # Configuration files

docs/
├── PROGRESS_TRACKING.md    # Development progress tracking
└── DEVELOPMENT_STATUS.md   # Current development status
```

### Component Architecture (v1.1)

**IntegratedDashboard.tsx** - Main dashboard component:
```typescript
// High-density layout with 4 main sections:
1. Top Metrics Row (6 cards): Market cap, volume, dominance, etc.
2. Price Display: BTC/ETH/SOL with 24h changes
3. Three-Column Layout:
   - Left: Derivatives (funding rates, liquidations)
   - Center: Market Analysis (trends, correlations)  
   - Right: Stablecoins (liquidity, reserves)
4. Responsive Grid: Mobile-first with adaptive breakpoints
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm run test            # Run unit tests
npm run test:coverage   # Generate coverage report

# Code Quality
npm run lint            # ESLint check
npm run lint:fix        # Fix ESLint issues
npm run type-check      # TypeScript type checking
npm run quality-check   # Full quality gate (Gemini CLI)

# Production
npm start               # Start production server
```

### Code Quality Standards

This project uses **Gemini CLI** as the Code Quality Director with the following standards:

- **TypeScript Strict Mode**: Full type safety
- **Test Coverage**: 80%+ line coverage required
- **Performance**: API responses < 500ms, bundle size < 2MB
- **Security**: No hardcoded secrets, input validation, encrypted data
- **Crypto-specific**: Financial precision, real-time data integrity

Run quality checks: `npm run quality-check`

## 📈 User Stories & Features

### Epic 1: Market Sentiment Analysis
- [x] **US1.1**: Fear & Greed Index visualization with color zones ✅
- [x] **US1.2**: ETF fund flow tracking with institutional analysis ✅
- [x] **US1.3**: Comprehensive sentiment scoring system ✅

### Epic 2: Multi-Asset Monitoring
- [x] **US2.1**: Real-time price monitoring for BTC/ETH/SOL ✅
- [x] **US2.2**: Cross-asset performance analysis and correlation ✅
- [x] **US2.3**: Stablecoin liquidity dashboard ✅

### Epic 3: Derivatives Intelligence  
- [x] **US3.1**: Funding rate analysis with arbitrage detection ✅
- [x] **US3.2**: Open interest tracking and correlation analysis ✅
- [x] **US3.3**: Real-time liquidation monitoring ✅

### Epic 4: DeFi Ecosystem
- [x] **US4.1**: Multi-protocol lending rate monitoring ✅
- [x] **US4.2**: Liquidation risk assessment across protocols ✅

### Epic 5: Alert System
- [x] **US5.1**: Customizable price movement alerts ✅
- [x] **US5.2**: Automated market anomaly detection ✅

See [PRD with User Stories](crypto-dashboard-prd-with-user-stories.md) for detailed requirements.

## 🔧 Configuration

### Alert Thresholds (Customizable)

```javascript
{
  // Price Movement Alerts
  BTC: { rapid: 2, daily: 5 },        // 5min: 2%, 24h: 5%
  ETH: { rapid: 3, daily: 8 },        // 5min: 3%, 24h: 8%  
  SOL: { rapid: 5, daily: 12 },       // 5min: 5%, 24h: 12%

  // Funding Rate Alerts
  fundingRates: {
    BTC: { high: 0.1, low: -0.05 },   // >0.1% or <-0.05%
    ETH: { high: 0.15, low: -0.08 },  // >0.15% or <-0.08%
    SOL: { high: 0.2, low: -0.1 }     // >0.2% or <-0.1%
  },

  // Market Sentiment
  fearGreed: { 
    extremeFear: 20, 
    extremeGreed: 80,
    rapidChange: 15 
  }
}
```

## 🚀 Deployment

### Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm start

# Or using Docker
docker build -t cryptosense-dashboard .
docker run -p 3000:3000 -p 3001:3001 cryptosense-dashboard
```

### Environment Setup

1. **Database Setup**: PostgreSQL + Redis + InfluxDB
2. **API Keys**: Configure all required API keys
3. **SSL Certificates**: HTTPS required for production
4. **Monitoring**: Prometheus + Grafana for metrics
5. **Alerts**: Email/SMS notification setup

## 📝 API Documentation

### WebSocket Events

```javascript
// Real-time price updates
socket.on('price:update', { symbol, price, change, timestamp })

// Funding rate changes  
socket.on('funding:update', { symbol, rate, change, timestamp })

// Alert notifications
socket.on('alert:triggered', { type, message, severity, data })

// Market sentiment updates
socket.on('sentiment:update', { fearGreedIndex, etfFlows, composite })
```

### REST Endpoints

```bash
GET /api/v1/market/prices           # Current prices (BTC/ETH/SOL)
GET /api/v1/sentiment/fear-greed    # Fear & Greed Index
GET /api/v1/etf/flows              # ETF fund flows
GET /api/v1/derivatives/funding     # Funding rates
GET /api/v1/defi/rates             # DeFi lending rates
GET /api/v1/alerts/settings        # Alert configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Run quality checks: `npm run quality-check`
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Maintain 80%+ test coverage
- Run `npm run quality-check` before committing
- Financial calculations must use Decimal precision
- All API calls must have timeout and error handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/cryptape/cryptosense-dashboard/issues)
- **Security**: security@cryptape.com
- **General**: hello@cryptape.com

---

**⚡ Built with precision for professional crypto traders**

*Powered by Gemini CLI Quality Assurance*