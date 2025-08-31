// CryptoSense Dashboard - Main Application Module
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

// Feature Modules
import { WebSocketModule } from './modules/websocket/websocket.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationModule } from './modules/notification/notification.module';
import { MarketDataModule } from './modules/market-data/market-data.module';

// Services
import { BinanceService } from './services/binance/binance.service';
import { CoinbaseService } from './services/coinbase/coinbase.service';
// import { RedisService } from './services/redis/redis.service';
// import { InfluxDBService } from './services/influxdb/influxdb.service';

// Configuration
import configuration from './config/configuration';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    
    // Database
    // TypeOrmModule.forRoot(databaseConfig),
    
    // Task Scheduling
    ScheduleModule.forRoot(),
    
    // HTTP Client
    HttpModule,
    
    // Feature Modules
    // DatabaseModule,
    // WebSocketModule,
    MarketDataModule,
    // AuthModule,
    // NotificationModule,
  ],
  providers: [
    BinanceService,
    CoinbaseService,
    // RedisService,
    // InfluxDBService,
  ],
})
export class AppModule {}