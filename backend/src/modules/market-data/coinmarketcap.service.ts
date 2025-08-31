import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CoinMarketCapService {
  private readonly logger = new Logger(CoinMarketCapService.name);
  private readonly baseUrl = 'https://pro-api.coinmarketcap.com/v3';
  private readonly apiKey = this.configService.get<string>('COINMARKETCAP_API_KEY');
  
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // Get CoinMarketCap Fear & Greed Index
  async getFearGreedIndex() {
    try {
      // If no API key, return fallback data directly
      if (!this.apiKey) {
        this.logger.warn('CoinMarketCap API key not provided, using fallback data');
        return this.getFallbackFearGreedIndex();
      }

      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/fear-and-greed/latest`, {
          headers: {
            'X-CMC_PRO_API_KEY': this.apiKey,
            'Accept': 'application/json',
          },
        }),
      );
      
      if (data && data.data && data.data.length > 0) {
        const latestData = data.data[0];
        return {
          value: Math.round(latestData.value),
          classification: this.getClassification(latestData.value),
          timestamp: latestData.timestamp,
          source: 'CoinMarketCap',
          lastUpdate: new Date().toISOString(),
        };
      }
      
      throw new Error('No data available');
    } catch (error) {
      this.logger.error('Failed to fetch CoinMarketCap Fear & Greed Index', error);
      // If CoinMarketCap API fails, return fallback data
      return this.getFallbackFearGreedIndex();
    }
  }

  // Get historical Fear & Greed Index
  async getFearGreedHistory(days: number = 7) {
    try {
      // If no API key, return fallback data directly
      if (!this.apiKey) {
        this.logger.warn('CoinMarketCap API key not provided, using fallback historical data');
        return this.getFallbackHistoricalData(days);
      }

      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/fear-and-greed/historical`, {
          headers: {
            'X-CMC_PRO_API_KEY': this.apiKey,
            'Accept': 'application/json',
          },
          params: {
            limit: days,
          },
        }),
      );
      
      if (data && data.data && data.data.length > 0) {
        return data.data.slice(0, days).map(item => ({
          date: new Date(item.timestamp).toISOString().split('T')[0],
          value: Math.round(item.value),
          classification: this.getClassification(item.value),
        }));
      }
      
      throw new Error('No historical data available');
    } catch (error) {
      this.logger.error('Failed to fetch CoinMarketCap Fear & Greed history', error);
      // Return fallback historical data
      return this.getFallbackHistoricalData(days);
    }
  }

  // Get classification based on value
  private getClassification(value: number): string {
    if (value <= 25) return 'Extreme Fear';
    if (value <= 45) return 'Fear';
    if (value <= 55) return 'Neutral';
    if (value <= 75) return 'Greed';
    return 'Extreme Greed';
  }

  // Fallback data - when CoinMarketCap API is unavailable
  private getFallbackFearGreedIndex() {
    // Try to get from other sources or use default values
    return {
      value: 50,
      classification: 'Neutral',
      timestamp: Date.now(),
      source: 'Fallback',
      lastUpdate: new Date().toISOString(),
    };
  }

  // Fallback historical data
  private getFallbackHistoricalData(days: number) {
    const data = [];
    const baseValue = 50;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      // Simulate some volatility
      const randomFactor = Math.sin(i * 0.5) * 20 + baseValue;
      const value = Math.round(Math.max(0, Math.min(100, randomFactor)));
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: value,
        classification: this.getClassification(value),
      });
    }
    
    return data;
  }

  // Get detailed market sentiment data
  async getMarketSentimentDetails() {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/fear-greed/latest`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CryptoSense Dashboard/1.0',
          }
        }),
      );
      
      if (data && data.data) {
        return {
          currentValue: data.data.value,
          classification: data.data.valueClassification,
          components: {
            volatility: data.data.volatility || null,
            marketMomentum: data.data.marketMomentum || null,
            socialMedia: data.data.socialMedia || null,
            surveys: data.data.surveys || null,
            dominance: data.data.dominance || null,
            trends: data.data.trends || null,
          },
          updateTime: data.data.updateTime,
          nextUpdate: data.data.nextUpdate,
        };
      }
      
      return null;
    } catch (error) {
      this.logger.error('Failed to fetch market sentiment details', error);
      return null;
    }
  }
}