// CryptoSense Dashboard - Binance API Service
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { WebSocket } from 'ws';

export interface BinanceTickerData {
  symbol: string;
  price: string;
  priceChange: string;
  priceChangePercent: string;
  volume: string;
  quoteVolume: string;
  count: number;
  weightedAvgPrice: string;
  highPrice: string;
  lowPrice: string;
  openPrice: string;
  lastPrice: string;
  askPrice: string;
  bidPrice: string;
  openTime: number;
  closeTime: number;
}

export interface BinanceFundingRate {
  symbol: string;
  fundingRate: string;
  fundingTime: number;
  markPrice: string;
}

export interface BinanceOpenInterest {
  symbol: string;
  openInterest: string;
  time: number;
}

export interface BinanceLiquidation {
  symbol: string;
  side: 'BUY' | 'SELL';
  orderType: string;
  timeInForce: string;
  origQty: string;
  price: string;
  avgPrice: string;
  orderStatus: string;
  updateTime: number;
}

export interface BinanceDepth {
  lastUpdateId: number;
  bids: Array<[string, string]>; // [price, quantity]
  asks: Array<[string, string]>; // [price, quantity]
}

@Injectable()
export class BinanceService {
  private readonly logger = new Logger(BinanceService.name);
  private readonly apiKey: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;
  private readonly wsUrl = 'wss://stream.binance.com:9443/ws';
  private readonly futuresWsUrl = 'wss://fstream.binance.com/ws';
  private websockets: Map<string, WebSocket> = new Map();
  
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get('binance.apiKey');
    this.secretKey = this.configService.get('binance.secretKey');
    this.baseUrl = this.configService.get('binance.baseUrl');
  }
  
  // Generate signature for authenticated requests
  private generateSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(queryString)
      .digest('hex');
  }
  
  // Add authentication headers
  private getHeaders(needsAuth = false): any {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (needsAuth && this.apiKey) {
      headers['X-MBX-APIKEY'] = this.apiKey;
    }
    
    return headers;
  }
  
  // Get spot ticker data for specific symbols
  async getSpotTickers(symbols: string[]): Promise<BinanceTickerData[]> {
    try {
      const symbolsParam = symbols.map(s => `"${s}USDT"`).join(',');
      const url = `${this.baseUrl}/api/v3/ticker/24hr?symbols=[${symbolsParam}]`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.getHeaders(),
        }),
      );
      
      return response.data.map((ticker: any) => ({
        symbol: ticker.symbol,
        price: ticker.lastPrice,
        priceChange: ticker.priceChange,
        priceChangePercent: ticker.priceChangePercent,
        volume: ticker.volume,
        quoteVolume: ticker.quoteVolume,
        count: ticker.count,
        weightedAvgPrice: ticker.weightedAvgPrice,
        highPrice: ticker.highPrice,
        lowPrice: ticker.lowPrice,
        openPrice: ticker.openPrice,
        lastPrice: ticker.lastPrice,
        askPrice: ticker.askPrice,
        bidPrice: ticker.bidPrice,
        openTime: ticker.openTime,
        closeTime: ticker.closeTime,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch spot tickers:', error.message);
      throw error;
    }
  }
  
  // Get futures funding rates
  async getFundingRates(symbols: string[]): Promise<BinanceFundingRate[]> {
    try {
      const url = `${this.baseUrl}/fapi/v1/premiumIndex`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.getHeaders(),
        }),
      );
      
      const symbolSet = new Set(symbols.map(s => `${s}USDT`));
      return response.data
        .filter((item: any) => symbolSet.has(item.symbol))
        .map((item: any) => ({
          symbol: item.symbol,
          fundingRate: item.lastFundingRate,
          fundingTime: item.nextFundingTime,
          markPrice: item.markPrice,
        }));
    } catch (error) {
      this.logger.error('Failed to fetch funding rates:', error.message);
      throw error;
    }
  }
  
  // Get open interest
  async getOpenInterest(symbols: string[]): Promise<BinanceOpenInterest[]> {
    try {
      const results: BinanceOpenInterest[] = [];
      
      for (const symbol of symbols) {
        const url = `${this.baseUrl}/fapi/v1/openInterest?symbol=${symbol}USDT`;
        const response = await firstValueFrom(
          this.httpService.get(url, {
            headers: this.getHeaders(),
          }),
        );
        
        results.push({
          symbol: `${symbol}USDT`,
          openInterest: response.data.openInterest,
          time: response.data.time,
        });
      }
      
      return results;
    } catch (error) {
      this.logger.error('Failed to fetch open interest:', error.message);
      throw error;
    }
  }
  
  // Get order book depth
  async getDepth(symbol: string, limit = 50): Promise<BinanceDepth> {
    try {
      const url = `${this.baseUrl}/api/v3/depth?symbol=${symbol}USDT&limit=${limit}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.getHeaders(),
        }),
      );
      
      return {
        lastUpdateId: response.data.lastUpdateId,
        bids: response.data.bids,
        asks: response.data.asks,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch depth for ${symbol}:`, error.message);
      throw error;
    }
  }
  
  // Get klines/candlestick data
  async getKlines(
    symbol: string,
    interval: string,
    limit = 100,
  ): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/api/v3/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.getHeaders(),
        }),
      );
      
      return response.data.map((kline: any[]) => ({
        openTime: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
        closeTime: kline[6],
        quoteVolume: parseFloat(kline[7]),
        trades: kline[8],
        takerBuyVolume: parseFloat(kline[9]),
        takerBuyQuoteVolume: parseFloat(kline[10]),
      }));
    } catch (error) {
      this.logger.error(`Failed to fetch klines for ${symbol}:`, error.message);
      throw error;
    }
  }
  
  // Subscribe to real-time price updates via WebSocket
  subscribeToTickers(
    symbols: string[],
    onMessage: (data: any) => void,
  ): void {
    const streams = symbols
      .map((symbol) => `${symbol.toLowerCase()}usdt@ticker`)
      .join('/');
    const wsUrl = `${this.wsUrl}/${streams}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.on('open', () => {
      this.logger.log(`Connected to Binance WebSocket for tickers`);
    });
    
    ws.on('message', (data: Buffer) => {
      try {
        const parsed = JSON.parse(data.toString());
        onMessage({
          stream: parsed.stream,
          symbol: parsed.data.s,
          price: parseFloat(parsed.data.c),
          priceChange: parseFloat(parsed.data.p),
          priceChangePercent: parseFloat(parsed.data.P),
          volume: parseFloat(parsed.data.v),
          quoteVolume: parseFloat(parsed.data.q),
          high: parseFloat(parsed.data.h),
          low: parseFloat(parsed.data.l),
          timestamp: parsed.data.E,
        });
      } catch (error) {
        this.logger.error('Failed to parse WebSocket message:', error);
      }
    });
    
    ws.on('error', (error) => {
      this.logger.error('WebSocket error:', error);
    });
    
    ws.on('close', () => {
      this.logger.log('WebSocket connection closed, reconnecting...');
      setTimeout(() => this.subscribeToTickers(symbols, onMessage), 5000);
    });
    
    this.websockets.set('tickers', ws);
  }
  
  // Subscribe to liquidation events
  subscribeToLiquidations(
    symbols: string[],
    onMessage: (data: any) => void,
  ): void {
    const streams = symbols
      .map((symbol) => `${symbol.toLowerCase()}usdt@forceOrder`)
      .join('/');
    const wsUrl = `${this.futuresWsUrl}/${streams}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.on('open', () => {
      this.logger.log(`Connected to Binance Futures WebSocket for liquidations`);
    });
    
    ws.on('message', (data: Buffer) => {
      try {
        const parsed = JSON.parse(data.toString());
        const order = parsed.data.o;
        
        onMessage({
          symbol: order.s,
          side: order.S,
          price: parseFloat(order.p),
          quantity: parseFloat(order.q),
          totalValue: parseFloat(order.p) * parseFloat(order.q),
          timestamp: order.T,
        });
      } catch (error) {
        this.logger.error('Failed to parse liquidation message:', error);
      }
    });
    
    ws.on('error', (error) => {
      this.logger.error('Liquidation WebSocket error:', error);
    });
    
    ws.on('close', () => {
      this.logger.log('Liquidation WebSocket closed, reconnecting...');
      setTimeout(() => this.subscribeToLiquidations(symbols, onMessage), 5000);
    });
    
    this.websockets.set('liquidations', ws);
  }
  
  // Subscribe to funding rate updates
  subscribeToFundingRates(
    symbols: string[],
    onMessage: (data: any) => void,
  ): void {
    const streams = symbols
      .map((symbol) => `${symbol.toLowerCase()}usdt@markPrice`)
      .join('/');
    const wsUrl = `${this.futuresWsUrl}/${streams}`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.on('open', () => {
      this.logger.log(`Connected to Binance Futures WebSocket for funding rates`);
    });
    
    ws.on('message', (data: Buffer) => {
      try {
        const parsed = JSON.parse(data.toString());
        
        onMessage({
          symbol: parsed.data.s,
          markPrice: parseFloat(parsed.data.p),
          fundingRate: parseFloat(parsed.data.r),
          nextFundingTime: parsed.data.T,
          timestamp: parsed.data.E,
        });
      } catch (error) {
        this.logger.error('Failed to parse funding rate message:', error);
      }
    });
    
    ws.on('error', (error) => {
      this.logger.error('Funding rate WebSocket error:', error);
    });
    
    ws.on('close', () => {
      this.logger.log('Funding rate WebSocket closed, reconnecting...');
      setTimeout(() => this.subscribeToFundingRates(symbols, onMessage), 5000);
    });
    
    this.websockets.set('funding', ws);
  }
  
  // Clean up WebSocket connections
  disconnect(): void {
    this.websockets.forEach((ws, key) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
        this.logger.log(`Closed WebSocket connection: ${key}`);
      }
    });
    this.websockets.clear();
  }
  
  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/api/v3/ping`),
      );
      return response.status === 200;
    } catch (error) {
      this.logger.error('Binance health check failed:', error.message);
      return false;
    }
  }
}