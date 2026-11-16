import { useState } from 'react';
import { db, newId, nowISO } from '@/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { statusLabel, statusColor, formatDate } from '@/utils/date';
import { useNavigate } from 'react-router-dom';
import { Play, Book, Clock, Flag, RefreshCw, Star } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress-bar';
import { computePercentage } from '@/utils/date';
import { useSafeLiveQuery } from '@/hooks/use-safe-live-query';
import { useAuthorNames } from '@/hooks/use-author-names';

const STATUSES = [
  { id: 'want-to-read', label: 'Want to Read', icon: 'clock' },
  { id: 'currently-reading', label: 'Currently Reading', icon: 'play' },
  { id: 'finished', label: 'Finished', icon: 'book' },
  { id: 'on-hold', label: 'On Hold', icon: 'pause' },
  { id: 'did-not-finish', label: 'Did Not Finish', icon: 'x' },
] as const;

export default function ReadingTracker() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [view, setView] = useState<'active' | 'all'>('active');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const books = useSafeLiveQuery(() => db.books.toArray(), []) ?? [];
  const sessions = useSafeLiveQuery(() => db.readingSessions.toArray(), []) ?? [];
  const { nameFor } = useAuthorNames();

  const activeBooks = books.filter((b) => b.readingStatus === 'currently-reading');
  const filteredBooks = (view === 'active' ? activeBooks : books).filter(
    (b) => statusFilter === 'all' || b.readingStatus === statusFilter
  );

  const handleStatusChange = async (bookId: string, newStatus: string) => {
    const b = await db.books.get(bookId);
    if (!b) return;
    const updates: any = { readingStatus: newStatus, updatedAt: nowISO() };
    if (newStatus === 'currently-reading' && !b.startDate) updates.startDate = new Date().toISOString().slice(0, 10);
    if (newStatus === 'finished') {
      updates.finishDate = new Date().toISOString().slice(0, 10);
      if (b.pageCount) updates.percentageComplete = 100;
    }
    await db.books.update(bookId, updates);
    toast.success(`Status updated to ${statusLabel(newStatus)}`);
  };

  const handleStartReading = async (bookId: string) => {
    await handleStatusChange(bookId, 'currently-reading');
  };

  const handleFinish = async (bookId: string) => {
    await handleStatusChange(bookId, 'finished');
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-text">Reading Tracker</h1>
          <p className="text-text-secondary">Manage what you're reading and move books between statuses.</p>
        </div>
        <Button onClick={() => setView(view === 'active' ? 'all' : 'active')}>
          {view === 'active' ? 'Show All' : 'Show Active Only'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => {
            setStatusFilter('all');
            setView('all');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
            statusFilter === 'all'
              ? 'bg-accent text-white border-accent'
              : 'bg-surface text-text-secondary border-input hover:bg-elevated hover:text-text'
          }`}
        >
          All Books
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusFilter === 'all' ? 'bg-black/20' : 'bg-elevated'}`}>
            {books.length}
          </span>
        </button>
        {STATUSES.map((s) => {
          const Icon = s.icon === 'play' ? Play : s.icon === 'book' ? Book : s.icon === 'clock' ? Clock : s.icon === 'pause' ? Flag : RefreshCw;
          const count = books.filter((b) => b.readingStatus === s.id).length;
          const active = statusFilter === s.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                setStatusFilter(s.id);
                setView('all');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                active
                  ? 'bg-accent text-white border-accent'
                  : 'bg-surface text-text-secondary border-input hover:bg-elevated hover:text-text'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{s.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-black/20' : 'bg-elevated'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
            <Book className="w-16 h-16 mb-4 text-text-muted opacity-50" />
            <h3 className="text-xl font-serif font-semibold text-text">No books in this view</h3>
            <p className="text-text-secondary mb-6">Add books to your library to start tracking.</p>
            <Button onClick={() => navigate('/library')}>Browse Library</Button>
          </div>
        ) : (
          filteredBooks.map((b) => (
            <BookTrackerCard key={b.id} book={b} author={nameFor(b.authorIds)} onStatusChange={handleStatusChange} onStart={handleStartReading} onFinish={handleFinish} sessions={sessions.filter((s) => s.bookId === b.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function BookTrackerCard({ book, author, onStatusChange, onStart, onFinish, sessions }: { book: any; author: string; onStatusChange: (id: string, status: string) => void; onStart: (id: string) => void; onFinish: (id: string) => void; sessions: any[] }) {
  const pct = computePercentage(book.currentPage, book.pageCount);
  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((s, x) => s + (x.durationMinutes ?? 0), 0);
  return (
    <Card className="p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-20">
        <Book className="w-12 h-12" />
      </div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="text-lg font-serif font-semibold text-text">{book.title}</h4>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-gold/50" />
          <span className="text-xs text-text-muted">{book.rating ?? '—'}</span>
        </div>
      </div>
      <p className="text-xs text-text-secondary mb-4 line-clamp-2">{author}</p>

      <div className="space-y-3 mb-4">
        <label className="text-xs font-medium text-text-secondary">Status</label>
        <div className="flex gap-1">
          {STATUSES.map((s) => (
            <button
              key={s.id}
              onClick={() => onStatusChange(book.id, s.id)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                book.readingStatus === s.id ? 'bg-accent text-text' : 'bg-surface text-text-secondary border border-input'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-text-secondary">Progress</span>
          <span className="text-xs font-mono text-text">{pct}%</span>
        </div>
        <ProgressBar value={pct} color="accent" className="h-2" />
      </div>

      <div className="mt-4 pt-4 border-t border-input">
        <p className="text-xs text-text-muted mb-2">{totalSessions} session{totalSessions !== 1 ? 's' : ''} • {totalMinutes} min read</p>
        <div className="flex gap-2">
          {book.readingStatus !== 'currently-reading' && (
            <Button size="sm" onClick={() => onStart(book.id)} className="flex-1">
              <Play className="w-3 h-3 mr-1" /> Start
            </Button>
          )}
          {book.readingStatus === 'currently-reading' && (
            <Button size="sm" variant="outline" onClick={() => onFinish(book.id)} className="flex-1">
              Finish
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => {}} className="w-10">
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
