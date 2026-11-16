import { db, newId, nowISO, type Book, type Author, type Series, type Shelf, type Goal, type Challenge, type WishlistItem, type Preference, type ReadingSession, type Review, type Quote } from '@/db';

// ---------------------------------------------------------------------------
// Sample library: real, widely-read books. Covers are official artwork served
// by Open Library and stay the property of their publishers.
// ---------------------------------------------------------------------------

const cover = (isbn: string) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;

type BookInput = Omit<Book, 'id' | 'createdAt' | 'updatedAt'>;

function book(input: BookInput): Book {
  return {
    id: newId(),
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
    ownershipStatus: input.ownershipStatus ?? 'Owned',
    readingStatus: input.readingStatus ?? 'want-to-read',
    coverImageId: null,
    coverUrl: input.coverUrl ?? null,
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

const authors: Author[] = [
  { id: newId(), name: 'J.R.R. Tolkien', biography: 'English writer and scholar (1892–1973), creator of Middle-earth.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'George R.R. Martin', biography: 'American novelist best known for A Song of Ice and Fire.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Patrick Rothfuss', biography: 'American author of the Kingkiller Chronicle.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Brandon Sanderson', biography: 'Prolific American fantasy author known for inventive magic systems.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Suzanne Collins', biography: 'American author of the Hunger Games series.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Frank Herbert', biography: 'American science-fiction writer (1920–1986), author of Dune.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Andy Weir', biography: 'American novelist and former software engineer, author of The Martian.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Cixin Liu', biography: 'Chinese science-fiction writer, winner of the Hugo Award.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Isaac Asimov', biography: 'American biochemist and writer (1920–1992), a foundational science-fiction voice.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Stieg Larsson', biography: 'Swedish journalist and author of the Millennium trilogy.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Agatha Christie', biography: 'English mystery writer (1890–1976), the best-selling novelist of all time.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Gillian Flynn', biography: 'American author and screenwriter known for dark psychological thrillers.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Alex Michaelides', biography: 'Cypriot-British author and psychotherapist.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Jane Austen', biography: 'English novelist (1775–1817) whose social comedies remain classics.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Emily Henry', biography: 'American author of contemporary romantic comedies.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Sally Rooney', biography: 'Irish novelist writing about intimacy and class among millennials.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Markus Zusak', biography: 'Australian-German writer, author of The Book Thief.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Anthony Doerr', biography: 'American novelist and short-story writer, winner of the Pulitzer Prize.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Ken Follett', biography: 'Welsh author of sweeping historical novels.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'James Clear', biography: 'American writer focused on habits, decision-making and improvement.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Cal Newport', biography: 'Computer science professor and author on focus and digital minimalism.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Daniel Kahneman', biography: 'Israeli-American psychologist (1934–2024), Nobel laureate in economics.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Yuval Noah Harari', biography: 'Israeli historian and author of Sapiens and Homo Deus.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Tara Westover', biography: 'American historian and memoirist, author of Educated.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Walter Isaacson', biography: 'American biographer of Jobs, Einstein, da Vinci and Musk.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'George Orwell', biography: 'English novelist and essayist (1903–1950).', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'F. Scott Fitzgerald', biography: 'American writer (1896–1940) of the Jazz Age.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Harper Lee', biography: 'American novelist (1926–2016), author of To Kill a Mockingbird.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Mary Oliver', biography: 'American poet (1935–2019) known for her attention to the natural world.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Marjane Satrapi', biography: 'Iranian-French cartoonist and filmmaker.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Peter Thiel', biography: 'American entrepreneur and investor, co-founder of PayPal.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Eric Ries', biography: 'American entrepreneur and author of The Lean Startup.', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Viktor E. Frankl', biography: 'Austrian psychiatrist and Holocaust survivor (1905–1997).', notes: '', createdAt: nowISO(), updatedAt: nowISO() },
];

const authorByName = new Map(authors.map((a) => [a.name, a]));

const books: Book[] = [
  // Fantasy
  book({
    title: 'The Hobbit',
    subtitle: 'There and Back Again',
    authorIds: [authorByName.get('J.R.R. Tolkien')!.id],
    isbn: '9780618260300',
    description: 'A reluctant hobbit is swept into a quest for dragon-guarded treasure and discovers a courage he never knew he had.',
    publisher: 'Houghton Mifflin',
    publicationDate: '1937-09-21',
    pageCount: 300,
    genres: ['fantasy'],
    format: 'Paperback',
    readingStatus: 'finished',
    dateAdded: '2024-01-03',
    startDate: '2024-01-05',
    finishDate: '2024-02-20',
    currentPage: 300,
    percentageComplete: 100,
    rating: 5,
    detailedScore: 92,
    isFavorite: true,
    coverUrl: cover('9780618260300'),
  }),
  book({
    title: 'A Game of Thrones',
    subtitle: 'A Song of Ice and Fire, Book One',
    authorIds: [authorByName.get('George R.R. Martin')!.id],
    isbn: '9780553103540',
    description: 'Noble houses scheme for an iron throne while an ancient winter stirs beyond the Wall.',
    publisher: 'Bantam',
    publicationDate: '1996-08-01',
    pageCount: 694,
    genres: ['fantasy'],
    format: 'Hardcover',
    readingStatus: 'finished',
    dateAdded: '2024-01-03',
    startDate: '2024-02-25',
    finishDate: '2024-04-12',
    currentPage: 694,
    percentageComplete: 100,
    rating: 4.5,
    detailedScore: 88,
    coverUrl: cover('9780553103540'),
  }),
  book({
    title: 'The Name of the Wind',
    subtitle: 'The Kingkiller Chronicle',
    authorIds: [authorByName.get('Patrick Rothfuss')!.id],
    isbn: '9780756404079',
    description: 'A gifted young musician recounts how he became the most notorious magician in his world.',
    publisher: 'DAW Books',
    publicationDate: '2007-03-27',
    pageCount: 662,
    genres: ['fantasy'],
    format: 'Paperback',
    readingStatus: 'finished',
    dateAdded: '2024-04-15',
    startDate: '2024-04-16',
    finishDate: '2024-05-29',
    currentPage: 662,
    percentageComplete: 100,
    rating: 5,
    detailedScore: 94,
    isFavorite: true,
    coverUrl: cover('9780756404079'),
  }),
  book({
    title: 'Mistborn',
    subtitle: 'The Final Empire',
    authorIds: [authorByName.get('Brandon Sanderson')!.id],
    isbn: '9780765311788',
    description: 'A street thief joins a crew of rebels to overthrow an immortal emperor by mastering allomancy.',
    publisher: 'Tor Books',
    publicationDate: '2006-07-17',
    pageCount: 541,
    genres: ['fantasy'],
    format: 'Paperback',
    readingStatus: 'want-to-read',
    dateAdded: '2024-09-02',
    coverUrl: cover('9780765311788'),
  }),
  book({
    title: 'The Hunger Games',
    subtitle: '',
    authorIds: [authorByName.get('Suzanne Collins')!.id],
    isbn: '9780439023481',
    description: 'In a televised fight to the death, one girl volunteers to save her sister.',
    publisher: 'Scholastic Press',
    publicationDate: '2008-09-14',
    pageCount: 374,
    genres: ['fantasy'],
    format: 'Hardcover',
    readingStatus: 'finished',
    dateAdded: '2024-03-02',
    startDate: '2024-03-03',
    finishDate: '2024-03-10',
    currentPage: 374,
    percentageComplete: 100,
    rating: 4,
    detailedScore: 84,
    seriesPosition: 1,
    coverUrl: cover('9780439023481'),
  }),
  book({
    title: 'Catching Fire',
    subtitle: 'The Hunger Games, Book Two',
    authorIds: [authorByName.get('Suzanne Collins')!.id],
    isbn: '9780439023498',
    description: 'The victor of last year’s Games becomes the face of a rebellion she never meant to start.',
    publisher: 'Scholastic Press',
    publicationDate: '2009-09-01',
    pageCount: 391,
    genres: ['fantasy'],
    format: 'Hardcover',
    readingStatus: 'finished',
    dateAdded: '2024-03-02',
    startDate: '2024-03-11',
    finishDate: '2024-03-19',
    currentPage: 391,
    percentageComplete: 100,
    rating: 4.5,
    detailedScore: 86,
    seriesPosition: 2,
    coverUrl: cover('9780439023498'),
  }),
  book({
    title: 'Mockingjay',
    subtitle: 'The Hunger Games, Book Three',
    authorIds: [authorByName.get('Suzanne Collins')!.id],
    isbn: '9780439023511',
    description: 'The districts rise, and a reluctant symbol must decide what victory is worth.',
    publisher: 'Scholastic Press',
    publicationDate: '2010-08-24',
    pageCount: 390,
    genres: ['fantasy'],
    format: 'Hardcover',
    readingStatus: 'on-hold',
    dateAdded: '2024-03-02',
    startDate: '2024-03-20',
    currentPage: 234,
    percentageComplete: 60,
    seriesPosition: 3,
    coverUrl: cover('9780439023511'),
  }),

  // Science fiction
  book({
    title: 'Dune',
    subtitle: '',
    authorIds: [authorByName.get('Frank Herbert')!.id],
    isbn: '9780441013593',
    description: 'A desert planet, a spice worth empires, and a boy who becomes a legend.',
    publisher: 'Ace',
    publicationDate: '1965-08-01',
    pageCount: 544,
    genres: ['science-fiction'],
    format: 'Paperback',
    readingStatus: 'finished',
    dateAdded: '2024-05-30',
    startDate: '2024-06-01',
    finishDate: '2024-07-04',
    currentPage: 544,
    percentageComplete: 100,
    rating: 5,
    detailedScore: 96,
    isFavorite: true,
    coverUrl: cover('9780441013593'),
  }),
  book({
    title: 'Project Hail Mary',
    subtitle: '',
    authorIds: [authorByName.get('Andy Weir')!.id],
    isbn: '9780593135204',
    description: 'A lone astronaut wakes with no memory and one job: save the sun.',
    publisher: 'Ballantine Books',
    publicationDate: '2021-05-04',
    pageCount: 476,
    genres: ['science-fiction'],
    format: 'Hardcover',
    readingStatus: 'currently-reading',
    dateAdded: '2024-10-20',
    startDate: '2024-10-28',
    currentPage: 322,
    percentageComplete: 68,
    coverUrl: cover('9780593135204'),
  }),
  book({
    title: 'The Three-Body Problem',
    subtitle: 'Remembrance of Earth’s Past',
    authorIds: [authorByName.get('Cixin Liu')!.id],
    isbn: '9780765382030',
    description: 'An alien message, a secret military project, and a countdown that should not exist.',
    publisher: 'Tor Books',
    publicationDate: '2014-11-11',
    pageCount: 399,
    genres: ['science-fiction'],
    format: 'Paperback',
    readingStatus: 'finished',
    dateAdded: '2024-07-08',
    startDate: '2024-07-10',
    finishDate: '2024-08-02',
    currentPage: 399,
    percentageComplete: 100,
    rating: 4.5,
    detailedScore: 89,
    coverUrl: cover('9780765382030'),
  }),
  book({
    title: 'Foundation',
    subtitle: 'Foundation, Book One',
    authorIds: [authorByName.get('Isaac Asimov')!.id],
    isbn: '9780553293357',
    description: 'A mathematician predicts the fall of an empire and plots a way to shorten the dark age.',
    publisher: 'Bantam Spectra',
    publicationDate: '1951-06-01',
    pageCount: 255,
    genres: ['science-fiction'],
    format: 'Paperback',
    readingStatus: 'want-to-read',
    dateAdded: '2024-08-05',
    coverUrl: cover('9780553293357'),
  }),

  // Mystery & thriller
  book({
    title: 'The Girl with the Dragon Tattoo',
    subtitle: 'Millennium, Book One',
    authorIds: [authorByName.get('Stieg Larsson')!.id],
    isbn: '9780307454546',
    description: 'A disgraced journalist and a brilliant hacker uncover a decades-old disappearance.',
    publisher: 'Vintage Crime',
    publicationDate: '2008-09-16',
    pageCount: 590,
    genres: ['mystery'],
    format: 'Paperback',
    readingStatus: 'finished',
    dateAdded: '2024-02-01',
    startDate: '2024-02-02',
    finishDate: '2024-02-24',
    currentPage: 590,
    percentageComplete: 100,
    rating: 4.5,
    detailedScore: 87,
    coverUrl: cover('9780307454546'),
  }),
  book({
    title: 'And Then There Were None',
    subtitle: '',
    authorIds: [authorByName.get('Agatha Christie')!.id],
    isbn: '9780062073471',
    description: 'Ten strangers are lured to an island where a nursery rhyme becomes a death sentence.',
    publisher: 'William Morrow',
    publicationDate: '1939-11-06',
    pageCount: 247,
    genres: ['mystery'],
    format: 'Paperback',
    readingStatus: 'finished',
    dateAdded: '2024-06-10',
    startDate: '2024-06-11',
    finishDate: '2024-06-16',
    currentPage: 247,
    percentageComplete: 100,
    rating: 4,
    detailedScore: 85,
    isFavorite: true,
    coverUrl: cover('9780062073471'),
  }),
  book({
    title: 'Gone Girl',
    subtitle: '',
    authorIds: [authorByName.get('Gillian Flynn')!.id],
    isbn: '9780307588364',
    description: 'A wife vanishes on her anniversary and the perfect marriage starts to look like a story.',
    publisher: 'Crown',
    publicationDate: '2012-06-05',
    pageCount: 415,
    genres: ['thriller'],
    format: 'Hardcover',
    readingStatus: 'finished',
    dateAdded: '2024-09-05',
    startDate: '2024-09-06',
    finishDate: '2024-09-14',
    currentPage: 415,
    percentageComplete: 100,
    rating: 4,
    detailedScore: 82,
    coverUrl: cover('9780307588364'),
  }),
  book({
    title: 'The Silent Patient',
    subtitle: '',
    authorIds: [authorByName.get('Alex Michaelides')!.id],
    isbn: '9781250301697',
    description: 'A painter stops speaking after a murder. A therapist becomes obsessed with making her talk.',
    publisher: 'Celadon Books',
    publicationDate: '2019-02-05',
    pageCount: 323,
    genres: ['thriller'],
    format: 'Hardcover',
    readingStatus: 'want-to-read',
    dateAdded: '2024-09-20',
    coverUrl: cover('9781250301697'),
  }),

  // Classics & romance
  book({
    title: 'Pride and Prejudice',
    subtitle: '',
    authorIds: [authorByName.get('Jane Austen')!.id],
    isbn: '9780141439518',
    description: 'Elizabeth Bennet must look past first impressions — and her own pride.',
    publisher: 'Penguin Classics',
    publicationDate: '1813-01-28',
    pageCount: 435,
    genres: ['classics'],
    format: 'Paperback',
    readingStatus: 'finished',
    dateAdded: '2024-01-20',
    startDate: '2024-01-21',
    finishDate: '2024-02-12',
    currentPage: 435,
    percentageComplete: 100,
    rating: 5,
    detailedScore: 93,
    isFavorite: true,
    coverUrl: cover('9780141439518'),
  }),
  book({
    title: 'Beach Read',
    subtitle: '',
    authorIds: [authorByName.get('Emily Henry')!.id],
    isbn: '9781984806734',
    description: 'Two rival writers swap genres for a summer in neighbouring beach houses.',
    publisher: 'Berkley',
    publicationDate: '2020-05-19',
    pageCount: 361,
    genres: ['romance'],
    format: 'Paperback',
    readingStatus: 'want-to-read',
    dateAdded: '2024-10-01',
    coverUrl: cover('9781984806734'),
  }),
  book({
    title: 'Normal People',
    subtitle: '',
    authorIds: [authorByName.get('Sally Rooney')!.id],
    isbn: '9781984822178',
    description: 'Two people keep finding their way back to each other through school, college and after.',
    publisher: 'Hogarth',
    publicationDate: '2019-04-16',
    pageCount: 273,
    genres: ['romance'],
    format: 'Hardcover',
    readingStatus: 'currently-reading',
    dateAdded: '2024-11-04',
    startDate: '2024-11-05',
    currentPage: 118,
    percentageComplete: 43,
    coverUrl: cover('9781984822178'),
  }),

  // Historical fiction
  book({
    title: 'The Book Thief',
    subtitle: '',
    authorIds: [authorByName.get('Markus Zusak')!.id],
    isbn: '9780375842207',
    description: 'Death narrates the story of a girl stealing books in Nazi Germany.',
    publisher: 'Knopf Books for Young Readers',
    publicationDate: '2005-03-14',
    pageCount: 552,
    genres: ['historical-fiction'],
    format: 'Hardcover',
    readingStatus: 'finished',
    dateAdded: '2024-02-15',
    startDate: '2024-02-16',
    finishDate: '2024-03-08',
    currentPage: 552,
    percentageComplete: 100,
    rating: 5,
    detailedScore: 97,
    isFavorite: true,
    coverUrl: cover('9780375842207'),
  }),
  book({
    title: 'All the Light We Cannot See',
    subtitle: '',
    authorIds: [authorByName.get('Anthony Doerr')!.id],
    isbn: '9781501173219',
    description: 'A blind French girl and a German boy cross paths in occupied France.',
    publisher: 'Scribner',
    publicationDate: '2014-05-06',
    pageCount: 531,
    genres: ['historical-fiction'],
    format: 'Paperback',
    readingStatus: 'finished',
    dateAdded: '2024-07-05',
    startDate: '2024-07-06',
    finishDate: '2024-07-28',
    currentPage: 531,
    percentageComplete: 100,
    rating: 4.5,
    detailedScore: 90,
    coverUrl: cover('9781501173219'),
  }),
  book({
    title: 'The Pillars of the Earth',
    subtitle: '',
    authorIds: [authorByName.get('Ken Follett')!.id],
    isbn: '9780451166890',
    description: 'Builders, monks and kings struggle to raise a cathedral across a turbulent twelfth century.',
    publisher: 'Signet',
    publicationDate: '1989-10-01',
    pageCount: 973,
    genres: ['historical-fiction'],
    format: 'Paperback',
    readingStatus: 'on-hold',
    dateAdded: '2024-09-25',
    startDate: '2024-09-26',
    currentPage: 214,
    percentageComplete: 22,
    coverUrl: cover('9780451166890'),
  }),

  // Ideas, business, psychology
  book({
    title: 'Atomic Habits',
    subtitle: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
    authorIds: [authorByName.get('James Clear')!.id],
    isbn: '9780735211292',
    description: 'A practical system for getting one percent better, every day.',
    publisher: 'Avery',
    publicationDate: '2018-10-16',
    pageCount: 320,
    genres: ['self-help'],
    format: 'Hardcover',
    readingStatus: 'finished',
    dateAdded: '2024-08-01',
    startDate: '2024-08-03',
    finishDate: '2024-08-20',
    currentPage: 320,
    percentageComplete: 100,
    rating: 4,
    detailedScore: 84,
    isFavorite: true,
    coverUrl: cover('9780735211292'),
  }),
  book({
    title: 'Deep Work',
    subtitle: 'Rules for Focused Success in a Distracted World',
    authorIds: [authorByName.get('Cal Newport')!.id],
    isbn: '9781455586691',
    description: 'Focused, distraction-free work is the rare skill of the knowledge economy.',
    publisher: 'Grand Central Publishing',
    publicationDate: '2016-01-05',
    pageCount: 296,
    genres: ['business'],
    format: 'Hardcover',
    readingStatus: 'currently-reading',
    dateAdded: '2024-11-08',
    startDate: '2024-11-09',
    currentPage: 164,
    percentageComplete: 55,
    coverUrl: cover('9781455586691'),
  }),
  book({
    title: 'Thinking, Fast and Slow',
    subtitle: '',
    authorIds: [authorByName.get('Daniel Kahneman')!.id],
    isbn: '9780374533557',
    description: 'Two systems of thought, and the shortcuts that quietly mislead us.',
    publisher: 'Farrar, Straus and Giroux',
    publicationDate: '2011-10-25',
    pageCount: 499,
    genres: ['psychology'],
    format: 'Paperback',
    readingStatus: 'on-hold',
    dateAdded: '2024-10-05',
    startDate: '2024-10-06',
    currentPage: 175,
    percentageComplete: 35,
    coverUrl: cover('9780374533557'),
  }),
  book({
    title: 'Sapiens',
    subtitle: 'A Brief History of Humankind',
    authorIds: [authorByName.get('Yuval Noah Harari')!.id],
    isbn: '9780062316097',
    description: 'A sweeping history of how Homo sapiens came to dominate the planet.',
    publisher: 'Harper',
    publicationDate: '2015-02-10',
    pageCount: 464,
    genres: ['nonfiction'],
    format: 'Hardcover',
    readingStatus: 'finished',
    dateAdded: '2024-04-20',
    startDate: '2024-04-22',
    finishDate: '2024-05-18',
    currentPage: 464,
    percentageComplete: 100,
    rating: 4.5,
    detailedScore: 88,
    coverUrl: cover('9780062316097'),
  }),
  book({
    title: 'Educated',
    subtitle: 'A Memoir',
    authorIds: [authorByName.get('Tara Westover')!.id],
    isbn: '9780399590504',
    description: 'A girl raised off the grid teaches herself into Cambridge and out of her family’s grip.',
    publisher: 'Random House',
    publicationDate: '2018-02-20',
    pageCount: 334,
    genres: ['biography'],
    format: 'Hardcover',
    readingStatus: 'finished',
    dateAdded: '2024-06-20',
    startDate: '2024-06-21',
    finishDate: '2024-07-02',
    currentPage: 334,
    percentageComplete: 100,
    rating: 5,
    detailedScore: 95,
    isFavorite: true,
    coverUrl: cover('9780399590504'),
  }),
  book({
    title: 'Steve Jobs',
    subtitle: '',
    authorIds: [authorByName.get('Walter Isaacson')!.id],
    isbn: '9781451648546',
    description: 'The biography of the demanding visionary behind Apple’s greatest products.',
    publisher: 'Simon & Schuster',
    publicationDate: '2011-10-24',
    pageCount: 656,
    genres: ['biography'],
    format: 'Hardcover',
    readingStatus: 'want-to-read',
    dateAdded: '2024-09-12',
    coverUrl: cover('9781451648546'),
  }),

  // Classics
  book({
    title: '1984',
    subtitle: '',
    authorIds: [authorByName.get('George Orwell')!.id],
    isbn: '9780451524935',
    description: 'A clerk in a totalitarian state begins to keep a diary — and to think.',
    publisher: 'Signet Classics',
    publicationDate: '1949-06-08',
    pageCount: 328,
    genres: ['classics'],
    format: 'Paperback',
    readingStatus: 'finished',
    dateAdded: '2024-03-12',
    startDate: '2024-03-13',
    finishDate: '2024-03-24',
    currentPage: 328,
    percentageComplete: 100,
    rating: 4.5,
    detailedScore: 91,
    coverUrl: cover('9780451524935'),
  }),
  book({
    title: 'The Great Gatsby',
    subtitle: '',
    authorIds: [authorByName.get('F. Scott Fitzgerald')!.id],
    isbn: '9780743273565',
    description: 'A mysterious millionaire throws parties across the bay from the woman he lost.',
    publisher: 'Scribner',
    publicationDate: '1925-04-10',
    pageCount: 180,
    genres: ['classics'],
    format: 'Paperback',
    readingStatus: 'finished',
    dateAdded: '2024-08-10',
    startDate: '2024-08-11',
    finishDate: '2024-08-16',
    currentPage: 180,
    percentageComplete: 100,
    rating: 3.5,
    detailedScore: 76,
    coverUrl: cover('9780743273565'),
  }),
  book({
    title: 'To Kill a Mockingbird',
    subtitle: '',
    authorIds: [authorByName.get('Harper Lee')!.id],
    isbn: '9780061120084',
    description: 'A small-town lawyer defends a Black man in 1930s Alabama, seen through his daughter’s eyes.',
    publisher: 'Harper Perennial',
    publicationDate: '1960-07-11',
    pageCount: 323,
    genres: ['classics'],
    format: 'Paperback',
    readingStatus: 'finished',
    dateAdded: '2024-01-25',
    startDate: '2024-01-26',
    finishDate: '2024-02-09',
    currentPage: 323,
    percentageComplete: 100,
    rating: 5,
    detailedScore: 96,
    isFavorite: true,
    coverUrl: cover('9780061120084'),
  }),

  // Poetry & comics
  book({
    title: 'Devotions',
    subtitle: 'The Selected Poems of Mary Oliver',
    authorIds: [authorByName.get('Mary Oliver')!.id],
    isbn: '9780399563249',
    description: 'A lifetime of poems about attention, nature, grief and wonder.',
    publisher: 'Penguin Press',
    publicationDate: '2017-10-10',
    pageCount: 455,
    genres: ['poetry'],
    format: 'Hardcover',
    readingStatus: 'want-to-read',
    dateAdded: '2024-10-12',
    coverUrl: cover('9780399563249'),
  }),
  book({
    title: 'Persepolis',
    subtitle: 'The Story of a Childhood',
    authorIds: [authorByName.get('Marjane Satrapi')!.id],
    isbn: '9780375714573',
    description: 'A childhood in revolutionary Iran, told in stark black-and-white comics.',
    publisher: 'Pantheon',
    publicationDate: '2003-04-29',
    pageCount: 153,
    genres: ['graphic-novels'],
    format: 'Paperback',
    readingStatus: 'finished',
    dateAdded: '2024-07-30',
    startDate: '2024-07-31',
    finishDate: '2024-08-02',
    currentPage: 153,
    percentageComplete: 100,
    rating: 4.5,
    detailedScore: 89,
    coverUrl: cover('9780375714573'),
  }),

  // Business & meaning
  book({
    title: 'Zero to One',
    subtitle: 'Notes on Startups, or How to Build the Future',
    authorIds: [authorByName.get('Peter Thiel')!.id],
    isbn: '9780804139298',
    description: 'Notes on startups, monopoly, and building the future rather than copying the past.',
    publisher: 'Crown Business',
    publicationDate: '2014-09-16',
    pageCount: 224,
    genres: ['business'],
    format: 'Hardcover',
    readingStatus: 'want-to-read',
    dateAdded: '2024-08-22',
    coverUrl: cover('9780804139298'),
  }),
  book({
    title: 'The Lean Startup',
    subtitle: '',
    authorIds: [authorByName.get('Eric Ries')!.id],
    isbn: '9780307887894',
    description: 'Test ideas quickly, measure what matters, and pivot before the runway ends.',
    publisher: 'Crown Business',
    publicationDate: '2011-09-13',
    pageCount: 336,
    genres: ['business'],
    format: 'Hardcover',
    readingStatus: 'did-not-finish',
    dateAdded: '2024-06-25',
    startDate: '2024-06-26',
    finishDate: null,
    currentPage: 101,
    percentageComplete: 30,
    rating: 2.5,
    detailedScore: 55,
    coverUrl: cover('9780307887894'),
  }),
  book({
    title: 'Man’s Search for Meaning',
    subtitle: '',
    authorIds: [authorByName.get('Viktor E. Frankl')!.id],
    isbn: '9780807014295',
    description: 'A psychiatrist’s account of survival in the camps, and the search for meaning.',
    publisher: 'Beacon Press',
    publicationDate: '1946-01-01',
    pageCount: 165,
    genres: ['psychology'],
    format: 'Paperback',
    readingStatus: 'finished',
    dateAdded: '2024-05-20',
    startDate: '2024-05-21',
    finishDate: '2024-05-26',
    currentPage: 165,
    percentageComplete: 100,
    rating: 5,
    detailedScore: 94,
    isFavorite: true,
    coverUrl: cover('9780807014295'),
  }),
];

// ---------------------------------------------------------------------------
// Series
// ---------------------------------------------------------------------------

const hungerGamesSeries: Series = {
  id: newId(),
  name: 'The Hunger Games',
  author: 'Suzanne Collins',
  description: 'Katniss Everdeen’s fight against the Capitol, from tribute to symbol.',
  orderedBookIds: [],
  createdAt: nowISO(),
  updatedAt: nowISO(),
};

for (const title of ['The Hunger Games', 'Catching Fire', 'Mockingjay']) {
  const b = books.find((x) => x.title === title);
  if (b) {
    b.seriesId = hungerGamesSeries.id;
    hungerGamesSeries.orderedBookIds.push(b.id);
  }
}

// ---------------------------------------------------------------------------
// Shelves
// ---------------------------------------------------------------------------

const shelves: Shelf[] = [
  {
    id: newId(),
    name: 'Bedtime Reads',
    description: 'Gentle, immersive stories to wind down with.',
    color: '#7c3aed',
    icon: 'Moon',
    coverStyle: 'cover',
    bookIds: books.filter((b) => b.genres.some((g) => g === 'fantasy' || g === 'romance')).map((b) => b.id),
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
  {
    id: newId(),
    name: 'Ideas & Nonfiction',
    description: 'Books that changed how I see the world.',
    color: '#047857',
    icon: 'Leaf',
    coverStyle: 'cover',
    bookIds: books
      .filter((b) => b.genres.some((g) => ['nonfiction', 'business', 'psychology', 'biography'].includes(g)))
      .map((b) => b.id),
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
];

// ---------------------------------------------------------------------------
// Reading sessions
// ---------------------------------------------------------------------------

const byTitle = (title: string) => books.find((b) => b.title === title)!.id;

const sessions: ReadingSession[] = [
  { id: newId(), bookId: byTitle('The Name of the Wind'), date: '2024-04-16', startTime: '20:00', endTime: '21:30', durationMinutes: 90, startPage: 1, endPage: 96, pagesRead: 96, notes: 'Read the prologue twice.', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: byTitle('The Name of the Wind'), date: '2024-04-20', startTime: '19:30', endTime: '21:15', durationMinutes: 105, startPage: 97, endPage: 210, pagesRead: 113, notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: byTitle('Dune'), date: '2024-06-01', startTime: '21:00', endTime: '23:00', durationMinutes: 120, startPage: 1, endPage: 88, pagesRead: 88, notes: 'The world-building is absurdly good.', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: byTitle('Dune'), date: '2024-06-08', startTime: '14:00', endTime: '17:00', durationMinutes: 180, startPage: 89, endPage: 256, pagesRead: 167, notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: byTitle('The Book Thief'), date: '2024-02-17', startTime: '09:00', endTime: '10:30', durationMinutes: 90, startPage: 1, endPage: 84, pagesRead: 84, notes: 'Death as narrator works better than expected.', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: byTitle('The Book Thief'), date: '2024-02-24', startTime: '20:00', endTime: '22:00', durationMinutes: 120, startPage: 85, endPage: 232, pagesRead: 147, notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: byTitle('Educated'), date: '2024-06-22', startTime: '11:00', endTime: '13:00', durationMinutes: 120, startPage: 1, endPage: 112, pagesRead: 112, notes: 'Read in two long sittings.', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: byTitle('Normal People'), date: '2024-11-05', startTime: '20:30', endTime: '21:30', durationMinutes: 60, startPage: 1, endPage: 64, pagesRead: 64, notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: byTitle('Normal People'), date: '2024-11-09', startTime: '21:00', endTime: '22:00', durationMinutes: 60, startPage: 65, endPage: 118, pagesRead: 53, notes: '', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: byTitle('Deep Work'), date: '2024-11-10', startTime: '07:30', endTime: '08:15', durationMinutes: 45, startPage: 120, endPage: 164, pagesRead: 44, notes: 'Morning pages, no phone.', createdAt: nowISO(), updatedAt: nowISO() },
];

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

const reviews: Review[] = [
  { id: newId(), bookId: byTitle('Dune'), rating: 5, detailedScore: 96, reviewText: 'Still the benchmark for political science fiction. The ecology of Arrakis matters as much as the plot.', spoilerFlag: false, createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: byTitle('The Book Thief'), rating: 5, detailedScore: 97, reviewText: 'A narration gimmick that turns into something genuinely moving. I put it down and sat still for a while.', spoilerFlag: false, createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: byTitle('Educated'), rating: 5, detailedScore: 95, reviewText: 'Clear-eyed about family without ever becoming cruel. One of the best memoirs I have read.', spoilerFlag: false, createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: byTitle('And Then There Were None'), rating: 4, detailedScore: 85, reviewText: 'The blueprint for the locked-island mystery. It still works ninety years later.', spoilerFlag: false, createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), bookId: byTitle('The Lean Startup'), rating: 2.5, detailedScore: 55, reviewText: 'The core loop is useful; the rest felt like a long conference talk. Put it down at 30%.', spoilerFlag: false, createdAt: nowISO(), updatedAt: nowISO() },
];

// ---------------------------------------------------------------------------
// Quotes (public-domain lines only)
// ---------------------------------------------------------------------------

const quotes: Quote[] = [
  { id: newId(), bookId: byTitle('Pride and Prejudice'), quoteText: 'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.', pageNumber: 1, dateAdded: '2024-01-21', notes: 'Still the best opening sentence in English.' },
  { id: newId(), bookId: byTitle('The Great Gatsby'), quoteText: 'So we beat on, boats against the current, borne back ceaselessly into the past.', pageNumber: 180, dateAdded: '2024-08-16', notes: '' },
];

// ---------------------------------------------------------------------------
// Goals & challenges
// ---------------------------------------------------------------------------

const goals: Goal[] = [
  { id: newId(), name: '2024 Reading Goal', goalType: 'books', target: 24, period: 'year', startDate: '2024-01-01', endDate: '2024-12-31', currentProgress: 21, status: 'active', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Pages This Year', goalType: 'pages', target: 10000, period: 'year', startDate: '2024-01-01', endDate: '2024-12-31', currentProgress: 8401, status: 'active', createdAt: nowISO(), updatedAt: nowISO() },
];

const challenges: Challenge[] = [
  { id: newId(), name: 'Genre Explorer', description: 'Read 12 books across different genres this year.', category: 'genre', target: 12, progress: 8, startDate: '2024-01-01', endDate: '2024-12-31', status: 'active', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), name: 'Backlist Challenge', description: 'Read 6 books published before 2000.', category: 'era', target: 6, progress: 4, startDate: '2024-01-01', endDate: '2024-12-31', status: 'active', createdAt: nowISO(), updatedAt: nowISO() },
];

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------

const wishlist: WishlistItem[] = [
  { id: newId(), title: 'The Midnight Library', author: 'Matt Haig', coverImageId: null, coverUrl: cover('9781786892737'), format: 'Paperback', estimatedPrice: 16.99, currency: 'USD', priority: 'high', plannedPurchaseDate: null, notes: 'Everyone keeps recommending it.', status: 'wishlisted', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), title: 'Tomorrow, and Tomorrow, and Tomorrow', author: 'Gabrielle Zevin', coverImageId: null, coverUrl: cover('9780593321201'), format: 'Hardcover', estimatedPrice: 22.0, currency: 'USD', priority: 'medium', plannedPurchaseDate: null, notes: 'Video-game friendship story.', status: 'wishlisted', createdAt: nowISO(), updatedAt: nowISO() },
  { id: newId(), title: 'The Seven Moons of Maali Almeida', author: 'Shehan Karunatilaka', coverImageId: null, coverUrl: 'https://covers.openlibrary.org/b/id/13822859-L.jpg?default=false', format: 'Paperback', estimatedPrice: 18.0, currency: 'USD', priority: 'low', plannedPurchaseDate: null, notes: 'Booker winner.', status: 'wishlisted', createdAt: nowISO(), updatedAt: nowISO() },
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
  // Avoid re-seeding if a real library already exists
  const existing = await db.books.count();
  if (existing > 0) return;

  // Keep the sample library current: the demo timeline is authored for 2024,
  // so slide it forward by whole years to the present.
  const yearShift = Math.max(0, new Date().getFullYear() - 2024);
  const shiftDate = <T extends string | null | undefined>(value: T): T => {
    if (!value || yearShift === 0) return value;
    return `${Number(value.slice(0, 4)) + yearShift}${value.slice(4)}` as T;
  };

  const seedBooks = books.map((b) => ({
    ...b,
    dateAdded: shiftDate(b.dateAdded),
    startDate: shiftDate(b.startDate),
    finishDate: shiftDate(b.finishDate),
  }));

  const seedSessions = sessions.map((s) => ({ ...s, date: shiftDate(s.date) }));

  // Keep the demo feeling live: a short current streak ending today.
  const inProgress = seedBooks.find((b) => b.readingStatus === 'currently-reading');
  if (inProgress) {
    const localDay = (offset: number) => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const runStart = Math.max(0, (inProgress.currentPage ?? 60) - 56);
    const steps = [
      { offset: 2, from: runStart, to: runStart + 18 },
      { offset: 1, from: runStart + 18, to: runStart + 38 },
      { offset: 0, from: runStart + 38, to: inProgress.currentPage ?? runStart + 56 },
    ];
    for (const step of steps) {
      seedSessions.push({
        id: newId(),
        bookId: inProgress.id,
        date: localDay(step.offset),
        startTime: '20:00',
        endTime: '20:45',
        durationMinutes: 45,
        startPage: step.from,
        endPage: step.to,
        pagesRead: step.to - step.from,
        notes: '',
        createdAt: nowISO(),
        updatedAt: nowISO(),
      });
    }
  }
  const seedGoals = goals.map((g) => ({
    ...g,
    name: g.name.replace('2024', String(2024 + yearShift)),
    startDate: shiftDate(g.startDate),
    endDate: shiftDate(g.endDate),
  }));
  const seedChallenges = challenges.map((c) => ({
    ...c,
    startDate: shiftDate(c.startDate),
    endDate: shiftDate(c.endDate),
  }));
  const seedQuotes = quotes.map((q) => ({ ...q, dateAdded: shiftDate(q.dateAdded) }));

  const tables = [
    db.books, db.authors, db.series, db.readingSessions, db.reviews, db.quotes, db.notes,
    db.shelves, db.goals, db.challenges, db.wishlist, db.preferences, db.covers, db.calendarEntries,
  ];

  await db.transaction('rw', tables, async () => {
    // Clear leftovers from an interrupted earlier seed so ids never collide.
    for (const table of tables) await table.clear();
    await db.authors.bulkPut(authors);
    await db.series.bulkPut([hungerGamesSeries]);
    await db.books.bulkPut(seedBooks);
    await db.readingSessions.bulkPut(seedSessions);
    await db.reviews.bulkPut(reviews);
    await db.quotes.bulkPut(seedQuotes);
    await db.shelves.bulkPut(shelves.map((s) => ({ ...s, description: s.description?.replace('2024', String(2024 + yearShift)) ?? s.description })));
    await db.goals.bulkPut(seedGoals);
    await db.challenges.bulkPut(seedChallenges);
    await db.wishlist.bulkPut(wishlist);
    await db.preferences.bulkPut(preferences);
  });
}

/**
 * One-time refresh for libraries seeded by the original fictional demo.
 * Only runs when the demo authors are present, so real user data is untouched.
 */
export async function refreshLegacyDemo(): Promise<boolean> {
  const legacyAuthors = await db.authors.where('name').equals('Elara Voss').count();
  if (legacyAuthors === 0) return false;
  await clearAllData();
  await seedDemoData();
  return true;
}

export async function clearAllData(): Promise<void> {
  await db.transaction('rw', [db.books, db.authors, db.series, db.readingSessions, db.reviews, db.quotes, db.notes, db.shelves, db.goals, db.challenges, db.wishlist, db.preferences, db.covers, db.calendarEntries], async () => {
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

export { authors, books, shelves, sessions, reviews, quotes, goals, challenges, wishlist, preferences, hungerGamesSeries };
