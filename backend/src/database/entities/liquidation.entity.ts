// CryptoSense Dashboard - Liquidation Entity
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum LiquidationSide {
  LONG = 'long',
  SHORT = 'short',
}

export enum LiquidationStatus {
  PENDING = 'pending',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  PARTIAL = 'partial',
}

@Entity('liquidations')
@Index(['symbol', 'timestamp'])
@Index(['exchange', 'timestamp'])
@Index(['side', 'timestamp'])
@Index(['totalValue', 'timestamp'])
@Index(['timestamp'])
export class Liquidation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, nullable: true })
  exchangeId?: string; // Original liquidation ID from exchange

  @Column({ length: 10 })
  symbol: string; // BTC, ETH, SOL

  @Column({ length: 20 })
  exchange: string; // binance, coinbase, bybit, etc.

  @Column({
    type: 'enum',
    enum: LiquidationSide,
  })
  side: LiquidationSide; // long or short

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  price: number; // Liquidation price

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  quantity: number; // Liquidated quantity

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  totalValue: number; // Total liquidation value in USD

  @Column({
    type: 'enum',
    enum: LiquidationStatus,
    default: LiquidationStatus.FILLED,
  })
  status: LiquidationStatus;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  averagePrice?: number; // Average execution price

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  fee?: number; // Liquidation fee

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  insurance?: number; // Insurance fund contribution

  @Column({ type: 'jsonb', nullable: true })
  orderInfo?: {
    orderId?: string;
    clientOrderId?: string;
    reduceOnly?: boolean;
    timeInForce?: string;
    executedQty?: number;
    cummulativeQuoteQty?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  positionInfo?: {
    markPrice?: number;
    entryPrice?: number;
    marginRatio?: number;
    leverage?: number;
    unrealizedPnl?: number;
    marginType?: 'isolated' | 'cross';
  };

  @Column({ type: 'jsonb', nullable: true })
  marketData?: {
    indexPrice?: number;
    fundingRate?: number;
    openInterest?: number;
    volume24h?: number;
    priceChange24h?: number;
  };

  @Column({ type: 'timestamp' })
  timestamp: Date; // When liquidation occurred

  @CreateDateColumn()
  createdAt: Date;

  // Virtual fields
  get sizeCategory(): 'small' | 'medium' | 'large' | 'whale' {
    if (this.totalValue >= 10000000) return 'whale';    // >= $10M
    if (this.totalValue >= 1000000) return 'large';     // >= $1M
    if (this.totalValue >= 100000) return 'medium';     // >= $100K
    return 'small';                                      // < $100K
  }

  get isLargeLiquidation(): boolean {
    return this.totalValue >= 1000000; // >= $1M
  }

  get isWhaleLiquidation(): boolean {
    return this.totalValue >= 10000000; // >= $10M
  }

  get executionEfficiency(): number | null {
    if (!this.averagePrice) return null;
    return Math.abs((this.averagePrice - this.price) / this.price) * 100;
  }

  get priceImpact(): number | null {
    if (!this.positionInfo?.markPrice) return null;
    return Math.abs((this.price - this.positionInfo.markPrice) / this.positionInfo.markPrice) * 100;
  }

  get leverage(): number | null {
    return this.positionInfo?.leverage || null;
  }

  get marginRatio(): number | null {
    return this.positionInfo?.marginRatio || null;
  }

  get pnl(): number | null {
    return this.positionInfo?.unrealizedPnl || null;
  }

  get riskLevel(): 'low' | 'medium' | 'high' | 'critical' {
    if (this.totalValue >= 10000000) return 'critical'; // Whale liquidation
    if (this.totalValue >= 1000000) return 'high';      // Large liquidation
    if (this.totalValue >= 100000) return 'medium';     // Medium liquidation
    return 'low';                                        // Small liquidation
  }

  getSeverityScore(): number {
    let score = 0;
    
    // Size factor (0-40 points)
    const sizeScore = Math.min(40, (this.totalValue / 1000000) * 10);
    score += sizeScore;
    
    // Leverage factor (0-20 points)
    if (this.leverage) {
      const leverageScore = Math.min(20, (this.leverage - 1) * 2);
      score += leverageScore;
    }
    
    // Price impact factor (0-20 points)
    const impact = this.priceImpact;
    if (impact) {
      const impactScore = Math.min(20, impact * 4);
      score += impactScore;
    }
    
    // Market conditions factor (0-20 points)
    if (this.marketData?.priceChange24h) {
      const volatilityScore = Math.min(20, Math.abs(this.marketData.priceChange24h) * 2);
      score += volatilityScore;
    }
    
    return Math.min(100, score);
  }

  getMarketSentiment(): 'bullish' | 'bearish' | 'neutral' {
    // More long liquidations = bearish sentiment (price falling)
    // More short liquidations = bullish sentiment (price rising)
    if (this.side === LiquidationSide.LONG) return 'bearish';
    if (this.side === LiquidationSide.SHORT) return 'bullish';
    return 'neutral';
  }

  isRecentLiquidation(minutes: number = 5): boolean {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.timestamp > cutoff;
  }

  getAgeInMinutes(): number {
    return Math.floor((Date.now() - this.timestamp.getTime()) / (1000 * 60));
  }

  toAlertMessage(): string {
    const direction = this.side.toUpperCase();
    const size = this.sizeCategory.toUpperCase();
    const value = this.totalValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    return `${size} ${direction} liquidation: ${this.symbol} ${value} at $${this.price.toLocaleString()}`;
  }
}