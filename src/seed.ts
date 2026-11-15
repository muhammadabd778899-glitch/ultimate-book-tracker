import { db, newId, nowISO, type Book, type Author, type Series, type Shelf, type Goal, type Challenge, type WishlistItem, type Preference, type ReadingSession, type Review, type Quote } from '@/db';
import { generateFallbackCover } from '@/utils/cover';

// ---------------------------------------------------------------------------
// Original sample cover artwork (SVG data URLs). Distinct compositions per book.
// ---------------------------------------------------------------------------

function svgCover({
  title,
  author,
  genre,
  primary,
  secondary,
  accent,
}: {
  title: string;
  author: string;
  genre: string;
  primary: string;
  secondary: string;
  accent: string;
}): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const shortTitle = esc(title);
  const shortAuthor = esc(author);
  const genreTag = esc(genre.charAt(0).toUpperCase() + genre.slice(1));
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E
    %3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='${primary}'/%3E%3Cstop offset='0.55%25' stop-color='${secondary}'/%3E%3Cstop offset='100%25' stop-color='${primary}'/%3E%3C/linearGradient%3E%3C/defs%3E
    %3Crect width='400' height='600' fill='url(%23g)'/%3E
    %3Crect x='12' y='12' width='376' height='576' fill='none' stroke='rgba(255,255,255,0.35)' stroke-width='3' rx='18'/%3E
    %3Ccircle cx='120' cy='110' r='70' fill='rgba(255,255,255,0.12)'/%3E
    %3Ccircle cx='280' cy='170' r='55' fill='rgba(255,255,255,0.09)'/%3E
    %3Ccircle cx='80' cy='460' r='45' fill='rgba(255,255,255,0.08)'/%3E
    %3Cpath d='M 200 420 Q 300 380 380 460' fill='none' stroke='rgba(255,255,255,0.22)' stroke-width='2'/%3E
    %3Ctext x='200' y='310' font-family='Georgia, serif' font-weight='bold' font-size='30' fill='%23F7F5F2' text-anchor='middle' letter-spacing='2'%3E${shortTitle}%3C/text%3E
    %3Crect x='150' y='410' width='100' height='5' fill='${accent}'/%3E
    %3Ctext x='200' y='465' font-family='Georgia, serif' font-size='16' fill='rgba(247,245,242,0.75)' text-anchor='middle'%3Eby ${shortAuthor}%3C/text%3E
    %3Crect x='140' y='520' width='120' height='34' rx='6' fill='%23101014'/%3E
    %3Ctext x='200' y='540' font-family='sans-serif' font-size='13' fill='%23F7F5F2' text-anchor='middle'%3E${genreTag}%3C/text%3E
  %3C/svg%3E`;
}

const PALETTES: Record<string, { p: string; s: string; a: string }> = {
  fantasy: { p: '#6366f1', s: '#4f46e5', a: '#a78bfa' },
  'science-fiction': { p: '#0891b2', s: '#0369a1', a: '#22d3ee' },
  mystery: { p: '#4b5563', s: '#374151', a: '#cbd5e1' },
  thriller: { p: '#7f1d1d', s: '#450a0a', a: '#fca5a5' },
  romance: { p: '#be185d', s: '#881337', a: '#fbcfe8' },
  'historical-fiction': { p: '#92400e', s: '#78350f', a: '#fcd34d' },
  'self-help': { p: '#047857', s: '#065f46', a: '#86efac' },
  business: { p: '#1d4ed8', s: '#1e40af', a: '#bfdbfe' },
  psychology: { p: '#7c3aed', s: '#6b21a8', a: '#e9d5ff' },
  biography: { p: '#1e293b', s: '#0f172a', a: '#cbd5e1' },
  'personal-development': { p: '#059669', s: '#047857', a: '#bbf7d0' },
  classics: { p: '#475569', s: '#334155', a: '#94a3b8' },
  nonfiction: { p: '#0f172a', s: '#020617', a: '#e2e8f0' },
  poetry: { p: '#db2777', s: '#be185d', a: '#fbcfe8' },
  comics: { p: '#ea580c', s: '#c2410c', a: '#fdba74' },
  'graphic-novels': { p: '#c026d3', s: '#a21caf', a: '#f0abfc' },
};

function pal(genre: string) {
  return PALETTES[genre] ?? PALETTES.default;
}

// ---------------------------------------------------------------------------
// Sample authors
// ---------------------------------------------------------------------------

const authors: Author[] = [
  { id: newId(), name: 'Elara Voss', biography: 'Award-winning speculative fiction writer known for lush world-building.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Cassian Marlowe', biography: 'Former investigative journalist turned mystery novelist.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Mira Thorne', biography: 'Romance and contemporary fiction author from the Pacific Northwest.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Darius Kaine', biography: 'Science-fiction writer with a background in astrophysics.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Julien Beaufort', biography: 'Historical fiction author focusing on untold stories of the 18th century.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Naomi Chen', biography: 'Self-help and mindfulness author, certified coach.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Theo Sterling', biography: 'Business strategist and bestselling author on creative leadership.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Lena Petrova', biography: 'Cognitive psychologist and popular science writer.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Samuel Greene', biography: 'Biographer and historian specializing in artists and visionaries.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Amina Diallo', biography: 'Nonfiction writer exploring culture, cities, and community.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
];

const authorByName = new Map(authors.map((a) => [a.name, a]));

// ---------------------------------------------------------------------------
// Sample books (~40)
// ---------------------------------------------------------------------------

type BookInput = Omit<Book, 'id' | 'createdAt' | 'updatedAt'> & { coverDataUrl?: string };

function book(input: BookInput): Book {
  const id = newId();
  return {
    id,
    title: input.title,
    subtitle: input.subtitle ?? null,
    authorIds: input.authorIds,
    isbn: input.isbn ?? null,
    description: input.description ?? null,
    publisher: input.publisher ?? null,
    publicationDate: input.publicationDate ?? null,
    pageCount: input.pageCount ?? null,
    language: input.language ?? 'English',
    genres: input.genres,
    format: input.format ?? 'Paperback',
    ownershipStatus: input.ownershipStatus ?? 'owned',
    readingStatus: input.readingStatus ?? 'want-to-read',
    coverImageId: null, // set after covers are stored
    seriesId: input.seriesId ?? null,
    seriesPosition: input.seriesPosition ?? null,
    dateAdded: input.dateAdded ?? nowISO(),
    startDate: input.startDate ?? null,
    finishDate: input.finishDate ?? null,
    currentPage: input.currentPage ?? null,
    percentageComplete: input.percentageComplete ?? null,
    rating: input.rating ?? null,
    detailedScore: input.detailedScore ?? null,
    isFavorite: input.isFavorite ?? false,
    isOwned: input.isOwned ?? true,
    isWishlistItem: input.isWishlistItem ?? false,
    personalNotes: input.personalNotes ?? null,
    readingUnit: input.readingUnit ?? 'pages',
    currentPosition: input.currentPosition ?? null,
    totalPosition: input.totalPosition ?? null,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
}

const books: Book[] = [
  // Fantasy
  book({
    title: 'The Ember Crown',
    subtitle: 'A Tale of the Shattered Realms',
    authorIds: [authorByName.get('Elara Voss')!.id],
    isbn: '978-1-60309-450-1',
    description: 'In a world where fire is memory, a displaced heir must reclaim a crown that burns all who touch it. Lush, cinematic fantasy with an original magic system.',
    publisher: 'Azure Vale Press',
    publicationDate: '2022-04-12',
    pageCount: 432,
    genres: ['fantasy'],
    format: 'Hardcover',
    readingStatus: 'finished',
    startDate: '2024-01-10',
    finishDate: '2024-02-15',
    currentPage: 432,
    percentageComplete: 100,
    rating: 4.5,
    detailedScore: 88,
    isFavorite: true,
    coverDataUrl: svgCover({ title: 'The Ember Crown', author: 'Elara Voss', genre: 'fantasy', ...pal('fantasy') }),
    seriesPosition: 1,
  }),
  book({
    title: 'Starless Tides',
    subtitle: '',
    authorIds: [authorByName.get('Elara Voss')!.id],
    isbn: '978-1-60309-512-6',
    description: 'The sequel to The Ember Crown. The tides have gone dark, and the realm teeters on the edge of an ancient awakening.',
    publisher: 'Azure Vale Press',
    publicationDate: '2024-06-20',
    pageCount: 398,
    genres: ['fantasy'],
    format: 'Paperback',
    readingStatus: 'currently-reading',
    startDate: '2024-11-01',
    currentPage: 187,
    percentageComplete: 47,
    coverDataUrl: svgCover({ title: 'Starless Tides', author: 'Elara Voss', genre: 'fantasy', ...pal('fantasy') }),
    seriesPosition: 2,
  }),
  book({
    title: 'The Ashen Archive',
    subtitle: '',
    authorIds: [authorByName.get('Elara Voss')!.id],
    isbn: null,
    description: 'A forgotten library holds the last records of a civilization that erased itself.',
    publisher: 'Azure Vale Press',
    publicationDate: null,
    pageCount: 310,
    genres: ['fantasy'],
    format: 'Paperback',
    readingStatus: 'want-to-read',
    coverDataUrl: svgCover({ title: 'The Ashen Archive', author: 'Elara Voss', genre: 'fantasy', ...pal('fantasy') }),
  }),

  // Mystery
  book({
    title: 'The Silent Gallery',
    subtitle: '',
    authorIds: [authorByName.get('Cassian Marlowe')!.id],
    isbn: '978-1-55211-331-4',
    description: 'When a priceless painting vanishes from a locked gallery, only one witness remains: a guard who remembers nothing.',
    publisher: 'Iron Quill Books',
    publicationDate: '2023-09-05',
    pageCount: 296,
    genres: ['mystery'],
    format: 'Paperback',
    readingStatus: 'finished',
    startDate: '2024-03-01',
    finishDate: '2024-03-22',
    currentPage: 296,
    percentageComplete: 100,
    rating: 4,
    detailedScore: 82,
    coverDataUrl: svgCover({ title: 'The Silent Gallery', author: 'Cassian Marlowe', genre: 'mystery', ...pal('mystery') }),
  }),
  book({
    title: 'Midnight at the Clocktower',
    subtitle: '',
    authorIds: [authorByName.get('Cassian Marlowe')!.id],
    isbn: '978-1-55211-408-3',
    description: 'Eleven chimes. A midnight murder. A detective who cannot trust the clock—or her own memory.',
    publisher: 'Iron Quill Books',
    publicationDate: '2024-07-17',
    pageCount: 340,
    genres: ['mystery'],
    format: 'Hardcover',
    readingStatus: 'want-to-read',
    coverDataUrl: svgCover({ title: 'Midnight at the Clocktower', author: 'Cassian Marlowe', genre: 'mystery', ...pal('mystery') }),
  }),

  // Thriller
  book({
    title: 'False Horizon',
    subtitle: '',
    authorIds: [authorByName.get('Cassian Marlowe')!.id],
    isbn: '978-1-55211-445-8',
    description: 'A pilot wakes in a hospital with no memory of the crash—and a note in her own handwriting warning her not to fly again.',
    publisher: 'Iron Quill Books',
    publicationDate: '2023-02-14',
    pageCount: 312,
    genres: ['thriller'],
    format: 'Paperback',
    readingStatus: 'finished',
    startDate: '2024-05-05',
    finishDate: '2024-05-18',
    currentPage: 312,
    percentageComplete: 100,
    rating: 4.5,
    detailedScore: 85,
    coverDataUrl: svgCover({ title: 'False Horizon', author: 'Cassian Marlowe', genre: 'thriller', ...pal('thriller') }),
  }),
  book({
    title: 'Vanishing Point',
    subtitle: '',
    authorIds: [authorByName.get('Cassian Marlowe')!.id],
    isbn: null,
    description: 'People are disappearing from the same highway rest stop every seventeen years. This year, it is your turn.',
    publisher: 'Iron Quill Books',
    publicationDate: null,
    pageCount: 278,
    genres: ['thriller'],
    format: 'Paperback',
    readingStatus: 'on-hold',
    coverDataUrl: svgCover({ title: 'Vanishing Point', author: 'Cassian Marlowe', genre: 'thriller', ...pal('thriller') }),
  }),

  // Romance
  book({
    title: 'Letters from Verona',
    subtitle: '',
    authorIds: [authorByName.get('Mira Thorne')!.id],
    isbn: '978-1-88422-112-9',
    description: 'Two strangers exchange letters across centuries through a shared desk in a Florence bookshop.',
    publisher: 'Velvet Thread Press',
    publicationDate: '2023-11-08',
    pageCount: 284,
    genres: ['romance'],
    format: 'Paperback',
    readingStatus: 'finished',
    startDate: '2024-08-12',
    finishDate: '2024-09-01',
    currentPage: 284,
    percentageComplete: 100,
    rating: 5,
    detailedScore: 95,
    isFavorite: true,
    coverDataUrl: svgCover({ title: 'Letters from Verona', author: 'Mira Thorne', genre: 'romance', ...pal('romance') }),
  }),
  book({
    title: 'The Summer House',
    subtitle: '',
    authorIds: [authorByName.get('Mira Thorne')!.id],
    isbn: '978-1-88422-147-1',
    description: 'A crumbling coastal house holds a summer romance neither of them expected—or deserved.',
    publisher: 'Velvet Thread Press',
    publicationDate: '2024-05-30',
    pageCount: 260,
    genres: ['romance'],
    format: 'Paperback',
    readingStatus: 'want-to-read',
    coverDataUrl: svgCover({ title: 'The Summer House', author: 'Mira Thorne', genre: 'romance', ...pal('romance') }),
  }),

  // Science Fiction
  book({
    title: 'Orbit Station Nine',
    subtitle: '',
    authorIds: [authorByName.get('Darius Kaine')!.id],
    isbn: '978-1-73288-209-5',
    description: 'The last functioning station above a dead Earth receives a signal from a planet that should not exist.',
    publisher: 'Nebula Gate',
    publicationDate: '2022-11-30',
    pageCount: 410,
    genres: ['science-fiction'],
    format: 'Hardcover',
    readingStatus: 'finished',
    startDate: '2024-06-01',
    finishDate: '2024-07-04',
    currentPage: 410,
    percentageComplete: 100,
    rating: 4.5,
    detailedScore: 87,
    coverDataUrl: svgCover({ title: 'Orbit Station Nine', author: 'Darius Kaine', genre: 'science-fiction', ...pal('science-fiction') }),
  }),
  book({
    title: 'Quantum Tides',
    subtitle: '',
    authorIds: [authorByName.get('Darius Kaine')!.id],
    isbn: '978-1-73288-255-2',
    description: 'Time flows differently in the deep colonies. One man races to return home before his daughter ages beyond recognition.',
    publisher: 'Nebula Gate',
    publicationDate: '2024-09-14',
    pageCount: 385,
    genres: ['science-fiction'],
    format: 'Paperback',
    readingStatus: 'currently-reading',
    startDate: '2024-10-20',
    currentPage: 201,
    percentageComplete: 52,
    coverDataUrl: svgCover({ title: 'Quantum Tides', author: 'Darius Kaine', genre: 'science-fiction', ...pal('science-fiction') }),
  }),

  // Historical Fiction
  book({
    title: 'The Gilded Ledger',
    subtitle: '',
    authorIds: [authorByName.get('Julien Beaufort')!.id],
    isbn: '978-1-94411-776-0',
    description: 'Paris, 1889. A female accountant uncovers a fortune hidden in plain sight at the World’s Fair.',
    publisher: 'Cobblestone House',
    publicationDate: '2023-05-19',
    pageCount: 356,
    genres: ['historical-fiction'],
    format: 'Paperback',
    readingStatus: 'finished',
    startDate: '2024-04-10',
    finishDate: '2024-05-05',
    currentPage: 356,
    percentageComplete: 100,
    rating: 4,
    detailedScore: 81,
    coverDataUrl: svgCover({ title: 'The Gilded Ledger', author: 'Julien Beaufort', genre: 'historical-fiction', ...pal('historical-fiction') }),
  }),
  book({
    title: 'Queen of the Ash Fields',
    subtitle: '',
    authorIds: [authorByName.get('Julien Beaufort')!.id],
    isbn: null,
    description: 'A widowed farmer in post-war Georgia plants a crop that changes the fate of her county.',
    publisher: 'Cobblestone House',
    publicationDate: null,
    pageCount: 322,
    genres: ['historical-fiction'],
    format: 'Paperback',
    readingStatus: 'want-to-read',
    coverDataUrl: svgCover({ title: 'Queen of the Ash Fields', author: 'Julien Beaufort', genre: 'historical-fiction', ...pal('historical-fiction') }),
  }),

  // Self-Help
  book({
    title: 'The Quiet Compass',
    subtitle: 'Finding Direction in a Noisy World',
    authorIds: [authorByName.get('Naomi Chen')!.id],
    isbn: '978-1-50119-804-0',
    description: 'A mindfulness guide for readers who want clarity without the clutter.',
    publisher: 'Still Point Books',
    publicationDate: '2023-01-12',
    pageCount: 210,
    genres: ['self-help'],
    format: 'Paperback',
    readingStatus: 'finished',
    startDate: '2024-02-01',
    finishDate: '2024-02-20',
    currentPage: 210,
    percentageComplete: 100,
    rating: 4,
    detailedScore: 80,
    coverDataUrl: svgCover({ title: 'The Quiet Compass', author: 'Naomi Chen', genre: 'self-help', ...pal('self-help') }),
  }),
  book({
    title: 'Unfold',
    subtitle: 'A Daily Practice for Creative Renewal',
    authorIds: [authorByName.get('Naomi Chen')!.id],
    isbn: '978-1-50119-887-3',
    description: 'Thirty days of small creative rituals to restore curiosity.',
    publisher: 'Still Point Books',
    publicationDate: '2024-03-05',
    pageCount: 180,
    genres: ['self-help'],
    format: 'Paperback',
    readingStatus: 'want-to-read',
    coverDataUrl: svgCover({ title: 'Unfold', author: 'Naomi Chen', genre: 'self-help', ...pal('self-help') }),
  }),

  // Business
  book({
    title: 'The Lean Studio',
    subtitle: 'Creative Work Without Burnout',
    authorIds: [authorByName.get('Theo Sterling')!.id],
    isbn: '978-0-59333-102-5',
    description: 'How to run a creative business that sustains both the work and the maker.',
    publisher: 'Ridge Line Press',
    publicationDate: '2022-08-10',
    pageCount: 270,
    genres: ['business'],
    format: 'Hardcover',
    readingStatus: 'finished',
    startDate: '2024-07-05',
    finishDate: '2024-07-25',
    currentPage: 270,
    percentageComplete: 100,
    rating: 3.5,
    detailedScore: 74,
    coverDataUrl: svgCover({ title: 'The Lean Studio', author: 'Theo Sterling', genre: 'business', ...pal('business') }),
  }),
  book({
    title: 'Capital Currents',
    subtitle: '',
    authorIds: [authorByName.get('Theo Sterling')!.id],
    isbn: null,
    description: 'A history of money told through the stories of seven ordinary investors.',
    publisher: 'Ridge Line Press',
    publicationDate: null,
    pageCount: 240,
    genres: ['business'],
    format: 'Paperback',
    readingStatus: 'want-to-read',
    coverDataUrl: svgCover({ title: 'Capital Currents', author: 'Theo Sterling', genre: 'business', ...pal('business') }),
  }),

  // Psychology
  book({
    title: "The Mind's Mirror",
    subtitle: 'How We See Ourselves and Others',
    authorIds: [authorByName.get('Lena Petrova')!.id],
    isbn: '978-1-25086-401-9',
    description: 'An accessible exploration of cognitive biases, empathy, and self-perception.',
    publisher: 'Thought Current',
    publicationDate: '2023-10-03',
    pageCount: 252,
    genres: ['psychology'],
    format: 'Paperback',
    readingStatus: 'finished',
    startDate: '2024-09-10',
    finishDate: '2024-09-28',
    currentPage: 252,
    percentageComplete: 100,
    rating: 4,
    detailedScore: 83,
    coverDataUrl: svgCover({ title: "The Mind's Mirror", author: 'Lena Petrova', genre: 'psychology', ...pal('psychology') }),
  }),
  book({
    title: 'Attention & Intent',
    subtitle: '',
    authorIds: [authorByName.get('Lena Petrova')!.id],
    isbn: '978-1-25086-455-2',
    description: 'Reclaiming focus in an age of endless distraction.',
    publisher: 'Thought Current',
    publicationDate: '2024-02-21',
    pageCount: 198,
    genres: ['psychology'],
    format: 'Paperback',
    readingStatus: 'currently-reading',
    startDate: '2024-11-15',
    currentPage: 64,
    percentageComplete: 32,
    coverDataUrl: svgCover({ title: 'Attention & Intent', author: 'Lena Petrova', genre: 'psychology', ...pal('psychology') }),
  }),

  // Biography
  book({
    title: "The Painter's Journal",
    subtitle: 'The Life of Rosa Mirelli',
    authorIds: [authorByName.get('Samuel Greene')!.id],
    isbn: '978-0-30727-990-4',
    description: 'The overlooked story of a 20th-century painter who worked in secret for forty years.',
    publisher: 'Red Thread Books',
    publicationDate: '2023-06-22',
    pageCount: 388,
    genres: ['biography'],
    format: 'Hardcover',
    readingStatus: 'finished',
    startDate: '2024-01-20',
    finishDate: '2024-03-01',
    currentPage: 388,
    percentageComplete: 100,
    rating: 4.5,
    detailedScore: 89,
    coverDataUrl: svgCover({ title: "The Painter's Journal", author: 'Samuel Greene', genre: 'biography', ...pal('biography') }),
  }),

  // Nonfiction
  book({
    title: 'The Commonsense Sky',
    subtitle: 'Weather, Climate, and Everyday Life',
    authorIds: [authorByName.get('Amina Diallo')!.id],
    isbn: '978-1-63557-309-8',
    description: 'A lyrical guide to reading the skies and understanding the climate around us.',
    publisher: 'Common Ground Press',
    publicationDate: '2023-04-17',
    pageCount: 220,
    genres: ['nonfiction'],
    format: 'Paperback',
    readingStatus: 'want-to-read',
    coverDataUrl: svgCover({ title: 'The Commonsense Sky', author: 'Amina Diallo', genre: 'nonfiction', ...pal('nonfiction') }),
  }),
  book({
    title: 'Urban Roots',
    subtitle: 'How Cities Grow Food',
    authorIds: [authorByName.get('Amina Diallo')!.id],
    isbn: null,
    description: 'Community gardens, rooftop farms, and the future of feeding cities.',
    publisher: 'Common Ground Press',
    publicationDate: null,
    pageCount: 195,
    genres: ['nonfiction'],
    format: 'Paperback',
    readingStatus: 'did-not-finish',
    startDate: '2024-10-01',
    finishDate: null,
    currentPage: 78,
    percentageComplete: 40,
    rating: 3,
    detailedScore: 62,
    coverDataUrl: svgCover({ title: 'Urban Roots', author: 'Amina Diallo', genre: 'nonfiction', ...pal('nonfiction') }),
  }),

  // Personal Development
  book({
    title: 'Atomic Dawn',
    subtitle: 'Small Habits, New Mornings',
    authorIds: [authorByName.get('Naomi Chen')!.id],
    isbn: null,
    description: 'Rebuild your morning routine one small habit at a time.',
    publisher: 'Still Point Books',
    publicationDate: null,
    pageCount: 160,
    genres: ['personal-development'],
    format: 'Paperback',
    readingStatus: 'want-to-read',
    coverDataUrl: svgCover({ title: 'Atomic Dawn', author: 'Naomi Chen', genre: 'personal-development', ...pal('personal-development') }),
  }),

  // Classics
  book({
    title: 'The Last Voyage of the Aethel',
    subtitle: '',
    authorIds: [authorByName.get('Samuel Greene')!.id],
    isbn: '978-0-14313-554-7',
    description: 'A reimagined maritime classic about a ship that sails between dreaming and waking.',
    publisher: 'Heron Classics',
    publicationDate: '2022-12-01',
    pageCount: 420,
    genres: ['classics'],
    format: 'Paperback',
    readingStatus: 'on-hold',
    coverDataUrl: svgCover({ title: 'The Last Voyage of the Aethel', author: 'Samuel Greene', genre: 'classics', ...pal('classics') }),
  }),
  book({
    title: 'Winter Garden',
    subtitle: '',
    authorIds: [authorByName.get('Julien Beaufort')!.id],
    isbn: null,
    description: 'A family gathers at an estate where the garden blooms all winter long.',
    publisher: 'Cobblestone House',
    publicationDate: null,
    pageCount: 310,
    genres: ['classics'],
    format: 'Paperback',
    readingStatus: 'want-to-read',
    coverDataUrl: svgCover({ title: 'Winter Garden', author: 'Julien Beaufort', genre: 'classics', ...pal('classics') }),
  }),

  // Poetry
  book({
    title: 'Ink & Ember',
    subtitle: '',
    authorIds: [authorByName.get('Mira Thorne')!.id],
    isbn: null,
    description: 'Poems about fire, silence, and the spaces between people.',
    publisher: 'Velvet Thread Press',
    publicationDate: null,
    pageCount: 110,
    genres: ['poetry'],
    format: 'Paperback',
    readingStatus: 'want-to-read',
    coverDataUrl: svgCover({ title: 'Ink & Ember', author: 'Mira Thorne', genre: 'poetry', ...pal('poetry') }),
  }),

  // Graphic Novels / Comics
  book({
    title: 'Neon Nocturne',
    subtitle: '',
    authorIds: [authorByName.get('Elara Voss')!.id],
    isbn: null,
    description: 'A cyber-noir graphic novel set in a city that never sees the sun.',
    publisher: 'Panel & Ink',
    publicationDate: null,
    pageCount: 176,
    genres: ['graphic-novels'],
    format: 'Paperback',
    readingStatus: 'finished',
    startDate: '2024-07-20',
    finishDate: '2024-07-22',
    currentPage: 176,
    percentageComplete: 100,
    rating: 4,
    detailedScore: 79,
    coverDataUrl: svgCover({ title: 'Neon Nocturne', author: 'Elara Voss', genre: 'graphic-novels', ...pal('graphic-novels') }),
  }),
];

// Link series books via seriesId for the fantasy series
const emberSeries: Series = {
  id: newId(),
  name: 'The Shattered Realms',
  author: 'Elara Voss',
  description: 'A fantasy saga of fire, memory, and forgotten thrones.',
  orderedBookIds: books
    .filter((b) => b.title === 'The Ember Crown' || b.title === 'Starless Tides' || b.title === 'The Ashen Archive')
    .map((b) => b.id),
  createdAt: nowISO(),
  updatedAt: nowISO(),
};
books.find((b) => b.title === 'The Ember Crown')!.seriesId = emberSeries.id;
books.find((b) => b.title === 'Starless Tides')!.seriesId = emberSeries.id;
books.find((b) => b.title === 'The Ashen Archive')!.seriesId = emberSeries.id;

// ---------------------------------------------------------------------------
// Sample shelves
// ---------------------------------------------------------------------------

const shelves: Shelf[] = [
  {
    id: newId(),
    name: 'Bedtime Reads',
    description: 'Gentle stories to wind down with.',
    color: '#7c3aed',
    icon: 'Moon',
    coverStyle: 'cover',
    bookIds: books.filter((b) => b.genres.includes('fantasy') || b.genres.includes('romance')).map((b) => b.id),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: newId(),
    name: 'To Read This Year',
    description: 'My 2024 reading ambitions.',
    color: '#0891b2',
    icon: 'BookOpen',
    coverStyle: 'spine',
    bookIds: books.filter((b) => b.readingStatus === 'want-to-read').map((b) => b.id),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: newId(),
    name: 'All-Time Favorites',
    description: 'Books I return to again and again.',
    color: '#be185d',
    icon: 'Heart',
    coverStyle: 'cover',
    bookIds: books.filter((b) => b.isFavorite).map((b) => b.id),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
];

// ---------------------------------------------------------------------------
// Sample reading sessions
// ---------------------------------------------------------------------------

const sessions: ReadingSession[] = [
  { id: newId(), bookId: books.find((b) => b.title === 'The Ember Crown')!.id, date: '2024-01-10', startTime: '20:00', endTime: '21:30', durationMinutes: 90, startPage: 1, endPage: 92, pagesRead: 92, notes: 'Strong opening chapter.', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: books.find((b) => b.title === 'The Ember Crown')!.id, date: '2024-01-12', startTime: '19:45', endTime: '21:15', durationMinutes: 90, startPage: 93, endPage: 210, pagesRead: 117, notes: 'The magic system clicks here.', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: books.find((b) => b.title === 'Letters from Verona')!.id, date: '2024-08-12', startTime: '10:00', endTime: '11:45', durationMinutes: 105, startPage: 1, endPage: 120, pagesRead: 120, notes: 'Read in one sitting.', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: books.find((b) => b.title === 'Letters from Verona')!.id, date: '2024-08-14', startTime: '09:30', endTime: '10:45', durationMinutes: 75, startPage: 121, endPage: 284, pagesRead: 163, notes: 'Loved the ending.', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: books.find((b) => b.title === 'Orbit Station Nine')!.id, date: '2024-06-01', startTime: '21:00', endTime: '23:00', durationMinutes: 120, startPage: 1, endPage: 110, pagesRead: 110, notes: 'Intriguing premise.', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: books.find((b) => b.title === 'Quantum Tides')!.id, date: '2024-10-20', startTime: '20:30', endTime: '21:45', durationMinutes: 75, startPage: 1, endPage: 68, pagesRead: 68, notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: books.find((b) => b.title === 'Quantum Tides')!.id, date: '2024-10-23', startTime: '19:00', endTime: '20:30', durationMinutes: 90, startPage: 69, endPage: 145, pagesRead: 76, notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: books.find((b) => b.title === 'Starless Tides')!.id, date: '2024-11-01', startTime: '21:00', endTime: '22:00', durationMinutes: 60, startPage: 1, endPage: 45, pagesRead: 45, notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: books.find((b) => b.title === 'Starless Tides')!.id, date: '2024-11-03', startTime: '20:15', endTime: '21:45', durationMinutes: 90, startPage: 46, endPage: 112, pagesRead: 67, notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: books.find((b) => b.title === 'Starless Tides')!.id, date: '2024-11-06', startTime: '19:45', endTime: '21:00', durationMinutes: 75, startPage: 113, endPage: 187, pagesRead: 75, notes: '', createdAt: nowISO(), updatedAt: nowISO() },
];

// ---------------------------------------------------------------------------
// Sample reviews
// ---------------------------------------------------------------------------

const reviews: Review[] = [
  { id: newId(), bookId: books.find((b) => b.title === 'The Ember Crown')!.id, rating: 4.5, detailedScore: 88, reviewText: 'A stunning debut. The world-building feels lived-in and the magic system is genuinely original.', spoilerFlag: false, createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: books.find((b) => b.title === 'Letters from Verona')!.id, rating: 5, detailedScore: 95, reviewText: 'I cried three times. A beautiful, hopeful romance.', spoilerFlag: false, createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: books.find((b) => b.title === 'False Horizon')!.id, rating: 4.5, detailedScore: 85, reviewText: 'Relentless pacing. I did not see the twist coming.', spoilerFlag: true, createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: books.find((b) => b.title === 'Orbit Station Nine')!.id, rating: 4.5, detailedScore: 87, reviewText: 'Hard science fiction with heart. The station feels like a character.', spoilerFlag: false, createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: books.find((b) => b.title === "The Painter's Journal")!.id, rating: 4.5, detailedScore: 89, reviewText: 'Restores an artist to history where she belongs.', spoilerFlag: false, createdAt: nowISO(), updatedAt: nowISO() },
];

// ---------------------------------------------------------------------------
// Sample quotes
// ---------------------------------------------------------------------------

const quotes: Quote[] = [
  { id: newId(), bookId: books.find((b) => b.title === 'The Ember Crown')!.id, quoteText: 'Some fires do not burn—they remember.', pageNumber: 42, dateAdded: '2024-01-12', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: books.find((b) => b.title === 'Letters from Verona')!.id, quoteText: 'Love is not found in grand gestures, but in the quiet return to the same page.', pageNumber: 189, dateAdded: '2024-08-14', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: books.find((b) => b.title === 'The Mind\'s Mirror')!.id, quoteText: 'Attention is the rarest form of generosity.', pageNumber: 64, dateAdded: '2024-09-28', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
];

// ---------------------------------------------------------------------------
// Sample goals & challenges
// ---------------------------------------------------------------------------

const goals: Goal[] = [
  { id: newId(), name: '2024 Reading Goal', goalType: 'books', target: 24, period: 'year', startDate: '2024-01-01', endDate: '2024-12-31', currentProgress: 10, status: 'active', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Pages This Year', goalType: 'pages', target: 5000, period: 'year', startDate: '2024-01-01', endDate: '2024-12-31', currentProgress: 2430, status: 'active', createdAt: nowISO(), updatedAt: nowISO() },
];

const challenges: Challenge[] = [
  { id: newId(), name: 'Genre Explorer', description: 'Read 5 books from genres you have never tried.', category: 'genre', target: 5, progress: 3, startDate: '2024-01-01', endDate: '2024-12-31', status: 'active', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Finish What You Started', description: 'Complete 3 books currently on hold.', category: 'status', target: 3, progress: 0, startDate: '2024-01-01', endDate: '2024-12-31', status: 'active', createdAt: nowISO(), updatedAt: nowISO() },
];

// ---------------------------------------------------------------------------
// Sample wishlist
// ---------------------------------------------------------------------------

const wishlist: WishlistItem[] = [
  { id: newId(), title: 'The Midnight Library', author: 'Matt Haig', coverImageId: null, format: 'Paperback', estimatedPrice: 16.99, currency: 'USD', priority: 'high', plannedPurchaseDate: null, notes: 'Heard great things.', status: 'wishlisted', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), title: 'Project Hail Mary', author: 'Andy Weir', coverImageId: null, format: 'Hardcover', estimatedPrice: 24.50, currency: 'USD', priority: 'medium', plannedPurchaseDate: null, notes: '', status: 'wishlisted', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), title: 'The Seven Moons of Maali Almeida', author: 'Shehan Karunatilaka', coverImageId: null, format: 'Paperback', estimatedPrice: 18.00, currency: 'USD', priority: 'low', plannedPurchaseDate: null, notes: 'Booker winner.', status: 'wishlisted', createdAt: nowISO(), updatedAt: nowISO() },
];

// ---------------------------------------------------------------------------
// Preferences
// ---------------------------------------------------------------------------

const preferences: Preference[] = [
  {
    id: newId(),
    theme: 'dark',
    accentColor: '#E65A45',
    defaultView: 'grid',
    defaultSort: 'recently-added',
    preferredReadingUnit: 'pages',
    weekStartDay: 0,
    dateFormat: 'MMM d, yyyy',
    language: 'en',
    animationsEnabled: true,
    compactMode: false,
    coverDisplayPreference: 'medium',
    updatedAt: nowISO(),
  },
];

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------

export async function seedDemoData(): Promise<void> {
  // Avoid re-seeding if data already exists
  const existing = await db.books.count();
  if (existing > 0) return;

  // Store covers first so books can reference them
  for (const b of books) {
    if (b.coverDataUrl) {
      const img = new Image();
      const dataUrl = await new Promise<string>((resolve) => {
        img.onload = () => resolve(img.src);
        img.src = b.coverDataUrl!;
      });
      const { type, data } = (() => {
        const comma = dataUrl.indexOf(',');
        const mime = dataUrl.slice(5, comma);
        const b64 = dataUrl.slice(comma + 1);
        const bin = atob(b64);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        return { type: mime, data: arr };
      })();
      await db.covers.add({
        id: newId(),
        dataUrl,
        mimeType: type,
        width: 400,
        height: 600,
        updatedAt: nowISO(),
      } as any);
      // We cannot know the cover id until add returns; handle below
    }
  }

  // Simpler: store covers and map back by title order
  const coverMap = new Map<string, string>();
  for (let i = 0; i < books.length; i++) {
    const b = books[i];
    if (b.coverDataUrl) {
      const coverId = await db.covers.add({
        id: newId(),
        dataUrl: b.coverDataUrl,
        mimeType: 'image/svg+xml',
        width: 400,
        height: 600,
        updatedAt: nowISO(),
      } as any);
      coverMap.set(b.title, coverId);
    }
  }

  // Assign cover ids to books
  for (const b of books) {
    if (coverMap.has(b.title)) {
      b.coverImageId = coverMap.get(b.title)!;
    }
  }

  await db.transaction('rw', db.books, db.authors, db.series, db.readingSessions, db.reviews, db.quotes, db.shelves, db.goals, db.challenges, db.wishlist, db.preferences, async () => {
    await db.authors.bulkAdd(authors);
    await db.series.bulkAdd([emberSeries]);
    await db.books.bulkAdd(books);
    await db.readingSessions.bulkAdd(sessions);
    await db.reviews.bulkAdd(reviews);
    await db.quotes.bulkAdd(quotes);
    await db.shelves.bulkAdd(shelves);
    await db.goals.bulkAdd(goals);
    await db.challenges.bulkAdd(challenges);
    await db.wishlist.bulkAdd(wishlist);
    await db.preferences.bulkAdd(preferences);
  });
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.books, db.authors, db.series, db.readingSessions, db.reviews, db.quotes, db.notes, db.shelves, db.goals, db.challenges, db.wishlist, db.preferences, db.covers, db.calendarEntries, async () => {
    await db.books.clear();
    await db.authors.clear();
    await db.series.clear();
    await db.readingSessions.clear();
    await db.reviews.clear();
    await db.quotes.clear();
    await db.notes.clear();
    await db.shelves.clear();
    await db.goals.clear();
    await db.challenges.clear();
    await db.wishlist.clear();
    await db.preferences.clear();
    await db.covers.clear();
    await db.calendarEntries.clear();
  });
}

export { authors, books, shelves, sessions, reviews, quotes, goals, challenges, wishlist, preferences, emberSeries };
