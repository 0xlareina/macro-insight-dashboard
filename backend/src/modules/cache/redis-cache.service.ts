import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);
  
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // 获取缓存
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value) {
        this.logger.debug(`Cache hit for key: ${key}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`Failed to get cache for key ${key}`, error);
      return undefined;
    }
  }

  // 设置缓存
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cache set for key: ${key}, TTL: ${ttl || 'default'}`);
    } catch (error) {
      this.logger.error(`Failed to set cache for key ${key}`, error);
    }
  }

  // 删除缓存
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete cache for key ${key}`, error);
    }
  }

  // 清空所有缓存
  async reset(): Promise<void> {
    try {
      await this.cacheManager.reset();
      this.logger.log('All cache cleared');
    } catch (error) {
      this.logger.error('Failed to reset cache', error);
    }
  }

  // 获取或设置缓存（如果不存在）
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    try {
      // 尝试从缓存获取
      let value = await this.get<T>(key);
      
      if (value === undefined) {
        // 缓存不存在，执行工厂函数
        value = await factory();
        
        // 设置缓存
        await this.set(key, value, ttl);
        this.logger.debug(`Cache miss for key: ${key}, value fetched and cached`);
      }
      
      return value;
    } catch (error) {
      this.logger.error(`Failed to get or set cache for key ${key}`, error);
      // 出错时直接返回工厂函数结果
      return factory();
    }
  }

  // 批量获取缓存
  async mget<T>(keys: string[]): Promise<(T | undefined)[]> {
    try {
      const promises = keys.map(key => this.get<T>(key));
      return Promise.all(promises);
    } catch (error) {
      this.logger.error('Failed to get multiple cache keys', error);
      return keys.map(() => undefined);
    }
  }

  // 批量设置缓存
  async mset(items: { key: string; value: any; ttl?: number }[]): Promise<void> {
    try {
      const promises = items.map(item =>
        this.set(item.key, item.value, item.ttl),
      );
      await Promise.all(promises);
    } catch (error) {
      this.logger.error('Failed to set multiple cache keys', error);
    }
  }

  // 缓存键生成器
  generateKey(...parts: (string | number)[]): string {
    return parts.join(':');
  }

  // 常用缓存键前缀
  static readonly KEY_PREFIX = {
    PRICE: 'price',
    FUNDING: 'funding',
    LIQUIDATION: 'liq',
    FEAR_GREED: 'fg',
    MARKET: 'market',
    USER: 'user',
    SESSION: 'session',
    ALERT: 'alert',
  };

  // 常用TTL值（秒）
  static readonly TTL = {
    MINUTE: 60,
    FIVE_MINUTES: 300,
    TEN_MINUTES: 600,
    HOUR: 3600,
    DAY: 86400,
    WEEK: 604800,
  };
}