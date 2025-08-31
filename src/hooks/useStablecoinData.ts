import { useState, useEffect, useCallback } from 'react';
import { apiService, StablecoinData } from '../services/api.service';

export const useStablecoinData = () => {
  const [data, setData] = useState<StablecoinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchStablecoinData = useCallback(async () => {
    try {
      setError(null);
      const stablecoinData = await apiService.getStablecoinData();
      setData(stablecoinData);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Failed to fetch stablecoin data:', err);
      setError(err.message || 'Failed to fetch stablecoin data');
      
      // Use fallback mock data on error
      setData({
        stablecoins: [
          {
            id: 'tether',
            symbol: 'USDT',
            name: 'Tether',
            price: 1.0001,
            marketCap: 120000000000,
            volume24h: 65000000000,
            marketCapChange24h: 500000000,
            marketCapChangePercentage24h: 0.42,
            circulatingSupply: 120000000000,
            pegDeviation: 0.01,
          },
          {
            id: 'usd-coin',
            symbol: 'USDC',
            name: 'USD Coin',
            price: 0.9999,
            marketCap: 25000000000,
            volume24h: 8500000000,
            marketCapChange24h: -100000000,
            marketCapChangePercentage24h: -0.4,
            circulatingSupply: 25000000000,
            pegDeviation: -0.01,
          },
          {
            id: 'dai',
            symbol: 'DAI',
            name: 'Dai',
            price: 0.9998,
            marketCap: 5300000000,
            volume24h: 450000000,
            marketCapChange24h: 15000000,
            marketCapChangePercentage24h: 0.28,
            circulatingSupply: 5300000000,
            pegDeviation: -0.02,
          },
        ],
        totalMarketCap: 150300000000,
        lastUpdate: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStablecoinData();

    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchStablecoinData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStablecoinData]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchStablecoinData();
  }, [fetchStablecoinData]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
  };
};