// Fetches fundamental stock data (sector, market cap, P/E, 52-week range) from Yahoo Finance.

import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();
import type { Holding, StockData } from './types';

// Fetches quote summary data for a single holding and returns enriched StockData.
export async function fetchStockData(holding: Holding): Promise<StockData> {
  const quote = await yahooFinance.quoteSummary(holding.ticker, {
    modules: ['summaryProfile', 'summaryDetail', 'price'],
  }) as any;

  const profile = quote.summaryProfile;
  const detail = quote.summaryDetail;
  const price = quote.price;

  // Converts a raw market cap number to a human-readable T/B/M string.
  const formatMarketCap = (value?: number | null): string => {
    if (!value) return 'N/A';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  return {
    ticker: holding.ticker,
    amountInvested: holding.amountInvested,
    sector: profile?.sector ?? 'N/A',
    marketCap: formatMarketCap(detail?.marketCap),
    weekHigh52: detail?.fiftyTwoWeekHigh?.toFixed(2) ?? 'N/A',
    weekLow52: detail?.fiftyTwoWeekLow?.toFixed(2) ?? 'N/A',
    peRatio: detail?.trailingPE?.toFixed(2) ?? 'N/A',
    currentPrice: price?.regularMarketPrice != null ? `$${price.regularMarketPrice.toFixed(2)}` : 'N/A',
  };
}
