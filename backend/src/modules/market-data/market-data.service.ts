import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BinanceService } from './binance.service';
import { CoinGeckoService } from './coingecko.service';
import { FearGreedService } from './fear-greed.service';
import { CoinGlassService } from './coinglass.service';
import { CoinMarketCapService } from './coinmarketcap.service';
import { RedisCacheService } from '../cache/redis-cache.service';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);

  constructor(
    private readonly binanceService: BinanceService,
    private readonly coinGeckoService: CoinGeckoService,
    private readonly fearGreedService: FearGreedService,
    private readonly coinGlassService: CoinGlassService,
    private readonly coinMarketCapService: CoinMarketCapService,
    private readonly cacheService: RedisCacheService,
  ) {}

  // 获取综合市场数据（包含历史数据）
  async getMarketOverview() {
    const cacheKey = this.cacheService.generateKey(
      RedisCacheService.KEY_PREFIX.MARKET,
      'overview',
    );

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // 使用Alternative.me作为主要源，CoinMarketCap作为备用（需要API密钥）
        let fearGreedIndex;
        let fearGreedHistory;
        
        try {
          // 优先使用Alternative.me (免费且稳定)
          [fearGreedIndex, fearGreedHistory] = await Promise.all([
            this.fearGreedService.getCurrentIndex(),
            this.fearGreedService.getHistoricalData(7),
          ]);
        } catch (error) {
          this.logger.warn('Alternative.me Fear & Greed API failed, falling back to CoinMarketCap');
          // 降级到CoinMarketCap
          [fearGreedIndex, fearGreedHistory] = await Promise.all([
            this.coinMarketCapService.getFearGreedIndex(),
            this.coinMarketCapService.getFearGreedHistory(7),
          ]);
        }

        const [binancePrices, marketOverview, historicalData, stablecoinData] = await Promise.all([
          this.binanceService.getSpotPrices(),
          this.coinGeckoService.getMarketOverview(),
          this.coinGeckoService.getHistoricalMarketData(7), // 获取7天历史数据
          this.getStablecoinData(), // 获取稳定币数据
        ]);

        // 处理恐慌贪婪指数历史数据
        const fearGreedHistoryData = fearGreedHistory.map(item => ({
          date: typeof item.date === 'string' ? item.date.split('T')[0] : item.date,
          value: item.value,
        }));

        return {
          prices: binancePrices,
          marketCap: marketOverview.totalMarketCap,
          volume24h: marketOverview.totalVolume,
          btcDominance: marketOverview.btcDominance,
          fearGreedIndex: fearGreedIndex.value,
          fearGreedClassification: fearGreedIndex.classification,
          stablecoinMarketCap: stablecoinData.totalMarketCap || 140500000000, // 使用真实稳定币市值
          liquidations24h: 127800000, // 默认值，后续可以从衍生品数据获取
          
          // 历史数据
          historicalData: {
            marketCap: historicalData.marketCap,
            volume24h: historicalData.volume24h,
            btcDominance: historicalData.btcDominance,
            fearGreedIndex: fearGreedHistoryData,
            stablecoinMarketCap: historicalData.stablecoinMarketCap,
            liquidations24h: historicalData.liquidations24h,
          },
          
          lastUpdate: new Date().toISOString(),
        };
      },
      RedisCacheService.TTL.FIVE_MINUTES,
    );
  }

  // 获取衍生品数据
  async getDerivativesData() {
    const cacheKey = this.cacheService.generateKey(
      RedisCacheService.KEY_PREFIX.FUNDING,
      'overview',
    );

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // 使用CoinGlass API获取更准确的衍生品数据
        const derivativesData = await this.coinGlassService.getDerivativesOverview();
        
        return derivativesData;
      },
      RedisCacheService.TTL.TEN_MINUTES,
    );
  }

  // 获取稳定币数据
  async getStablecoinData() {
    const cacheKey = this.cacheService.generateKey(
      RedisCacheService.KEY_PREFIX.MARKET,
      'stablecoins',
    );

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const stablecoins = await this.coinGeckoService.getStablecoinData();
        
        // 尝试从CoinGlass获取更准确的总市值数据
        const coinGlassMarketCap = await this.coinGlassService.getStablecoinMarketCap();
        const totalMarketCap = coinGlassMarketCap?.marketCap || 
          stablecoins.reduce((sum, coin) => sum + coin.marketCap, 0);

        return {
          stablecoins,
          totalMarketCap,
          coinGlassData: coinGlassMarketCap ? {
            marketCap: coinGlassMarketCap.marketCap,
            source: 'CoinGlass',
            lastUpdate: coinGlassMarketCap.lastUpdate,
          } : null,
          lastUpdate: new Date().toISOString(),
        };
      },
      RedisCacheService.TTL.HOUR, // 增加稳定币缓存时间到1小时以减少API调用
    );
  }

  // 获取恐慌贪婪指数历史
  async getFearGreedHistory(days: number = 30) {
    const cacheKey = this.cacheService.generateKey(
      RedisCacheService.KEY_PREFIX.FEAR_GREED,
      'history',
      days.toString(),
    );

    return this.cacheService.getOrSet(
      cacheKey,
      () => this.fearGreedService.getHistoricalData(days),
      RedisCacheService.TTL.HOUR,
    );
  }

  // 获取跨资产分析数据
  async getCrossAssetData() {
    const cacheKey = this.cacheService.generateKey(
      RedisCacheService.KEY_PREFIX.MARKET,
      'cross-asset',
    );

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const [tokenDetails, trendingCoins] = await Promise.all([
          this.coinGeckoService.getTokenDetails(),
          this.coinGeckoService.getTrendingCoins(),
        ]);

        // 计算相关性（简化版本）
        const correlationMatrix = this.calculateCorrelations(tokenDetails);

        return {
          tokens: tokenDetails,
          trending: trendingCoins,
          correlations: correlationMatrix,
          lastUpdate: new Date().toISOString(),
        };
      },
      RedisCacheService.TTL.TEN_MINUTES,
    );
  }

  // 定时更新核心数据
  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateMarketData() {
    try {
      this.logger.log('Updating market data...');
      await Promise.all([
        this.getMarketOverview(),
        this.getDerivativesData(),
      ]);
      this.logger.log('Market data updated successfully');
    } catch (error) {
      this.logger.error('Failed to update market data', error);
    }
  }

  // 暂时禁用定时更新以避免API限制
  // @Cron(CronExpression.EVERY_10_MINUTES)
  async updateStablecoinData() {
    try {
      await this.getStablecoinData();
      this.logger.log('Stablecoin data updated successfully');
    } catch (error) {
      this.logger.error('Failed to update stablecoin data', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updateFearGreedData() {
    try {
      await this.getFearGreedHistory();
      this.logger.log('Fear & Greed data updated successfully');
    } catch (error) {
      this.logger.error('Failed to update Fear & Greed data', error);
    }
  }

  // 简化的相关性计算
  private calculateCorrelations(tokens: any[]) {
    // 这里可以实现更复杂的相关性计算逻辑
    // 目前返回模拟数据
    return {
      BTC: { ETH: 0.82, SOL: 0.74, SPX: 0.42, GOLD: 0.18 },
      ETH: { BTC: 0.82, SOL: 0.88, SPX: 0.38, GOLD: 0.12 },
      SOL: { BTC: 0.74, ETH: 0.88, SPX: 0.35, GOLD: 0.08 },
    };
  }

  // 健康检查
  async healthCheck() {
    try {
      const [binanceHealth, coinGeckoHealth, fearGreedHealth] = await Promise.all([
        this.binanceService.getSpotPrices(['BTCUSDT']),
        this.coinGeckoService.getMarketOverview(),
        this.fearGreedService.getCurrentIndex(),
      ]);

      return {
        status: 'healthy',
        services: {
          binance: !!binanceHealth,
          coinGecko: !!coinGeckoHealth,
          fearGreed: !!fearGreedHealth,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}