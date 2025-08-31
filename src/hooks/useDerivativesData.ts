import { useState, useEffect, useCallback } from 'react';
import { apiService, DerivativesData } from '../services/api.service';

export const useDerivativesData = () => {
  const [data, setData] = useState<DerivativesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchDerivativesData = useCallback(async () => {
    try {
      setError(null);
      const derivativesData = await apiService.getDerivativesData();
      setData(derivativesData);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error('Failed to fetch derivatives data:', err);
      setError(err.message || 'Failed to fetch derivatives data');
      
      // Use fallback mock data on error
      setData({
        fundingRates: [
          { symbol: 'BTCUSDT', fundingRate: 0.0001, markPrice: 108500, indexPrice: 108450, nextFundingTime: new Date(Date.now() + 8 * 3600000).toISOString() },
          { symbol: 'ETHUSDT', fundingRate: 0.00015, markPrice: 4450, indexPrice: 4445, nextFundingTime: new Date(Date.now() + 8 * 3600000).toISOString() },
          { symbol: 'SOLUSDT', fundingRate: -0.0002, markPrice: 198.5, indexPrice: 198.3, nextFundingTime: new Date(Date.now() + 8 * 3600000).toISOString() },
        ],
        openInterest: [
          { symbol: 'BTCUSDT', openInterest: 85000, openInterestValue: 9222500000 },
          { symbol: 'ETHUSDT', openInterest: 1250000, openInterestValue: 5562500000 },
          { symbol: 'SOLUSDT', openInterest: 5500000, openInterestValue: 1091750000 },
        ],
        liquidations: {
          symbol: 'ALL',
          total24h: 125000000,
          longs: 75000000,
          shorts: 50000000,
          ratio: 1.5,
        },
        lastUpdate: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDerivativesData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDerivativesData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDerivativesData]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchDerivativesData();
  }, [fetchDerivativesData]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
  };
};