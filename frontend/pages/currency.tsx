import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ArrowRightLeft, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Star,
  Calculator,
  Globe,
  RefreshCw,
  BookmarkPlus,
  History,
} from 'lucide-react';

import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/Loading';
import { useCurrencyConverter, useCurrencyHistory } from '@/services/currency';
import { currencyService, currencyUtils } from '@/services/currency';
import { POPULAR_CURRENCIES } from '@/utils/constants';
import { CurrencyConversion} from '@/utils/types';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface ConversionHistoryItem extends CurrencyConversion {
  timestamp: Date;
  id: string;
}

const CurrencyPage: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState<string>('1');
  const [result, setResult] = useState<CurrencyConversion | null>(null);
  const [conversionHistory, setConversionHistory] = useState<ConversionHistoryItem[]>([]);
  const [favoriteConversions, setFavoriteConversions] = useState<string[]>([]);

  const { convertCurrency, loading: convertLoading, error } = useCurrencyConverter();
  const { history, loading: historyLoading } = useCurrencyHistory(fromCurrency, toCurrency, 30);

  const popularPairs = currencyService.getPopularPairs();

  useEffect(() => {
    // Load favorite conversions from localStorage
    const saved = localStorage.getItem('favorite_conversions');
    if (saved) {
      try {
        setFavoriteConversions(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load favorite conversions:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Auto-convert when currencies change
    if (amount && parseFloat(amount) > 0) {
      handleConvert();
    }
  }, [fromCurrency, toCurrency]);

  const handleConvert = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      return;
    }

    try {
      const conversion = await convertCurrency({
        from: fromCurrency,
        to: toCurrency,
        amount: numAmount,
      });

      setResult(conversion);

      // Add to history
      const historyItem: ConversionHistoryItem = {
        ...conversion,
        timestamp: new Date(),
        id: Date.now().toString(),
      };
      
      setConversionHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10
    } catch (error) {
      console.error('Conversion failed:', error);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    setTimeout(handleConvert, 100);
  };

  const handlePopularPair = (pair: { from: string; to: string }) => {
    setFromCurrency(pair.from);
    setToCurrency(pair.to);
  };

  const toggleFavoriteConversion = (pair: string) => {
    const newFavorites = favoriteConversions.includes(pair)
      ? favoriteConversions.filter(f => f !== pair)
      : [...favoriteConversions, pair];
    
    setFavoriteConversions(newFavorites);
    localStorage.setItem('favorite_conversions', JSON.stringify(newFavorites));
  };

  const currentPair = `${fromCurrency}-${toCurrency}`;
  const isFavorite = favoriteConversions.includes(currentPair);

  return (
    <Layout
      title="Currency Converter - WanderMind"
      description="Convert currencies in real-time with live exchange rates and historical data for your travel planning."
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                  <DollarSign className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-bold">Currency Converter</h1>
              </div>
              <p className="text-xl text-green-100 max-w-2xl mx-auto">
                Get real-time exchange rates and convert currencies for your travel planning
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Converter */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Convert Currency</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={isFavorite ? Star : BookmarkPlus}
                    onClick={() => toggleFavoriteConversion(currentPair)}
                    className={clsx(
                      isFavorite && 'bg-yellow-50 border-yellow-300 text-yellow-700'
                    )}
                  >
                    {isFavorite ? 'Favorited' : 'Add to Favorites'}
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="text-2xl font-bold"
                      min="0"
                      step="0.01"
                    />
                    
                    {/* Quick Amount Buttons */}
                    <div className="flex space-x-2 mt-3">
                      {[1, 10, 100, 1000].map((quickAmount) => (
                        <button
                          key={quickAmount}
                          onClick={() => handleQuickAmount(quickAmount)}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          {quickAmount}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Currency Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    {/* From Currency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From
                      </label>
                      <div className="relative">
                        <select
                          value={fromCurrency}
                          onChange={(e) => setFromCurrency(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white font-medium text-lg"
                        >
                          {POPULAR_CURRENCIES.map((currency) => (
                            <option key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {currencyUtils.getCurrencySymbol(fromCurrency)}
                        </div>
                      </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        icon={ArrowRightLeft}
                        onClick={handleSwapCurrencies}
                        className="rounded-full p-3"
                      >
                        Swap
                      </Button>
                    </div>

                    {/* To Currency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To
                      </label>
                      <div className="relative">
                        <select
                          value={toCurrency}
                          onChange={(e) => setToCurrency(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white font-medium text-lg"
                        >
                          {POPULAR_CURRENCIES.map((currency) => (
                            <option key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          {currencyUtils.getCurrencySymbol(toCurrency)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Convert Button */}
                  <Button
                    onClick={handleConvert}
                    loading={convertLoading}
                    variant="primary"
                    size="lg"
                    icon={Calculator}
                    fullWidth
                    disabled={!amount || parseFloat(amount) <= 0}
                  >
                    {convertLoading ? 'Converting...' : 'Convert'}
                  </Button>

                  {/* Result */}
                  {result && (
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl p-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Conversion Result</p>
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          {currencyUtils.getCurrencySymbol(result.to)}{result.converted.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })} {result.to}
                        </div>
                        <p className="text-gray-600">
                          1 {result.from} = {result.rate.toFixed(4)} {result.to}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Last updated: {format(new Date(), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Historical Chart */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Exchange Rate Trend (30 days)
                  </h3>
                  <div className="text-sm text-gray-500">
                    {fromCurrency} to {toCurrency}
                  </div>
                </div>

                {historyLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : history.length > 0 ? (
                  <div className="h-64 flex items-end space-x-1">
                    {history.slice(-30).map((point, index) => {
                      const maxRate = Math.max(...history.map(h => h.rate));
                      const minRate = Math.min(...history.map(h => h.rate));
                      const height = ((point.rate - minRate) / (maxRate - minRate)) * 200 + 20;
                      
                      return (
                        <div
                          key={index}
                          className="bg-gradient-to-t from-green-500 to-teal-400 rounded-t flex-1 min-w-[8px] hover:from-green-600 hover:to-teal-500 transition-colors cursor-pointer"
                          style={{ height: `${height}px` }}
                          title={`${point.date}: ${point.rate.toFixed(4)}`}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No historical data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Popular Pairs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Pairs</h3>
                <div className="space-y-2">
                  {popularPairs.map((pair) => (
                    <button
                      key={`${pair.from}-${pair.to}`}
                      onClick={() => handlePopularPair(pair)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <span className="font-medium text-gray-900">{pair.label}</span>
                      <ArrowRightLeft className="h-4 w-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Favorite Conversions */}
              {favoriteConversions.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    Favorites
                  </h3>
                  <div className="space-y-2">
                    {favoriteConversions.map((pair) => {
                      const [from, to] = pair.split('-');
                      return (
                        <button
                          key={pair}
                          onClick={() => {
                            setFromCurrency(from);
                            setToCurrency(to);
                          }}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        >
                          <span className="font-medium text-gray-900">
                            {from} → {to}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoriteConversion(pair);
                            }}
                            className="text-yellow-500 hover:text-yellow-600"
                          >
                            <Star className="h-4 w-4 fill-current" />
                          </button>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Conversion History */}
              {conversionHistory.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <History className="h-5 w-5 text-gray-500 mr-2" />
                    Recent Conversions
                  </h3>
                  <div className="space-y-3">
                    {conversionHistory.slice(0, 5).map((conversion) => (
                      <div
                        key={conversion.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">
                            {conversion.amount} {conversion.from} → {conversion.to}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(conversion.timestamp, 'HH:mm')}
                          </span>
                        </div>
                        <div className="text-lg font-semibold text-green-600">
                          {currencyUtils.getCurrencySymbol(conversion.to)}{conversion.converted.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          Rate: 1 {conversion.from} = {conversion.rate.toFixed(4)} {conversion.to}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Currency Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Currency Info</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-gray-900">
                        {POPULAR_CURRENCIES.find(c => c.code === fromCurrency)?.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">
                      Symbol: {currencyUtils.getCurrencySymbol(fromCurrency)}
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-gray-900">
                        {POPULAR_CURRENCIES.find(c => c.code === toCurrency)?.name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">
                      Symbol: {currencyUtils.getCurrencySymbol(toCurrency)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Travel Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Travel Tips</h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <p>• Check exchange rates regularly before your trip</p>
                  <p>• Consider using cards with no foreign transaction fees</p>
                  <p>• Keep some local cash for small vendors and tips</p>
                  <p>• Notify your bank about travel plans to avoid blocks</p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Rates Table */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Live Exchange Rates</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Updated: {format(new Date(), 'HH:mm')}</span>
                <Button variant="ghost" size="sm" icon={RefreshCw}>
                  Refresh
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Currency</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Rate (USD)</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Change</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {POPULAR_CURRENCIES.filter(c => c.code !== 'USD').map((currency) => {
                    const isPositive = Math.random() > 0.5; // Mock data
                    const change = (Math.random() * 2 - 1).toFixed(2);
                    const rate = (Math.random() * 2 + 0.5).toFixed(4);
                    
                    return (
                      <tr key={currency.code} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="font-medium text-gray-900">
                              {currency.code}
                            </div>
                            <div className="text-sm text-gray-600">
                              {currency.name}
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4 font-medium">
                          {rate}
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className={clsx(
                            'flex items-center justify-end space-x-1',
                            isPositive ? 'text-green-600' : 'text-red-600'
                          )}>
                            {isPositive ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span>{isPositive ? '+' : ''}{change}%</span>
                          </div>
                        </td>
                        <td className="text-right py-4 px-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFromCurrency('USD');
                              setToCurrency(currency.code);
                            }}
                          >
                            Convert
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CurrencyPage;