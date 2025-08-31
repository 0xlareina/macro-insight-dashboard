import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface CoinGlassFundingRate {
  symbol: string;
  exchangeName: string;
  rate: number;
  nextFundingTime: number;
  markPrice: number;
  indexPrice: number;
}

export interface CoinGlassOpenInterest {
  symbol: string;
  exchangeName: string;
  openInterest: number;
  openInterestValue: number;
}

export interface CoinGlassLiquidation {
  symbol: string;
  side: string; // 'long' | 'short'
  amount: number;
  price: number;
  time: number;
  exchangeName: string;
}

@Injectable()
export class CoinGlassService {
  private readonly logger = new Logger(CoinGlassService.name);
  private readonly baseUrl = 'https://open-api-v4.coinglass.com';
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('COINGLASS_API_KEY');
  }

  private getHeaders() {
    const headers: any = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    
    if (this.apiKey) {
      headers['CG_API_KEY'] = this.apiKey;
    }
    
    return headers;
  }

  // 获取资金费率数据
  async getFundingRates(symbols: string[] = ['BTC', 'ETH', 'SOL']): Promise<CoinGlassFundingRate[]> {
    try {
      const results: CoinGlassFundingRate[] = [];
      
      for (const symbol of symbols) {
        const url = `${this.baseUrl}/api/futures/funding-rates/chart`;
        const { data } = await firstValueFrom(
          this.httpService.get(url, {
            headers: this.getHeaders(),
            params: {
              symbol: symbol.toUpperCase(),
              time_type: '1h',
              limit: 1
            }
          })
        );

        if (data.success && data.data && data.data.length > 0) {
          const latest = data.data[0];
          results.push({
            symbol: symbol,
            exchangeName: 'Aggregated',
            rate: parseFloat(latest.rate || 0),
            nextFundingTime: Date.now() + 8 * 3600000, // 8小时后
            markPrice: parseFloat(latest.price || 0),
            indexPrice: parseFloat(latest.price || 0) * 0.999, // 估算指数价格
          });
        }
      }

      if (results.length === 0) {
        return this.getMockFundingRates();
      }

      return results;
    } catch (error) {
      this.logger.error('Failed to fetch funding rates from CoinGlass', error);
      return this.getMockFundingRates();
    }
  }

  // 获取持仓量数据
  async getOpenInterest(symbols: string[] = ['BTC', 'ETH', 'SOL']): Promise<CoinGlassOpenInterest[]> {
    try {
      const results: CoinGlassOpenInterest[] = [];
      
      for (const symbol of symbols) {
        const url = `${this.baseUrl}/api/futures/openInterest/chart`;
        const { data } = await firstValueFrom(
          this.httpService.get(url, {
            headers: this.getHeaders(),
            params: {
              symbol: symbol.toUpperCase(),
              time_type: '1h',
              limit: 1
            }
          })
        );

        if (data.success && data.data && data.data.length > 0) {
          const latest = data.data[0];
          results.push({
            symbol: symbol,
            exchangeName: 'Aggregated',
            openInterest: parseFloat(latest.openInterest || 0),
            openInterestValue: parseFloat(latest.openInterestValue || 0),
          });
        }
      }

      if (results.length === 0) {
        return this.getMockOpenInterest();
      }

      return results;
    } catch (error) {
      this.logger.error('Failed to fetch open interest from CoinGlass', error);
      return this.getMockOpenInterest();
    }
  }

  // 获取清算数据
  async getLiquidations(timeframe: string = '24h'): Promise<{
    total: number;
    longs: number;
    shorts: number;
    bySymbol: { [key: string]: { longs: number; shorts: number; total: number } }
  }> {
    try {
      const url = `${this.baseUrl}/api/futures/liquidation_history`;
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.getHeaders(),
          params: {
            time_type: timeframe === '24h' ? '1d' : '1h',
            limit: 100
          }
        })
      );

      if (data.success && data.data) {
        let totalLongs = 0;
        let totalShorts = 0;
        const bySymbol: { [key: string]: { longs: number; shorts: number; total: number } } = {};

        data.data.forEach((item: any) => {
          const amount = parseFloat(item.amount || 0);
          const symbol = item.symbol || 'UNKNOWN';
          
          if (!bySymbol[symbol]) {
            bySymbol[symbol] = { longs: 0, shorts: 0, total: 0 };
          }

          if (item.side === 'sell') { // 多单清算
            totalLongs += amount;
            bySymbol[symbol].longs += amount;
          } else { // 空单清算
            totalShorts += amount;
            bySymbol[symbol].shorts += amount;
          }
          
          bySymbol[symbol].total += amount;
        });

        return {
          total: totalLongs + totalShorts,
          longs: totalLongs,
          shorts: totalShorts,
          bySymbol
        };
      }

      return this.getMockLiquidations();
    } catch (error) {
      this.logger.error('Failed to fetch liquidations from CoinGlass', error);
      return this.getMockLiquidations();
    }
  }

  // 获取稳定币市值数据
  async getStablecoinMarketCap(): Promise<{ marketCap: number; lastUpdate: string } | null> {
    try {
      const url = `${this.baseUrl}/api/index/stableCoin-marketCap-history`;
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          headers: this.getHeaders(),
        })
      );

      if (data.code === '0' && data.data && data.data.length > 0) {
        // 获取最新的数据点
        const latest = data.data[data.data.length - 1];
        const latestMarketCap = latest.data_list && latest.data_list.length > 0 
          ? latest.data_list[latest.data_list.length - 1] 
          : null;
        const latestTime = latest.time_list && latest.time_list.length > 0 
          ? latest.time_list[latest.time_list.length - 1] 
          : Date.now();

        if (latestMarketCap) {
          return {
            marketCap: parseFloat(latestMarketCap) * 1e9, // 转换为美元（假设返回的是十亿美元单位）
            lastUpdate: new Date(latestTime * 1000).toISOString(),
          };
        }
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to fetch stablecoin market cap from CoinGlass', error);
      return null;
    }
  }

  // 获取综合衍生品数据
  async getDerivativesOverview() {
    const [fundingRates, openInterest, liquidations] = await Promise.all([
      this.getFundingRates(),
      this.getOpenInterest(),
      this.getLiquidations()
    ]);

    return {
      fundingRates: fundingRates.map(fr => ({
        symbol: fr.symbol + 'USDT',
        fundingRate: fr.rate,
        markPrice: fr.markPrice,
        indexPrice: fr.indexPrice,
        nextFundingTime: new Date(fr.nextFundingTime).toISOString(),
      })),
      openInterest: openInterest.map(oi => ({
        symbol: oi.symbol + 'USDT',
        openInterest: oi.openInterest,
        openInterestValue: oi.openInterestValue,
      })),
      liquidations: {
        symbol: 'ALL',
        total24h: liquidations.total / 1e6, // 转换为百万美元
        longs: liquidations.longs / 1e6,
        shorts: liquidations.shorts / 1e6,
        ratio: liquidations.longs / (liquidations.shorts || 1),
      },
      lastUpdate: new Date().toISOString(),
    };
  }

  // Mock数据备份
  private getMockFundingRates(): CoinGlassFundingRate[] {
    return [
      { symbol: 'BTC', exchangeName: 'Mock', rate: 0.0001, nextFundingTime: Date.now() + 8 * 3600000, markPrice: 108500, indexPrice: 108450 },
      { symbol: 'ETH', exchangeName: 'Mock', rate: 0.00015, nextFundingTime: Date.now() + 8 * 3600000, markPrice: 4450, indexPrice: 4445 },
      { symbol: 'SOL', exchangeName: 'Mock', rate: -0.0002, nextFundingTime: Date.now() + 8 * 3600000, markPrice: 198.5, indexPrice: 198.3 },
    ];
  }

  private getMockOpenInterest(): CoinGlassOpenInterest[] {
    return [
      { symbol: 'BTC', exchangeName: 'Mock', openInterest: 85000, openInterestValue: 9222500000 },
      { symbol: 'ETH', exchangeName: 'Mock', openInterest: 1250000, openInterestValue: 5562500000 },
      { symbol: 'SOL', exchangeName: 'Mock', openInterest: 5500000, openInterestValue: 1091750000 },
    ];
  }

  private getMockLiquidations() {
    return {
      total: 125000000,
      longs: 75000000,
      shorts: 50000000,
      bySymbol: {
        'BTC': { longs: 45000000, shorts: 30000000, total: 75000000 },
        'ETH': { longs: 20000000, shorts: 15000000, total: 35000000 },
        'SOL': { longs: 10000000, shorts: 5000000, total: 15000000 },
      }
    };
  }
}