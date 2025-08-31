// CryptoSense Dashboard - Notification Service
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

// Entities
import {
  AlertRule,
  AlertType,
  AlertSeverity,
  NotificationMethod,
} from '../../database/entities/alert-rule.entity';
import {
  AlertHistory,
  AlertStatus,
} from '../../database/entities/alert-history.entity';
import { User } from '../../database/entities/user.entity';
import { UserPreferences } from '../../database/entities/user-preferences.entity';

// Services
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { PushService } from './services/push.service';
import { WebhookService } from './services/webhook.service';

// Interfaces
export interface AlertTriggerData {
  symbol: string;
  alertType: AlertType;
  currentValue: number;
  threshold?: number;
  percentage?: number;
  priceChange?: number;
  volume?: number;
  indicator?: string;
  raw?: Record<string, any>;
}

export interface NotificationResult {
  success: boolean;
  method: NotificationMethod;
  error?: string;
  deliveredAt?: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(AlertRule)
    private readonly alertRuleRepository: Repository<AlertRule>,

    @InjectRepository(AlertHistory)
    private readonly alertHistoryRepository: Repository<AlertHistory>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserPreferences)
    private readonly preferencesRepository: Repository<UserPreferences>,

    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushService,
    private readonly webhookService: WebhookService,
  ) {}

  async processAlert(
    alertRule: AlertRule,
    triggerData: AlertTriggerData,
  ): Promise<AlertHistory> {
    this.logger.log(
      `Processing alert: ${alertRule.name} for ${triggerData.symbol}`,
    );

    // Check if alert should trigger (cooldown, one-time, etc.)
    if (!alertRule.shouldTrigger) {
      this.logger.debug(`Alert ${alertRule.id} is in cooldown or inactive`);
      return null;
    }

    // Create alert history entry
    const alertHistory = this.alertHistoryRepository.create({
      userId: alertRule.userId,
      alertRuleId: alertRule.id,
      symbol: triggerData.symbol,
      title: this.generateAlertTitle(alertRule, triggerData),
      message: this.generateAlertMessage(alertRule, triggerData),
      severity: alertRule.severity,
      status: AlertStatus.PENDING,
      notificationMethods: alertRule.notificationMethods,
      triggerData,
    });

    const savedAlert = await this.alertHistoryRepository.save(alertHistory);

    // Update alert rule statistics
    alertRule.triggerCount += 1;
    alertRule.lastTriggeredAt = new Date();

    // Disable if one-time alert
    if (alertRule.isOneTime) {
      alertRule.isActive = false;
    }

    await this.alertRuleRepository.save(alertRule);

    // Send notifications asynchronously
    this.sendNotifications(alertRule, savedAlert).catch((error) => {
      this.logger.error(
        `Failed to send notifications for alert ${savedAlert.id}:`,
        error,
      );
    });

    return savedAlert;
  }

  async sendNotifications(
    alertRule: AlertRule,
    alertHistory: AlertHistory,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: alertRule.userId },
      relations: ['preferences'],
    });

    if (!user) {
      this.logger.error(`User ${alertRule.userId} not found for alert`);
      return;
    }

    const deliveryStatus = {};
    const notificationPromises = [];

    for (const method of alertRule.notificationMethods) {
      try {
        let promise: Promise<NotificationResult>;

        switch (method) {
          case NotificationMethod.EMAIL:
            promise = this.sendEmailNotification(user, alertHistory);
            break;

          case NotificationMethod.SMS:
            promise = this.sendSmsNotification(user, alertHistory, alertRule);
            break;

          case NotificationMethod.PUSH:
            promise = this.sendPushNotification(user, alertHistory);
            break;

          case NotificationMethod.WEBHOOK:
            promise = this.sendWebhookNotification(user, alertHistory, alertRule);
            break;

          default:
            this.logger.warn(`Unknown notification method: ${method}`);
            continue;
        }

        notificationPromises.push(
          promise.then((result) => {
            deliveryStatus[method] = {
              status: result.success ? 'sent' : 'failed',
              timestamp: result.deliveredAt || new Date(),
              error: result.error,
            };
          }).catch((error) => {
            deliveryStatus[method] = {
              status: 'failed',
              timestamp: new Date(),
              error: error.message,
            };
          }),
        );
      } catch (error) {
        this.logger.error(
          `Error setting up ${method} notification:`,
          error,
        );
        deliveryStatus[method] = {
          status: 'failed',
          timestamp: new Date(),
          error: error.message,
        };
      }
    }

    // Wait for all notifications to complete
    await Promise.allSettled(notificationPromises);

    // Update alert history with delivery status
    alertHistory.deliveryStatus = deliveryStatus;
    alertHistory.status = Object.values(deliveryStatus).some(
      (status: any) => status.status === 'sent',
    )
      ? AlertStatus.SENT
      : AlertStatus.FAILED;

    if (alertHistory.status === AlertStatus.SENT) {
      alertHistory.sentAt = new Date();
    }

    await this.alertHistoryRepository.save(alertHistory);

    this.logger.log(
      `Notifications sent for alert ${alertHistory.id}. Status: ${alertHistory.status}`,
    );
  }

  private async sendEmailNotification(
    user: User,
    alertHistory: AlertHistory,
  ): Promise<NotificationResult> {
    try {
      await this.emailService.sendAlertEmail(user, alertHistory);
      return {
        success: true,
        method: NotificationMethod.EMAIL,
        deliveredAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        method: NotificationMethod.EMAIL,
        error: error.message,
      };
    }
  }

  private async sendSmsNotification(
    user: User,
    alertHistory: AlertHistory,
    alertRule: AlertRule,
  ): Promise<NotificationResult> {
    try {
      const phoneNumber = alertRule.notificationConfig?.phoneNumber || 
                         user.preferences?.notificationPreferences?.sms?.phoneNumber;

      if (!phoneNumber) {
        throw new Error('No phone number configured for SMS notifications');
      }

      await this.smsService.sendAlertSms(phoneNumber, alertHistory);
      return {
        success: true,
        method: NotificationMethod.SMS,
        deliveredAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        method: NotificationMethod.SMS,
        error: error.message,
      };
    }
  }

  private async sendPushNotification(
    user: User,
    alertHistory: AlertHistory,
  ): Promise<NotificationResult> {
    try {
      const pushTokens = user.preferences?.notificationPreferences?.push?.tokens || [];

      if (pushTokens.length === 0) {
        throw new Error('No push tokens configured for push notifications');
      }

      await this.pushService.sendAlertPush(pushTokens, alertHistory);
      return {
        success: true,
        method: NotificationMethod.PUSH,
        deliveredAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        method: NotificationMethod.PUSH,
        error: error.message,
      };
    }
  }

  private async sendWebhookNotification(
    user: User,
    alertHistory: AlertHistory,
    alertRule: AlertRule,
  ): Promise<NotificationResult> {
    try {
      const webhookUrl = alertRule.notificationConfig?.webhookUrl || 
                        user.preferences?.notificationPreferences?.webhook?.url;

      if (!webhookUrl) {
        throw new Error('No webhook URL configured for webhook notifications');
      }

      const secret = alertRule.notificationConfig?.webhookUrl || 
                    user.preferences?.notificationPreferences?.webhook?.secret;

      await this.webhookService.sendAlertWebhook(webhookUrl, alertHistory, secret);
      return {
        success: true,
        method: NotificationMethod.WEBHOOK,
        deliveredAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        method: NotificationMethod.WEBHOOK,
        error: error.message,
      };
    }
  }

  private generateAlertTitle(
    alertRule: AlertRule,
    triggerData: AlertTriggerData,
  ): string {
    const { symbol, alertType, currentValue, threshold } = triggerData;

    switch (alertType) {
      case AlertType.PRICE_ABOVE:
        return `${symbol} Price Alert: Above $${threshold}`;

      case AlertType.PRICE_BELOW:
        return `${symbol} Price Alert: Below $${threshold}`;

      case AlertType.PRICE_CHANGE:
        return `${symbol} Price Movement: ${triggerData.percentage}% change`;

      case AlertType.VOLUME_SPIKE:
        return `${symbol} Volume Spike Detected`;

      case AlertType.FUNDING_RATE:
        return `${symbol} Funding Rate Alert`;

      case AlertType.LIQUIDATION:
        return `${symbol} Large Liquidation Detected`;

      case AlertType.SENTIMENT:
        return `${symbol} Sentiment Alert`;

      case AlertType.ETF_FLOW:
        return `${symbol} ETF Flow Alert`;

      case AlertType.TECHNICAL_INDICATOR:
        return `${symbol} Technical Indicator: ${triggerData.indicator}`;

      default:
        return `${symbol} Alert: ${alertRule.name}`;
    }
  }

  private generateAlertMessage(
    alertRule: AlertRule,
    triggerData: AlertTriggerData,
  ): string {
    const { symbol, alertType, currentValue, threshold, percentage } = triggerData;

    let message = `Alert: ${alertRule.name}\n\n`;

    switch (alertType) {
      case AlertType.PRICE_ABOVE:
        message += `${symbol} price is now $${currentValue.toLocaleString()}, above your threshold of $${threshold?.toLocaleString()}.`;
        break;

      case AlertType.PRICE_BELOW:
        message += `${symbol} price is now $${currentValue.toLocaleString()}, below your threshold of $${threshold?.toLocaleString()}.`;
        break;

      case AlertType.PRICE_CHANGE:
        message += `${symbol} price has changed by ${percentage}% to $${currentValue.toLocaleString()}.`;
        break;

      case AlertType.VOLUME_SPIKE:
        message += `${symbol} is experiencing unusual volume: ${triggerData.volume?.toLocaleString()} (${percentage}% increase).`;
        break;

      case AlertType.FUNDING_RATE:
        message += `${symbol} funding rate is now ${(currentValue * 100).toFixed(4)}% (${percentage}% APR).`;
        break;

      case AlertType.LIQUIDATION:
        message += `Large ${symbol} liquidation detected: $${currentValue.toLocaleString()} at $${triggerData.priceChange}.`;
        break;

      case AlertType.TECHNICAL_INDICATOR:
        message += `${symbol} ${triggerData.indicator} signal triggered. Current value: ${currentValue}.`;
        break;

      default:
        message += `${symbol} alert triggered. Current value: ${currentValue}.`;
    }

    message += `\n\nTriggered at: ${new Date().toLocaleString()}`;
    
    if (alertRule.description) {
      message += `\n\nAlert Description: ${alertRule.description}`;
    }

    return message;
  }

  // Scheduled task to clean up old alerts
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldAlerts() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.alertHistoryRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :date', { date: thirtyDaysAgo })
      .execute();

    this.logger.log(`Cleaned up ${result.affected} old alert records`);
  }

  // Get alert statistics for a user
  async getAlertStats(userId: string): Promise<any> {
    const stats = await this.alertHistoryRepository
      .createQueryBuilder('alert')
      .select([
        'COUNT(*) as total',
        'COUNT(CASE WHEN alert.status = :sent THEN 1 END) as sent',
        'COUNT(CASE WHEN alert.status = :failed THEN 1 END) as failed',
        'COUNT(CASE WHEN alert.severity = :critical THEN 1 END) as critical',
        'COUNT(CASE WHEN alert.severity = :high THEN 1 END) as high',
      ])
      .where('alert.userId = :userId', { userId })
      .andWhere('alert.createdAt >= :since', { 
        since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      })
      .setParameters({
        sent: AlertStatus.SENT,
        failed: AlertStatus.FAILED,
        critical: AlertSeverity.CRITICAL,
        high: AlertSeverity.HIGH,
      })
      .getRawOne();

    return {
      total: parseInt(stats.total),
      sent: parseInt(stats.sent),
      failed: parseInt(stats.failed),
      critical: parseInt(stats.critical),
      high: parseInt(stats.high),
      successRate: stats.total > 0 ? (stats.sent / stats.total) * 100 : 0,
    };
  }
}