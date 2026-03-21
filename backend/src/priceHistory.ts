import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();
import type { PricePoint, PriceHistory } from './types';

const intervalRangeMap: Record<string, { period1: Date; interval: '1d' | '1wk' | '1mo' }> = {
  daily: { period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), interval: '1d' },
  weekly: { period1: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000), interval: '1wk' },
  monthly: { period1: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000), interval: '1mo' },
  yearly: { period1: new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000), interval: '1mo' },
};

export async function fetchPriceHistory(ticker: string, interval: string): Promise<PriceHistory> {
  const config = intervalRangeMap[interval] ?? intervalRangeMap.monthly;

  const result = await yahooFinance.chart(ticker, {
    period1: config.period1,
    interval: config.interval,
  }) as any;

  const prices: PricePoint[] = (result.quotes ?? [])
    .filter((q: any) => q.close != null)
    .map((q: any) => ({
      date: new Date(q.date).toISOString().slice(0, 10),
      close: parseFloat((q.close as number).toFixed(2)),
    }));

  return { ticker, interval, prices };
}
