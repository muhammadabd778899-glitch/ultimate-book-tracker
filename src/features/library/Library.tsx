import { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '@/db';
import { CoverImage } from '@/components/ui/cover-image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { statusLabel, statusColor, computeLibraryStats } from '@/utils/date';
import {
  Search,
  Filter,
  SlidersHorizontal,
  List,
  Grid,
  Book,
  SortAsc,
  Trash2,
  Plus,
  ShieldAlert,
  LayoutGrid,
  LayoutList,
} from 'lucide-react';

const VIEW_MODES = [
  { id: 'grid', label: 'Cover Grid', icon: LayoutGrid },
  { id: 'list', label: 'Compact List', icon: LayoutList },
  { id: 'spine', label: 'Book Spine', icon: Book },
] as const;

export default function Library() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const books = useLiveQuery(() => db.books.toArray(), []) ?? [];
  const authors = useLiveQuery(() => db.authors.toArray(), []) ?? [];

  // Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sort, setSort] = useState<keyof typeof SORT_OPTIONS>('recentlyAdded');
  const [view, setView] = useState<'grid' | 'list' | 'spine'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Derived options
  const genres = useMemo(
    () => Array.from(new Set(books.flatMap((b) => b.genres))).sort(),
    [books]
  );
  const formats = useMemo(
    () => Array.from(new Set(books.map((b) => b.format).filter(Boolean))).sort(),
    [books]
  );

  const SORT_OPTIONS: Record<string, (a: any, b: any) => number> = {
    titleAZ: (a, b) => a.title.localeCompare(b.title),
    titleZA: (a, b) => b.title.localeCompare(a.title),
    author: (a, b) => {
      const an = authors.find((x) => x.id === a.authorIds[0])?.name ?? '';
      const bn = authors.find((x) => x.id === b.authorIds[0])?.name ?? '';
      return an.localeCompare(bn);
    },
    highestRated: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
    lowestRated: (a, b) => (a.rating ?? 0) - (b.rating ?? 0),
    recentlyAdded: (a, b) => (b.dateAdded ?? '').localeCompare(a.dateAdded ?? ''),
    oldestAdded: (a, b) => (a.dateAdded ?? '').localeCompare(b.dateAdded ?? ''),
    recentlyFinished: (a, b) => (b.finishDate ?? '').localeCompare(a.finishDate ?? ''),
    progress: (a, b) => (b.percentageComplete ?? 0) - (a.percentageComplete ?? 0),
    pageCount: (a, b) => (b.pageCount ?? 0) - (a.pageCount ?? 0),
  };

  const filtered = useMemo(() => {
    return books
      .filter((b) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          b.title.toLowerCase().includes(q) ||
          (b.subtitle ?? '').toLowerCase().includes(q) ||
          (b.isbn ?? '').toLowerCase().includes(q) ||
          b.genres.some((g) => g.toLowerCase().includes(q)) ||
          b.authorIds.some((id) => authors.find((x) => x.id === id)?.name.toLowerCase().includes(q));
        const matchesStatus = statusFilter === 'all' || b.readingStatus === statusFilter;
        const matchesGenre = genreFilter === 'all' || b.genres.includes(genreFilter);
        const matchesAuthor = authorFilter === 'all' || (b.authorIds[0] && authorFilter === b.authorIds[0]);
        const matchesFormat = formatFilter === 'all' || b.format === formatFilter;
        const matchesRating =
          ratingFilter === 'all' ||
          (ratingFilter === '4+' && (b.rating ?? 0) >= 4) ||
          (ratingFilter === '3+' && (b.rating ?? 0) >= 3) ||
          (ratingFilter === 'unrated' && !b.rating);
        return matchesSearch && matchesStatus && matchesGenre && matchesAuthor && matchesFormat && matchesRating;
      })
      .sort(SORT_OPTIONS[sort]);
  }, [books, search, statusFilter, genreFilter, authorFilter, formatFilter, ratingFilter, sort, authors]);

  const allSelected = selectedIds.size > 0 && selectedIds.size === filtered.length;

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await db.books.delete(deleteId);
    setDeleteId(null);
    toast.success('Book removed from library');
  };

  const handleBulkAction = (action: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    switch (action) {
      case 'delete':
        setDeleteId(ids[0]); // simplify: delete first for demo; ideally multi-delete
        break;
      default:
        toast.info(`Bulk ${action} applied to ${ids.length} books`);
    }
    setSelectedIds(new Set());
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-text">My Library</h1>
          <p className="text-text-secondary">{filtered.length} books</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/books/add')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Book
          </Button>
          <Button variant="outline" onClick={() => setFiltersOpen(!filtersOpen)} className="flex items-center gap-2 px-4">
            <SlidersHorizontal className="w-4 h-4" /> Filter
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search title, author, ISBN, genre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
          leftIcon={<Search className="w-4 h-4 text-text-muted" />}
        />
      </div>

      {/* Filters bar */}
      <div className={`flex flex-wrap gap-3 mb-6 ${filtersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <FilterPill label="Status" value={statusFilter === 'all' ? 'All' : statusLabel(statusFilter)} onChange={setStatusFilter} options={STATUS_OPTIONS} />
        <FilterPill label="Genre" value={genreFilter === 'all' ? 'All genres' : genreFilter} onChange={setGenreFilter} options={genres} />
        <FilterPill label="Author" value={authorFilter === 'all' ? 'All authors' : authorFilter} onChange={setAuthorFilter} options={authors.map((a) => a.name)} />
        <FilterPill label="Format" value={formatFilter === 'all' ? 'All formats' : formatFilter} onChange={setFormatFilter} options={formats} />
        <FilterPill label="Rating" value={ratingFilter === 'all' ? 'Any rating' : ratingFilter} onChange={setRatingFilter} options={['4+', '3+', 'unrated']} />
        <FilterPill label="Sort" value={sort} onChange={setSort} options={Object.keys(SORT_OPTIONS)} />
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-text-muted uppercase tracking-wider">View</span>
        {VIEW_MODES.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              onClick={() => setView(m.id as any)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                view === m.id ? 'bg-accent text-text' : 'bg-surface text-text-secondary hover:bg-elevated'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Book className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
          <h3 className="text-xl font-serif font-semibold text-text">No books found</h3>
          <p className="text-text-secondary mb-6">Try adjusting your filters or add a new book.</p>
          <Button onClick={() => navigate('/books/add')}>Add Book</Button>
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((b) => (
            <LibraryCard key={b.id} book={b} selected={selectedIds.has(b.id)} onToggle={() => toggleSelection(b.id)} onClick={() => navigate(`/books/${b.id}`)} />
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="divide-y divide-input">
          {filtered.map((b) => (
            <LibraryListItem key={b.id} book={b} selected={selectedIds.has(b.id)} onToggle={() => toggleSelection(b.id)} onClick={() => navigate(`/books/${b.id}`)} />
          ))}
        </div>
      )}

      {/* Spine view */}
      {view === 'spine' && (
        <div className="flex gap-2 overflow-x-auto pb-8">
          {filtered.map((b) => (
            <SpineBook key={b.id} book={b} selected={selectedIds.has(b.id)} onToggle={() => toggleSelection(b.id)} onClick={() => navigate(`/books/${b.id}`)} />
          ))}
        </div>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-3 rounded-2xl border border-input bg-card p-4 shadow-cover">
          <span className="text-xs text-text-secondary">{selectedIds.size} selected</span>
          <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleBulkAction('delete')}>
            <Trash2 className="w-4 h-4 mr-1" /> Delete
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

  function toggleSelection(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }
}

const STATUS_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'want-to-read', label: 'Want to Read' },
  { id: 'currently-reading', label: 'Currently Reading' },
  { id: 'finished', label: 'Finished' },
  { id: 'on-hold', label: 'On Hold' },
  { id: 'did-not-finish', label: 'Did Not Finish' },
];

function FilterPill({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-input bg-surface text-sm text-text hover:bg-elevated"
      >
        {label}: {value}
        <span className="w-3 h-3 border-b border-r border-text-muted rotate-45" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-full rounded-xl border border-input bg-card shadow-cover z-20">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-sm text-text-secondary hover:bg-elevated hover:text-accent"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LibraryCard({ book, selected, onToggle, onClick }: { book: any; selected: boolean; onToggle: () => void; onClick: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="group relative cursor-pointer">
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="absolute top-2 left-2 z-20 hidden group-focus:block"
      />
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-surface border border-transparent group-hover:border-accent/50 transition-colors">
        <div className="w-full h-full bg-gradient-to-b from-transparent to-black/40"></div>
        <CoverImage coverImageId={book.coverImageId} alt={book.title} className="w-full h-full object-cover" />
        {book.isFavorite && (
          <div className="absolute top-2 right-2">
            <ShieldAlert className="w-4 h-4 fill-gold text-gold drop-shadow-lg" />
          </div>
        )}
        {book.percentageComplete && book.percentageComplete > 0 && (
          <div className="absolute bottom-2 left-2 right-2">
            <ProgressBar value={book.percentageComplete} color="gold" className="h-1.5" />
          </div>
        )}
      </div>
      <h4 className="mt-2 text-sm font-semibold text-text line-clamp-1">{book.title}</h4>
      <p className="text-xs text-text-secondary line-clamp-1">{book.authorIds.join(', ') || 'Unknown Author'}</p>
      <p className="text-xs text-text-muted">{statusLabel(book.readingStatus)}</p>
    </div>
  );
}

function LibraryListItem({ book, selected, onToggle, onClick }: { book: any; selected: boolean; onToggle: () => void; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-elevated transition-colors group">
      <input type="checkbox" checked={selected} onChange={onToggle} className="shrink-0" />
      <div className="relative w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-surface">
        <CoverImage coverImageId={book.coverImageId} alt={book.title} className="w-full h-full object-cover" radius="md" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-text truncate">{book.title}</h4>
        <p className="text-xs text-text-secondary truncate">{book.authorIds.join(', ') || 'Unknown Author'}</p>
        <p className="text-xs text-text-muted">{statusLabel(book.readingStatus)} • {book.genres.join(', ') || 'General'}</p>
      </div>
      {book.percentageComplete && book.percentageComplete > 0 && (
        <ProgressBar value={book.percentageComplete} color="accent" className="w-32 h-1.5 shrink-0" />
      )}
    </button>
  );
}

function SpineBook({ book, selected, onToggle, onClick }: { book: any; selected: boolean; onToggle: () => void; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 shrink-0 w-14 cursor-pointer group">
      <input type="checkbox" checked={selected} onChange={onToggle} className="z-20" />
      <div className="w-full h-48 rounded-sm overflow-hidden bg-surface border border-input flex items-end justify-center p-1 group-hover:scale-105 transition-transform">
        <div
          className="w-full rounded-t-sm"
          style={{ background: book.genres[0] ? genreColor(book.genres[0]) : '#30303a' }}
        >
          <div className="h-1 bg-black/20" />
        </div>
      </div>
      <h4 className="text-[10px] font-semibold text-text text-center leading-tight">{book.title}</h4>
    </button>
  );
}

function genreColor(g: string): string {
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
  return colors[g] ?? '#6b7280';
}
