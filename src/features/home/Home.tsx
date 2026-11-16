import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/db';
import { CoverImage } from '@/components/ui/cover-image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { booksFinishedInRange, computeLibraryStats, computeStreak, getYearRange, statusLabel } from '@/utils/date';
import { useSafeLiveQuery } from '@/hooks/use-safe-live-query';
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
  Flame,
  Plus,
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const books = useSafeLiveQuery(() => db.books.toArray(), []) ?? [];
  const authors = useSafeLiveQuery(() => db.authors.toArray(), []) ?? [];
  const sessions = useSafeLiveQuery(() => db.readingSessions.toArray(), []) ?? [];

  const authorName = useMemo(() => {
    const map = new Map(authors.map((a) => [a.id, a.name]));
    return (ids: string[]) => ids.map((id) => map.get(id)).filter(Boolean).join(', ');
  }, [authors]);

  const [featuredId, setFeaturedId] = useState<string | null>(null);

  useEffect(() => {
    const current = books.find((b) => b.readingStatus === 'currently-reading');
    const finished = books.find((b) => b.readingStatus === 'finished');
    setFeaturedId(current?.id ?? finished?.id ?? books[0]?.id ?? null);
  }, [books]);

  const featured = books.find((b) => b.id === featuredId);
  const stats = computeLibraryStats(books);
  const streak = computeStreak(sessions);
  const { start, end } = getYearRange(new Date().getFullYear());
  const finishedThisYear = booksFinishedInRange(books, start, end).length;

  const continueReading = books.filter((b) => b.readingStatus === 'currently-reading').slice(0, 8);
  const recentlyAdded = [...books].sort((a, b) => (b.dateAdded ?? '').localeCompare(a.dateAdded ?? '')).slice(0, 8);
  const nextReads = books.filter((b) => b.readingStatus === 'want-to-read').slice(0, 8);
  const favorites = books.filter((b) => b.isFavorite).slice(0, 8);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const sections = [
    { title: 'Continue reading', books: continueReading, icon: Clock, empty: "You're not reading anything right now." },
    { title: 'Recently added', books: recentlyAdded, icon: BookOpen, empty: 'No books added yet.' },
    { title: 'Up next', books: nextReads, icon: ArrowRight, empty: 'Add books to your TBR queue.' },
    { title: 'Your favorites', books: favorites, icon: Heart, empty: 'Mark books as favorites to see them here.' },
  ];

  return (
    <div className="container py-8 mb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-text-muted mb-1">{greeting}</p>
          <h1 className="text-3xl font-serif font-bold text-text">Your reading room</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/timer')} className="flex items-center gap-2">
            <Timer className="w-4 h-4" /> Start timer
          </Button>
          <Button onClick={() => navigate('/books/add')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add book
          </Button>
        </div>
      </div>

      {/* Quick stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Books in library" value={stats.totalBooks} icon={BookOpen} tone="neutral" />
        <StatCard label="Currently reading" value={stats.currentlyReading} icon={Clock} tone="accent" />
        <StatCard label="Finished this year" value={finishedThisYear} icon={Star} tone="success" />
        <StatCard label="Day streak" value={streak.current} icon={Flame} tone="gold" />
      </div>

      {/* Hero */}
      <section className="mb-12 relative overflow-hidden rounded-3xl border border-input bg-surface shadow-hero p-6 md:p-10 animate-fade-in">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 140% at 85% 10%, rgb(var(--c-accent) / 0.22) 0%, transparent 55%), radial-gradient(90% 100% at 10% 100%, rgb(var(--c-gold) / 0.14) 0%, transparent 60%)',
          }}
        />
        <div className="relative grid lg:grid-cols-[300px_1fr] gap-8 md:gap-12 items-center">
          <div className="relative mx-auto w-full max-w-[190px] sm:max-w-[230px] lg:max-w-[280px]">
            {featured ? (
              <>
                <div className="absolute -inset-6 rounded-[2rem] bg-accent/20 blur-3xl" aria-hidden="true" />
                <div className="group relative">
                  <CoverImage
                    coverImageId={featured.coverImageId}
                    coverUrl={featured.coverUrl}
                    title={featured.title}
                    author={authorName(featured.authorIds)}
                    genre={featured.genres?.[0]}
                    alt={featured.title}
                    className="relative w-full shadow-hero ring-1 ring-white/10 transition-transform duration-500 group-hover:-translate-y-1"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/25 via-transparent to-transparent opacity-60"
                    aria-hidden="true"
                  />
                </div>
                <div className="mx-auto mt-4 h-4 w-4/5 rounded-[50%] bg-black/30 blur-lg" aria-hidden="true" />
              </>
            ) : (
              <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
            )}
          </div>

          <div className="flex flex-col justify-center text-center lg:text-left">
            {featured ? (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-xs font-medium mb-4 mx-auto lg:mx-0 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {statusLabel(featured.readingStatus)}
                </div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-text mb-2 leading-[1.1]">{featured.title}</h2>
                {featured.subtitle && <p className="text-lg text-text-secondary font-serif mb-3 italic">{featured.subtitle}</p>}
                <p className="text-sm text-text-muted mb-5">
                  by {authorName(featured.authorIds) || 'Unknown author'}
                  {featured.pageCount ? ` · ${featured.pageCount} pages` : ''}
                  {featured.format ? ` · ${featured.format}` : ''}
                </p>
                <p className="text-text-secondary text-sm md:text-base mb-6 max-w-xl mx-auto lg:mx-0 leading-relaxed line-clamp-3">
                  {featured.description ?? 'No description available.'}
                </p>

                {featured.readingStatus === 'currently-reading' && (
                  <div className="mb-5 max-w-sm mx-auto lg:mx-0 w-full">
                    <div className="flex justify-between text-xs text-text-muted mb-1.5">
                      <span>Progress</span>
                      <span>{featured.percentageComplete ?? 0}%</span>
                    </div>
                    <ProgressBar value={featured.percentageComplete ?? 0} color="accent" className="h-2" />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Button onClick={() => navigate(`/books/${featured.id}`)} className="flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    {featured.readingStatus === 'currently-reading' ? 'Continue reading' : 'Open book'}
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/library')} className="flex items-center justify-center gap-2">
                    Browse library <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <BookOpen className="w-14 h-14 mx-auto mb-4 text-text-muted opacity-50" />
                <h3 className="text-2xl font-serif font-semibold text-text mb-2">Your library is empty</h3>
                <p className="text-text-secondary mb-6">Add your first book to get started.</p>
                <Button onClick={() => navigate('/books/add')} className="w-auto">
                  <BookPlus className="w-4 h-4 mr-2" /> Add your first book
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Shelves */}
      <section className="space-y-10 mb-12">
        {sections.map((section) => (
          <ShelfRow
            key={section.title}
            title={section.title}
            books={section.books}
            icon={section.icon}
            empty={section.empty}
            authorName={authorName}
          />
        ))}
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAction icon={BookPlus} label="Add book" onClick={() => navigate('/books/add')} />
        <QuickAction icon={Timer} label="Reading timer" onClick={() => navigate('/timer')} />
        <QuickAction icon={Calendar} label="Calendar" onClick={() => navigate('/calendar')} />
        <QuickAction icon={BookOpen} label="Browse library" onClick={() => navigate('/library')} />
      </section>
    </div>
  );
}

const TONES = {
  neutral: 'bg-elevated text-text-secondary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
  gold: 'bg-gold/10 text-gold',
};

function StatCard({ label, value, icon: Icon, tone }: { label: string; value: number | string; icon: any; tone: keyof typeof TONES }) {
  return (
    <Card padded={false} className="p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${TONES[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] text-text-muted uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-serif font-bold text-text">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function ShelfRow({ title, books: shelfBooks, icon: Icon, empty, authorName }: { title: string; books: any[]; icon: any; empty: string; authorName: (ids: string[]) => string }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-surface border border-input text-text-secondary">
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-serif font-semibold text-text">{title}</h3>
        </div>
        <button onClick={() => navigate('/library')} className="flex items-center text-xs font-medium text-accent hover:underline">
          View all <ChevronRight className="w-3 h-3 ml-0.5" />
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {shelfBooks.length > 0 ? (
          shelfBooks.map((b) => (
            <BookCard
              key={b.id}
              book={b}
              author={authorName(b.authorIds)}
              onClick={() => navigate(`/books/${b.id}`)}
            />
          ))
        ) : (
          <div className="flex items-center gap-3 min-w-[240px] px-4 py-6 rounded-2xl border border-dashed border-input bg-surface/60">
            <BookOpen className="w-5 h-5 text-text-muted shrink-0" />
            <span className="text-xs text-text-muted">{empty}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function BookCard({ book, author, onClick }: { book: any; author: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col gap-2 group w-24 md:w-28 shrink-0 text-left">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-surface shadow-cover ring-1 ring-black/5">
        <CoverImage
          coverImageId={book.coverImageId}
          coverUrl={book.coverUrl}
          title={book.title}
          author={author}
          genre={book.genres?.[0]}
          alt={book.title}
          className="group-hover:scale-105 transition-transform duration-300"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-80" />
        {book.isFavorite && (
          <div className="absolute top-2 right-2">
            <Heart className="w-4 h-4 fill-accent text-accent drop-shadow-lg" />
          </div>
        )}
        {(book.percentageComplete ?? 0) > 0 && (book.percentageComplete ?? 0) < 100 && (
          <div className="absolute bottom-2 left-2 right-2">
            <ProgressBar value={book.percentageComplete} color="gold" className="h-1.5" />
          </div>
        )}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-text line-clamp-1">{book.title}</h4>
        <p className="text-xs text-text-secondary line-clamp-1">{author || 'Unknown author'}</p>
      </div>
    </button>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-input bg-card p-4 text-sm font-medium text-text-secondary transition-colors hover:border-accent/40 hover:text-text"
    >
      <span className="w-9 h-9 rounded-xl bg-elevated flex items-center justify-center text-text">
        <Icon className="w-4 h-4" />
      </span>
      {label}
    </button>
  );
}
