import { useState, useEffect, useCallback } from 'react';
import { apiService, MarketOverview } from '../services/api.service';

export const useMarketData = () => {
  const [data, setData] = useState<MarketOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchMarketData = useCallback(async () => {
    try {
      setError(null);
      const marketData = await apiService.getMarketOverview();
      setData(marketData);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Failed to fetch market data:', err);
      setError(err.message || 'Failed to fetch market data');

      // Generate historical mock data for fallback
      const generateHistoricalData = (baseValue: number, volatility: number = 0.05) => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const randomFactor = 1 + (Math.random() - 0.5) * volatility;
          const value = baseValue > 100 ? Math.round(baseValue * randomFactor) : baseValue * randomFactor;
          data.push({
            date: date.toISOString().split('T')[0],
            value: value
          });
        }
        return data;
      };

      // Use fallback mock data on error
      setData({
        prices: [
          { symbol: 'BTC', price: 43250.50, change24h: 2.98, volume24h: 28500000000, high24h: 44000, low24h: 42000 },
          { symbol: 'ETH', price: 2545.80, change24h: 3.63, volume24h: 18200000000, high24h: 2600, low24h: 2450 },
          { symbol: 'SOL', price: 98.75, change24h: -3.38, volume24h: 3800000000, high24h: 102, low24h: 95 },
        ],
        marketCap: 1680000000000,
        volume24h: 47800000000,
        btcDominance: 52.3,
        fearGreedIndex: 72,
        fearGreedClassification: 'Greed',
        stablecoinMarketCap: 140500000000,
        liquidations24h: 127800000,
        
        // Historical 7-day data
        historicalData: {
          marketCap: generateHistoricalData(1680000000000, 0.08),
          volume24h: generateHistoricalData(47800000000, 0.25),
          btcDominance: generateHistoricalData(52.3, 0.03),
          fearGreedIndex: generateHistoricalData(72, 0.15),
          stablecoinMarketCap: generateHistoricalData(140500000000, 0.05),
          liquidations24h: generateHistoricalData(127800000, 0.40),
        },
        
        lastUpdate: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchMarketData();
  }, [fetchMarketData]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
  };
};