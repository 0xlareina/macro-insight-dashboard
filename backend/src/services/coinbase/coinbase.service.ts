// CryptoSense Dashboard - Coinbase API Service
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { WebSocket } from 'ws';

export interface CoinbaseProduct {
  id: string;
  base_currency: string;
  quote_currency: string;
  base_min_size: string;
  base_max_size: string;
  quote_increment: string;
  display_name: string;
  status: string;
  trading_disabled: boolean;
}

export interface CoinbaseTicker {
  product_id: string;
  price: string;
  size: string;
  bid: string;
  ask: string;
  volume: string;
  time: string;
}

export interface CoinbaseCandle {
  time: number;
  low: number;
  high: number;
  open: number;
  close: number;
  volume: number;
}

export interface CoinbaseStats {
  open: string;
  high: string;
  low: string;
  volume: string;
  last: string;
  volume_30day: string;
}

export interface ETFFlowData {
  date: string;
  ticker: string;
  name: string;
  flow: number;
  flowUSD: number;
  holdings: number;
  shares: number;
}

@Injectable()
export class CoinbaseService {
  private readonly logger = new Logger(CoinbaseService.name);
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly baseUrl: string;
  private readonly wsUrl = 'wss://ws-feed.exchange.coinbase.com';
  private websocket: WebSocket | null = null;
  
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get('coinbase.apiKey');
    this.apiSecret = this.configService.get('coinbase.apiSecret');
    this.baseUrl = this.configService.get('coinbase.baseUrl');
  }
  
  // Generate signature for authenticated requests
  private generateSignature(
    timestamp: string,
    method: string,
    path: string,
    body = '',
  ): string {
    const message = timestamp + method + path + body;
    const key = Buffer.from(this.apiSecret, 'base64');
    const hmac = crypto.createHmac('sha256', key);
    const signature = hmac.update(message).digest('base64');
    return signature;
  }
  
  // Add authentication headers
  private getHeaders(
    method: string,
    path: string,
    needsAuth = false,
  ): any {
    const headers: any = {
      'Content-Type': 'application/json',
      'User-Agent': 'CryptoSense/1.0',
    };
    
    if (needsAuth && this.apiKey && this.apiSecret) {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      headers['CB-ACCESS-KEY'] = this.apiKey;
      headers['CB-ACCESS-SIGN'] = this.generateSignature(
        timestamp,
        method,
        path,
      );
      headers['CB-ACCESS-TIMESTAMP'] = timestamp;
    }
    
    return headers;
  }
  
  // Get products/trading pairs
  async getProducts(): Promise<CoinbaseProduct[]> {
    try {
      const path = '/v2/exchange-rates';
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}${path}`, {
          headers: this.getHeaders('GET', path),
        }),
      );
      
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch Coinbase products:', error.message);
      throw error;
    }
  }
  
  // Get ticker data for specific products
  async getTickers(symbols: string[]): Promise<CoinbaseTicker[]> {
    try {
      const tickers: CoinbaseTicker[] = [];
      
      for (const symbol of symbols) {
        const productId = `${symbol}-USD`;
        const path = `/products/${productId}/ticker`;
        const response = await firstValueFrom(
          this.httpService.get(`https://api.exchange.coinbase.com${path}`, {
            headers: this.getHeaders('GET', path),
          }),
        );
        
        tickers.push({
          product_id: productId,
          price: response.data.price,
          size: response.data.size,
          bid: response.data.bid,
          ask: response.data.ask,
          volume: response.data.volume,
          time: response.data.time,
        });
      }
      
      return tickers;
    } catch (error) {
      this.logger.error('Failed to fetch Coinbase tickers:', error.message);
      throw error;
    }
  }
  
  // Get 24hr stats
  async get24hrStats(symbols: string[]): Promise<{ [key: string]: CoinbaseStats }> {
    try {
      const stats: { [key: string]: CoinbaseStats } = {};
      
      for (const symbol of symbols) {
        const productId = `${symbol}-USD`;
        const path = `/products/${productId}/stats`;
        const response = await firstValueFrom(
          this.httpService.get(`https://api.exchange.coinbase.com${path}`, {
            headers: this.getHeaders('GET', path),
          }),
        );
        
        stats[symbol] = {
          open: response.data.open,
          high: response.data.high,
          low: response.data.low,
          volume: response.data.volume,
          last: response.data.last,
          volume_30day: response.data.volume_30day,
        };
      }
      
      return stats;
    } catch (error) {
      this.logger.error('Failed to fetch 24hr stats:', error.message);
      throw error;
    }
  }
  
  // Get historical candles
  async getCandles(
    symbol: string,
    granularity: number, // in seconds (60, 300, 900, 3600, 21600, 86400)
    start?: string,
    end?: string,
  ): Promise<CoinbaseCandle[]> {
    try {
      const productId = `${symbol}-USD`;
      let path = `/products/${productId}/candles?granularity=${granularity}`;
      
      if (start) path += `&start=${start}`;
      if (end) path += `&end=${end}`;
      
      const response = await firstValueFrom(
        this.httpService.get(`https://api.exchange.coinbase.com${path}`, {
          headers: this.getHeaders('GET', path),
        }),
      );
      
      return response.data.map((candle: number[]) => ({
        time: candle[0],
        low: candle[1],
        high: candle[2],
        open: candle[3],
        close: candle[4],
        volume: candle[5],
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch candles for ${symbol}:`, error.message);
      throw error;
    }
  }
  
  // Get order book
  async getOrderBook(
    symbol: string,
    level = 2, // 1 = best bid/ask, 2 = top 50, 3 = full order book
  ): Promise<any> {
    try {
      const productId = `${symbol}-USD`;
      const path = `/products/${productId}/book?level=${level}`;
      
      const response = await firstValueFrom(
        this.httpService.get(`https://api.exchange.coinbase.com${path}`, {
          headers: this.getHeaders('GET', path),
        }),
      );
      
      return {
        sequence: response.data.sequence,
        bids: response.data.bids.map((bid: string[]) => ({
          price: parseFloat(bid[0]),
          size: parseFloat(bid[1]),
          orders: parseInt(bid[2]),
        })),
        asks: response.data.asks.map((ask: string[]) => ({
          price: parseFloat(ask[0]),
          size: parseFloat(ask[1]),
          orders: parseInt(ask[2]),
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to fetch order book for ${symbol}:`, error.message);
      throw error;
    }
  }
  
  // Subscribe to real-time data via WebSocket
  subscribeToRealtime(
    symbols: string[],
    channels: string[],
    onMessage: (data: any) => void,
  ): void {
    const products = symbols.map(s => `${s}-USD`);
    
    this.websocket = new WebSocket(this.wsUrl);
    
    this.websocket.on('open', () => {
      this.logger.log('Connected to Coinbase WebSocket');
      
      // Subscribe to channels
      const subscribeMessage = {
        type: 'subscribe',
        product_ids: products,
        channels: channels, // e.g., ['ticker', 'level2', 'matches']
      };
      
      this.websocket.send(JSON.stringify(subscribeMessage));
    });
    
    this.websocket.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        // Skip subscription confirmations
        if (message.type === 'subscriptions') return;
        
        // Process different message types
        switch (message.type) {
          case 'ticker':
            onMessage({
              type: 'ticker',
              product: message.product_id,
              price: parseFloat(message.price),
              size: parseFloat(message.last_size),
              bid: parseFloat(message.best_bid),
              ask: parseFloat(message.best_ask),
              volume24h: parseFloat(message.volume_24h),
              time: message.time,
            });
            break;
            
          case 'l2update':
            onMessage({
              type: 'orderbook',
              product: message.product_id,
              changes: message.changes.map((change: any[]) => ({
                side: change[0],
                price: parseFloat(change[1]),
                size: parseFloat(change[2]),
              })),
              time: message.time,
            });
            break;
            
          case 'match':
            onMessage({
              type: 'trade',
              product: message.product_id,
              price: parseFloat(message.price),
              size: parseFloat(message.size),
              side: message.side,
              time: message.time,
            });
            break;
        }
      } catch (error) {
        this.logger.error('Failed to parse WebSocket message:', error);
      }
    });
    
    this.websocket.on('error', (error) => {
      this.logger.error('WebSocket error:', error);
    });
    
    this.websocket.on('close', () => {
      this.logger.log('WebSocket connection closed, reconnecting...');
      setTimeout(() => this.subscribeToRealtime(symbols, channels, onMessage), 5000);
    });
  }
  
  // Fetch ETF flow data (this would typically come from a different source)
  async getETFFlows(): Promise<ETFFlowData[]> {
    // Note: Coinbase doesn't directly provide ETF flow data
    // This is a placeholder for integration with ETF data providers
    // In production, this would fetch from sources like:
    // - Farside Investors API
    // - Bloomberg API
    // - ETF.com API
    
    try {
      // Simulated ETF flow data structure
      const mockETFData: ETFFlowData[] = [
        {
          date: new Date().toISOString().split('T')[0],
          ticker: 'IBIT',
          name: 'iShares Bitcoin Trust',
          flow: 234567890,
          flowUSD: 234567890,
          holdings: 45678.9,
          shares: 123456789,
        },
        {
          date: new Date().toISOString().split('T')[0],
          ticker: 'FBTC',
          name: 'Fidelity Wise Origin Bitcoin Fund',
          flow: 123456789,
          flowUSD: 123456789,
          holdings: 34567.8,
          shares: 98765432,
        },
        {
          date: new Date().toISOString().split('T')[0],
          ticker: 'ARKB',
          name: 'ARK 21Shares Bitcoin ETF',
          flow: -45678901,
          flowUSD: -45678901,
          holdings: 23456.7,
          shares: 76543210,
        },
      ];
      
      this.logger.log('ETF flow data fetched (mock data for development)');
      return mockETFData;
    } catch (error) {
      this.logger.error('Failed to fetch ETF flows:', error.message);
      throw error;
    }
  }
  
  // Disconnect WebSocket
  disconnect(): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.close();
      this.logger.log('Closed Coinbase WebSocket connection');
    }
  }
  
  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://api.exchange.coinbase.com/products'),
      );
      return response.status === 200;
    } catch (error) {
      this.logger.error('Coinbase health check failed:', error.message);
      return false;
    }
  }
}