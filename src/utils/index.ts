// CryptoSense Dashboard - Utility Functions
// Common utility functions for data processing and formatting

import { VALIDATION_RULES } from '../config/app.config';
import { AssetSymbol } from '../types';

/**
 * Format price with appropriate decimal places
 */
export const formatPrice = (price: number, currency = 'USD'): string => {
  if (!isValidNumber(price)) return 'N/A';
  
  const decimals = price > 1 ? 2 : 6;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(price);
};

/**
 * Format percentage with sign and color indication
 */
export const formatPercentage = (percentage: number): { 
  formatted: string; 
  color: string; 
  isPositive: boolean; 
} => {
  if (!isValidNumber(percentage)) {
    return { formatted: 'N/A', color: 'neutral', isPositive: false };
  }
  
  const formatted = `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  const isPositive = percentage > 0;
  const color = percentage > 0 ? 'bull' : percentage < 0 ? 'bear' : 'neutral';
  
  return { formatted, color, isPositive };
};

/**
 * Format volume with appropriate units (K, M, B, T)
 */
export const formatVolume = (volume: number): string => {
  if (!isValidNumber(volume)) return 'N/A';
  
  const units = [
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' },
  ];
  
  for (const unit of units) {
    if (volume >= unit.value) {
      return `${(volume / unit.value).toFixed(2)}${unit.suffix}`;
    }
  }
  
  return volume.toFixed(0);
};

/**
 * Format funding rate as percentage
 */
export const formatFundingRate = (rate: number): { 
  formatted: string; 
  annualized: string; 
  color: string; 
} => {
  if (!isValidNumber(rate)) {
    return { 
      formatted: 'N/A', 
      annualized: 'N/A', 
      color: 'neutral' 
    };
  }
  
  const percentage = rate * 100;
  const annualized = ((1 + rate) ** (365 * 3) - 1) * 100; // 3 times daily
  
  const formatted = `${percentage >= 0 ? '+' : ''}${percentage.toFixed(4)}%`;
  const annualizedFormatted = `${annualized.toFixed(2)}% APR`;
  
  const color = Math.abs(percentage) > 0.1 ? 'warning' : 
                percentage > 0.05 ? 'bull' : 
                percentage < -0.05 ? 'bear' : 'neutral';
  
  return { formatted, annualized: annualizedFormatted, color };
};

/**
 * Format timestamp to relative time (e.g., "2 minutes ago")
 */
export const formatRelativeTime = (timestamp: string | Date): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  
  if (diffMs < 0) return 'in the future'; // Safety check
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

/**
 * Format exact timestamp
 */
export const formatTimestamp = (timestamp: string | Date, includeSeconds = false): string => {
  const time = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds && { second: '2-digit' }),
  };
  
  return time.toLocaleDateString('en-US', options);
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (!isValidNumber(current) || !isValidNumber(previous) || previous === 0) {
    return 0;
  }
  
  return ((current - previous) / previous) * 100;
};

/**
 * Validate if a number is valid for calculations
 */
export const isValidNumber = (value: any): value is number => {
  return typeof value === 'number' && 
         !isNaN(value) && 
         isFinite(value);
};

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Debounce function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(deepClone) as unknown as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    Object.keys(obj).forEach(key => {
      (clonedObj as any)[key] = deepClone((obj as any)[key]);
    });
    return clonedObj;
  }
  return obj;
};

/**
 * Validate asset symbol
 */
export const isValidAssetSymbol = (symbol: string): symbol is AssetSymbol => {
  return ['BTC', 'ETH', 'SOL'].includes(symbol);
};

/**
 * Validate price within acceptable ranges
 */
export const validatePrice = (price: number): boolean => {
  return isValidNumber(price) && 
         price >= VALIDATION_RULES.price.min && 
         price <= VALIDATION_RULES.price.max;
};

/**
 * Validate percentage within acceptable ranges
 */
export const validatePercentage = (percentage: number): boolean => {
  return isValidNumber(percentage) && 
         percentage >= VALIDATION_RULES.percentage.min && 
         percentage <= VALIDATION_RULES.percentage.max;
};

/**
 * Format large numbers for display (e.g., market cap)
 */
export const formatLargeNumber = (value: number): string => {
  if (!isValidNumber(value)) return 'N/A';
  
  const units = [
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' },
  ];
  
  for (const unit of units) {
    if (value >= unit.value) {
      return `${(value / unit.value).toFixed(2)}${unit.suffix}`;
    }
  }
  
  return value.toFixed(0);
};

/**
 * Calculate moving average
 */
export const calculateMovingAverage = (values: number[], period: number): number[] => {
  if (values.length < period) return [];
  
  const result: number[] = [];
  for (let i = period - 1; i < values.length; i++) {
    const slice = values.slice(i - period + 1, i + 1);
    const average = slice.reduce((sum, val) => sum + val, 0) / period;
    result.push(average);
  }
  
  return result;
};

/**
 * Calculate RSI (Relative Strength Index)
 */
export const calculateRSI = (prices: number[], period = 14): number => {
  if (prices.length < period + 1) return 50; // Default neutral RSI
  
  const changes = prices.slice(1).map((price, i) => price - prices[i]);
  const gains = changes.map(change => change > 0 ? change : 0);
  const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);
  
  const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
  const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;
  
  if (avgLoss === 0) return 100; // No losses, maximum RSI
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return Number(rsi.toFixed(2));
};

/**
 * Format API error for user display
 */
export const formatAPIError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'An unexpected error occurred';
};

/**
 * Check if timestamp is recent (within last 5 minutes)
 */
export const isRecentData = (timestamp: string | Date, maxAgeMs = 300000): boolean => {
  const time = new Date(timestamp);
  const now = new Date();
  return (now.getTime() - time.getTime()) < maxAgeMs;
};

/**
 * Get color for Fear & Greed Index value
 */
export const getFearGreedColor = (value: number): string => {
  if (value <= 25) return '#8B0000'; // Extreme Fear
  if (value <= 45) return '#FF4757'; // Fear
  if (value <= 55) return '#FAAD14'; // Neutral
  if (value <= 75) return '#7ED321'; // Greed
  return '#27AE60'; // Extreme Greed
};

/**
 * Get classification for Fear & Greed Index value
 */
export const getFearGreedClassification = (value: number): string => {
  if (value <= 25) return 'Extreme Fear';
  if (value <= 45) return 'Fear';
  if (value <= 55) return 'Neutral';
  if (value <= 75) return 'Greed';
  return 'Extreme Greed';
};

/**
 * Sleep utility for async operations
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
  
  throw lastError!;
};