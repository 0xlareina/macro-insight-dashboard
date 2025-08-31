// CryptoSense Dashboard - Funding Rate Entity
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('funding_rates')
@Index(['symbol', 'exchange', 'timestamp'])
@Index(['timestamp'])
@Index(['symbol', 'timestamp'])
export class FundingRate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 10 })
  symbol: string; // BTC, ETH, SOL

  @Column({ length: 20 })
  exchange: string; // binance, coinbase, bybit, etc.

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  fundingRate: number; // Current funding rate (e.g., 0.0001 = 0.01%)

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  predictedFundingRate?: number; // Next funding rate prediction

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  markPrice: number; // Mark price used for funding

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  indexPrice?: number; // Index price

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  premiumIndex?: number; // Premium index

  @Column({ type: 'timestamp' })
  fundingTime: Date; // When this funding rate applies

  @Column({ type: 'timestamp' })
  nextFundingTime: Date; // Next funding time

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  openInterest?: number; // Open interest value

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  openInterestValue?: number; // Open interest in USD

  @Column({ type: 'int', nullable: true })
  openInterestCount?: number; // Number of open positions

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  longShortRatio?: number; // Ratio of long to short positions

  @Column({ type: 'jsonb', nullable: true })
  historicalRates?: {
    '1h': number[];
    '8h': number[];
    '1d': number[];
    '7d': number[];
    '30d': number[];
  };

  @Column({ type: 'jsonb', nullable: true })
  analytics?: {
    annualizedRate?: number; // Funding rate * frequency * 365
    volatility?: number;
    trend?: 'bullish' | 'bearish' | 'neutral';
    extremeLevel?: 'normal' | 'high' | 'extreme';
    arbitrageOpportunity?: boolean;
  };

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Virtual fields
  get fundingRatePercent(): number {
    return this.fundingRate * 100;
  }

  get annualizedRatePercent(): number {
    // Assuming 8-hour funding intervals (3 times per day)
    return this.fundingRate * 3 * 365 * 100;
  }

  get isHighFundingRate(): boolean {
    return Math.abs(this.fundingRate) > 0.001; // > 0.1%
  }

  get isExtremeFundingRate(): boolean {
    return Math.abs(this.fundingRate) > 0.005; // > 0.5%
  }

  get fundingDirection(): 'long_pays' | 'short_pays' | 'neutral' {
    if (this.fundingRate > 0.0001) return 'long_pays';
    if (this.fundingRate < -0.0001) return 'short_pays';
    return 'neutral';
  }

  get timeToNextFunding(): number {
    return this.nextFundingTime.getTime() - Date.now();
  }

  get hoursToNextFunding(): number {
    return Math.max(0, this.timeToNextFunding / (1000 * 60 * 60));
  }

  get premiumToIndex(): number | null {
    if (!this.indexPrice) return null;
    return ((this.markPrice - this.indexPrice) / this.indexPrice) * 100;
  }

  isArbitrageOpportunity(): boolean {
    return this.isHighFundingRate || this.analytics?.arbitrageOpportunity === true;
  }

  getArbitrageStrategy(): string | null {
    if (!this.isArbitrageOpportunity()) return null;
    
    if (this.fundingRate > 0.005) {
      return 'Short perpetual, Long spot';
    } else if (this.fundingRate < -0.005) {
      return 'Long perpetual, Short spot';
    }
    
    return null;
  }

  getRiskLevel(): 'low' | 'medium' | 'high' | 'extreme' {
    const absRate = Math.abs(this.fundingRate);
    
    if (absRate > 0.01) return 'extreme'; // > 1%
    if (absRate > 0.005) return 'high';   // > 0.5%
    if (absRate > 0.001) return 'medium'; // > 0.1%
    return 'low';
  }

  calculateHistoricalAverage(period: '1h' | '8h' | '1d' | '7d' | '30d'): number | null {
    const rates = this.historicalRates?.[period];
    if (!rates || rates.length === 0) return null;
    
    return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  }

  isAboveAverage(period: '1h' | '8h' | '1d' | '7d' | '30d' = '7d'): boolean | null {
    const average = this.calculateHistoricalAverage(period);
    if (average === null) return null;
    
    return this.fundingRate > average;
  }
}