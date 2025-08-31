// CryptoSense Dashboard Backend - Main Entry Point
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Custom WebSocket adapter for Socket.IO
export class SocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const corsOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
    ];
    
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: corsOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable CORS - support multiple origins
  const corsOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:5173', // Vite default port
  ];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      // Check if the origin is in our allowed list
      if (corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Use WebSocket adapter
  app.useWebSocketAdapter(new SocketIoAdapter(app));
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Set global prefix for REST API
  app.setGlobalPrefix('api/v1');
  
  const port = configService.get('PORT') || 3001;
  await app.listen(port);
  
  console.log(`🚀 CryptoSense Backend is running on: http://localhost:${port}`);
  console.log(`📡 WebSocket server is running on: ws://localhost:${port}`);
  console.log(`📊 API endpoints available at: http://localhost:${port}/api/v1`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});