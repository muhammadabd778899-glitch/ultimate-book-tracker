import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, newId, nowISO } from '@/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { CoverImage } from '@/components/ui/cover-image';
import { FileText, Quote, Star, Heart, Calendar, ShieldAlert } from 'lucide-react';
import { formatDate } from '@/utils/date';

export default function Journal() {
  const { toast } = useToast();

  const reviews = useLiveQuery(() => db.reviews.toArray(), []) ?? [];
  const quotes = useLiveQuery(() => db.quotes.toArray(), []) ?? [];
  const books = useLiveQuery(() => db.books.toArray(), []) ?? [];
  const notes = useLiveQuery(() => db.notes.toArray(), []) ?? [];

  const [entry, setEntry] = useState({ title: '', content: '', mood: '', rating: '' });
  const [open, setOpen] = useState(false);

  const handleAddEntry = async () => {
    if (!entry.content.trim()) return toast.error('Please write something first.');
    await db.notes.add({
      id: newId(),
      bookId: null,
      title: entry.title.trim() || null,
      content: entry.content.trim(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    } as any);
    setEntry({ title: '', content: '', mood: '', rating: '' });
    setOpen(false);
    toast.success('Journal entry saved');
  };

  const bookById = (id: string) => books.find((b) => b.id === id);

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-text">Reading Journal</h1>
          <p className="text-text-secondary">Your reflections, reviews, and quotes in one place.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
          <FileText className="w-4 h-4" /> New Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-serif font-semibold text-text mb-4">This Month</h3>
              <p className="text-2xl font-serif font-bold text-text">{reviews.filter((r) => r.createdAt.slice(0, 7) === new Date().toISOString().slice(0, 7)).length}</p>
              <p className="text-xs text-text-muted mt-2">reviews written</p>
            </div>
          </Card>
          <Card className="mt-4">
            <div className="p-6">
              <h3 className="text-lg font-serif font-semibold text-text mb-4">Quotes Saved</h3>
              <p className="text-2xl font-serif font-bold text-text">{quotes.length}</p>
              <p className="text-xs text-text-muted mt-2">across your library</p>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-semibold text-text">Recent Reviews</h2>
            </div>
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-10 text-text-muted">No reviews yet.</div>
              ) : (
                reviews.slice(0, 6).map((r) => {
                  const b = bookById(r.bookId);
                  return (
                    <div key={r.id} className="border border-input rounded-xl p-4 bg-surface flex gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                        <CoverImage coverImageId={b?.coverImageId ?? null} alt={b?.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text">{b ? b.title : 'Unknown Book'}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={`text-[12px] ${star <= (r.rating || 0) ? 'text-gold' : 'text-text-muted'}`}>
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-text-secondary mt-2 line-clamp-2">{r.reviewText || ''}</p>
                        <p className="text-xs text-text-muted mt-2">{formatDate(r.createdAt)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-serif font-semibold text-text">Favorite Quotes</h2>
            </div>
            <div className="space-y-4">
              {quotes.length === 0 ? (
                <div className="text-center py-10 text-text-muted">No quotes saved yet.</div>
              ) : (
                quotes.slice(0, 6).map((q) => {
                  const b = bookById(q.bookId);
                  return (
                    <div key={q.id} className="border-l-2 border-accent bg-surface/50 rounded-r-xl p-4">
                      <p className="font-serif italic text-text">“{q.quoteText}”</p>
                      <p className="text-xs text-text-secondary mt-2">{b ? `— ${b.title}` : ''} {q.pageNumber ? `• p.${q.pageNumber}` : ''}</p>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      <DialogJournal open={open} onOpenChange={setOpen} entry={entry} setEntry={setEntry} onAdd={handleAddEntry} />
    </div>
  );
}

function DialogJournal({ open, onOpenChange, entry, setEntry, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; entry: any; setEntry: any; onAdd: () => void }) {
  const MOODS = ['Reflective', 'Excited', 'Melancholy', 'Inspired', 'Thoughtful', 'Angry', 'Peaceful'];
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl border border-input bg-card shadow-cover animate-scale-in">
        <div className="p-6">
          <h2 className="text-lg font-serif font-semibold text-text mb-4">New Journal Entry</h2>
          <form onSubmit={(e) => { e.preventDefault(); onAdd(); onOpenChange(false); }} className="space-y-3">
            <Input label="Title" value={entry.title} onChange={(e) => setEntry({ ...entry, title: e.target.value })} />
            <div className="flex gap-2">
              <select value={entry.mood} onChange={(e) => setEntry({ ...entry, mood: e.target.value })} className="w-1/3 h-10 rounded-xl border border-input bg-surface px-3 py-2 text-text focus:outline-none focus:ring-1 focus:ring-accent">
                <option value="">Mood</option>
                {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={entry.rating} onChange={(e) => setEntry({ ...entry, rating: e.target.value })} className="w-1/3 h-10 rounded-xl border border-input bg-surface px-3 py-2 text-text focus:outline-none focus:ring-1 focus:ring-accent">
                <option value="">Rating</option>
                {[1,2,3,4,5].map((r) => <option key={r} value={String(r)}>{r}</option>)}
              </select>
            </div>
            <Textarea label="Reflection *" required value={entry.content} onChange={(e) => setEntry({ ...entry, content: e.target.value })} rows={6} />
            <div className="flex gap-2 pt-2">
              <button onClick={() => onOpenChange(false)} className="flex-1 h-10 rounded-xl border border-input bg-surface text-text-secondary hover:bg-elevated">
                Cancel
              </button>
              <button type="submit" className="flex-1 h-10 rounded-xl bg-accent text-text">Save Entry</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
