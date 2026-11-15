import Dexie, { Table } from 'dexie';

// ---------------------------------------------------------------------------
// Database version & migration strategy
// ---------------------------------------------------------------------------
// Bump DB_VERSION whenever the schema changes. Each version block below
// describes how to upgrade from the previous version without destroying user
// data. Add new `stores()` / `upgrade()` blocks as the app evolves.

export const DB_VERSION = 3;

export interface Book {
  id: string;
  title: string;
  subtitle?: string | null;
  authorIds: string[];
  isbn?: string | null;
  description?: string | null;
  publisher?: string | null;
  publicationDate?: string | null; // ISO date
  pageCount?: number | null;
  language?: string | null;
  genres: string[]; // genre names
  format?: string | null; // e.g. Paperback, Hardcover, eBook, Audiobook
  ownershipStatus?: string | null; // owned, borrowed, library, gifted
  readingStatus?: string | null; // want-to-read, currently-reading, finished, on-hold, did-not-finish
  coverImageId?: string | null;
  seriesId?: string | null;
  seriesPosition?: number | null;
  dateAdded?: string | null; // ISO date
  startDate?: string | null; // ISO date
  finishDate?: string | null; // ISO date
  currentPage?: number | null;
  percentageComplete?: number | null;
  rating?: number | null; // 0-5 (half stars)
  detailedScore?: number | null; // 0-100
  isFavorite?: boolean | null;
  isOwned?: boolean | null;
  isWishlistItem?: boolean | null;
  personalNotes?: string | null;
  readingUnit?: string | null; // pages | minutes
  currentPosition?: number | null; // page or minute
  totalPosition?: number | null; // total pages or minutes
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: string;
  name: string;
  biography?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Series {
  id: string;
  name: string;
  author?: string | null;
  description?: string | null;
  orderedBookIds: string[]; // book ids in reading order
  createdAt: string;
  updatedAt: string;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  date: string; // ISO date
  startTime?: string | null; // ISO time
  endTime?: string | null;
  durationMinutes?: number | null;
  startPage?: number | null;
  endPage?: number | null;
  pagesRead?: number | null;
  notes?: string | null;
  readingUnit?: string | null; // pages | minutes
  startedAt?: string | null; // ISO datetime (active session tracking)
  endedAt?: string | null; // ISO datetime
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  rating?: number | null; // 0-5
  detailedScore?: number | null; // 0-100
  reviewText?: string | null;
  spoilerFlag?: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  id: string;
  bookId: string;
  quoteText: string;
  pageNumber?: number | null;
  dateAdded: string;
  notes?: string | null;
}

export interface Note {
  id: string;
  bookId?: string | null;
  title?: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shelf {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  coverStyle?: string | null; // cover | spine
  bookIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  name: string;
  goalType?: string | null; // books | pages | hours
  target?: number | null;
  period?: string | null; // year | month | custom
  startDate?: string | null;
  endDate?: string | null;
  currentProgress?: number | null;
  status?: string | null; // active | completed | abandoned
  createdAt: string;
  updatedAt: string;
}

export interface Challenge {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  target?: number | null;
  progress?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null; // active | completed | abandoned
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  bookId?: string | null; // links to a book if added to library
  title: string;
  author?: string | null;
  coverImageId?: string | null;
  format?: string | null;
  estimatedPrice?: number | null;
  currency?: string | null;
  priority?: string | null; // low | medium | high
  plannedPurchaseDate?: string | null;
  notes?: string | null;
  status?: string | null; // wishlisted | purchased | cancelled
  createdAt: string;
  updatedAt: string;
}

export interface Preference {
  id: string;
  theme?: string | null; // dark | light | system
  accentColor?: string | null;
  defaultView?: string | null; // grid | list | spine
  defaultSort?: string | null;
  preferredReadingUnit?: string | null; // pages | minutes
  weekStartDay?: number | null; // 0 = Sunday
  dateFormat?: string | null;
  language?: string | null;
  animationsEnabled?: boolean | null;
  compactMode?: boolean | null;
  coverDisplayPreference?: string | null; // large | medium | small
  updatedAt: string;
}

export interface CalendarEntry {
  id: string;
  type: 'session' | 'start' | 'finish' | 'plan';
  bookId: string;
  date: string; // ISO date
  title?: string | null;
  pagesRead?: number | null;
  durationMinutes?: number | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Database class
// ---------------------------------------------------------------------------

export class BookTrackerDB extends Dexie {
  books!: Table<Book, string>;
  authors!: Table<Author, string>;
  series!: Table<Series, string>;
  readingSessions!: Table<ReadingSession, string>;
  reviews!: Table<Review, string>;
  quotes!: Table<Quote, string>;
  notes!: Table<Note, string>;
  shelves!: Table<Shelf, string>;
  goals!: Table<Goal, string>;
  challenges!: Table<Challenge, string>;
  wishlist!: Table<WishlistItem, string>;
  preferences!: Table<Preference, string>;
  covers!: Table<{ id: string; dataUrl: string; mimeType: string; width: number; height: number; updatedAt: string }, string>;
  calendarEntries!: Table<CalendarEntry, string>;

  constructor() {
    super('BookTrackerDB');
    this.version(DB_VERSION).stores({
      books: '++id, title, authorIds, isbn, readingStatus, genres, dateAdded, updatedAt, seriesId, isFavorite, rating',
      authors: '++id, name, updatedAt',
      series: '++id, name, updatedAt',
      readingSessions: '++id, bookId, date, startedAt, createdAt',
      reviews: '++id, bookId, rating, createdAt, updatedAt',
      quotes: '++id, bookId, dateAdded',
      notes: '++id, bookId, createdAt, updatedAt',
      shelves: '++id, name, updatedAt',
      goals: '++id, name, goalType, period, status, updatedAt',
      challenges: '++id, name, category, status, updatedAt',
      wishlist: '++id, bookId, title, status, priority, createdAt, updatedAt',
      preferences: '++id, updatedAt',
      covers: '++id, updatedAt',
      calendarEntries: '++id, bookId, date, type',
    });

    // Migration hooks can be added here as the app evolves.
    this.on('populate', () => {
      // Placeholder for future data migrations.
    });
  }
}

// Singleton instance
export const db = new BookTrackerDB();
export type { Book, Author, Series, ReadingSession, Review, Quote, Note, Shelf, Goal, Challenge, WishlistItem, Preference, CalendarEntry };

export function nowISO(): string {
  return new Date().toISOString();
}

export function newId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
