export function isToday(timestamp: string | null | undefined): boolean {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function formatDate(timestamp: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!timestamp) return 'Not yet synced';
  return new Intl.DateTimeFormat(undefined, options ?? { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(timestamp),
  );
}

export function formatTime(timestamp: string | null | undefined): string {
  if (!timestamp) return 'Not yet synced';
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(timestamp));
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
