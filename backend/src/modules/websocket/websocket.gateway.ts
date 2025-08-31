// CryptoSense Dashboard - WebSocket Gateway
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { BinanceService } from '../market-data/binance.service';
import { CoinGeckoService } from '../market-data/coingecko.service';
import { FearGreedService } from '../market-data/fear-greed.service';
import { RedisCacheService } from '../cache/redis-cache.service';

export interface PriceUpdate {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
  source: 'binance' | 'coinbase';
}

export interface FundingRateUpdate {
  symbol: string;
  fundingRate: number;
  nextFundingTime: number;
  markPrice: number;
  timestamp: number;
}

export interface LiquidationAlert {
  symbol: string;
  side: 'long' | 'short';
  price: number;
  quantity: number;
  totalValue: number;
  timestamp: number;
}

export interface SentimentUpdate {
  fearGreedIndex: number;
  fearGreedClassification: string;
  etfNetFlow: number;
  etfCumulativeFlow: {
    '7d': number;
    '30d': number;
    total: number;
  };
  timestamp: number;
}

export interface StablecoinUpdate {
  symbol: string;
  price: number;
  deviation: number;
  volume24h: number;
  liquidity: number;
  spread: number;
  timestamp: number;
}

export interface CorrelationUpdate {
  matrix: {
    [asset: string]: {
      [otherAsset: string]: number;
    };
  };
  timestamp: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/realtime',
  transports: ['websocket', 'polling'],
})
export class CryptoWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  
  private logger = new Logger('WebSocketGateway');
  private connectedClients = new Map<string, Socket>();
  private subscribedAssets = new Map<string, Set<string>>(); // clientId -> Set<asset>
  private priceUpdateInterval: NodeJS.Timeout;
  private fundingRateInterval: NodeJS.Timeout;
  
  constructor(
    private readonly binanceService: BinanceService,
    private readonly coinbaseService: CoinbaseService,
  ) {}
  
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    this.initializeDataStreams();
  }
  
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
    this.subscribedAssets.set(client.id, new Set());
    
    // Send initial connection confirmation
    client.emit('connection:status', {
      status: 'connected',
      clientId: client.id,
      timestamp: Date.now(),
    });
    
    // Send current market snapshot
    this.sendMarketSnapshot(client);
  }
  
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
    this.subscribedAssets.delete(client.id);
  }
  
  // Initialize real-time data streams from exchanges
  private initializeDataStreams() {
    const assets = ['BTC', 'ETH', 'SOL'];
    const stablecoins = ['USDT', 'USDC', 'BUSD', 'DAI'];
    
    // Initialize stablecoin monitoring
    this.initializeStablecoinStreams(stablecoins);
    
    // Initialize correlation calculations
    this.initializeCorrelationUpdates(assets);
    
    // Subscribe to Binance price updates
    this.binanceService.subscribeToTickers(assets, (data) => {
      this.broadcastPriceUpdate({
        symbol: data.symbol.replace('USDT', ''),
        price: data.price,
        change24h: data.priceChange,
        changePercent24h: data.priceChangePercent,
        volume24h: data.volume,
        high24h: data.high,
        low24h: data.low,
        timestamp: data.timestamp,
        source: 'binance',
      });
    });
    
    // Subscribe to Binance funding rates
    this.binanceService.subscribeToFundingRates(assets, (data) => {
      this.broadcastFundingRateUpdate({
        symbol: data.symbol.replace('USDT', ''),
        fundingRate: data.fundingRate,
        nextFundingTime: data.nextFundingTime,
        markPrice: data.markPrice,
        timestamp: data.timestamp,
      });
    });
    
    // Subscribe to Binance liquidations
    this.binanceService.subscribeToLiquidations(assets, (data) => {
      this.broadcastLiquidation({
        symbol: data.symbol.replace('USDT', ''),
        side: data.side === 'BUY' ? 'long' : 'short',
        price: data.price,
        quantity: data.quantity,
        totalValue: data.totalValue,
        timestamp: data.timestamp,
      });
    });
    
    // Subscribe to Coinbase real-time data
    this.coinbaseService.subscribeToRealtime(
      assets,
      ['ticker', 'matches'],
      (data) => {
        if (data.type === 'ticker') {
          this.broadcastPriceUpdate({
            symbol: data.product.replace('-USD', ''),
            price: data.price,
            change24h: 0, // Calculate from stored data
            changePercent24h: 0, // Calculate from stored data
            volume24h: data.volume24h,
            high24h: 0, // Fetch from stats
            low24h: 0, // Fetch from stats
            timestamp: new Date(data.time).getTime(),
            source: 'coinbase',
          });
        }
      },
    );
  }
  
  // Initialize stablecoin data streams
  private initializeStablecoinStreams(stablecoins: string[]) {
    // Subscribe to stablecoin price feeds from Binance
    stablecoins.forEach(async (stable) => {
      try {
        // Get stablecoin ticker data
        const ticker = await this.binanceService.getSpotTicker(stable + 'USDT');
        if (ticker) {
          this.broadcastStablecoinUpdate({
            symbol: stable,
            price: ticker.price,
            deviation: ((ticker.price - 1.0) * 100),
            volume24h: ticker.volume24h,
            liquidity: ticker.bidQty + ticker.askQty,
            spread: ((ticker.askPrice - ticker.bidPrice) / ticker.bidPrice) * 100,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        this.logger.warn(`Failed to get stablecoin data for ${stable}:`, error.message);
      }
    });
    
    // Set up periodic stablecoin updates every 30 seconds
    setInterval(async () => {
      for (const stable of stablecoins) {
        try {
          const ticker = await this.binanceService.getSpotTicker(stable + 'USDT');
          if (ticker) {
            this.broadcastStablecoinUpdate({
              symbol: stable,
              price: ticker.price,
              deviation: ((ticker.price - 1.0) * 100),
              volume24h: ticker.volume24h,
              liquidity: ticker.bidQty + ticker.askQty,
              spread: ((ticker.askPrice - ticker.bidPrice) / ticker.bidPrice) * 100,
              timestamp: Date.now(),
            });
          }
        } catch (error) {
          // Silently continue if one stablecoin fails
        }
      }
    }, 30000);
  }
  
  // Initialize correlation matrix calculations
  private initializeCorrelationUpdates(assets: string[]) {
    // Calculate correlation matrix every 5 minutes
    setInterval(async () => {
      try {
        const correlationMatrix: { [asset: string]: { [otherAsset: string]: number } } = {};
        
        // Simple correlation calculation (would use historical price data in production)
        for (const asset of assets) {
          correlationMatrix[asset] = {};
          for (const otherAsset of assets) {
            if (asset === otherAsset) {
              correlationMatrix[asset][otherAsset] = 1.0;
            } else {
              // Mock correlation values (in production, calculate from price history)
              const mockCorrelations = {
                'BTC-ETH': 0.73,
                'ETH-BTC': 0.73,
                'BTC-SOL': 0.65,
                'SOL-BTC': 0.65,
                'ETH-SOL': 0.81,
                'SOL-ETH': 0.81,
              };
              correlationMatrix[asset][otherAsset] = 
                mockCorrelations[`${asset}-${otherAsset}`] || 0.5;
            }
          }
        }
        
        this.broadcastCorrelationUpdate({
          matrix: correlationMatrix,
          timestamp: Date.now(),
        });
      } catch (error) {
        this.logger.error('Failed to calculate correlation matrix:', error);
      }
    }, 300000); // 5 minutes
  }
  
  // Send initial market snapshot to newly connected client
  private async sendMarketSnapshot(client: Socket) {
    try {
      const assets = ['BTC', 'ETH', 'SOL'];
      
      // Fetch current prices
      const binanceTickers = await this.binanceService.getSpotTickers(assets);
      const coinbaseTickers = await this.coinbaseService.getTickers(assets);
      
      // Fetch funding rates
      const fundingRates = await this.binanceService.getFundingRates(assets);
      
      // Fetch open interest
      const openInterest = await this.binanceService.getOpenInterest(assets);
      
      // Fetch stablecoin data
      const stablecoins = ['USDT', 'USDC', 'BUSD', 'DAI'];
      const stablecoinData = {};
      for (const stable of stablecoins) {
        try {
          const ticker = await this.binanceService.getSpotTicker(stable + 'USDT');
          if (ticker) {
            stablecoinData[stable] = {
              price: ticker.price,
              deviation: ((ticker.price - 1.0) * 100),
              volume24h: ticker.volume24h,
              spread: ((ticker.askPrice - ticker.bidPrice) / ticker.bidPrice) * 100,
            };
          }
        } catch (error) {
          // Continue if stablecoin data fails
        }
      }
      
      // Send snapshot to client
      client.emit('market:snapshot', {
        prices: {
          binance: binanceTickers,
          coinbase: coinbaseTickers,
        },
        fundingRates,
        openInterest,
        stablecoins: stablecoinData,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.logger.error('Failed to send market snapshot:', error);
    }
  }
  
  // Broadcast price update to all subscribed clients
  private broadcastPriceUpdate(update: PriceUpdate) {
    this.server.emit('price:update', update);
    
    // Also emit to asset-specific room
    this.server.to(`price:${update.symbol}`).emit(`price:${update.symbol}`, update);
  }
  
  // Broadcast funding rate update
  private broadcastFundingRateUpdate(update: FundingRateUpdate) {
    this.server.emit('funding:update', update);
    this.server.to(`funding:${update.symbol}`).emit(`funding:${update.symbol}`, update);
  }
  
  // Broadcast liquidation alert
  private broadcastLiquidation(alert: LiquidationAlert) {
    // Check if it's a large liquidation (> $1M)
    const isLarge = alert.totalValue > 1000000;
    
    this.server.emit('liquidation:alert', {
      ...alert,
      severity: isLarge ? 'high' : 'medium',
    });
    
    if (isLarge) {
      this.server.emit('alert:large_liquidation', alert);
    }
  }
  
  // Broadcast sentiment update
  public broadcastSentimentUpdate(update: SentimentUpdate) {
    this.server.emit('sentiment:update', update);
  }
  
  // Broadcast stablecoin update
  public broadcastStablecoinUpdate(update: StablecoinUpdate) {
    this.server.emit('stablecoin:update', update);
    this.server.to(`stablecoin:${update.symbol}`).emit(`stablecoin:${update.symbol}`, update);
  }
  
  // Broadcast correlation matrix update
  public broadcastCorrelationUpdate(update: CorrelationUpdate) {
    this.server.emit('correlation:update', update);
  }
  
  // Subscribe to specific asset updates
  @SubscribeMessage('subscribe:prices')
  handleSubscribePrices(
    @MessageBody() assets: string[],
    @ConnectedSocket() client: Socket,
  ) {
    const validAssets = assets.filter((asset) =>
      ['BTC', 'ETH', 'SOL'].includes(asset),
    );
    
    validAssets.forEach((asset) => {
      client.join(`price:${asset}`);
      this.subscribedAssets.get(client.id)?.add(asset);
    });
    
    client.emit('subscription:confirmed', {
      type: 'prices',
      assets: validAssets,
    });
    
    this.logger.log(`Client ${client.id} subscribed to prices: ${validAssets.join(', ')}`);
  }
  
  // Subscribe to funding rate updates
  @SubscribeMessage('subscribe:funding')
  handleSubscribeFunding(
    @MessageBody() assets: string[],
    @ConnectedSocket() client: Socket,
  ) {
    const validAssets = assets.filter((asset) =>
      ['BTC', 'ETH', 'SOL'].includes(asset),
    );
    
    validAssets.forEach((asset) => {
      client.join(`funding:${asset}`);
    });
    
    client.emit('subscription:confirmed', {
      type: 'funding',
      assets: validAssets,
    });
    
    this.logger.log(`Client ${client.id} subscribed to funding rates: ${validAssets.join(', ')}`);
  }
  
  // Subscribe to liquidation alerts
  @SubscribeMessage('subscribe:liquidations')
  handleSubscribeLiquidations(@ConnectedSocket() client: Socket) {
    client.join('liquidations');
    
    client.emit('subscription:confirmed', {
      type: 'liquidations',
    });
    
    this.logger.log(`Client ${client.id} subscribed to liquidations`);
  }
  
  // Subscribe to sentiment updates
  @SubscribeMessage('subscribe:sentiment')
  handleSubscribeSentiment(@ConnectedSocket() client: Socket) {
    client.join('sentiment');
    
    client.emit('subscription:confirmed', {
      type: 'sentiment',
    });
    
    this.logger.log(`Client ${client.id} subscribed to sentiment updates`);
  }
  
  // Subscribe to stablecoin updates
  @SubscribeMessage('subscribe:stablecoins')
  handleSubscribeStablecoins(
    @MessageBody() stablecoins: string[],
    @ConnectedSocket() client: Socket,
  ) {
    const validStablecoins = stablecoins.filter((stable) =>
      ['USDT', 'USDC', 'BUSD', 'DAI'].includes(stable),
    );
    
    validStablecoins.forEach((stable) => {
      client.join(`stablecoin:${stable}`);
    });
    
    client.emit('subscription:confirmed', {
      type: 'stablecoins',
      assets: validStablecoins,
    });
    
    this.logger.log(`Client ${client.id} subscribed to stablecoins: ${validStablecoins.join(', ')}`);
  }
  
  // Subscribe to correlation updates
  @SubscribeMessage('subscribe:correlations')
  handleSubscribeCorrelations(
    @MessageBody() assets: string[],
    @ConnectedSocket() client: Socket,
  ) {
    client.join('correlations');
    
    client.emit('subscription:confirmed', {
      type: 'correlations',
      assets,
    });
    
    this.logger.log(`Client ${client.id} subscribed to correlation updates`);
  }
  
  // Unsubscribe from updates
  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { type: string; assets?: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.type === 'prices' && data.assets) {
      data.assets.forEach((asset) => {
        client.leave(`price:${asset}`);
        this.subscribedAssets.get(client.id)?.delete(asset);
      });
    } else if (data.type === 'funding' && data.assets) {
      data.assets.forEach((asset) => {
        client.leave(`funding:${asset}`);
      });
    } else if (data.type === 'liquidations') {
      client.leave('liquidations');
    } else if (data.type === 'sentiment') {
      client.leave('sentiment');
    } else if (data.type === 'stablecoins' && data.assets) {
      data.assets.forEach((stable) => {
        client.leave(`stablecoin:${stable}`);
      });
    } else if (data.type === 'correlations') {
      client.leave('correlations');
    }
    
    client.emit('unsubscribe:confirmed', data);
    this.logger.log(`Client ${client.id} unsubscribed from ${data.type}`);
  }
  
  // Handle ping/pong for connection keep-alive
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: Date.now() });
  }
  
  // Get connection statistics
  getConnectionStats() {
    return {
      totalConnections: this.connectedClients.size,
      subscribedClients: this.subscribedAssets.size,
      rooms: this.server.sockets.adapter.rooms,
    };
  }
  
  // Cleanup on module destroy
  onModuleDestroy() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }
    if (this.fundingRateInterval) {
      clearInterval(this.fundingRateInterval);
    }
    
    this.binanceService.disconnect();
    this.coinbaseService.disconnect();
    
    this.logger.log('WebSocket Gateway cleanup completed');
  }
}