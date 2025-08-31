import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BinanceService {
  private readonly logger = new Logger(BinanceService.name);
  private readonly baseUrl = 'https://api.binance.com';
  
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // 获取现货价格
  async getSpotPrices(symbols: string[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']) {
    try {
      const url = `${this.baseUrl}/api/v3/ticker/24hr`;
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            symbols: JSON.stringify(symbols),
          },
        }),
      );
      
      return data.map(ticker => ({
        symbol: ticker.symbol.replace('USDT', ''),
        price: parseFloat(ticker.lastPrice),
        change24h: parseFloat(ticker.priceChangePercent),
        volume24h: parseFloat(ticker.volume) * parseFloat(ticker.lastPrice),
        high24h: parseFloat(ticker.highPrice),
        low24h: parseFloat(ticker.lowPrice),
      }));
    } catch (error) {
      this.logger.error('Failed to fetch Binance spot prices', error);
      return this.getMockPrices();
    }
  }

  // 获取期货资金费率
  async getFundingRates(symbols: string[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']) {
    try {
      const url = `${this.baseUrl}/fapi/v1/premiumIndex`;
      const rates = await Promise.all(
        symbols.map(async (symbol) => {
          const { data } = await firstValueFrom(
            this.httpService.get(url, {
              params: { symbol },
            }),
          );
          return {
            symbol: symbol.replace('USDT', ''),
            fundingRate: parseFloat(data.lastFundingRate) * 100,
            markPrice: parseFloat(data.markPrice),
            indexPrice: parseFloat(data.indexPrice),
            nextFundingTime: data.nextFundingTime,
          };
        }),
      );
      return rates;
    } catch (error) {
      this.logger.error('Failed to fetch funding rates', error);
      return this.getMockFundingRates();
    }
  }

  // 获取未平仓合约
  async getOpenInterest(symbols: string[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT']) {
    try {
      const url = `${this.baseUrl}/fapi/v1/openInterest`;
      const interests = await Promise.all(
        symbols.map(async (symbol) => {
          const { data } = await firstValueFrom(
            this.httpService.get(url, {
              params: { symbol },
            }),
          );
          return {
            symbol: symbol.replace('USDT', ''),
            openInterest: parseFloat(data.openInterest),
            openInterestValue: parseFloat(data.openInterest) * parseFloat(data.lastPrice || 0),
          };
        }),
      );
      return interests;
    } catch (error) {
      this.logger.error('Failed to fetch open interest', error);
      return this.getMockOpenInterest();
    }
  }

  // 获取清算数据
  async getLiquidations(symbol: string = 'BTCUSDT') {
    try {
      const url = `${this.baseUrl}/fapi/v1/allForceOrders`;
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            symbol,
            limit: 100,
          },
        }),
      );
      
      const longs = data.filter(order => order.side === 'SELL');
      const shorts = data.filter(order => order.side === 'BUY');
      
      return {
        symbol: symbol.replace('USDT', ''),
        total24h: this.calculateLiquidationVolume(data),
        longs: this.calculateLiquidationVolume(longs),
        shorts: this.calculateLiquidationVolume(shorts),
        ratio: longs.length / (shorts.length || 1),
      };
    } catch (error) {
      this.logger.error('Failed to fetch liquidations', error);
      return this.getMockLiquidations();
    }
  }

  // 获取订单簿深度
  async getOrderBook(symbol: string = 'BTCUSDT', limit: number = 20) {
    try {
      const url = `${this.baseUrl}/api/v3/depth`;
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            symbol,
            limit,
          },
        }),
      );
      
      return {
        symbol: symbol.replace('USDT', ''),
        bids: data.bids.map(([price, quantity]) => ({
          price: parseFloat(price),
          quantity: parseFloat(quantity),
        })),
        asks: data.asks.map(([price, quantity]) => ({
          price: parseFloat(price),
          quantity: parseFloat(quantity),
        })),
        bidTotal: data.bids.reduce((sum, [price, qty]) => sum + parseFloat(price) * parseFloat(qty), 0),
        askTotal: data.asks.reduce((sum, [price, qty]) => sum + parseFloat(price) * parseFloat(qty), 0),
      };
    } catch (error) {
      this.logger.error('Failed to fetch order book', error);
      return null;
    }
  }

  // 计算清算量
  private calculateLiquidationVolume(orders: any[]): number {
    return orders.reduce((sum, order) => {
      return sum + parseFloat(order.executedQty) * parseFloat(order.averagePrice);
    }, 0);
  }

  // Mock数据作为备用
  private getMockPrices() {
    return [
      { symbol: 'BTC', price: 43250.50, change24h: 2.98, volume24h: 28500000000, high24h: 44000, low24h: 42000 },
      { symbol: 'ETH', price: 2545.80, change24h: 3.63, volume24h: 18200000000, high24h: 2600, low24h: 2450 },
      { symbol: 'SOL', price: 98.75, change24h: -3.38, volume24h: 3800000000, high24h: 102, low24h: 95 },
    ];
  }

  private getMockFundingRates() {
    return [
      { symbol: 'BTC', fundingRate: 0.0425, markPrice: 43285.50, indexPrice: 43250.00, nextFundingTime: Date.now() + 8 * 3600000 },
      { symbol: 'ETH', fundingRate: 0.0155, markPrice: 2548.75, indexPrice: 2545.00, nextFundingTime: Date.now() + 8 * 3600000 },
      { symbol: 'SOL', fundingRate: -0.0087, markPrice: 98.85, indexPrice: 98.75, nextFundingTime: Date.now() + 8 * 3600000 },
    ];
  }

  private getMockOpenInterest() {
    return [
      { symbol: 'BTC', openInterest: 200000, openInterestValue: 8700000000 },
      { symbol: 'ETH', openInterest: 1650000, openInterestValue: 4200000000 },
      { symbol: 'SOL', openInterest: 7900000, openInterestValue: 780000000 },
    ];
  }

  private getMockLiquidations() {
    return {
      symbol: 'BTC',
      total24h: 127000000,
      longs: 89000000,
      shorts: 38000000,
      ratio: 2.34,
    };
  }
}