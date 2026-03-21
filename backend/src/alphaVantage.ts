import dotenv from 'dotenv';
import axios from 'axios';
import { Holding, StockData } from './types';

dotenv.config();

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

export async function fetchStockData(holding: Holding): Promise<StockData> {
  const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${holding.ticker}&apikey=${API_KEY}`;

  const response = await axios.get(url);
  const data = response.data as Record<string, string>;

  return {
    ticker: holding.ticker,
    amountInvested: holding.amountInvested,
    sector: data.Sector ?? 'N/A',
    marketCap: data.MarketCapitalization ?? 'N/A',
    weekHigh52: data['52WeekHigh'] ?? 'N/A',
    weekLow52: data['52WeekLow'] ?? 'N/A',
    peRatio: data.PERatio ?? 'N/A',
  };
}
