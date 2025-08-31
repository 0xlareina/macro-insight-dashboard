// CryptoSense Dashboard - Market Data Entity
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('market_data')
@Index(['symbol', 'timestamp'])
@Index(['exchange', 'symbol', 'timestamp'])
@Index(['timestamp'])
export class MarketData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 10 })
  symbol: string; // BTC, ETH, SOL

  @Column({ length: 20 })
  exchange: string; // binance, coinbase, etc.

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  price: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  volume24h: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  high24h: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  low24h: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  open24h?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  close24h?: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  change24h?: number; // Percentage change

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  marketCap?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  circulatingSupply?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  totalSupply?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  bidPrice?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  askPrice?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  bidQty?: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  askQty?: number;

  @Column({ type: 'int', nullable: true })
  tradeCount?: number;

  @Column({ type: 'jsonb', nullable: true })
  technicalIndicators?: {
    rsi?: number;
    macd?: {
      macd: number;
      signal: number;
      histogram: number;
    };
    sma20?: number;
    sma50?: number;
    sma200?: number;
    ema12?: number;
    ema26?: number;
    bollingerBands?: {
      upper: number;
      middle: number;
      lower: number;
    };
    stochastic?: {
      k: number;
      d: number;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  orderBook?: {
    bids: Array<[number, number]>; // [price, quantity]
    asks: Array<[number, number]>;
    lastUpdateId: number;
  };

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Virtual fields
  get spread(): number | null {
    if (!this.bidPrice || !this.askPrice) return null;
    return this.askPrice - this.bidPrice;
  }

  get spreadPercent(): number | null {
    if (!this.bidPrice || !this.askPrice) return null;
    return ((this.askPrice - this.bidPrice) / this.bidPrice) * 100;
  }

  get midPrice(): number | null {
    if (!this.bidPrice || !this.askPrice) return null;
    return (this.bidPrice + this.askPrice) / 2;
  }

  get priceChangePercent(): number | null {
    if (!this.open24h) return this.change24h || null;
    return ((this.price - this.open24h) / this.open24h) * 100;
  }

  get volumeWeightedPrice(): number | null {
    if (!this.volume24h || this.volume24h === 0) return null;
    // Simplified calculation - in practice would use more detailed trade data
    return ((this.high24h + this.low24h + this.price) / 3);
  }

  hasTechnicalIndicator(indicator: string): boolean {
    return !!(this.technicalIndicators && this.technicalIndicators[indicator]);
  }

  getTechnicalIndicator(indicator: string): any {
    return this.technicalIndicators?.[indicator];
  }

  isStale(maxAgeMinutes: number = 5): boolean {
    const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
    return (Date.now() - this.timestamp.getTime()) > maxAge;
  }
}