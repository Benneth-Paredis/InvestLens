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

  return `You are a professional portfolio analyst. Analyze the following investment portfolio and respond with exactly three sections: Summary, Risks, and Recommendations.

Portfolio Holdings:
${holdingsText}

Instructions:
- In the Summary section: provide an overview of the portfolio including total amount invested, sector breakdown, and market cap breakdown (large-cap, mid-cap, small-cap). Include a diversification score out of 10 with justification.
- In the Risks section: comment on sector concentration risk, valuation concerns based on P/E ratios, and where each holding is positioned relative to its 52-week high and low (e.g. near highs may indicate overvaluation, near lows may indicate distress or opportunity).
- In the Recommendations section: suggest specific actions to improve diversification, rebalance overweight sectors, or address valuation concerns. Be concrete and actionable.

Format your response with each section clearly labeled as "Summary:", "Risks:", and "Recommendations:".`;
}
