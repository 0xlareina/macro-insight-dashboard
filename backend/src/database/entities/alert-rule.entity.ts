// CryptoSense Dashboard - Alert Rule Entity
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { AlertHistory } from './alert-history.entity';

export enum AlertType {
  PRICE_ABOVE = 'price_above',
  PRICE_BELOW = 'price_below',
  PRICE_CHANGE = 'price_change',
  VOLUME_SPIKE = 'volume_spike',
  FUNDING_RATE = 'funding_rate',
  LIQUIDATION = 'liquidation',
  SENTIMENT = 'sentiment',
  ETF_FLOW = 'etf_flow',
  CROSS_ASSET = 'cross_asset',
  TECHNICAL_INDICATOR = 'technical_indicator',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum NotificationMethod {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBHOOK = 'webhook',
}

@Entity('alert_rules')
@Index(['userId', 'isActive'])
@Index(['symbol', 'alertType'])
export class AlertRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ length: 10 })
  symbol: string; // BTC, ETH, SOL, USDT, etc.

  @Column({
    type: 'enum',
    enum: AlertType,
  })
  alertType: AlertType;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: AlertSeverity,
    default: AlertSeverity.MEDIUM,
  })
  severity: AlertSeverity;

  @Column({ type: 'jsonb' })
  conditions: {
    threshold?: number;
    comparison?: 'above' | 'below' | 'equal';
    timeframe?: string;
    percentage?: number;
    indicator?: string;
    parameters?: Record<string, any>;
  };

  @Column({
    type: 'enum',
    enum: NotificationMethod,
    array: true,
    default: [NotificationMethod.EMAIL],
  })
  notificationMethods: NotificationMethod[];

  @Column({ type: 'jsonb', nullable: true })
  notificationConfig?: {
    email?: string;
    phoneNumber?: string;
    webhookUrl?: string;
    pushToken?: string;
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isOneTime: boolean; // If true, disable after first trigger

  @Column({ type: 'int', default: 0 })
  triggerCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastTriggeredAt?: Date;

  @Column({ type: 'int', default: 0 })
  cooldownMinutes: number; // Minimum time between triggers

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.alertRules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => AlertHistory, (alertHistory) => alertHistory.alertRule)
  history: AlertHistory[];

  // Virtual fields
  get isInCooldown(): boolean {
    if (!this.lastTriggeredAt || this.cooldownMinutes === 0) {
      return false;
    }

    const cooldownEnd = new Date(this.lastTriggeredAt);
    cooldownEnd.setMinutes(cooldownEnd.getMinutes() + this.cooldownMinutes);
    
    return new Date() < cooldownEnd;
  }

  get shouldTrigger(): boolean {
    return this.isActive && !this.isInCooldown;
  }
}