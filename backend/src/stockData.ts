import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();
import type { Holding, StockData } from './types';

export async function fetchStockData(holding: Holding): Promise<StockData> {
  const quote = await yahooFinance.quoteSummary(holding.ticker, {
    modules: ['summaryProfile', 'summaryDetail'],
  }) as any;

  const profile = quote.summaryProfile;
  const detail = quote.summaryDetail;

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
  };
}
