import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, newId, nowISO } from '@/db';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { CoverImage } from '@/components/ui/cover-image';
import { Play, Trash2, Shuffle, Plus, Star, RefreshCw } from 'lucide-react';
import { statusLabel } from '@/utils/date';

export default function TBR() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const books = useLiveQuery(() => db.books.where('readingStatus').equals('want-to-read').toArray(), []) ?? [];
  const allBooks = useLiveQuery(() => db.books.toArray(), []) ?? [];

  const [priorityFilter, setPriorityFilter] = useState('all');

  const handleStart = async (bookId: string) => {
    await db.books.update(bookId, { readingStatus: 'currently-reading', startDate: new Date().toISOString().slice(0, 10), updatedAt: nowISO() } as any);
    toast.success('Started reading!');
    // no-op: data reactively updates
  };

  const handleRemove = async (bookId: string) => {
    await db.books.update(bookId, { readingStatus: 'want-to-read', isWishlistItem: false, updatedAt: nowISO() } as any);
    toast.success('Removed from TBR');
  };

  const handleRandom = () => {
    const eligible = allBooks.filter((b) => b.readingStatus === 'want-to-read');
    if (eligible.length === 0) return toast.info('No books in your TBR queue.');
    const pick = eligible[Math.floor(Math.random() * eligible.length)];
    navigate(`/books/${pick.id}`);
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-text">TBR Queue</h1>
          <p className="text-text-secondary">Books you plan to read next.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRandom} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Random Next Read
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        {['all', 'high', 'medium', 'low'].map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              priorityFilter === p ? 'bg-accent text-text border border-accent' : 'bg-surface text-text-secondary border border-input hover:bg-elevated'
            }`}
          >
            {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)} Priority
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
            <Book className="w-16 h-16 mb-4 text-text-muted opacity-50" />
            <h3 className="text-xl font-serif font-semibold text-text">Your TBR is empty</h3>
            <p className="text-text-secondary mb-6">Add books and set them to "Want to Read" to see them here.</p>
            <Button onClick={() => navigate('/library')}>Browse Library</Button>
          </div>
        ) : (
          books.map((b) => (
            <TBRCard key={b.id} book={b} onStart={handleStart} onRemove={handleRemove} />
          ))
        )}
      </div>
    </div>
  );
}

function TBRCard({ book, onStart, onRemove }: { book: any; onStart: (id: string) => void; onRemove: (id: string) => void }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  return (
    <Card className="p-5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-20">
        <Star className="w-10 h-10" />
      </div>
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-surface border border-input mb-4">
        <CoverImage coverImageId={book.coverImageId} alt={book.title} className="w-full h-full object-cover" />
      </div>
      <h4 className="text-lg font-serif font-semibold text-text mb-1">{book.title}</h4>
      <p className="text-xs text-text-secondary mb-4">{book.authorIds.join(', ') || 'Unknown Author'}</p>
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">TBR</span>
        <button onClick={() => onStart(book.id)} className="text-xs font-medium text-accent hover:underline">
          Start Reading <Play className="w-3 h-3 ml-1" />
        </button>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(`/books/${book.id}`)} className="flex-1">
          Details
        </Button>
        <Button variant="danger" size="sm" onClick={() => onRemove(book.id)}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );
}
