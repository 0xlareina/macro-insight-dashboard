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

  // Get comprehensive market data (including historical data)
  async getMarketOverview() {
    const cacheKey = this.cacheService.generateKey(
      RedisCacheService.KEY_PREFIX.MARKET,
      'overview',
    );

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Use Alternative.me as primary source, CoinMarketCap as backup (requires API key)
        let fearGreedIndex;
        let fearGreedHistory;
        
        try {
          // Prioritize Alternative.me (free and stable)
          [fearGreedIndex, fearGreedHistory] = await Promise.all([
            this.fearGreedService.getCurrentIndex(),
            this.fearGreedService.getHistoricalData(7),
          ]);
        } catch (error) {
          this.logger.warn('Alternative.me Fear & Greed API failed, falling back to CoinMarketCap');
          // Fallback to CoinMarketCap
          [fearGreedIndex, fearGreedHistory] = await Promise.all([
            this.coinMarketCapService.getFearGreedIndex(),
            this.coinMarketCapService.getFearGreedHistory(7),
          ]);
        }

        const [binancePrices, marketOverview, historicalData, stablecoinData] = await Promise.all([
          this.binanceService.getSpotPrices(),
          this.coinGeckoService.getMarketOverview(),
          this.coinGeckoService.getHistoricalMarketData(7), // Get 7 days historical data
          this.getStablecoinData(), // Get stablecoin data
        ]);

        // Process Fear & Greed Index historical data
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
          stablecoinMarketCap: stablecoinData.totalMarketCap || 140500000000, // Use real stablecoin market cap
          liquidations24h: 127800000, // Default value, can be obtained from derivatives data later
          
          // Historical data
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

  // Get derivatives data
  async getDerivativesData() {
    const cacheKey = this.cacheService.generateKey(
      RedisCacheService.KEY_PREFIX.FUNDING,
      'overview',
    );

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // Use CoinGlass API for more accurate derivatives data
        const derivativesData = await this.coinGlassService.getDerivativesOverview();
        
        return derivativesData;
      },
      RedisCacheService.TTL.TEN_MINUTES,
    );
  }

  // Get stablecoin data
  async getStablecoinData() {
    const cacheKey = this.cacheService.generateKey(
      RedisCacheService.KEY_PREFIX.MARKET,
      'stablecoins',
    );

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const stablecoins = await this.coinGeckoService.getStablecoinData();
        
        // Try to get more accurate total market cap from CoinGlass
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
      RedisCacheService.TTL.HOUR, // Increase stablecoin cache time to 1 hour to reduce API calls
    );
  }

  // Get Fear & Greed Index history
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

  // Get cross-asset analysis data
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

        // Calculate correlations (simplified version)
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

  // Scheduled update of core data
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

  // Temporarily disable scheduled updates to avoid API limits
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

  // Simplified correlation calculation
  private calculateCorrelations(tokens: any[]) {
    // More complex correlation calculation logic can be implemented here
    // Currently returns mock data
    return {
      BTC: { ETH: 0.82, SOL: 0.74, SPX: 0.42, GOLD: 0.18 },
      ETH: { BTC: 0.82, SOL: 0.88, SPX: 0.38, GOLD: 0.12 },
      SOL: { BTC: 0.74, ETH: 0.88, SPX: 0.35, GOLD: 0.08 },
    };
  }

  // Health check
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