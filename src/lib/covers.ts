// ---------------------------------------------------------------------------
// Official cover lookup via Open Library (CORS-enabled, no API key).
// Covers stay the property of their publishers; the app only links to them.
// ---------------------------------------------------------------------------

const COVERS = 'https://covers.openlibrary.org';
const OL = 'https://openlibrary.org';
const TIMEOUT_MS = 9000;

export type CoverSize = 'S' | 'M' | 'L';

export interface BookLookup {
  title: string;
  subtitle?: string | null;
  authors: string[];
  isbn?: string | null;
  publisher?: string | null;
  publishDate?: string | null;
  pageCount?: number | null;
  coverUrl?: string | null;
  subjects?: string[];
}

export function normalizeIsbn(raw?: string | null): string {
  return (raw ?? '').replace(/[^0-9Xx]/g, '').toUpperCase();
}

export function isbnCoverUrl(isbn: string, size: CoverSize = 'L'): string {
  return `${COVERS}/b/isbn/${normalizeIsbn(isbn)}-${size}.jpg?default=false`;
}

export function coverUrlById(id: number | string, size: CoverSize = 'L'): string {
  return `${COVERS}/b/id/${id}-${size}.jpg?default=false`;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Returns true when the browser can actually decode the image. */
export function probeImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => resolve(false), TIMEOUT_MS);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img.naturalWidth > 0);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    img.referrerPolicy = 'no-referrer';
    img.src = url;
  });
}

interface OLDoc {
  title?: string;
  subtitle?: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
  publisher?: string[];
  subject?: string[];
}

interface OLSearchPayload {
  docs?: OLDoc[];
}

interface OLBooksPayload {
  [key: string]: {
    title?: string;
    subtitle?: string;
    authors?: { name?: string }[];
    publishers?: { name?: string }[];
    publish_date?: string;
    number_of_pages?: number;
    cover?: { small?: string; medium?: string; large?: string };
    subjects?: { name?: string }[];
  };
}

function docToLookup(doc: OLDoc): BookLookup | null {
  if (!doc.title) return null;
  const isbn13 = (doc.isbn ?? []).find((i) => /^97[89]\d{10}$/.test(i)) ?? null;
  return {
    title: doc.title,
    subtitle: doc.subtitle ?? null,
    authors: (doc.author_name ?? []).filter(Boolean),
    isbn: isbn13,
    publisher: doc.publisher?.[0] ?? null,
    publishDate: doc.first_publish_year ? `${doc.first_publish_year}` : null,
    pageCount: doc.number_of_pages_median ?? null,
    coverUrl: doc.cover_i ? coverUrlById(doc.cover_i) : isbn13 ? isbnCoverUrl(isbn13) : null,
    subjects: (doc.subject ?? []).slice(0, 12),
  };
}

/** Free-text search across Open Library works — used by the "Find book" panel. */
export async function searchBooks(query: string, limit = 8): Promise<BookLookup[]> {
  const q = query.trim();
  if (!q) return [];
  const payload = await fetchJson<OLSearchPayload>(
    `${OL}/search.json?q=${encodeURIComponent(q)}&limit=${limit * 2}` +
      '&fields=title,subtitle,author_name,first_publish_year,isbn,cover_i,number_of_pages_median,publisher,subject',
  );
  return (payload?.docs ?? [])
    .map(docToLookup)
    .filter((d): d is BookLookup => Boolean(d))
    .slice(0, limit);
}

/** Detailed edition lookup by ISBN (autofill + official cover). */
export async function lookupIsbn(rawIsbn: string): Promise<BookLookup | null> {
  const isbn = normalizeIsbn(rawIsbn);
  if (isbn.length !== 10 && isbn.length !== 13) return null;

  const payload = await fetchJson<OLBooksPayload>(
    `${OL}/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
  );
  const entry = payload?.[`ISBN:${isbn}`];
  if (entry?.title) {
    const cover =
      entry.cover?.large ??
      entry.cover?.medium ??
      (isbn ? isbnCoverUrl(isbn) : null);
    return {
      title: entry.title,
      subtitle: entry.subtitle ?? null,
      authors: (entry.authors ?? []).map((a) => a.name ?? '').filter(Boolean),
      isbn,
      publisher: entry.publishers?.[0]?.name ?? null,
      publishDate: entry.publish_date ?? null,
      pageCount: entry.number_of_pages ?? null,
      coverUrl: cover ?? null,
      subjects: (entry.subjects ?? []).map((s) => s.name ?? '').filter(Boolean).slice(0, 12),
    };
  }

  const results = await searchBooks(`isbn:${isbn}`, 3);
  return results[0] ?? null;
}

/**
 * Best-effort official cover for a book. Tries the ISBN first, then a
 * title + author search, and only returns URLs the browser can decode.
 */
export async function findCover({
  isbn,
  title,
  author,
}: {
  isbn?: string | null;
  title?: string | null;
  author?: string | null;
}): Promise<string | null> {
  const candidates: string[] = [];
  const normalized = normalizeIsbn(isbn);
  if (normalized.length === 10 || normalized.length === 13) {
    candidates.push(isbnCoverUrl(normalized));
  }

  const query = [title, author].filter(Boolean).join(' ').trim();
  if (query) {
    const results = await searchBooks(query, 3);
    for (const r of results) {
      if (r.coverUrl) candidates.push(r.coverUrl);
      else if (r.isbn) candidates.push(isbnCoverUrl(r.isbn));
    }
  }

  for (const url of candidates) {
    if (await probeImage(url)) return url;
  }
  return null;
}

/** Best-effort ISBN → cover + metadata, with a title/author fallback. */
export async function enrichBookDetails({
  isbn,
  title,
  author,
}: {
  isbn?: string | null;
  title?: string | null;
  author?: string | null;
}): Promise<{ details: BookLookup | null; coverUrl: string | null }> {
  let details: BookLookup | null = null;
  const normalized = normalizeIsbn(isbn);
  if (normalized.length === 10 || normalized.length === 13) {
    details = await lookupIsbn(normalized);
  }
  if (!details && (title || author)) {
    const results = await searchBooks([title, author].filter(Boolean).join(' '), 1);
    details = results[0] ?? null;
  }

  if (details?.coverUrl && (await probeImage(details.coverUrl))) {
    return { details, coverUrl: details.coverUrl };
  }

  const coverUrl = await findCover({ isbn: details?.isbn ?? isbn, title: details?.title ?? title, author: author });
  return { details, coverUrl };
}
