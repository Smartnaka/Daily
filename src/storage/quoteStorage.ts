import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Quote } from '@/types/quote';

const KEYS = {
  current: '@daily/current-quote',
  history: '@daily/quote-history',
  favorites: '@daily/favorite-quotes',
  lastFetch: '@daily/last-fetch',
} as const;

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return parsed as T;
  } catch (error) {
    if (__DEV__) console.warn(`Daily storage read failed for ${key}`, error);
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (__DEV__) console.warn(`Daily storage write failed for ${key}`, error);
    throw error;
  }
}

export async function getCurrentQuote(): Promise<Quote | null> {
  const quote = await readJson<Quote | null>(KEYS.current, null);
  return quote && typeof quote.quote === 'string' && typeof quote.author === 'string' ? quote : null;
}

export function saveCurrentQuote(quote: Quote): Promise<void> {
  return writeJson(KEYS.current, quote);
}

export function getQuoteHistory(): Promise<Quote[]> {
  return readJson<Quote[]>(KEYS.history, []);
}

export async function saveQuoteToHistory(quote: Quote): Promise<void> {
  const history = await getQuoteHistory();
  const next = [quote, ...history.filter((item) => item.id !== quote.id)].slice(0, 100);
  await writeJson(KEYS.history, next);
}

export function getFavoriteQuotes(): Promise<Quote[]> {
  return readJson<Quote[]>(KEYS.favorites, []);
}

export async function toggleFavorite(quote: Quote): Promise<boolean> {
  const favorites = await getFavoriteQuotes();
  const exists = favorites.some((item) => item.id === quote.id);
  const next = exists ? favorites.filter((item) => item.id !== quote.id) : [quote, ...favorites];
  await writeJson(KEYS.favorites, next);
  return !exists;
}

export async function isFavorite(quoteId: number): Promise<boolean> {
  const favorites = await getFavoriteQuotes();
  return favorites.some((item) => item.id === quoteId);
}

export async function getLastFetchTime(): Promise<string | null> {
  return readJson<string | null>(KEYS.lastFetch, null);
}

export function saveLastFetchTime(timestamp: string): Promise<void> {
  return writeJson(KEYS.lastFetch, timestamp);
}
