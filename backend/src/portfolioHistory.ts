// Fetches and combines price history for all holdings into a single portfolio value time series.

import { fetchPriceHistory } from './priceHistory';
import type { Holding } from './types';

export interface PortfolioValuePoint {
  date: string;
  value: number;
}

// Fetches price history for each holding in parallel and returns combined portfolio value per date.
// Uses the union of all dates with forward-fill so that cross-exchange holdings (e.g. ASX + NYSE)
// still produce a continuous chart — a ticker's last known price is carried forward on days it
// didn't trade.
export async function fetchPortfolioHistory(
  holdings: Holding[],
  interval: string
): Promise<PortfolioValuePoint[]> {
  if (holdings.length === 0) return [];

  const histories = await Promise.all(
    holdings.map((h) => fetchPriceHistory(h.ticker, interval))
  );

  // Build sorted (date, close) entry arrays — one per ticker — for forward-fill.
  const sortedEntries: [string, number][][] = histories.map((h) =>
    h.prices
      .map((p): [string, number] => [p.date, p.close])
      .sort((a, b) => a[0].localeCompare(b[0]))
  );

  // Union of all dates across all tickers, sorted ascending.
  const allDates = [
    ...new Set(sortedEntries.flatMap((entries) => entries.map(([d]) => d))),
  ].sort();

  // Walk each ticker's entries in parallel with pointers, carrying the last seen price forward.
  const pointers = sortedEntries.map(() => 0);
  const lastPrices: (number | null)[] = sortedEntries.map(() => null);

  const result: PortfolioValuePoint[] = [];

  for (const date of allDates) {
    for (let i = 0; i < sortedEntries.length; i++) {
      while (pointers[i] < sortedEntries[i].length && sortedEntries[i][pointers[i]][0] <= date) {
        lastPrices[i] = sortedEntries[i][pointers[i]][1];
        pointers[i]++;
      }
    }

    // Only emit a point once every ticker has at least one data point.
    if (lastPrices.every((p) => p !== null)) {
      const value = holdings.reduce((sum, h, i) => sum + h.shares * lastPrices[i]!, 0);
      result.push({ date, value: parseFloat(value.toFixed(2)) });
    }
  }

  return result;
}
