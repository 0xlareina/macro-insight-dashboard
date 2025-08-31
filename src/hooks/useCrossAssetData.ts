import { useState, useEffect, useCallback } from 'react';
import { apiService, CrossAssetData } from '../services/api.service';

export const useCrossAssetData = () => {
  const [data, setData] = useState<CrossAssetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchCrossAssetData = useCallback(async () => {
    try {
      setError(null);
      const crossAssetData = await apiService.getCrossAssetData();
      setData(crossAssetData);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Failed to fetch cross-asset data:', err);
      setError(err.message || 'Failed to fetch cross-asset data');
      
      // Use fallback mock data on error
      setData({
        tokens: [
          {
            id: 'bitcoin',
            symbol: 'BTC',
            name: 'Bitcoin',
            price: 108500,
            marketCap: 2130000000000,
            volume24h: 28500000000,
            priceChange1h: 0.5,
            priceChange24h: 1.2,
            priceChange7d: 5.3,
            priceChange30d: 15.2,
            sparkline: [105000, 106000, 107000, 107500, 108000, 108500],
          },
          {
            id: 'ethereum',
            symbol: 'ETH',
            name: 'Ethereum',
            price: 4450,
            marketCap: 535000000000,
            volume24h: 18200000000,
            priceChange1h: 0.3,
            priceChange24h: 2.1,
            priceChange7d: 7.8,
            priceChange30d: 22.5,
            sparkline: [4200, 4250, 4300, 4350, 4400, 4450],
          },
        ],
        trending: {
          coins: [
            { id: 'pepe', symbol: 'PEPE', name: 'Pepe', marketCapRank: 35, priceChange24h: 25.3, price: 0.00002145 },
            { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum', marketCapRank: 42, priceChange24h: 15.2, price: 2.35 },
            { id: 'injective', symbol: 'INJ', name: 'Injective', marketCapRank: 58, priceChange24h: 12.8, price: 45.67 },
          ],
        },
        correlations: {
          BTC: { ETH: 0.85, SOL: 0.72, BNB: 0.68 },
          ETH: { BTC: 0.85, SOL: 0.78, BNB: 0.75 },
        },
        lastUpdate: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCrossAssetData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchCrossAssetData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchCrossAssetData]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchCrossAssetData();
  }, [fetchCrossAssetData]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
  };
};