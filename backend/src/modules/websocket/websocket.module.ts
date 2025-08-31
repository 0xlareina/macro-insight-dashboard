// CryptoSense Dashboard - WebSocket Module
import { Module } from '@nestjs/common';
import { CryptoWebSocketGateway } from './websocket.gateway';
import { BinanceService } from '../../services/binance/binance.service';
import { CoinbaseService } from '../../services/coinbase/coinbase.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [CryptoWebSocketGateway, BinanceService, CoinbaseService],
  exports: [CryptoWebSocketGateway],
})
export class WebSocketModule {}