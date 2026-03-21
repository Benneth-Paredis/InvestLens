import { StockData } from './types';

export function buildPrompt(portfolio: StockData[]): string {
  const holdingsText = portfolio
    .map(
      (stock) => `
  Ticker: ${stock.ticker}
  Amount Invested: $${stock.amountInvested.toLocaleString()}
  Sector: ${stock.sector}
  Market Cap: ${stock.marketCap}
  52-Week High: ${stock.weekHigh52}
  52-Week Low: ${stock.weekLow52}
  P/E Ratio: ${stock.peRatio}`
    )
    .join('\n');

  return `You are a professional portfolio analyst. Analyze the following investment portfolio.

Portfolio Holdings:
${holdingsText}

Instructions:
- Summary: provide an overview of the portfolio including total amount invested, sector breakdown, and market cap breakdown (large-cap, mid-cap, small-cap). Include a diversification score out of 10 with justification.
- Risks: comment on sector concentration risk, valuation concerns based on P/E ratios, and where each holding is positioned relative to its 52-week high and low.
- Recommendations: suggest specific actions to improve diversification, rebalance overweight sectors, or address valuation concerns. Be concrete and actionable.

You MUST respond with a valid JSON object and nothing else — no markdown, no extra text outside the JSON.
The values for all three keys MUST be plain strings (not nested objects or arrays).
Use this exact structure:
{"summary": "plain text here", "risks": "plain text here", "recommendations": "plain text here"}`;
}
