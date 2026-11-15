import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '@/db';
import { CoverImage } from '@/components/ui/cover-image';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { computeLibraryStats, statusLabel } from '@/utils/date';
import {
  Play,
  BookOpen,
  Heart,
  ArrowRight,
  Clock,
  BookPlus,
  Timer,
  Calendar,
  ChevronRight,
  Star,
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const books = useLiveQuery(() => db.books.toArray(), []) ?? [];

  const [featuredId, setFeaturedId] = useState<string | null>(null);

  useEffect(() => {
    // Pick a featured book: currently reading > finished > first book
    const current = books.find((b) => b.readingStatus === 'currently-reading');
    const finished = books.find((b) => b.readingStatus === 'finished');
    setFeaturedId(current?.id ?? finished?.id ?? books[0]?.id ?? null);
  }, [books]);

  const featured = books.find((b) => b.id === featuredId);
  const stats = computeLibraryStats(books);

  // Shelf groupings
  const continueReading = books.filter((b) => b.readingStatus === 'currently-reading').slice(0, 8);
  const recentlyAdded = [...books].sort((a, b) => (b.dateAdded ?? '').localeCompare(a.dateAdded ?? '')).slice(0, 8);
  const nextReads = books.filter((b) => b.readingStatus === 'want-to-read').slice(0, 8);
  const recentlyFinished = books
    .filter((b) => b.readingStatus === 'finished')
    .sort((a, b) => (b.finishDate ?? '').localeCompare(a.finishDate ?? ''))
    .slice(0, 8);
  const favorites = books.filter((b) => b.isFavorite).slice(0, 8);
  const highestRated = books
    .filter((b) => (b.rating ?? 0) > 0)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 8);
  const notStarted = books.filter((b) => b.readingStatus === 'want-to-read').slice(0, 8);

  const handleAddBook = () => navigate('/books/add');

  return (
    <div className="container py-6 mb-10">
      {/* Quick stats bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Books in Library" value={stats.totalBooks} icon={BookOpen} />
        <StatCard label="Currently Reading" value={stats.currentlyReading} icon={Clock} accent />
        <StatCard label="Finished This Year" value={stats.finished} icon={BookOpen} success />
        <StatCard label="Pages Read" value={stats.pagesRead} icon={BookOpen} />
        <StatCard label="Average Rating" value={stats.averageRating || '--'} icon={Star} gold />
        <StatCard label="Reading Streak" value="—" icon={Calendar} />
      </div>

      {/* Hero */}
      <section className="mb-12 relative overflow-hidden rounded-3xl border border-input bg-surface shadow-hero p-8 md:p-12 animate-fade-in">
        <div className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;base64,CPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNjAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTAxMDE0Ii8+PHBhdGggZD0iTTAgMHY2MDBoNDAwVjB6IiBmaWxsPSJub25lIiBzdHJva2U9IiMzMDMwM2EiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==')] opacity-10" />
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="relative">
            {featured ? (
              <CoverImage coverImageId={featured.coverImageId} alt={featured.title} className="w-full max-w-[320px] mx-auto shadow-cover" />
            ) : (
              <div className="w-full max-w-[320px] mx-auto">
                <Skeleton className="h-[480px] rounded-2xl" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center lg:justify-start text-center lg:text-left">
            {featured ? (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-medium mb-4">
                  {statusLabel(featured.readingStatus)}
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-text mb-2 leading-tight">{featured.title}</h1>
                {featured.subtitle && (
                  <p className="text-lg text-text-secondary font-serif mb-4 italic">{featured.subtitle}</p>
                )}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-text-muted text-sm">By {featured.authorIds.join(', ')}</span>
                  <span className="w-px h-4 bg-border mx-2 hidden md:block" />
                  <span className="text-text-muted text-sm">{featured.format}</span>
                  {featured.pageCount && (
                    <>
                      <span className="w-px h-4 bg-border mx-2 hidden md:block" />
                      <span className="text-text-muted text-sm">{featured.pageCount} pages</span>
                    </>
                  )}
                </div>
                <p className="text-text-secondary text-sm md:text-base mb-6 max-w-md mx-auto lg:mx-0 leading-relaxed">
                  {featured.description ?? 'No description available.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6">
                  {featured.readingStatus === 'currently-reading' ? (
                    <>
                      <Button onClick={() => navigate(`/books/${featured.id}`)} className="flex-1">
                        <Play className="w-4 h-4 mr-2" /> Continue Reading
                      </Button>
                      <ProgressBar value={featured.percentageComplete ?? 0} color="accent" className="flex-1 h-3" />
                    </>
                  ) : (
                    <>
                      <Button onClick={() => navigate(`/books/${featured.id}`)} className="flex-1">
                        <BookOpen className="w-4 h-4 mr-2" /> View Details
                      </Button>
                      <Button variant="outline" onClick={() => navigate(`/books/${featured.id}`)} className="flex-1">
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start text-xs text-text-muted">
                  <span>{featured.genres.join(' • ') || 'General'}</span>
                  {featured.rating && <span>★ {featured.rating}</span>}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
                <h3 className="text-xl font-serif font-semibold text-text mb-2">Your library is empty</h3>
                <p className="text-text-secondary mb-6">Add your first book to get started.</p>
                <Button onClick={handleAddBook} className="w-auto">
                  <BookPlus className="w-4 h-4 mr-2" /> Add Your First Book
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Shelves */}
      <section className="mb-12">
        <h2 className="text-2xl font-serif font-bold text-text mb-6 text-balance">Your Shelves</h2>
        <div className="space-y-8">
          {[
            { title: 'Continue Reading', books: continueReading, icon: Clock, empty: "You're not reading anything right now." },
            { title: 'Recently Added', books: recentlyAdded, icon: ArrowRight, empty: "No books added yet." },
            { title: 'Your Next Reads', books: nextReads, icon: BookOpen, empty: "Add books to your TBR queue." },
            { title: 'Recently Finished', books: recentlyFinished, icon: BookOpen, empty: "No finished books yet." },
            { title: 'Your Favorites', books: favorites, icon: Heart, empty: "Mark books as favorites to see them here." },
            { title: 'Highest Rated', books: highestRated, icon: Star, empty: "Rate your finished books." },
            { title: "Books You Haven't Started", books: notStarted, icon: Clock, empty: "All caught up!" },
          ].map(({ title, books: shelfBooks, icon: Icon, empty }) => (
            <ShelfRow key={title} title={title} books={shelfBooks} icon={Icon} empty={empty} />
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction icon={BookPlus} label="Add Book" onClick={handleAddBook} />
        <QuickAction icon={Timer} label="Log Session" onClick={() => navigate('/reading')} />
        <QuickAction icon={Calendar} label="Calendar" onClick={() => navigate('/calendar')} />
        <QuickAction icon={BookOpen} label="Browse Library" onClick={() => navigate('/library')} />
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent, success, gold }: { label: string; value: React.ReactNode; icon: any; accent?: boolean; success?: boolean; gold?: boolean }) {
  const colorClass = accent ? 'text-accent' : success ? 'text-success' : gold ? 'text-gold' : 'text-text-secondary';
  return (
    <Card padded={false} className="p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} bg-${accent ? 'accent' : success ? 'success' : gold ? 'gold' : 'surface'}/10`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-serif font-bold text-text">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function ShelfRow({ title, books: shelfBooks, icon: Icon, empty }: { title: string; books: any[]; icon: any; empty: string }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-surface text-text-secondary">
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-serif font-semibold text-text">{title}</h3>
        </div>
        <button
          onClick={() => navigate('/library')}
          className="text-xs font-medium text-accent hover:underline"
        >
          View all <ChevronRight className="w-3 h-3 ml-1" />
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {shelfBooks.length > 0 ? (
          shelfBooks.map((b) => (
            <BookCard key={b.id} book={b} onClick={() => navigate(`/books/${b.id}`)} />
          ))
        ) : (
          <div className="flex items-center gap-3 min-w-[200px] px-4 py-6 rounded-2xl border border-dashed border-input bg-surface/50 text-center">
            <BookOpen className="w-6 h-6 text-text-muted" />
            <span className="text-text-sm text-text-muted">{empty}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function BookCard({ book, onClick }: { book: any; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-2 group w-24 md:w-28 shrink-0 cursor-pointer"
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface">
        <div className="w-full h-full bg-gradient-to-b from-transparent to-black/40"></div>
        <CoverImage coverImageId={book.coverImageId} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {book.isFavorite && (
          <div className="absolute top-2 right-2">
            <Heart className="w-4 h-4 fill-accent text-accent drop-shadow-lg" />
          </div>
        )}
        {book.percentageComplete && book.percentageComplete > 0 && (
          <div className="absolute bottom-2 left-2 right-2">
            <ProgressBar value={book.percentageComplete} color="gold" className="h-1.5" />
          </div>
        )}
      </div>
      <h4 className="text-sm font-semibold text-text line-clamp-1">{book.title}</h4>
      <p className="text-xs text-text-secondary line-clamp-1">{book.authorIds.join(', ') || 'Unknown Author'}</p>
    </button>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="flex flex-col items-center gap-2 py-3 text-xs"
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Button>
  );
}
