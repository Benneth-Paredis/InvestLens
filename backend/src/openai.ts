import dotenv from 'dotenv';
import OpenAI from 'openai';
import { StockData } from './types';
import { buildPrompt } from './buildPrompt';

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AnalysisResult {
  summary: string;
  risks: string;
  recommendations: string;
}

export async function analysePortfolio(portfolio: StockData[]): Promise<AnalysisResult> {
  const prompt = buildPrompt(portfolio);

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert portfolio analyst. Be concise, specific, and data-driven. Always respond with valid JSON only.' },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content ?? '{}';
  return JSON.parse(raw) as AnalysisResult;
}
