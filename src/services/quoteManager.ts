import { fetchRandomQuote } from '@/services/quoteService';
import {
  getCurrentQuote,
  getQuoteHistory,
  saveCurrentQuote,
  saveLastFetchTime,
  saveQuoteToHistory,
} from '@/storage/quoteStorage';
import { isToday } from '@/utils/dates';
import type { Quote } from '@/types/quote';

export async function ensureDailyQuote(force = false): Promise<{ quote: Quote | null; updated: boolean }> {
  const current = await getCurrentQuote();
  if (!force && current && isToday(current.fetchedAt)) return { quote: current, updated: false };

  try {
    const history = await getQuoteHistory();
    const next = await fetchRandomQuote(history.map((item) => item.id));
    await saveCurrentQuote(next);
    await saveQuoteToHistory(next);
    await saveLastFetchTime(next.fetchedAt);
    return { quote: next, updated: true };
  } catch (error) {
    if (__DEV__) console.warn('Daily quote refresh failed; using cached quote', error);
    return { quote: current, updated: false };
  }
}
