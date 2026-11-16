import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/db';
import { CoverImage } from '@/components/ui/cover-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ConfirmDialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { statusLabel } from '@/utils/date';
import { useSafeLiveQuery } from '@/hooks/use-safe-live-query';
import { useAuthorNames } from '@/hooks/use-author-names';
import {
  Search,
  Book,
  Trash2,
  Plus,
  SlidersHorizontal,
  LayoutGrid,
  LayoutList,
  Star,
  Heart,
  Check,
  ArrowUpDown,
} from 'lucide-react';

const VIEW_MODES = [
  { id: 'grid', label: 'Cover grid', icon: LayoutGrid },
  { id: 'list', label: 'Compact list', icon: LayoutList },
  { id: 'spine', label: 'Book spines', icon: Book },
] as const;

type ViewMode = (typeof VIEW_MODES)[number]['id'];

export default function Library() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const books = useSafeLiveQuery(() => db.books.toArray(), []) ?? [];
  const { authors, nameFor } = useAuthorNames();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sort, setSort] = useState<keyof typeof SORT_OPTIONS>('recentlyAdded');
  const [view, setView] = useState<ViewMode>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const genres = useMemo(() => Array.from(new Set(books.flatMap((b) => b.genres))).sort(), [books]);
  const formats = useMemo(
    () => Array.from(new Set(books.map((b) => b.format).filter((f): f is string => Boolean(f)))).sort(),
    [books]
  );

  const SORT_OPTIONS: Record<string, (a: any, b: any) => number> = {
    titleAZ: (a, b) => a.title.localeCompare(b.title),
    titleZA: (a, b) => b.title.localeCompare(a.title),
    author: (a, b) => nameFor(a.authorIds).localeCompare(nameFor(b.authorIds)),
    highestRated: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    lowestRated: (a, b) => (a.rating ?? 0) - (b.rating ?? 0),
    recentlyAdded: (a, b) => (b.dateAdded ?? '').localeCompare(a.dateAdded ?? ''),
    oldestAdded: (a, b) => (a.dateAdded ?? '').localeCompare(b.dateAdded ?? ''),
    recentlyFinished: (a, b) => (b.finishDate ?? '').localeCompare(a.finishDate ?? ''),
    progress: (a, b) => (b.percentageComplete ?? 0) - (a.percentageComplete ?? 0),
    pageCount: (a, b) => (b.pageCount ?? 0) - (a.pageCount ?? 0),
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return books
      .filter((b) => {
        const names = nameFor(b.authorIds, '');
        const matchesSearch =
          !q ||
          b.title.toLowerCase().includes(q) ||
          (b.subtitle ?? '').toLowerCase().includes(q) ||
          (b.isbn ?? '').toLowerCase().includes(q) ||
          names.toLowerCase().includes(q) ||
          b.genres.some((g) => g.toLowerCase().includes(q));
        const matchesStatus = statusFilter === 'all' || b.readingStatus === statusFilter;
        const matchesGenre = genreFilter === 'all' || b.genres.includes(genreFilter);
        const matchesAuthor = authorFilter === 'all' || b.authorIds.includes(authorFilter);
        const matchesFormat = formatFilter === 'all' || b.format === formatFilter;
        const matchesRating =
          ratingFilter === 'all' ||
          (ratingFilter === '4+' && (b.rating ?? 0) >= 4) ||
          (ratingFilter === '3+' && (b.rating ?? 0) >= 3) ||
          (ratingFilter === 'unrated' && !b.rating);
        return matchesSearch && matchesStatus && matchesGenre && matchesAuthor && matchesFormat && matchesRating;
      })
      .sort(SORT_OPTIONS[sort]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books, search, statusFilter, genreFilter, authorFilter, formatFilter, ratingFilter, sort, authors]);

  const activeFilters = [
    statusFilter !== 'all' && {
      key: 'status',
      label: STATUS_OPTIONS.find((s) => s.id === statusFilter)?.label ?? statusFilter,
      clear: () => setStatusFilter('all'),
    },
    genreFilter !== 'all' && {
      key: 'genre',
      label: titleCase(genreFilter),
      clear: () => setGenreFilter('all'),
    },
    authorFilter !== 'all' && {
      key: 'author',
      label: nameFor([authorFilter], 'Unknown author'),
      clear: () => setAuthorFilter('all'),
    },
    formatFilter !== 'all' && { key: 'format', label: formatFilter, clear: () => setFormatFilter('all') },
    ratingFilter !== 'all' && { key: 'rating', label: ratingFilter === 'unrated' ? 'Unrated' : `${ratingFilter} stars`, clear: () => setRatingFilter('all') },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const activeFilterCount = activeFilters.length;

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await db.books.delete(deleteId);
    setDeleteId(null);
    setSelectedIds(new Set());
    toast.success('Book removed from library');
  };

  const deleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    await db.books.bulkDelete(ids);
    setSelectedIds(new Set());
    toast.success(`${ids.length} book${ids.length > 1 ? 's' : ''} removed`);
  };

  return (
    <div className="container py-8 mb-10">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text md:text-4xl">My Library</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {filtered.length === books.length
              ? `${books.length} book${books.length === 1 ? '' : 's'} on your shelves`
              : `${filtered.length} of ${books.length} books`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/books/add')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add book
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          placeholder="Search title, author, ISBN or genre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full lg:max-w-md"
          leftIcon={<Search className="h-4 w-4 text-text-muted" />}
        />
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <Button
            variant={filtersOpen || activeFilterCount ? 'default' : 'outline'}
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex items-center gap-2 px-4"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-full bg-black/25 px-1.5 text-[11px] font-bold">{activeFilterCount}</span>
            )}
          </Button>
          <label className="flex h-11 items-center gap-2 rounded-xl border border-input bg-surface px-3 text-sm text-text-secondary">
            <ArrowUpDown className="h-4 w-4 text-text-muted" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as keyof typeof SORT_OPTIONS)}
              className="cursor-pointer bg-transparent pr-1 text-sm font-medium text-text focus:outline-none"
            >
              {SORT_OPTIONS_LIST.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-1 rounded-xl border border-input bg-surface p-1">
            {VIEW_MODES.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  title={m.label}
                  onClick={() => setView(m.id)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    view === m.id ? 'bg-accent text-white' : 'text-text-secondary hover:bg-elevated hover:text-text'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {(filtersOpen || activeFilterCount > 0) && (
        <div className="mb-5 flex flex-wrap items-center gap-2 animate-fade-in">
          {filtersOpen && (
            <>
              <FilterPill
                label="Status"
                value={statusFilter}
                placeholder="All statuses"
                onChange={setStatusFilter}
                options={STATUS_OPTIONS.filter((s) => s.id !== 'all').map((s) => ({ value: s.id, label: s.label }))}
              />
              <FilterPill
                label="Genre"
                value={genreFilter}
                placeholder="All genres"
                onChange={setGenreFilter}
                options={genres.map((g) => ({ value: g, label: titleCase(g) }))}
              />
              <FilterPill
                label="Author"
                value={authorFilter}
                placeholder="All authors"
                onChange={setAuthorFilter}
                options={authors.map((a) => ({ value: a.id, label: a.name }))}
              />
              <FilterPill
                label="Format"
                value={formatFilter}
                placeholder="All formats"
                onChange={setFormatFilter}
                options={formats.map((f) => ({ value: f, label: f }))}
              />
              <FilterPill
                label="Rating"
                value={ratingFilter}
                placeholder="Any rating"
                onChange={setRatingFilter}
                options={[
                  { value: '4+', label: '4 stars & up' },
                  { value: '3+', label: '3 stars & up' },
                  { value: 'unrated', label: 'Unrated' },
                ]}
              />
            </>
          )}
          {activeFilters.map((f) => (
            <button
              key={f.key}
              onClick={f.clear}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-medium text-text"
            >
              {f.label}
              <span className="text-text-muted">×</span>
            </button>
          ))}
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setGenreFilter('all');
                setAuthorFilter('all');
                setFormatFilter('all');
                setRatingFilter('all');
              }}
              className="text-xs font-medium text-text-muted underline-offset-2 hover:text-text hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-input bg-surface/40 py-24 text-center">
          <Book className="mb-4 h-14 w-14 text-text-muted opacity-40" />
          <h3 className="font-serif text-xl font-semibold text-text">
            {books.length === 0 ? 'Your library is empty' : 'No books match'}
          </h3>
          <p className="mb-6 mt-1 max-w-sm text-sm text-text-secondary">
            {books.length === 0
              ? 'Add your first book — or load the demo library from Settings.'
              : 'Try a different search or clear your filters to see everything on your shelves.'}
          </p>
          <Button onClick={() => navigate('/books/add')}>
            <Plus className="mr-2 h-4 w-4" /> Add a book
          </Button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
          {filtered.map((b) => (
            <LibraryCard
              key={b.id}
              book={b}
              author={nameFor(b.authorIds)}
              selected={selectedIds.has(b.id)}
              onToggle={() => toggleSelection(b.id)}
              onClick={() => navigate(`/books/${b.id}`)}
            />
          ))}
        </div>
      ) : view === 'list' ? (
        <div className="overflow-hidden rounded-2xl border border-input bg-card">
          {filtered.map((b) => (
            <LibraryListItem
              key={b.id}
              book={b}
              author={nameFor(b.authorIds)}
              selected={selectedIds.has(b.id)}
              onToggle={() => toggleSelection(b.id)}
              onClick={() => navigate(`/books/${b.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-input bg-surface/40 p-6">
          {filtered.map((b) => (
            <SpineBook
              key={b.id}
              book={b}
              selected={selectedIds.has(b.id)}
              onToggle={() => toggleSelection(b.id)}
              onClick={() => navigate(`/books/${b.id}`)}
            />
          ))}
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-input bg-card px-4 py-3 shadow-cover">
          <span className="text-sm font-medium text-text">{selectedIds.size} selected</span>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={deleteSelected}>
            <Trash2 className="mr-1 h-4 w-4" /> Delete
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={deleteId != null}
        onOpenChange={(o) => (o ? null : setDeleteId(null))}
        title="Delete book"
        message="This will remove the book and its reading history. This cannot be undone."
        onConfirm={confirmDelete}
        destructive
      />
    </div>
  );
}

const STATUS_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'want-to-read', label: 'Want to Read' },
  { id: 'currently-reading', label: 'Currently Reading' },
  { id: 'finished', label: 'Finished' },
  { id: 'on-hold', label: 'On Hold' },
  { id: 'did-not-finish', label: 'Did Not Finish' },
];

const SORT_OPTIONS_LIST = [
  { value: 'recentlyAdded', label: 'Recently added' },
  { value: 'oldestAdded', label: 'Oldest added' },
  { value: 'titleAZ', label: 'Title A → Z' },
  { value: 'titleZA', label: 'Title Z → A' },
  { value: 'author', label: 'Author A → Z' },
  { value: 'highestRated', label: 'Highest rated' },
  { value: 'lowestRated', label: 'Lowest rated' },
  { value: 'recentlyFinished', label: 'Recently finished' },
  { value: 'progress', label: 'Reading progress' },
  { value: 'pageCount', label: 'Page count' },
];

const STATUS_TONE: Record<string, { dot: string; pill: string }> = {
  finished: { dot: 'bg-success', pill: 'bg-black/55' },
  'currently-reading': { dot: 'bg-accent', pill: 'bg-black/60' },
  'want-to-read': { dot: 'bg-gold', pill: 'bg-black/55' },
  'on-hold': { dot: 'bg-warning', pill: 'bg-black/55' },
  'did-not-finish': { dot: 'bg-danger', pill: 'bg-black/55' },
};

function titleCase(value: string) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function FilterPill({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
          selected
            ? 'border-accent/40 bg-accent/10 text-text'
            : 'border-input bg-surface text-text-secondary hover:bg-elevated hover:text-text'
        }`}
      >
        <span className="text-text-muted">{label}:</span>
        <span className="font-medium">{selected?.label ?? placeholder}</span>
        <svg className="h-3 w-3 opacity-60" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-2 max-h-72 min-w-full overflow-y-auto whitespace-nowrap rounded-xl border border-input bg-card py-1 shadow-cover">
            <FilterOption
              label={placeholder}
              active={!selected}
              onClick={() => {
                onChange('all');
                setOpen(false);
              }}
            />
            {options.map((o) => (
              <FilterOption
                key={o.value}
                label={o.label}
                active={o.value === value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FilterOption({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
        active ? 'bg-accent/10 font-medium text-accent' : 'text-text-secondary hover:bg-elevated hover:text-text'
      }`}
    >
      {label}
    </button>
  );
}

function SelectBox({ selected, onToggle }: { selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={selected ? 'Deselect book' : 'Select book'}
      className={`flex h-6 w-6 items-center justify-center rounded-full border shadow-sm backdrop-blur transition-all ${
        selected
          ? 'border-accent bg-accent text-white'
          : 'border-white/60 bg-black/35 text-transparent opacity-0 group-hover:opacity-100 focus:opacity-100'
      }`}
    >
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </button>
  );
}

function LibraryCard({
  book,
  author,
  selected,
  onToggle,
  onClick,
}: {
  book: any;
  author: string;
  selected: boolean;
  onToggle: () => void;
  onClick: () => void;
}) {
  const tone = STATUS_TONE[book.readingStatus] ?? { dot: 'bg-text-muted', pill: 'bg-black/55' };
  const progress = typeof book.percentageComplete === 'number' ? book.percentageComplete : 0;
  const inProgress = progress > 0 && progress < 100;

  return (
    <div className="group relative">
      <button onClick={onClick} className="block w-full text-left">
        <div
          className={`relative aspect-[2/3] overflow-hidden rounded-xl bg-surface shadow-cover ring-1 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-hero ${
            selected ? 'ring-2 ring-accent' : 'ring-black/15'
          }`}
        >
          <CoverImage
            coverImageId={book.coverImageId}
            coverUrl={book.coverUrl}
            title={book.title}
            author={author}
            genre={book.genres?.[0]}
            alt={book.title}
            className="h-full w-full"
            radius="lg"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />

          <span
            className={`absolute left-2 top-2 inline-flex items-center gap-1 rounded-full ${tone.pill} px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
            {statusLabel(book.readingStatus)}
          </span>
          {book.isFavorite && (
            <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/45 backdrop-blur">
              <Heart className="h-3.5 w-3.5 fill-accent text-accent" />
            </span>
          )}

          {inProgress && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-2 pb-2 pt-8">
              <div className="mb-1 flex items-center justify-between text-[10px] font-semibold text-white">
                <span>{progress}%</span>
                <span className="opacity-75">
                  {book.currentPage ?? 0}/{book.pageCount ?? '?'}p
                </span>
              </div>
              <ProgressBar value={progress} color="gold" className="h-1.5" />
            </div>
          )}
        </div>

        <h4 className="mt-2.5 line-clamp-2 text-[13px] font-semibold leading-snug text-text">{book.title}</h4>
        <p className="mt-0.5 truncate text-xs text-text-secondary">{author || 'Unknown author'}</p>
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-text-muted">
          {book.rating ? (
            <span className="inline-flex items-center gap-0.5 text-gold">
              <Star className="h-3 w-3 fill-gold" /> {book.rating}
            </span>
          ) : null}
          {book.genres[0] ? <span className="truncate">{titleCase(book.genres[0])}</span> : null}
          {book.pageCount ? <span className="ml-auto shrink-0 opacity-70">{book.pageCount}p</span> : null}
        </div>
      </button>
      <div className="absolute left-2 top-2 z-10">
        <SelectBox selected={selected} onToggle={onToggle} />
      </div>
    </div>
  );
}

function LibraryListItem({
  book,
  author,
  selected,
  onToggle,
  onClick,
}: {
  book: any;
  author: string;
  selected: boolean;
  onToggle: () => void;
  onClick: () => void;
}) {
  const progress = typeof book.percentageComplete === 'number' ? book.percentageComplete : 0;
  return (
    <div
      className={`group flex cursor-pointer items-center gap-4 border-b border-input/60 px-4 py-3 transition-colors last:border-b-0 hover:bg-elevated ${
        selected ? 'bg-accent/5' : ''
      }`}
      onClick={onClick}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={selected ? 'Deselect book' : 'Select book'}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          selected ? 'border-accent bg-accent text-white' : 'border-input text-transparent hover:border-accent/60'
        }`}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </button>
      <div className="h-[84px] w-14 shrink-0">
        <CoverImage
          coverImageId={book.coverImageId}
          coverUrl={book.coverUrl}
          title={book.title}
          author={author}
          genre={book.genres?.[0]}
          alt={book.title}
          className="h-full w-full shadow-cover"
          radius="md"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold text-text">{book.title}</h4>
        <p className="truncate text-xs text-text-secondary">{author || 'Unknown author'}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
          <span className="rounded-full bg-surface px-2 py-0.5">{statusLabel(book.readingStatus)}</span>
          {book.genres[0] && <span>{titleCase(book.genres[0])}</span>}
          {book.rating ? (
            <span className="inline-flex items-center gap-0.5 text-gold">
              <Star className="h-3 w-3 fill-gold" /> {book.rating}
            </span>
          ) : null}
        </div>
      </div>
      {progress > 0 && (
        <div className="hidden w-32 shrink-0 sm:block">
          <div className="mb-1 text-right text-[11px] text-text-muted">{progress}%</div>
          <ProgressBar value={progress} color="accent" className="h-1.5" />
        </div>
      )}
    </div>
  );
}

function SpineBook({
  book,
  selected,
  onToggle,
  onClick,
}: {
  book: any;
  selected: boolean;
  onToggle: () => void;
  onClick: () => void;
}) {
  const color = genreColor(book.genres[0]);
  return (
    <div className="group relative">
      <button onClick={onClick} className="block" title={book.title}>
        <div
          className={`relative flex h-56 w-14 items-center justify-center overflow-hidden rounded-md shadow-cover ring-1 ring-black/25 transition-transform group-hover:-translate-y-1.5 ${
            selected ? 'ring-2 ring-accent' : ''
          }`}
          style={{ background: `linear-gradient(90deg, ${shade(color, 34)} 0%, ${color} 22%, ${shade(color, -10)} 100%)` }}
        >
          <span className="absolute inset-y-0 left-0 w-[3px] bg-black/25" />
          <span className="[writing-mode:vertical-rl] rotate-180 truncate px-1 text-[11px] font-semibold tracking-wide text-white/95">
            {book.title}
          </span>
        </div>
      </button>
      <div className="absolute -left-1 top-1 z-10">
        <SelectBox selected={selected} onToggle={onToggle} />
      </div>
    </div>
  );
}

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, ((n >> 16) & 255) + amount));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + amount));
  const b = Math.min(255, Math.max(0, (n & 255) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function genreColor(g?: string): string {
  const colors: Record<string, string> = {
    fantasy: '#6366f1',
    'science-fiction': '#0891b2',
    mystery: '#4b5563',
    thriller: '#7f1d1d',
    romance: '#be185d',
    'historical-fiction': '#92400e',
    'self-help': '#047857',
    business: '#1d4ed8',
    psychology: '#7c3aed',
    biography: '#1e293b',
    'personal-development': '#059669',
    classics: '#475569',
    nonfiction: '#0f172a',
    poetry: '#db2777',
    comics: '#ea580c',
    'graphic-novels': '#c026d3',
  };
  return (g && colors[g]) ?? '#6b7280';
}
