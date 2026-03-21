// Express server — defines all API routes for portfolio data, price history, and AI analysis.

import express from "express";
import { fetchStockData } from "./stockData";
import { fetchPriceHistory } from "./priceHistory";
import { analysePortfolio } from "./openai";
import { Holding } from "./types";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint.
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Accepts a list of holdings and returns enriched stock data for each.
app.post("/portfolio", async (req, res) => {
  const holdings: Holding[] = req.body.holdings;
  try {
    const results = await Promise.all(holdings.map(fetchStockData));
    res.json({ portfolio: results });
  } catch {
    res.status(404).json({ error: 'Ticker not found' });
  }
});

// Fetches stock data for all holdings, then returns an AI-generated analysis.
app.post("/analyse", async (req, res) => {
  const holdings: Holding[] = req.body.holdings;
  const stockData = await Promise.all(holdings.map(fetchStockData));
  const result = await analysePortfolio(stockData);
  res.json({ analysis: result });
});

// Returns closing price history for a single ticker at the requested interval.
app.get("/prices/:ticker/:interval", async (req, res) => {
  const { ticker, interval } = req.params;
  const result = await fetchPriceHistory(ticker, interval);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
