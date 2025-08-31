// CryptoSense Dashboard - Database Module
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { InfluxDBModule } from '@nestjs/influxdb';

// Entities
import { User } from './entities/user.entity';
import { AlertRule } from './entities/alert-rule.entity';
import { AlertHistory } from './entities/alert-history.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { ApiKey } from './entities/api-key.entity';
import { MarketData } from './entities/market-data.entity';
import { FundingRate } from './entities/funding-rate.entity';
import { Liquidation } from './entities/liquidation.entity';

@Module({
  imports: [
    // PostgreSQL Configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'postgres'),
        password: configService.get('DATABASE_PASSWORD', 'password'),
        database: configService.get('DATABASE_NAME', 'cryptosense'),
        entities: [
          User,
          AlertRule,
          AlertHistory,
          UserPreferences,
          ApiKey,
          MarketData,
          FundingRate,
          Liquidation,
        ],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('DATABASE_SSL') === 'true' ? {
          rejectUnauthorized: false,
        } : false,
        migrations: ['dist/database/migrations/*.js'],
        migrationsRun: true,
      }),
      inject: [ConfigService],
    }),
    
    // Redis Configuration
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        config: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          db: configService.get('REDIS_DB', 0),
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        },
      }),
      inject: [ConfigService],
    }),
    
    // InfluxDB Configuration
    InfluxDBModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        url: configService.get('INFLUXDB_URL', 'http://localhost:8086'),
        token: configService.get('INFLUXDB_TOKEN'),
        org: configService.get('INFLUXDB_ORG', 'cryptosense'),
        bucket: configService.get('INFLUXDB_BUCKET', 'market_data'),
        timeout: 30000,
      }),
      inject: [ConfigService],
    }),
    
    // TypeORM Feature Modules
    TypeOrmModule.forFeature([
      User,
      AlertRule,
      AlertHistory,
      UserPreferences,
      ApiKey,
      MarketData,
      FundingRate,
      Liquidation,
    ]),
  ],
  exports: [
    TypeOrmModule,
    RedisModule,
    InfluxDBModule,
  ],
})
export class DatabaseModule {}