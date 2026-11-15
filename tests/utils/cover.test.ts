import { describe, it, expect } from 'vitest';
import { generateFallbackCover } from '@/utils/cover';

describe('cover generation', () => {
  it('generates a data URL for a book', () => {
    const url = generateFallbackCover({
      title: 'The Ember Crown',
      author: 'Elara Voss',
      genre: 'fantasy',
      width: 400,
      height: 600,
    });
    expect(url).toMatch(/^data:image\//);
    expect(url.length).toBeGreaterThan(100);
  });

  it('handles long titles without crashing', () => {
    const url = generateFallbackCover({
      title: 'A Very Long Title That Should Wrap Across Multiple Lines In The Cover Design',
      author: 'Author Name',
      genre: 'mystery',
    });
    expect(url).toMatch(/^data:image\//);
  });

  it('produces different output for different genres', () => {
    const fantasy = generateFallbackCover({ title: 'T', author: 'A', genre: 'fantasy' });
    const scifi = generateFallbackCover({ title: 'T', author: 'A', genre: 'science-fiction' });
    expect(fantasy).not.toBe(scifi);
  });
});
