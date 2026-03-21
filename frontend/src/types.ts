export interface Holding {
  ticker: string;
  amountInvested: number;
}

export interface StockData {
  ticker: string;
  amountInvested: number;
  sector: string;
  marketCap: string;
  weekHigh52: string;
  weekLow52: string;
  peRatio: string;
}

export interface PricePoint {
  date: string;
  close: number;
}

export interface PriceHistory {
  ticker: string;
  interval: string;
  prices: PricePoint[];
}
