import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface HistoricalDataPoint {
  date: string;
  value: number;
}

export interface MarketOverview {
  prices: Array<{
    symbol: string;
    price: number;
    change24h: number;
    volume24h: number;
    high24h: number;
    low24h: number;
  }>;
  marketCap: number;
  volume24h: number;
  btcDominance: number;
  fearGreedIndex: number;
  fearGreedClassification: string;
  stablecoinMarketCap: number;
  liquidations24h: number;
  
  // Historical 7-day data
  historicalData: {
    marketCap: HistoricalDataPoint[];
    volume24h: HistoricalDataPoint[];
    btcDominance: HistoricalDataPoint[];
    fearGreedIndex: HistoricalDataPoint[];
    stablecoinMarketCap: HistoricalDataPoint[];
    liquidations24h: HistoricalDataPoint[];
  };
  
  lastUpdate: string;
}

export interface DerivativesData {
  fundingRates: Array<{
    symbol: string;
    fundingRate: number;
    markPrice: number;
    indexPrice: number;
    nextFundingTime: string;
  }>;
  openInterest: Array<{
    symbol: string;
    openInterest: number;
    openInterestValue: number;
  }>;
  liquidations: {
    symbol: string;
    total24h: number;
    longs: number;
    shorts: number;
    ratio: number;
  };
  lastUpdate: string;
}

export interface StablecoinData {
  stablecoins: Array<{
    id: string;
    symbol: string;
    name: string;
    price: number;
    marketCap: number;
    volume24h: number;
    marketCapChange24h: number;
    marketCapChangePercentage24h: number;
    circulatingSupply: number;
    pegDeviation: number;
  }>;
  totalMarketCap: number;
  lastUpdate: string;
}

export interface FearGreedData {
  value: number;
  classification: string;
  timestamp: number;
  date: string;
}

export interface CrossAssetData {
  tokens: Array<{
    id: string;
    symbol: string;
    name: string;
    price: number;
    marketCap: number;
    volume24h: number;
    priceChange1h: number;
    priceChange24h: number;
    priceChange7d: number;
    priceChange30d: number;
    sparkline: number[];
  }>;
  trending: {
    coins: Array<{
      id: string;
      symbol: string;
      name: string;
      marketCapRank: number;
      priceChange24h: number;
      price: number;
    }>;
  };
  correlations: {
    [key: string]: { [key: string]: number };
  };
  lastUpdate: string;
}

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('[API Response Error]', error.response?.data || error.message);
        
        // Handle 401 errors
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Generic API methods
  private async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(endpoint, config);
    return response.data;
  }

  private async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(endpoint, data, config);
    return response.data;
  }

  // Market Data API calls
  async getMarketOverview(): Promise<MarketOverview> {
    return this.get<MarketOverview>('/api/v1/market-data/overview');
  }

  async getDerivativesData(): Promise<DerivativesData> {
    return this.get<DerivativesData>('/api/v1/market-data/derivatives');
  }

  async getStablecoinData(): Promise<StablecoinData> {
    return this.get<StablecoinData>('/api/v1/market-data/stablecoins');
  }

  async getFearGreedData(days: number = 30): Promise<FearGreedData[]> {
    return this.get<FearGreedData[]>(`/api/v1/market-data/fear-greed?days=${days}`);
  }

  async getCrossAssetData(): Promise<CrossAssetData> {
    return this.get<CrossAssetData>('/api/v1/market-data/cross-asset');
  }

  async getHealthCheck(): Promise<{ status: string; services: any; timestamp: string }> {
    return this.get('/api/v1/market-data/health');
  }

  // WebSocket connection
  getWebSocketUrl(): string {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = this.baseURL.replace(/^https?:\/\//, '');
    return `${wsProtocol}//${wsHost}`;
  }

  // Utility methods
  isOnline(): boolean {
    return navigator.onLine;
  }

  getBaseURL(): string {
    return this.baseURL;
  }
}

// Create singleton instance
export const apiService = new ApiService();
export default apiService;