import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Quote } from '@/types/quote';

const KEYS = {
  current: '@daily/current-quote',
  history: '@daily/quote-history',
  favorites: '@daily/favorite-quotes',
  lastFetch: '@daily/last-fetch',
} as const;

let storageQueue: Promise<void> = Promise.resolve();

function isQuote(value: unknown): value is Quote {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'number' &&
    Number.isFinite(candidate.id) &&
    typeof candidate.quote === 'string' &&
    candidate.quote.trim().length > 0 &&
    typeof candidate.author === 'string' &&
    candidate.author.trim().length > 0 &&
    typeof candidate.fetchedAt === 'string' &&
    !Number.isNaN(Date.parse(candidate.fetchedAt))
  );
}

function isQuoteArray(value: unknown): value is Quote[] {
  return Array.isArray(value) && value.every(isQuote);
}

async function readJson<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch (error) {
    if (__DEV__) console.warn(`Daily storage read failed for ${key}`, error);
    return fallback;
  }
}

function enqueueMutation<T>(operation: () => Promise<T>): Promise<T> {
  const result = storageQueue.then(operation, operation);
  storageQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function saveQuoteSnapshot(quote: Quote): Promise<void> {
  const history = await getQuoteHistory();
  const nextHistory = [quote, ...history.filter((item) => item.id !== quote.id)].slice(0, 100);
  await AsyncStorage.multiSet([
    [KEYS.current, JSON.stringify(quote)],
    [KEYS.history, JSON.stringify(nextHistory)],
    [KEYS.lastFetch, JSON.stringify(quote.fetchedAt)],
  ]);
}

export async function getCurrentQuote(): Promise<Quote | null> {
  return readJson<Quote | null>(KEYS.current, null, (value): value is Quote | null => value === null || isQuote(value));
}

export function saveCurrentQuote(quote: Quote): Promise<void> {
  return enqueueMutation(() => AsyncStorage.setItem(KEYS.current, JSON.stringify(quote)));
}

export function getQuoteHistory(): Promise<Quote[]> {
  return readJson(KEYS.history, [], isQuoteArray);
}

export function saveQuoteToHistory(quote: Quote): Promise<void> {
  return enqueueMutation(async () => {
    const history = await getQuoteHistory();
    const next = [quote, ...history.filter((item) => item.id !== quote.id)].slice(0, 100);
    await AsyncStorage.setItem(KEYS.history, JSON.stringify(next));
  });
}

export function saveQuoteAndFetchTime(quote: Quote): Promise<void> {
  return enqueueMutation(() => saveQuoteSnapshot(quote));
}

export function getFavoriteQuotes(): Promise<Quote[]> {
  return readJson(KEYS.favorites, [], isQuoteArray);
}

export function toggleFavorite(quote: Quote): Promise<boolean> {
  return enqueueMutation(async () => {
    const favorites = await getFavoriteQuotes();
    const exists = favorites.some((item) => item.id === quote.id);
    const next = exists ? favorites.filter((item) => item.id !== quote.id) : [quote, ...favorites];
    await AsyncStorage.setItem(KEYS.favorites, JSON.stringify(next));
    return !exists;
  });
}

export async function isFavorite(quoteId: number): Promise<boolean> {
  const favorites = await getFavoriteQuotes();
  return favorites.some((item) => item.id === quoteId);
}

export function getLastFetchTime(): Promise<string | null> {
  return readJson<string | null>(
    KEYS.lastFetch,
    null,
    (value): value is string | null => value === null || (typeof value === 'string' && !Number.isNaN(Date.parse(value))),
  );
}

export function saveLastFetchTime(timestamp: string): Promise<void> {
  return enqueueMutation(() => AsyncStorage.setItem(KEYS.lastFetch, JSON.stringify(timestamp)));
}
