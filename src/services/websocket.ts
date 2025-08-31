// CryptoSense Dashboard - WebSocket Service
import { io, Socket } from 'socket.io-client';
import { WebSocketMessage, MarketAlert } from '../types';

export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 5000;
  
  connect(): Socket {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';
    
    this.socket = io(`${wsUrl}/realtime`, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });
    
    this.setupEventHandlers();
    return this.socket;
  }
  
  private setupEventHandlers(): void {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      this.reconnectAttempts = 0;
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket server:', reason);
      this.handleReconnect();
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.handleReconnect();
    });
    
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt #${attemptNumber}`);
    });
    
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });
  }
  
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, this.reconnectInterval);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  // Subscription methods
  subscribeToAssets(assets: string[]): void {
    if (!this.socket) return;
    
    this.socket.emit('subscribe:prices', assets);
    this.socket.emit('subscribe:funding', assets);
  }
  
  subscribeToSentiment(): void {
    if (!this.socket) return;
    this.socket.emit('subscribe:sentiment');
  }
  
  subscribeToLiquidations(): void {
    if (!this.socket) return;
    this.socket.emit('subscribe:liquidations');
  }
  
  // Unsubscribe methods
  unsubscribe(type: string, assets?: string[]): void {
    if (!this.socket) return;
    this.socket.emit('unsubscribe', { type, assets });
  }
  
  // Health check
  ping(): void {
    if (!this.socket) return;
    this.socket.emit('ping');
  }
}