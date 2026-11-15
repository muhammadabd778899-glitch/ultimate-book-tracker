import { Book, Preference, ReadingSession } from '@/db';

// ---------------------------------------------------------------------------
// Date helpers (timezone-safe, local calendar dates)
// ---------------------------------------------------------------------------

export function todayISO(): string {
  // Return local YYYY-MM-DD without timezone offset issues
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isoToLocalDate(iso?: string | null): string | null {
  if (!iso) return null;
  // Accept YYYY-MM-DD or full ISO; extract date part in local time
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDate(iso?: string | null, pref?: Preference | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const df = pref?.dateFormat || 'MMM d, yyyy';
  try {
    return new Intl.DateTimeFormat(pref?.language || undefined, {
      year: df.includes('yyyy') ? 'numeric' : undefined,
      month: df.includes('MMM') ? 'short' : df.includes('MM') ? '2-digit' : undefined,
      day: df.includes('d') || df.includes('dd') ? 'numeric' : undefined,
    } as Intl.DateTimeFormatOptions).format(d);
  } catch {
    return isoToLocalDate(iso) ?? iso;
  }
}

export function formatRelative(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  try {
    return new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(
      Math.round((d.getTime() - Date.now()) / 86400000),
      'day'
    );
  } catch {
    return '';
  }
}

export function isSameDay(a: string | Date, b: string | Date): boolean {
  const da = typeof a === 'string' ? new Date(a + 'T00:00:00') : a;
  const db = typeof b === 'string' ? new Date(b + 'T00:00:00') : b;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function daysBetween(from: string, to: string): number {
  const d1 = new Date(from + 'T00:00:00');
  const d2 = new Date(to + 'T00:00:00');
  return Math.round((d2.getTime() - d1.getTime()) / 86400000);
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const end = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
  return { start, end };
}

export function getYearRange(year: number): { start: string; end: string } {
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

// ---------------------------------------------------------------------------
// Progress & calculation helpers
// ---------------------------------------------------------------------------

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function computePercentage(current: number | null, total: number | null): number {
  if (!current || !total || total <= 0) return 0;
  return clamp(Math.round((current / total) * 100), 0, 100);
}

export function statusColor(status?: string | null): string {
  switch (status) {
    case 'currently-reading': return 'text-accent';
    case 'finished': return 'text-success';
    case 'on-hold': return 'text-warning';
    case 'did-not-finish': return 'text-danger';
    case 'want-to-read':
    default: return 'text-text-muted';
  }
}

export function statusLabel(status?: string | null): string {
  switch (status) {
    case 'currently-reading': return 'Currently Reading';
    case 'finished': return 'Finished';
    case 'on-hold': return 'On Hold';
    case 'did-not-finish': return 'Did Not Finish';
    case 'want-to-read':
    default: return 'Want to Read';
  }
}

// ---------------------------------------------------------------------------
// Library statistics calculations (used by stats / home / goals)
// ---------------------------------------------------------------------------

export interface LibraryStats {
  totalBooks: number;
  currentlyReading: number;
  finished: number;
  wantToRead: number;
  onHold: number;
  didNotFinish: number;
  pagesRead: number;
  averageRating: number;
  ratedBooks: number;
  favoriteCount: number;
  ownedCount: number;
  totalPages: number;
}

export function computeLibraryStats(books: Book[]): LibraryStats {
  const totalBooks = books.length;
  const currentlyReading = books.filter((b) => b.readingStatus === 'currently-reading').length;
  const finished = books.filter((b) => b.readingStatus === 'finished').length;
  const wantToRead = books.filter((b) => b.readingStatus === 'want-to-read').length;
  const onHold = books.filter((b) => b.readingStatus === 'on-hold').length;
  const didNotFinish = books.filter((b) => b.readingStatus === 'did-not-finish').length;

  const rated = books.filter((b) => b.rating != null && b.rating > 0);
  const averageRating =
    rated.length > 0
      ? Math.round((rated.reduce((s, b) => s + (b.rating ?? 0), 0) / rated.length) * 10) / 10
      : 0;

  const pagesRead = books.reduce((s, b) => s + (b.currentPage ?? 0), 0);
  const totalPages = books.reduce((s, b) => s + (b.pageCount ?? 0), 0);
  const favoriteCount = books.filter((b) => b.isFavorite).length;
  const ownedCount = books.filter((b) => b.isOwned).length;

  return {
    totalBooks,
    currentlyReading,
    finished,
    wantToRead,
    onHold,
    didNotFinish,
    pagesRead,
    averageRating,
    ratedBooks: rated.length,
    favoriteCount,
    ownedCount,
    totalPages,
  };
}

export function computeStreak(sessions: ReadingSession[]): { current: number; longest: number } {
  if (sessions.length === 0) return { current: 0, longest: 0 };
  // Unique dates with at least one session
  const dates = Array.from(
    new Set(sessions.map((s) => isoToLocalDate(s.date)).filter(Boolean) as string[])
  ).sort();
  let current = 0;
  let longest = 0;
  let run = 1;
  const today = todayISO();
  // Determine current streak ending today or yesterday
  for (let i = 0; i < dates.length; i++) {
    if (i > 0) {
      const diff = daysBetween(dates[i - 1], dates[i]);
      run = diff === 1 ? run + 1 : 1;
    }
    longest = Math.max(longest, run);
  }
  // Current streak: count backwards from most recent date if it's today or yesterday
  const last = dates[dates.length - 1];
  const diffToToday = daysBetween(last, today);
  if (diffToToday === 0 || diffToToday === 1) {
    current = run; // run at end of sorted array
  } else {
    current = 0;
  }
  return { current, longest };
}

export function booksFinishedInRange(books: Book[], start: string, end: string): Book[] {
  return books.filter(
    (b) => b.readingStatus === 'finished' && b.finishDate && b.finishDate >= start && b.finishDate <= end
  );
}

export function sessionsInRange(sessions: ReadingSession[], start: string, end: string): ReadingSession[] {
  return sessions.filter((s) => s.date >= start && s.date <= end);
}

export function pagesReadInRange(sessions: ReadingSession[], start: string, end: string): number {
  return sessionsInRange(sessions, start, end).reduce((s, x) => s + (x.pagesRead ?? 0), 0);
}

export function readingHoursInRange(sessions: ReadingSession[], start: string, end: string): number {
  const minutes = sessionsInRange(sessions, start, end).reduce((s, x) => s + (x.durationMinutes ?? 0), 0);
  return Math.round((minutes / 60) * 10) / 10;
}
