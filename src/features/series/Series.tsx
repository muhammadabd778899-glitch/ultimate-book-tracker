import { useState } from 'react';
import { db, newId, nowISO, type Author, type Book as BookType } from '@/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { CoverImage } from '@/components/ui/cover-image';
import { Book, Play, ArrowRight, Trash2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { computePercentage } from '@/utils/date';
import { useSafeLiveQuery } from '@/hooks/use-safe-live-query';

export default function Series() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const series = useSafeLiveQuery(() => db.series.toArray(), []) ?? [];
  const books = useSafeLiveQuery(() => db.books.toArray(), []) ?? [];
  const authors = useSafeLiveQuery(() => db.authors.toArray(), []) ?? [];

  const [form, setForm] = useState({ name: '', author: '', description: '' });
  const [open, setOpen] = useState(false);

  const handleAddSeries = async () => {
    if (!form.name.trim()) return toast.error('Series name is required.');
    const authorName = form.author.trim();
    let authorId: string | null = null;
    if (authorName) {
      let a = authors.find((x) => x.name.toLowerCase() === authorName.toLowerCase());
      if (!a) {
        const created: Author = { id: newId(), name: authorName, biography: null, notes: null, createdAt: nowISO(), updatedAt: nowISO() };
        await db.authors.add(created);
        a = created;
      }
      authorId = a.id;
    }
    await db.series.add({
      id: newId(),
      name: form.name.trim(),
      author: authorName || null,
      description: form.description.trim() || null,
      orderedBookIds: [],
      createdAt: nowISO(),
      updatedAt: nowISO(),
    } as any);
    setForm({ name: '', author: '', description: '' });
    setOpen(false);
    toast.success('Series created');
  };

  const handleAddBookToSeries = async (seriesId: string, bookId: string) => {
    const s = await db.series.get(seriesId);
    if (!s) return;
    const ordered = s.orderedBookIds.includes(bookId) ? s.orderedBookIds : [...s.orderedBookIds, bookId];
    await db.series.update(seriesId, { orderedBookIds: ordered, updatedAt: nowISO() } as any);
    await db.books.update(bookId, { seriesId, seriesPosition: ordered.indexOf(bookId) + 1, updatedAt: nowISO() } as any);
    toast.success('Book added to series');
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-text">Series Tracker</h1>
          <p className="text-text-secondary">Manage your book series and reading order.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Series
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
            <Book className="w-16 h-16 mb-4 text-text-muted opacity-50" />
            <h3 className="text-xl font-serif font-semibold text-text">No series yet</h3>
            <p className="text-text-secondary mb-6">Create your first series to track multi-volume books.</p>
            <Button onClick={() => setOpen(true)}>Create Series</Button>
          </div>
        ) : (
          series.map((s) => {
            const seriesBooks = s.orderedBookIds
              .map((id) => books.find((b) => b.id === id))
              .filter((b): b is BookType => Boolean(b));
            const readCount = seriesBooks.filter((b) => b.readingStatus === 'finished').length;
            const pct = seriesBooks.length ? Math.round((readCount / seriesBooks.length) * 100) : 0;
            return (
              <SeriesCard key={s.id} series={s} books={seriesBooks} readCount={readCount} pct={pct} onAddBook={() => handleAddBookToSeries(s.id, '')} navigate={navigate} />
            );
          })
        )}
      </div>

      <DialogAddSeries open={open} onOpenChange={setOpen} form={form} setForm={setForm} onAdd={handleAddSeries} />
    </div>
  );
}

function SeriesCard({ series, books: seriesBooks, readCount, pct, onAddBook, navigate }: { series: any; books: any[]; readCount: number; pct: number; onAddBook: () => void; navigate: any }) {
  const firstBook = seriesBooks[0];
  return (
    <Card className="p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-20">
        <Book className="w-12 h-12" />
      </div>
      <div className="mb-3">
        <h4 className="text-lg font-serif font-semibold text-text">{series.name}</h4>
        <p className="text-xs text-text-secondary">{series.author || 'Unknown Author'}</p>
      </div>
      <div className="flex gap-2 mb-3">
        {seriesBooks.slice(0, 5).map((b) => (
          <div key={b.id} className="w-16 h-24 rounded-lg overflow-hidden bg-surface border border-input flex items-center justify-center">
            <CoverImage coverImageId={b.coverImageId} coverUrl={b.coverUrl} title={b.title} genre={b.genres?.[0]} alt={b.title} className="h-full w-full" />
          </div>
        ))}
        {seriesBooks.length > 5 && (
          <div className="w-16 h-24 rounded-lg bg-surface/50 flex items-center justify-center text-[10px] text-text-muted">
            +{seriesBooks.length - 5}
          </div>
        )}
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-text-muted">Progress</span>
          <span className="text-text">{pct}%</span>
        </div>
        <ProgressBarInline value={pct} color="accent" />
        <p className="text-xs text-text-muted">{readCount} of {seriesBooks.length} volumes read</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate(`/series/${series.id}`)} className="flex-1">
          View Series
        </Button>
        <Button size="sm" onClick={onAddBook} className="flex-1">
          <ArrowRight className="w-3 h-3 mr-1" /> Add Book
        </Button>
      </div>
    </Card>
  );
}

function ProgressBarInline({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-2 rounded-full bg-elevated overflow-hidden">
      <div className="h-full bg-accent transition-all duration-500" style={{ width: `${value}%` }} />
    </div>
  );
}

function DialogAddSeries({ open, onOpenChange, form, setForm, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; form: any; setForm: any; onAdd: () => void }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-input bg-card shadow-cover animate-scale-in">
        <div className="p-6">
          <h2 className="text-lg font-serif font-semibold text-text mb-4">Create Series</h2>
          <form onSubmit={(e) => { e.preventDefault(); onAdd(); onOpenChange(false); }} className="space-y-3">
            <Input label="Series Name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            <div className="flex gap-2 pt-2">
              <button onClick={() => onOpenChange(false)} className="flex-1 h-10 rounded-xl border border-input bg-surface text-text-secondary hover:bg-elevated">
                Cancel
              </button>
              <button type="submit" className="flex-1 h-10 rounded-xl bg-accent text-text">Create Series</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
