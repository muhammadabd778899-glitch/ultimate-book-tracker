import { useState } from 'react';
import { db } from '@/db';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CoverImage } from '@/components/ui/cover-image';
import { Book, ChevronLeft, Plus, ArrowRight, Trash2 } from 'lucide-react';
import { statusLabel } from '@/utils/date';
import { useSafeLiveQuery } from '@/hooks/use-safe-live-query';

export default function ShelfDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const shelf = useSafeLiveQuery(() => db.shelves.get(id ?? ''), [id ?? '']) as any;
  const books = useSafeLiveQuery(() => db.books.toArray(), []) ?? [];

  if (!shelf) return <div className="container py-20 text-center">Loading shelf…</div>;

  const shelfBooks = shelf.bookIds.map((bid: string) => books.find((b) => b.id === bid)).filter((b: any) => Boolean(b));

  const handleRemove = async (bookId: string) => {
    await db.shelves.update(id ?? '', { bookIds: shelf.bookIds.filter((b: string) => b !== bookId), updatedAt: new Date().toISOString() } as any);
  };

  return (
    <div className="container py-6">
      <nav className="mb-6 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate('/shelves')} className="flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Shelves
        </Button>
      </nav>

      <div className="mb-6">
        <div style={{ borderLeft: `4px solid ${shelf.color || '#E65A45'}` }} className="pl-4 py-3 rounded-r-xl bg-surface border border-input">
          <h1 className="text-3xl font-serif font-bold text-text">{shelf.name}</h1>
          <p className="text-text-secondary">{shelf.description || 'No description'}</p>
          <p className="text-xs text-text-muted mt-2">{shelf.bookIds.length} book{shelf.bookIds.length !== 1 ? 's' : ''} • {shelf.coverStyle === 'spine' ? 'Spine style' : 'Cover style'}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Button onClick={() => {}} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Books
        </Button>
        <Button variant="outline" onClick={() => {}}>Manage</Button>
      </div>

      <div className={shelf.coverStyle === 'spine' ? 'flex gap-2 overflow-x-auto pb-8' : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'}>
        {shelfBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Book className="w-16 h-16 mb-4 text-text-muted opacity-50" />
            <h3 className="text-xl font-serif font-semibold text-text">This shelf is empty</h3>
            <p className="text-text-secondary mb-6">Add books to this collection.</p>
            <Button onClick={() => {}}>Add Books</Button>
          </div>
        ) : (
          shelfBooks.map((b: any) => (
            <ShelfBookCard key={b.id} book={b} onRemove={handleRemove} spine={shelf.coverStyle === 'spine'} />
          ))
        )}
      </div>
    </div>
  );
}

function ShelfBookCard({ book, onRemove, spine }: { book: any; onRemove: (id: string) => void; spine: boolean }) {
  return (
    <div className="relative group cursor-pointer">
      {spine ? (
        <div className="w-12 h-48 rounded-sm overflow-hidden bg-surface border border-input flex items-end justify-center p-1 group-hover:scale-105 transition-transform">
          <div className="w-full h-1 bg-accent rounded-t-sm" />
        </div>
      ) : (
        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-surface border border-input group-hover:border-accent/50 transition-colors">
          <div className="w-full h-full bg-gradient-to-b from-transparent to-black/40"></div>
          <CoverImage coverImageId={book.coverImageId} coverUrl={book.coverUrl} title={book.title} genre={book.genres?.[0]} alt={book.title} className="h-full w-full" />
        </div>
      )}
      <h4 className="mt-2 text-sm font-semibold text-text line-clamp-1 text-center">{book.title}</h4>
      <button onClick={(e) => { e.stopPropagation(); onRemove(book.id); }} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-black/60 rounded">
        <Trash2 className="w-3 h-3 text-text" />
      </button>
    </div>
  );
}
