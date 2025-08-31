import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class FearGreedService {
  private readonly logger = new Logger(FearGreedService.name);
  private readonly baseUrl = 'https://api.alternative.me/fng';
  private cachedData: any = null;
  private lastUpdate: Date = null;
  
  constructor(private readonly httpService: HttpService) {}

  // Get current Fear & Greed Index
  async getCurrentIndex() {
    try {
      // Use cached data (if within 1 hour)
      if (this.cachedData && this.lastUpdate) {
        const hourAgo = new Date(Date.now() - 3600000);
        if (this.lastUpdate > hourAgo) {
          return this.cachedData;
        }
      }

      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/?limit=1`),
      );
      
      const current = data.data[0];
      const result = {
        value: parseInt(current.value),
        classification: current.value_classification,
        timestamp: current.timestamp,
        timeUntilUpdate: current.time_until_update,
        lastUpdate: new Date().toISOString(),
      };

      // Update cache
      this.cachedData = result;
      this.lastUpdate = new Date();

      return result;
    } catch (error) {
      this.logger.error('Failed to fetch Fear & Greed Index', error);
      return this.getMockCurrentIndex();
    }
  }

  // Get historical data
  async getHistoricalData(days: number = 30) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/?limit=${days}`),
      );
      
      return data.data.map(item => ({
        value: parseInt(item.value),
        classification: item.value_classification,
        timestamp: item.timestamp,
        date: new Date(parseInt(item.timestamp) * 1000).toISOString(),
      }));
    } catch (error) {
      this.logger.error('Failed to fetch historical Fear & Greed data', error);
      return this.getMockHistoricalData(days);
    }
  }

  // Analyze index changes
  async analyzeIndexChange() {
    try {
      const history = await this.getHistoricalData(7);
      
      if (history.length < 2) {
        return null;
      }

      const current = history[0].value;
      const yesterday = history[1].value;
      const weekAgo = history[Math.min(6, history.length - 1)].value;
      
      return {
        current,
        change24h: current - yesterday,
        change7d: current - weekAgo,
        trend: this.calculateTrend(history),
        volatility: this.calculateVolatility(history),
        extremeZone: this.getExtremeZone(current),
        recommendation: this.getRecommendation(current, history),
      };
    } catch (error) {
      this.logger.error('Failed to analyze index change', error);
      return null;
    }
  }

  // Calculate trend
  private calculateTrend(history: any[]): string {
    if (history.length < 3) return 'neutral';
    
    const recent = history.slice(0, 3).map(h => h.value);
    const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
    const older = history.slice(3, 6).map(h => h.value);
    const avgOlder = older.reduce((a, b) => a + b, 0) / older.length;
    
    if (avgRecent > avgOlder + 5) return 'increasing';
    if (avgRecent < avgOlder - 5) return 'decreasing';
    return 'neutral';
  }

  // Calculate volatility
  private calculateVolatility(history: any[]): number {
    if (history.length < 2) return 0;
    
    const values = history.map(h => h.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  // Get extreme zones
  private getExtremeZone(value: number): string | null {
    if (value <= 20) return 'extreme_fear';
    if (value >= 80) return 'extreme_greed';
    return null;
  }

  // Get trading suggestions
  private getRecommendation(current: number, history: any[]): string {
    const trend = this.calculateTrend(history);
    
    if (current <= 20) {
      return 'Extreme fear - Potential buying opportunity';
    } else if (current >= 80) {
      return 'Extreme greed - Consider taking profits';
    } else if (current <= 30 && trend === 'increasing') {
      return 'Fear with improving sentiment - Accumulation zone';
    } else if (current >= 70 && trend === 'decreasing') {
      return 'Greed with weakening sentiment - Caution advised';
    } else if (current >= 40 && current <= 60) {
      return 'Neutral sentiment - Wait for clearer signals';
    }
    
    return 'Monitor market conditions';
  }

  // 定时Update cache
  @Cron(CronExpression.EVERY_HOUR)
  async updateCache() {
    try {
      await this.getCurrentIndex();
      this.logger.log('Fear & Greed Index cache updated');
    } catch (error) {
      this.logger.error('Failed to update Fear & Greed cache', error);
    }
  }

  // Mock data
  private getMockCurrentIndex() {
    return {
      value: 72,
      classification: 'Greed',
      timestamp: Date.now(),
      timeUntilUpdate: 3600,
      lastUpdate: new Date().toISOString(),
    };
  }

  private getMockHistoricalData(days: number) {
    const data = [];
    const classifications = ['Extreme Fear', 'Fear', 'Neutral', 'Greed', 'Extreme Greed'];
    
    for (let i = 0; i < days; i++) {
      const value = Math.floor(Math.random() * 40) + 40; // 40-80 range
      data.push({
        value,
        classification: classifications[Math.floor(value / 20)],
        timestamp: Date.now() - i * 86400000,
        date: new Date(Date.now() - i * 86400000).toISOString(),
      });
    }
    
    return data;
  }
}