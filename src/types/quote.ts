export type Quote = {
  id: number;
  quote: string;
  author: string;
  fetchedAt: string;
};

export type ApiQuote = {
  id: number;
  quote: string;
  author: string;
};

export type QuoteSyncFailure = 'network' | 'timeout' | 'invalid-response' | 'storage' | 'unknown';

export type QuoteSyncResult =
  | { status: 'updated'; quote: Quote; updated: true }
  | { status: 'cached'; quote: Quote | null; updated: false }
  | { status: 'failed'; quote: Quote | null; updated: false; reason: QuoteSyncFailure };
