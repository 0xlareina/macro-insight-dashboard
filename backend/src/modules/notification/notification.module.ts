// CryptoSense Dashboard - Notification Module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

// Controllers
import { NotificationController } from './notification.controller';

// Services
import { NotificationService } from './notification.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import { PushService } from './services/push.service';
import { WebhookService } from './services/webhook.service';

// Entities
import { AlertRule } from '../../database/entities/alert-rule.entity';
import { AlertHistory } from '../../database/entities/alert-history.entity';
import { User } from '../../database/entities/user.entity';
import { UserPreferences } from '../../database/entities/user-preferences.entity';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([
      AlertRule,
      AlertHistory,
      User,
      UserPreferences,
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    EmailService,
    SmsService,
    PushService,
    WebhookService,
  ],
  exports: [
    NotificationService,
    EmailService,
    SmsService,
    PushService,
    WebhookService,
  ],
})
export class NotificationModule {}