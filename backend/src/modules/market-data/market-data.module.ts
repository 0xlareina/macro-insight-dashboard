import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { BinanceService } from './binance.service';
import { CoinGeckoService } from './coingecko.service';
import { FearGreedService } from './fear-greed.service';
import { CoinGlassService } from './coinglass.service';
import { CoinMarketCapService } from './coinmarketcap.service';
import { MarketDataService } from './market-data.service';
import { MarketDataController } from './market-data.controller';
import { RedisCacheModule } from '../cache/cache.module';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    RedisCacheModule,
  ],
  controllers: [MarketDataController],
  providers: [
    BinanceService,
    CoinGeckoService,
    FearGreedService,
    CoinGlassService,
    CoinMarketCapService,
    MarketDataService,
  ],
  exports: [
    BinanceService,
    CoinGeckoService,
    FearGreedService,
    CoinGlassService,
    CoinMarketCapService,
    MarketDataService,
  ],
})
export class MarketDataModule {}