import dotenv from 'dotenv';
import axios from 'axios';
import { PricePoint, PriceHistory } from './types';

dotenv.config();

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

const intervalFunctionMap: Record<string, string> = {
  daily: 'TIME_SERIES_DAILY',
  weekly: 'TIME_SERIES_WEEKLY',
  monthly: 'TIME_SERIES_MONTHLY',
  yearly: 'TIME_SERIES_MONTHLY',
};

const timeSeriesKeyMap: Record<string, string> = {
  daily: 'Time Series (Daily)',
  weekly: 'Weekly Time Series',
  monthly: 'Monthly Time Series',
  yearly: 'Monthly Time Series',
};

export async function fetchPriceHistory(ticker: string, interval: string): Promise<PriceHistory> {
  const avFunction = intervalFunctionMap[interval] ?? 'TIME_SERIES_DAILY';
  const timeSeriesKey = timeSeriesKeyMap[interval] ?? 'Time Series (Daily)';

  const url = `https://www.alphavantage.co/query?function=${avFunction}&symbol=${ticker}&apikey=${API_KEY}`;

  const response = await axios.get(url);
  const data = response.data as Record<string, unknown>;

  const timeSeries = (data[timeSeriesKey] ?? {}) as Record<string, Record<string, string>>;

  let prices: PricePoint[] = Object.entries(timeSeries).map(([date, values]) => ({
    date,
    close: parseFloat(values['4. close'] ?? 'N/A'),
  }));

  if (interval === 'yearly') {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    prices = prices.filter((p) => new Date(p.date) >= oneYearAgo);
  }

  prices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return { ticker, interval, prices };
}
