import { Book, Author, Series, Shelf, Goal, Challenge, WishlistItem, Preference, ReadingSession, Review, Quote, Note, CalendarEntry } from '@/db';

// ---------------------------------------------------------------------------
// Versioned backup format
// ---------------------------------------------------------------------------

export const BACKUP_FORMAT_VERSION = 1;
export const APP_VERSION = '1.0.0';

export interface BackupManifest {
  formatVersion: number;
  appVersion: string;
  exportDate: string;
  recordCounts: Record<string, number>;
}

export interface BackupData {
  manifest: BackupManifest;
  books: Book[];
  authors: Author[];
  series: Series[];
  readingSessions: ReadingSession[];
  reviews: Review[];
  quotes: Quote[];
  notes: Note[];
  shelves: Shelf[];
  goals: Goal[];
  challenges: Challenge[];
  wishlist: WishlistItem[];
  preferences: Preference[];
  covers: { id: string; dataUrl: string; mimeType: string; width: number; height: number; updatedAt: string }[];
  calendarEntries: CalendarEntry[];
}

// ---------------------------------------------------------------------------
// Export / Import
// ---------------------------------------------------------------------------

export function createBackup(records: {
  books: Book[];
  authors: Author[];
  series: Series[];
  readingSessions: ReadingSession[];
  reviews: Review[];
  quotes: Quote[];
  notes: Note[];
  shelves: Shelf[];
  goals: Goal[];
  challenges: Challenge[];
  wishlist: WishlistItem[];
  preferences: Preference[];
  covers: ReturnType<typeof extractCovers>;
  calendarEntries: CalendarEntry[];
}): string {
  const manifest: BackupManifest = {
    formatVersion: BACKUP_FORMAT_VERSION,
    appVersion: APP_VERSION,
    exportDate: new Date().toISOString(),
    recordCounts: {
      books: records.books.length,
      authors: records.authors.length,
      series: records.series.length,
      readingSessions: records.readingSessions.length,
      reviews: records.reviews.length,
      quotes: records.quotes.length,
      notes: records.notes.length,
      shelves: records.shelves.length,
      goals: records.goals.length,
      challenges: records.challenges.length,
      wishlist: records.wishlist.length,
      preferences: records.preferences.length,
      covers: records.covers.length,
      calendarEntries: records.calendarEntries.length,
    },
  };
  const backup: BackupData = { manifest, ...records } as BackupData;
  return JSON.stringify(backup, null, 2);
}

export function parseBackup(json: string): BackupData {
  const data = JSON.parse(json) as BackupData;
  if (!data || !data.manifest || data.manifest.formatVersion !== BACKUP_FORMAT_VERSION) {
    throw new Error('Unsupported or invalid backup format version.');
  }
  return data;
}

export function validateBackup(data: BackupData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const required: Array<keyof BackupData> = [
    'books', 'authors', 'series', 'readingSessions', 'reviews', 'quotes', 'notes',
    'shelves', 'goals', 'challenges', 'wishlist', 'preferences', 'covers', 'calendarEntries',
  ];
  for (const key of required) {
    if (!Array.isArray(data[key])) {
      errors.push(`Missing or invalid collection: ${key}`);
    }
  }
  if (!data.manifest || data.manifest.formatVersion !== BACKUP_FORMAT_VERSION) {
    errors.push('Unsupported backup format version.');
  }
  return { valid: errors.length === 0, errors };
}

export function downloadBackup(json: string, fileName?: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName ?? `book-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

export const CSV_DEFAULT_COLUMNS = [
  'title', 'author', 'isbn', 'genre', 'status', 'rating', 'pageCount', 'format', 'description', 'dateStarted', 'dateFinished',
];

export function csvEscape(value: string | number | undefined | null): string {
  if (value == null) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function booksToCSV(books: Book[]): string {
  const header = CSV_DEFAULT_COLUMNS.join(',');
  const rows = books.map((b) => {
    const getAuthors = (): string => {
      // We don't have author names here; fallback to placeholder
      return b.authorIds.join(';');
    };
    return [
      csvEscape(b.title),
      csvEscape(getAuthors()),
      csvEscape(b.isbn),
      csvEscape(b.genres.join(';')),
      csvEscape(b.readingStatus),
      csvEscape(b.rating),
      csvEscape(b.pageCount),
      csvEscape(b.format),
      csvEscape(b.description),
      csvEscape(b.startDate),
      csvEscape(b.finishDate),
    ].join(',');
  });
  return [header, ...rows].join('\n');
}

export function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });
    rows.push(row);
  }
  return { headers, rows };
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        values.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  values.push(current);
  return values;
}

export function extractCovers(covers: { id: string; dataUrl: string; mimeType: string; width: number; height: number; updatedAt: string }[]) {
  return covers;
}
