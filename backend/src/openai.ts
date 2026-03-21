import dotenv from 'dotenv';
import OpenAI from 'openai';
import { StockData } from './types';
import { buildPrompt } from './buildPrompt';

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analysePortfolio(portfolio: StockData[]): Promise<string> {
  const prompt = buildPrompt(portfolio);

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert portfolio analyst. Be concise, specific, and data-driven.' },
      { role: 'user', content: prompt },
    ],
  });

  return response.choices[0].message.content ?? '';
}
