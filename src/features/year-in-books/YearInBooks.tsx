import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { computeLibraryStats, booksFinishedInRange, pagesReadInRange, readingHoursInRange, getYearRange } from '@/utils/date';
import { CoverImage } from '@/components/ui/cover-image';
import { Trophy, Star, Calendar, Award } from 'lucide-react';

export default function YearInBooks() {
  const books = useLiveQuery(() => db.books.toArray(), []) ?? [];
  const sessions = useLiveQuery(() => db.readingSessions.toArray(), []) ?? [];
  const [year, setYear] = useState(new Date().getFullYear());

  const { start, end } = getYearRange(year);
  const finished = booksFinishedInRange(books, start, end);
  const pages = pagesReadInRange(sessions, start, end);
  const hours = readingHoursInRange(sessions, start, end);
  const stats = computeLibraryStats(finished);

  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  const topBook = finished.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))[0];
  const longest = finished.sort((a, b) => (b.pageCount ?? 0) - (a.pageCount ?? 0))[0];

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-text">Year in Books</h1>
          <p className="text-text-secondary">Your reading year, recapped.</p>
        </div>
        <div className="flex gap-2">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-3 py-1 rounded-xl text-sm font-medium transition-all ${
                y === year ? 'bg-accent text-text border border-accent' : 'bg-surface text-text-secondary border border-input hover:bg-elevated'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Hero stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <YearStat label="Books Finished" value={finished.length} icon={Book} />
        <YearStat label="Pages Read" value={pages} icon={Book} />
        <YearStat label="Reading Hours" value={hours} icon={Calendar} />
        <YearStat label="Average Rating" value={stats.averageRating || '—'} icon={Star} />
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-2xl font-serif font-bold text-text mb-6">Book of the Year</h2>
          <div className="flex gap-6">
            <div className="w-40 h-60 rounded-xl overflow-hidden bg-surface border border-input shrink-0">
              <CoverImage coverImageId={topBook?.coverImageId ?? null} alt={topBook?.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-text">{topBook?.title || 'No books finished yet'}</h3>
              <p className="text-text-secondary">{topBook?.authorIds.join(', ') || ''}</p>
              <p className="mt-3 text-text-secondary leading-relaxed">{topBook?.description || 'Finish some books to unlock your book of the year.'}</p>
              <div className="mt-4 flex items-center gap-1">
                <Trophy className="w-5 h-5 text-gold" />
                <span className="font-serif text-lg">Your highest-rated book of {year}</span>
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-serif font-semibold text-text mb-4">Longest Book</h3>
          <p className="text-text-secondary mb-3">{longest?.title || '—'}</p>
          <p className="text-sm font-mono text-text">{longest?.pageCount ? `${longest.pageCount} pages` : '—'}</p>
        </Card>
      </div>

      {/* Milestones */}
      <div className="mb-10">
        <h2 className="text-xl font-serif font-bold text-text mb-6">Reading Milestones</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'First Book', unlocked: finished.length > 0 },
            { title: 'Goal Getter', unlocked: finished.length >= 12 },
            { title: 'Page Turner', unlocked: pages >= 1000 },
            { title: 'Dedicated Reader', unlocked: hours >= 50 },
            { title: 'Genre Explorer', unlocked: new Set(finished.flatMap((b) => b.genres)).size >= 3 },
            { title: 'Consistent', unlocked: finished.length >= 6 },
          ].map((m) => (
            <Card key={m.title} className="p-5 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.unlocked ? 'bg-success text-text' : 'bg-surface/50 text-text-muted'}`}>
                {m.unlocked ? <Award className="w-4 h-4" /> : <span className="text-xs">—</span>}
              </div>
              <span className={`text-sm ${m.unlocked ? 'text-text' : 'text-text-muted'}`}>{m.title}</span>
              {m.unlocked && <span className="ml-auto text-xs text-success font-medium">Unlocked</span>}
            </Card>
          ))}
        </div>
      </div>

      <div className="text-center py-10">
        <Button onClick={() => { window.print(); }}>Print Recap</Button>
      </div>
    </div>
  );
}

function YearStat({ label, value, icon: Icon }: { label: string; value: number | string; icon: any }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-3xl font-serif font-bold text-text">{value}</p>
    </Card>
  );
}
