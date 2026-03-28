// Constructs the GPT prompt used to analyse a portfolio.

import { StockData } from './types';

// Builds a structured prompt instructing the model to return JSON with enriched analysis sections.
export function buildPrompt(portfolio: StockData[]): string {
  const totalInvested = portfolio.reduce((sum, s) => sum + s.amountInvested, 0);

  // Format each holding with derived metrics the AI can reason about directly.
  const holdingsText = portfolio
    .map((stock) => {
      const currentPrice = parseFloat(stock.currentPrice.replace('$', ''));
      const high = parseFloat(stock.weekHigh52);
      const low = parseFloat(stock.weekLow52);
      const portfolioWeight = totalInvested > 0
        ? ((stock.amountInvested / totalInvested) * 100).toFixed(1)
        : 'N/A';
      const pctFromHigh = (!isNaN(currentPrice) && !isNaN(high) && high > 0)
        ? (((currentPrice - high) / high) * 100).toFixed(1)
        : 'N/A';
      const pctFromLow = (!isNaN(currentPrice) && !isNaN(low) && low > 0)
        ? (((currentPrice - low) / low) * 100).toFixed(1)
        : 'N/A';

      return `
  Ticker: ${stock.ticker}
  Sector: ${stock.sector}
  Amount Invested: $${stock.amountInvested.toLocaleString()}
  Portfolio Weight: ${portfolioWeight}%
  Current Price: ${stock.currentPrice}
  52-Week High: $${stock.weekHigh52} (${pctFromHigh}% from high)
  52-Week Low: $${stock.weekLow52} (+${pctFromLow}% from low)
  P/E Ratio: ${stock.peRatio}
  Market Cap: ${stock.marketCap}`;
    })
    .join('\n');

  return `You are a professional portfolio analyst. Analyse the following investment portfolio and provide a detailed, data-driven assessment.

Total Portfolio Value: $${totalInvested.toLocaleString()}
Number of Holdings: ${portfolio.length}

Holdings:
${holdingsText}

Instructions for each section — always reference specific tickers by name, use the numbers provided, and format each point as a bullet starting with "- ":

- summary: 4–6 bullets covering total invested, sector/geographic breakdown, market-cap mix (large/mid/small), and concentration highlights. End with one sentence on overall portfolio character.
- risks: 4–6 bullets. For each major risk, name the specific ticker(s) involved. Cover: sector concentration, P/E valuation concerns (flag any P/E above 40), holdings near 52-week highs (within 5%), holdings far below 52-week highs (more than 30% off), and any single position over 30% of the portfolio.
- opportunities: 3–5 bullets of specific, actionable opportunities — e.g. sectors/geographies missing, undervalued tickers (low P/E, near 52W low), or positions worth adding to. Name tickers or suggest specific sectors/ETFs.
- recommendations: 4–6 concrete, prioritised action steps. Each bullet should be a specific action (trim X, add Y, consider hedging with Z). Reference portfolio weights and specific tickers.
- score: an integer from 1–10 rating overall portfolio health (diversification, valuation, risk balance).
- scoreJustification: one sentence explaining the score.

You MUST respond with a valid JSON object and nothing else — no markdown, no extra text outside the JSON.
All string values must use "\\n- " to separate bullet points (not actual newlines).
Use this exact structure:
{"summary": "- bullet\\n- bullet", "risks": "- bullet\\n- bullet", "opportunities": "- bullet\\n- bullet", "recommendations": "- bullet\\n- bullet", "score": 7, "scoreJustification": "one sentence here"}`;
}
