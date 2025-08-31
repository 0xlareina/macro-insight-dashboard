// CryptoSense Dashboard - User Preferences Entity
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
  SYSTEM = 'system',
}

export enum TimeZone {
  UTC = 'UTC',
  EST = 'America/New_York',
  PST = 'America/Los_Angeles',
  GMT = 'Europe/London',
  CET = 'Europe/Paris',
  JST = 'Asia/Tokyo',
  CST = 'Asia/Shanghai',
}

export enum Language {
  EN = 'en',
  ZH = 'zh',
  JA = 'ja',
  KO = 'ko',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
}

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @Column({
    type: 'enum',
    enum: Theme,
    default: Theme.DARK,
  })
  theme: Theme;

  @Column({
    type: 'enum',
    enum: TimeZone,
    default: TimeZone.UTC,
  })
  timeZone: TimeZone;

  @Column({
    type: 'enum',
    enum: Language,
    default: Language.EN,
  })
  language: Language;

  @Column({ type: 'varchar', array: true, default: ['BTC', 'ETH', 'SOL'] })
  watchlist: string[];

  @Column({ length: 10, default: 'BTC' })
  defaultAsset: string;

  @Column({ type: 'jsonb', default: {} })
  dashboardLayout: {
    panels?: string[];
    positions?: Record<string, { x: number; y: number; w: number; h: number }>;
    activeTab?: string;
  };

  @Column({ type: 'jsonb', default: {} })
  chartSettings: {
    defaultTimeframe?: string;
    indicators?: string[];
    chartType?: 'candlestick' | 'line' | 'area';
    showVolume?: boolean;
  };

  @Column({ type: 'jsonb', default: {} })
  notificationPreferences: {
    email?: {
      enabled: boolean;
      frequency: 'immediate' | 'hourly' | 'daily';
      types: string[];
    };
    sms?: {
      enabled: boolean;
      phoneNumber?: string;
      types: string[];
    };
    push?: {
      enabled: boolean;
      tokens: string[];
      types: string[];
    };
    webhook?: {
      enabled: boolean;
      url?: string;
      secret?: string;
      types: string[];
    };
  };

  @Column({ type: 'jsonb', default: {} })
  alertSettings: {
    maxAlertsPerHour?: number;
    defaultSeverity?: string;
    autoAcknowledge?: boolean;
    soundEnabled?: boolean;
    cooldownMinutes?: number;
  };

  @Column({ type: 'jsonb', default: {} })
  tradingSettings: {
    defaultExchange?: string;
    riskLevel?: 'conservative' | 'moderate' | 'aggressive';
    maxPositionSize?: number;
    stopLossPercentage?: number;
    takeProfitPercentage?: number;
  };

  @Column({ type: 'jsonb', default: {} })
  privacySettings: {
    shareData?: boolean;
    analyticsEnabled?: boolean;
    marketingEmails?: boolean;
    profileVisibility?: 'public' | 'private' | 'friends';
  };

  @Column({ type: 'jsonb', nullable: true })
  customSettings?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => User, (user) => user.preferences, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Helper methods
  isAssetInWatchlist(symbol: string): boolean {
    return this.watchlist.includes(symbol.toUpperCase());
  }

  addToWatchlist(symbol: string): void {
    const upperSymbol = symbol.toUpperCase();
    if (!this.watchlist.includes(upperSymbol)) {
      this.watchlist.push(upperSymbol);
    }
  }

  removeFromWatchlist(symbol: string): void {
    const upperSymbol = symbol.toUpperCase();
    this.watchlist = this.watchlist.filter(s => s !== upperSymbol);
  }

  isNotificationEnabled(method: string, type: string): boolean {
    const preferences = this.notificationPreferences[method];
    if (!preferences || !preferences.enabled) {
      return false;
    }
    return preferences.types?.includes(type) || false;
  }
}