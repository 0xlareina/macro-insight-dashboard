// CryptoSense Dashboard - Alert History Entity
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { AlertRule } from './alert-rule.entity';
import { AlertSeverity, NotificationMethod } from './alert-rule.entity';

export enum AlertStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  ACKNOWLEDGED = 'acknowledged',
  DISMISSED = 'dismissed',
}

@Entity('alert_history')
@Index(['userId', 'createdAt'])
@Index(['alertRuleId', 'createdAt'])
@Index(['status', 'createdAt'])
export class AlertHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  alertRuleId?: string;

  @Column({ length: 10 })
  symbol: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: AlertSeverity,
    default: AlertSeverity.MEDIUM,
  })
  severity: AlertSeverity;

  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.PENDING,
  })
  status: AlertStatus;

  @Column({
    type: 'enum',
    enum: NotificationMethod,
    array: true,
    default: [],
  })
  notificationMethods: NotificationMethod[];

  @Column({ type: 'jsonb', nullable: true })
  triggerData?: {
    currentValue?: number;
    threshold?: number;
    percentage?: number;
    priceChange?: number;
    volume?: number;
    indicator?: string;
    raw?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  deliveryStatus?: {
    email?: {
      status: 'sent' | 'failed';
      timestamp: Date;
      error?: string;
    };
    sms?: {
      status: 'sent' | 'failed';
      timestamp: Date;
      error?: string;
    };
    push?: {
      status: 'sent' | 'failed';
      timestamp: Date;
      error?: string;
    };
    webhook?: {
      status: 'sent' | 'failed';
      timestamp: Date;
      statusCode?: number;
      error?: string;
    };
  };

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  dismissedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.alertHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => AlertRule, (alertRule) => alertRule.history, { 
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'alertRuleId' })
  alertRule?: AlertRule;

  // Virtual fields
  get isDelivered(): boolean {
    return this.status === AlertStatus.SENT;
  }

  get isAcknowledged(): boolean {
    return this.status === AlertStatus.ACKNOWLEDGED;
  }

  get isDismissed(): boolean {
    return this.status === AlertStatus.DISMISSED;
  }

  get isPending(): boolean {
    return this.status === AlertStatus.PENDING;
  }

  get deliveryFailures(): string[] {
    if (!this.deliveryStatus) return [];
    
    const failures: string[] = [];
    
    Object.entries(this.deliveryStatus).forEach(([method, status]) => {
      if (status.status === 'failed') {
        failures.push(method);
      }
    });
    
    return failures;
  }
}