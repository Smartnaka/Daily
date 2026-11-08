import { fetchRandomQuote } from '@/services/quoteService';
import {
  getCurrentQuote,
  getQuoteHistory,
  saveQuoteAndFetchTime,
} from '@/storage/quoteStorage';
import { isToday } from '@/utils/dates';
import type { Quote, QuoteSyncFailure, QuoteSyncResult } from '@/types/quote';

function getFailureReason(error: unknown): QuoteSyncFailure {
  if (error instanceof Error && error.name === 'AbortError') return 'timeout';
  if (error instanceof Error && error.message.includes('malformed')) return 'invalid-response';
  if (error instanceof Error && error.message.includes('storage')) return 'storage';
  if (error instanceof TypeError) return 'network';
  return 'unknown';
}

let refreshInFlight: Promise<QuoteSyncResult> | null = null;

async function refreshQuote(current: Quote | null): Promise<QuoteSyncResult> {
  try {
    const history = await getQuoteHistory();
    const next = await fetchRandomQuote(history.map((item) => item.id));
    await saveQuoteAndFetchTime(next);
    return { status: 'updated', quote: next, updated: true };
  } catch (error) {
    if (__DEV__) console.warn('Daily quote refresh failed; using cached quote', error);
    return { status: 'failed', quote: current, updated: false, reason: getFailureReason(error) };
  }
}

export async function ensureDailyQuote(force = false): Promise<QuoteSyncResult> {
  const current = await getCurrentQuote();
  if (!force && current && isToday(current.fetchedAt)) return { status: 'cached', quote: current, updated: false };
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = refreshQuote(current);
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}
