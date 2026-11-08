import { QUOTE_API_URL } from '@/constants/app';
import type { ApiQuote, Quote } from '@/types/quote';

const REQUEST_TIMEOUT_MS = 8_000;
const MAX_DUPLICATE_ATTEMPTS = 3;

function isValidApiQuote(value: unknown): value is ApiQuote {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.quote === 'string' &&
    candidate.quote.trim().length > 0 &&
    typeof candidate.author === 'string' &&
    candidate.author.trim().length > 0
  );
}

export async function fetchRandomQuote(existingIds: number[] = []): Promise<Quote> {
  for (let attempt = 0; attempt < MAX_DUPLICATE_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(QUOTE_API_URL, { signal: controller.signal });
      if (!response.ok) throw new Error(`Quote API returned ${response.status}`);
      const data: unknown = await response.json();
      if (!isValidApiQuote(data)) throw new Error('Quote API returned malformed data');
      const quote = {
        id: data.id,
        quote: data.quote.trim(),
        author: data.author.trim(),
        fetchedAt: new Date().toISOString(),
      };
      if (!existingIds.includes(quote.id) || attempt === MAX_DUPLICATE_ATTEMPTS - 1) return quote;
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error('Unable to fetch a new quote');
}
