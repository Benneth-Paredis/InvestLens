// Shared TypeScript interfaces used across the frontend.

// A single portfolio holding as entered by the user.
export interface Holding {
  ticker: string;
  shares: number;
  amountInvested: number;
}

// Enriched holding with market data returned from the backend.
export interface StockData {
  ticker: string;
  amountInvested: number;
  sector: string;
  marketCap: string;
  weekHigh52: string;
  weekLow52: string;
  peRatio: string;
  currentPrice: string;
}

// A single closing price on a given date.
export interface PricePoint {
  date: string;
  close: number;
}

// Price history for a ticker at a specified interval.
export interface PriceHistory {
  ticker: string;
  interval: string;
  prices: PricePoint[];
}
