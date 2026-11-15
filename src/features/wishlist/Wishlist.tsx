import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, newId, nowISO } from '@/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { CoverImage } from '@/components/ui/cover-image';
import { Book, DollarSign, Star, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRIORITIES = ['high', 'medium', 'low'] as const;
const STATUSES = ['wishlisted', 'purchased', 'cancelled'] as const;

export default function Wishlist() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const items = useLiveQuery(() => db.wishlist.toArray(), []) ?? [];
  const books = useLiveQuery(() => db.books.toArray(), []) ?? [];

  const [item, setItem] = useState({
    title: '',
    author: '',
    format: 'Paperback',
    estimatedPrice: '',
    currency: 'USD',
    priority: 'medium' as const,
    plannedPurchaseDate: '',
    notes: '',
    status: 'wishlisted' as const,
  });
  const [open, setOpen] = useState(false);

  const totalEstimated = items.reduce((s, i) => s + (i.estimatedPrice || 0), 0);

  const handleAdd = async () => {
    if (!item.title.trim()) return toast.error('Title is required.');
    await db.wishlist.add({
      id: newId(),
      bookId: null,
      title: item.title.trim(),
      author: item.author.trim() || null,
      coverImageId: null,
      format: item.format,
      estimatedPrice: item.estimatedPrice ? Number(item.estimatedPrice) : null,
      currency: item.currency,
      priority: item.priority,
      plannedPurchaseDate: item.plannedPurchaseDate || null,
      notes: item.notes.trim() || null,
      status: item.status,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    } as any);
    setItem({ title: '', author: '', format: 'Paperback', estimatedPrice: '', currency: 'USD', priority: 'medium', plannedPurchaseDate: '', notes: '', status: 'wishlisted' });
    setOpen(false);
    toast.success('Added to wishlist');
  };

  const handleStatus = async (id: string, status: string) => {
    await db.wishlist.update(id, { status: status as any, updatedAt: nowISO() } as any);
    if (status === 'purchased') {
      toast.success('Marked as purchased. Add it to your library to start tracking.');
    } else {
      toast.success('Wishlist item updated');
    }
  };

  const handlePurchaseAndAdd = async (id: string) => {
    const w = await db.wishlist.get(id);
    if (!w) return;
    // Create a book record
    await db.books.add({
      id: newId(),
      title: w.title,
      subtitle: null,
      authorIds: w.author ? [await ensureAuthor(w.author)] : [],
      isbn: null,
      description: null,
      publisher: null,
      publicationDate: null,
      pageCount: null,
      language: 'English',
      genres: [],
      format: w.format || 'Paperback',
      ownershipStatus: 'owned',
      readingStatus: 'want-to-read',
      coverImageId: w.coverImageId || null,
      seriesId: null,
      seriesPosition: null,
      dateAdded: new Date().toISOString().slice(0, 10),
      startDate: null,
      finishDate: null,
      currentPage: null,
      percentageComplete: null,
      rating: null,
      detailedScore: null,
      isFavorite: false,
      isOwned: true,
      isWishlistItem: true,
      personalNotes: w.notes || null,
      readingUnit: 'pages',
      currentPosition: null,
      totalPosition: null,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    } as any);
    await db.wishlist.update(id, { status: 'purchased', updatedAt: nowISO() } as any);
    toast.success('Added to your library as owned');
  };

  const handleRemove = async (id: string) => {
    await db.wishlist.delete(id);
    toast.success('Removed from wishlist');
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-text">Wishlist</h1>
          <p className="text-text-secondary">Books you'd like to buy.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      <div className="mb-6 flex gap-4 items-end">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gold" />
          <span className="text-2xl font-serif font-bold text-text">${totalEstimated.toFixed(2)}</span>
          <span className="text-sm text-text-muted">estimated total</span>
        </div>
        <div className="h-8 w-px bg-border mx-2" />
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wider">High Priority</p>
          <p className="text-xl font-serif font-bold text-text">{items.filter((i) => i.priority === 'high' && i.status === 'wishlisted').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
            <Book className="w-16 h-16 mb-4 text-text-muted opacity-50" />
            <h3 className="text-xl font-serif font-semibold text-text">Your wishlist is empty</h3>
            <p className="text-text-secondary mb-6">Add books you'd like to purchase.</p>
            <Button onClick={() => setOpen(true)}>Add Item</Button>
          </div>
        ) : (
          items.map((i) => (
            <WishlistCard key={i.id} item={i} onStatus={handleStatus} onPurchaseAndAdd={handlePurchaseAndAdd} onRemove={handleRemove} />
          ))
        )}
      </div>

      <DialogAddItem open={open} onOpenChange={setOpen} item={item} setItem={setItem} onAdd={handleAdd} />
    </div>
  );

  function ensureAuthor(name: string): Promise<string> {
    return db.authors.add({ id: newId(), name, biography: null, notes: null, createdAt: nowISO(), updatedAt: nowISO() } as any);
  }
}

function WishlistCard({ item, onStatus, onPurchaseAndAdd, onRemove }: { item: any; onStatus: (id: string, status: string) => void; onPurchaseAndAdd: (id: string) => void; onRemove: (id: string) => void }) {
  const navigate = useNavigate();
  return (
    <Card className="p-5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-20">
        <Book className="w-10 h-10" />
      </div>
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-surface border border-input mb-4">
        <CoverImage coverImageId={item.coverImageId} alt={item.title} className="w-full h-full object-cover" />
      </div>
      <h4 className="text-lg font-serif font-semibold text-text mb-1">{item.title}</h4>
      <p className="text-xs text-text-secondary mb-3">{item.author || 'Unknown Author'}</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <span className="text-xs bg-surface/50 border border-input rounded p-1 text-text-secondary">
          {item.priority.toUpperCase()} priority
        </span>
        <span className="text-xs font-mono text-text">
          {item.estimatedPrice ? `$${item.estimatedPrice.toFixed(2)} ${item.currency}` : '—'}
        </span>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate('/library')} className="flex-1">
          Library
        </Button>
        {item.status === 'wishlisted' ? (
          <Button size="sm" onClick={() => onPurchaseAndAdd(item.id)} className="flex-1 bg-success text-text hover:bg-success/90">
            <ArrowRight className="w-3 h-3 mr-1" /> Buy & Add
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => onStatus(item.id, 'wishlisted')} className="flex-1">
            Wishlist
          </Button>
        )}
      </div>
      <div className="mt-3 flex gap-1">
        <button onClick={() => onStatus(item.id, 'purchased')} className="px-2 py-1 text-[10px] rounded bg-success/10 text-success border border-success/20 hover:bg-success/20">
          Purchased
        </button>
        <button onClick={() => onRemove(item.id)} className="text-text-muted hover:text-danger">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </Card>
  );
}

function DialogAddItem({ open, onOpenChange, item, setItem, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; item: any; setItem: any; onAdd: () => void }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-input bg-card shadow-cover animate-scale-in">
        <div className="p-6">
          <h2 className="text-lg font-serif font-semibold text-text mb-4">Add to Wishlist</h2>
          <form onSubmit={(e) => { e.preventDefault(); onAdd(); onOpenChange(false); }} className="space-y-3">
            <Input label="Title *" required value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} />
            <Input label="Author" value={item.author} onChange={(e) => setItem({ ...item, author: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select value={item.format} onChange={(e) => setItem({ ...item, format: e.target.value })} className="w-full h-10 rounded-xl border border-input bg-surface px-3 py-2 text-text focus:outline-none focus:ring-1 focus:ring-accent">
                {['Paperback', 'Hardcover', 'eBook', 'Audiobook'].map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <Input label="Price" type="number" value={item.estimatedPrice} onChange={(e) => setItem({ ...item, estimatedPrice: e.target.value })} />
            </div>
            <select value={item.priority} onChange={(e) => setItem({ ...item, priority: e.target.value })} className="w-full h-10 rounded-xl border border-input bg-surface px-3 py-2 text-text focus:outline-none focus:ring-1 focus:ring-accent">
              {['high', 'medium', 'low'].map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
            <Textarea label="Notes" value={item.notes} onChange={(e) => setItem({ ...item, notes: e.target.value })} rows={2} />
            <div className="flex gap-2 pt-2">
              <button onClick={() => onOpenChange(false)} className="flex-1 h-10 rounded-xl border border-input bg-surface text-text-secondary hover:bg-elevated">
                Cancel
              </button>
              <button type="submit" className="flex-1 h-10 rounded-xl bg-accent text-text">Add Item</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
