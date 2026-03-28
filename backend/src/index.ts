// Express server — defines all API routes for portfolio data, price history, and AI analysis.

import express from "express";
import { fetchStockData } from "./stockData";
import { fetchPriceHistory } from "./priceHistory";
import { fetchPortfolioHistory } from "./portfolioHistory";
import { analysePortfolio } from "./openai";
import { Holding } from "./types";
import { pool, initDb } from "./db";

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

// Returns combined portfolio value over time for all holdings at the requested interval.
app.post("/portfolio-history", async (req, res) => {
  const { holdings, interval } = req.body as { holdings: Holding[]; interval: string };
  const history = await fetchPortfolioHistory(holdings, interval ?? 'monthly');
  res.json({ history, interval });
});

// Returns closing price history for a single ticker at the requested interval.
app.get("/prices/:ticker/:interval", async (req, res) => {
  const { ticker, interval } = req.params;
  const result = await fetchPriceHistory(ticker, interval);
  res.json(result);
});

// Returns all persisted holdings from the database.
app.get("/holdings", async (_req, res) => {
  const result = await pool.query(
    'SELECT ticker, shares::float AS shares, amount_invested::float AS "amountInvested" FROM holdings ORDER BY id'
  );
  res.json({ holdings: result.rows as Holding[] });
});

// Persists a new holding to the database.
app.post("/holdings", async (req, res) => {
  const { ticker, shares, amountInvested } = req.body as Holding;
  await pool.query(
    'INSERT INTO holdings (ticker, shares, amount_invested) VALUES ($1, $2, $3)',
    [ticker, shares, amountInvested]
  );
  res.json({ success: true });
});

// Removes a holding from the database by ticker symbol.
app.delete("/holdings/:ticker", async (req, res) => {
  await pool.query('DELETE FROM holdings WHERE ticker = $1', [req.params.ticker]);
  res.json({ success: true });
});

initDb()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => { console.error('Failed to initialise database:', err); process.exit(1); });
