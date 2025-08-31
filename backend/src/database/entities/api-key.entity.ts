// CryptoSense Dashboard - API Key Entity
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from './user.entity';

export enum ApiKeyType {
  BINANCE = 'binance',
  COINBASE = 'coinbase',
  BYBIT = 'bybit',
  OKX = 'okx',
  CUSTOM = 'custom',
}

export enum ApiKeyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

@Entity('api_keys')
@Index(['userId', 'type'])
@Index(['keyHash'], { unique: true })
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ApiKeyType,
  })
  type: ApiKeyType;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text' })
  @Exclude()
  keyHash: string; // Encrypted API key

  @Column({ type: 'text', nullable: true })
  @Exclude()
  secretHash?: string; // Encrypted API secret

  @Column({ type: 'text', nullable: true })
  @Exclude()
  passphraseHash?: string; // Encrypted passphrase for some exchanges

  @Column({
    type: 'enum',
    enum: ApiKeyStatus,
    default: ApiKeyStatus.ACTIVE,
  })
  status: ApiKeyStatus;

  @Column({ type: 'varchar', array: true, default: [] })
  permissions: string[]; // ['spot', 'futures', 'read', 'trade']

  @Column({ type: 'boolean', default: false })
  isTestNet: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'jsonb', nullable: true })
  rateLimits?: {
    requestsPerSecond?: number;
    requestsPerMinute?: number;
    requestsPerHour?: number;
    dailyLimit?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  restrictions?: {
    ipWhitelist?: string[];
    allowedSymbols?: string[];
    maxOrderSize?: number;
    tradingEnabled?: boolean;
    withdrawalEnabled?: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  lastError?: {
    message: string;
    code?: string;
    timestamp: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.apiKeys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Virtual fields
  get isActive(): boolean {
    return this.status === ApiKeyStatus.ACTIVE && !this.isExpired;
  }

  get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  get canTrade(): boolean {
    return (
      this.isActive &&
      this.permissions.includes('trade') &&
      this.restrictions?.tradingEnabled !== false
    );
  }

  get canWithdraw(): boolean {
    return (
      this.isActive &&
      this.permissions.includes('withdraw') &&
      this.restrictions?.withdrawalEnabled !== false
    );
  }

  get displayName(): string {
    return `${this.name} (${this.type.toUpperCase()})`;
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  isSymbolAllowed(symbol: string): boolean {
    if (!this.restrictions?.allowedSymbols) return true;
    return this.restrictions.allowedSymbols.includes(symbol);
  }

  updateUsage(): void {
    this.usageCount += 1;
    this.lastUsedAt = new Date();
  }

  recordError(error: string, code?: string): void {
    this.lastError = {
      message: error,
      code,
      timestamp: new Date(),
    };
  }
}