import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('market-data')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get('overview')
  @Public()
  async getMarketOverview() {
    return this.marketDataService.getMarketOverview();
  }

  @Get('derivatives')
  @Public()
  async getDerivativesData() {
    return this.marketDataService.getDerivativesData();
  }

  @Get('stablecoins')
  @Public()
  async getStablecoinData() {
    return this.marketDataService.getStablecoinData();
  }

  @Get('fear-greed')
  @Public()
  async getFearGreedData(@Query('days') days?: string) {
    const dayCount = days ? parseInt(days, 10) : 30;
    return this.marketDataService.getFearGreedHistory(dayCount);
  }

  @Get('cross-asset')
  @Public()
  async getCrossAssetData() {
    return this.marketDataService.getCrossAssetData();
  }

  @Get('health')
  @Public()
  async getHealthCheck() {
    return this.marketDataService.healthCheck();
  }
}