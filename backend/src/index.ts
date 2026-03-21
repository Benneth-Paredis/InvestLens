import express from "express";
import { fetchStockData } from "./alphaVantage";
import { fetchPriceHistory } from "./alphaVantagePrices";
import { analysePortfolio } from "./openai";
import { Holding } from "./types";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/portfolio", async (req, res) => {
  const holdings: Holding[] = req.body.holdings;
  const results = await Promise.all(holdings.map(fetchStockData));
  res.json({ portfolio: results });
});

app.post("/analyse", async (req, res) => {
  const holdings: Holding[] = req.body.holdings;
  const stockData = await Promise.all(holdings.map(fetchStockData));
  const result = await analysePortfolio(stockData);
  res.json({ analysis: result });
});

app.get("/prices/:ticker/:interval", async (req, res) => {
  const { ticker, interval } = req.params;
  const result = await fetchPriceHistory(ticker, interval);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
