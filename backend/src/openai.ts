// Calls the OpenAI API to generate a portfolio analysis from enriched stock data.

import dotenv from 'dotenv';
import OpenAI from 'openai';
import { StockData } from './types';
import { buildPrompt } from './buildPrompt';

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// The structured analysis returned by the model.
export interface AnalysisResult {
  summary: string;
  risks: string;
  opportunities: string;
  recommendations: string;
  score: number;
  scoreJustification: string;
}

// Sends the portfolio to GPT-4o-mini and parses the JSON analysis response.
export async function analysePortfolio(portfolio: StockData[]): Promise<AnalysisResult> {
  const prompt = buildPrompt(portfolio);

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert portfolio analyst. Be concise, specific, and data-driven. Always respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    // Force JSON output mode to avoid markdown or prose wrapping the response.
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content ?? '{}';
  return JSON.parse(raw) as AnalysisResult;
}
