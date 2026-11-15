import { describe, it, expect } from 'vitest';
import {
  computePercentage,
  clamp,
  statusLabel,
  statusColor,
  computeLibraryStats,
  booksFinishedInRange,
  pagesReadInRange,
  readingHoursInRange,
  todayISO,
  isSameDay,
} from '@/utils/date';

describe('date utilities', () => {
  it('computePercentage clamps between 0 and 100', () => {
    expect(computePercentage(50, 100)).toBe(50);
    expect(computePercentage(0, 100)).toBe(0);
    expect(computePercentage(150, 100)).toBe(100);
    expect(computePercentage(null, 100)).toBe(0);
    expect(computePercentage(50, 0)).toBe(0);
  });

  it('clamp bounds a value', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('statusLabel returns readable labels', () => {
    expect(statusLabel('currently-reading')).toBe('Currently Reading');
    expect(statusLabel('finished')).toBe('Finished');
    expect(statusLabel('want-to-read')).toBe('Want to Read');
    expect(statusLabel(undefined)).toBe('Want to Read');
  });

  it('computeLibraryStats calculates counts', () => {
    const books = [
      { readingStatus: 'finished', rating: 5, currentPage: 100, pageCount: 100, isFavorite: true, isOwned: true },
      { readingStatus: 'currently-reading', rating: null, currentPage: 30, pageCount: 100, isFavorite: false, isOwned: true },
      { readingStatus: 'want-to-read', rating: null, currentPage: 0, pageCount: 100, isFavorite: false, isOwned: false },
    ] as any;
    const s = computeLibraryStats(books);
    expect(s.totalBooks).toBe(3);
    expect(s.finished).toBe(1);
    expect(s.currentlyReading).toBe(1);
    expect(s.wantToRead).toBe(1);
    expect(s.averageRating).toBe(5);
    expect(s.pagesRead).toBe(130);
    expect(s.favoriteCount).toBe(1);
    expect(s.ownedCount).toBe(2);
  });

  it('booksFinishedInRange filters by finish date', () => {
    const books = [
      { readingStatus: 'finished', finishDate: '2024-06-15' } as any,
      { readingStatus: 'finished', finishDate: '2024-01-05' } as any,
      { readingStatus: 'currently-reading', finishDate: null } as any,
    ];
    const result = booksFinishedInRange(books, '2024-06-01', '2024-06-30');
    expect(result.length).toBe(1);
    expect(result[0].finishDate).toBe('2024-06-15');
  });

  it('pagesReadInRange sums pages', () => {
    const sessions = [
      { date: '2024-06-01', pagesRead: 20 } as any,
      { date: '2024-06-02', pagesRead: 30 } as any,
      { date: '2024-07-01', pagesRead: 50 } as any,
    ];
    expect(pagesReadInRange(sessions, '2024-06-01', '2024-06-30')).toBe(50);
  });

  it('readingHoursInRange sums minutes', () => {
    const sessions = [
      { date: '2024-06-01', durationMinutes: 60 } as any,
      { date: '2024-06-02', durationMinutes: 30 } as any,
    ];
    expect(readingHoursInRange(sessions, '2024-06-01', '2024-06-30')).toBe(1.5);
  });

  it('todayISO returns YYYY-MM-DD', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('isSameDay compares local dates', () => {
    expect(isSameDay('2024-06-15', '2024-06-15')).toBe(true);
    expect(isSameDay('2024-06-15', '2024-06-16')).toBe(false);
  });
});
