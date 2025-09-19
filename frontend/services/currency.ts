import React from 'react';
import { api } from './auth';
import { CurrencyConversion } from '@/utils/types';
import { API_ENDPOINTS, POPULAR_CURRENCIES } from '@/utils/constants';

export interface CurrencyConversionRequest {
  from: string;
  to: string;
  amount: number;
}

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  lastUpdated: string;
}

export interface CurrencyHistory {
  date: string;
  rate: number;
}

// Currency API Service
export const currencyService = {
  // Convert currency
  convertCurrency: async (params: CurrencyConversionRequest): Promise<CurrencyConversion> => {
    const searchParams = new URLSearchParams({
      from: params.from,
      to: params.to,
      amount: params.amount.toString(),
    });

    const response = await api.get<CurrencyConversion>(
      `${API_ENDPOINTS.CURRENCY_CONVERT}?${searchParams}`
    );
    
    return response.data;
  },

  // Get all available currencies
  getAvailableCurrencies: async (): Promise<string[]> => {
    // For now, return popular currencies
    // In a real app, this would fetch from backend
    return POPULAR_CURRENCIES.map(currency => currency.code);
  },

  // Get currency rates for a base currency
  getCurrencyRates: async (baseCurrency: string): Promise<CurrencyRate[]> => {
    // This would typically fetch from your backend
    // For now, we'll simulate with popular currencies
    const rates: CurrencyRate[] = [];
    
    for (const currency of POPULAR_CURRENCIES) {
      if (currency.code !== baseCurrency) {
        try {
          const conversion = await currencyService.convertCurrency({
            from: baseCurrency,
            to: currency.code,
            amount: 1
          });
          
          rates.push({
            code: currency.code,
            name: currency.name,
            symbol: currency.symbol,
            rate: conversion.converted,
            lastUpdated: new Date().toISOString(),
          });
        } catch (error) {
          console.warn(`Failed to get rate for ${currency.code}`);
        }
      }
    }
    
    return rates;
  },

  // Get currency history (mock implementation)
  getCurrencyHistory: async (
    from: string, 
    to: string, 
    days: number = 30
  ): Promise<CurrencyHistory[]> => {
    // This would fetch historical data from backend
    // For now, generate mock data
    const history: CurrencyHistory[] = [];
    const baseRate = Math.random() * 2 + 0.5; // Random base rate
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate slight variations around base rate
      const variation = (Math.random() - 0.5) * 0.1;
      const rate = baseRate + variation;
      
      history.push({
        date: date.toISOString().split('T')[0],
        rate: parseFloat(rate.toFixed(4))
      });
    }
    
    return history;
  },

  // Get popular currency pairs
  getPopularPairs: (): Array<{ from: string; to: string; label: string }> => {
    return [
      { from: 'USD', to: 'EUR', label: 'USD → EUR' },
      { from: 'USD', to: 'GBP', label: 'USD → GBP' },
      { from: 'USD', to: 'PKR', label: 'USD → PKR' },
      { from: 'EUR', to: 'USD', label: 'EUR → USD' },
      { from: 'EUR', to: 'GBP', label: 'EUR → GBP' },
      { from: 'GBP', to: 'USD', label: 'GBP → USD' },
      { from: 'PKR', to: 'USD', label: 'PKR → USD' },
      { from: 'JPY', to: 'USD', label: 'JPY → USD' },
    ];
  },

  // Format currency amount with proper symbol
  formatCurrency: (amount: number, currencyCode: string): string => {
    const currency = POPULAR_CURRENCIES.find(c => c.code === currencyCode);
    const symbol = currency?.symbol || currencyCode;
    
    return `${symbol}${amount.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  },

  // Get currency info
  getCurrencyInfo: (code: string) => {
    return POPULAR_CURRENCIES.find(currency => currency.code === code);
  },
};

// Custom hooks for currency
export const useCurrencyConverter = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastConversion, setLastConversion] = React.useState<CurrencyConversion | null>(null);

  const convertCurrency = async (params: CurrencyConversionRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await currencyService.convertCurrency(params);
      setLastConversion(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Currency conversion failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    convertCurrency,
    loading,
    error,
    lastConversion,
    clearError: () => setError(null),
  };
};

export const useCurrencyRates = (baseCurrency: string) => {
  const [rates, setRates] = React.useState<CurrencyRate[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchRates = async () => {
    if (!baseCurrency) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedRates = await currencyService.getCurrencyRates(baseCurrency);
      setRates(fetchedRates);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch currency rates');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (baseCurrency) {
      fetchRates();
    }
  }, [baseCurrency]);

  return {
    rates,
    loading,
    error,
    refetch: fetchRates,
  };
};

export const useCurrencyHistory = (from: string, to: string, days: number = 30) => {
  const [history, setHistory] = React.useState<CurrencyHistory[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchHistory = async () => {
    if (!from || !to) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedHistory = await currencyService.getCurrencyHistory(from, to, days);
      setHistory(fetchedHistory);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch currency history');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (from && to) {
      fetchHistory();
    }
  }, [from, to, days]);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
  };
};

// Utility functions for currency
export const currencyUtils = {
  // Validate currency code
  isValidCurrencyCode: (code: string): boolean => {
    return POPULAR_CURRENCIES.some(currency => currency.code === code);
  },

  // Get currency symbol
  getCurrencySymbol: (code: string): string => {
    const currency = POPULAR_CURRENCIES.find(c => c.code === code);
    return currency?.symbol || code;
  },

  // Format large numbers
  formatLargeAmount: (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  },

  // Calculate percentage change
  calculatePercentageChange: (oldValue: number, newValue: number): number => {
    return ((newValue - oldValue) / oldValue) * 100;
  },

  // Format percentage
  formatPercentage: (percentage: number): string => {
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  },

  // Get trend direction
  getTrendDirection: (history: CurrencyHistory[]): 'up' | 'down' | 'stable' => {
    if (history.length < 2) return 'stable';
    
    const recent = history[history.length - 1].rate;
    const previous = history[history.length - 2].rate;
    const change = recent - previous;
    
    if (Math.abs(change) < 0.001) return 'stable';
    return change > 0 ? 'up' : 'down';
  },
};