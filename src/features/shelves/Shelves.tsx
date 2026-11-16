import { useState } from 'react';
import { db, newId, nowISO } from '@/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { Book, Plus, LayoutGrid, LayoutList, Trash2, ArrowRight, Heart, Star, Moon, Sun, Flame, Zap, Leaf, Award, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSafeLiveQuery } from '@/hooks/use-safe-live-query';
import { CoverImage } from '@/components/ui/cover-image';

export default function Shelves() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const shelves = useSafeLiveQuery(() => db.shelves.toArray(), []) ?? [];
  const books = useSafeLiveQuery(() => db.books.toArray(), []) ?? [];

  const [form, setForm] = useState({ name: '', description: '', color: '#E65A45', icon: 'Book', coverStyle: 'cover' as const });
  const [open, setOpen] = useState(false);

  const handleAdd = async () => {
    if (!form.name.trim()) return toast.error('Shelf name is required.');
    await db.shelves.add({
      id: newId(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      color: form.color,
      icon: form.icon,
      coverStyle: form.coverStyle,
      bookIds: [],
      createdAt: nowISO(),
      updatedAt: nowISO(),
    } as any);
    setForm({ name: '', description: '', color: '#E65A45', icon: 'Book', coverStyle: 'cover' });
    setOpen(false);
    toast.success('Shelf created');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this shelf? Books will remain in your library.')) return;
    await db.shelves.delete(id);
    toast.success('Shelf deleted');
  };

  const ICONS = ['Book', 'Heart', 'Star', 'Moon', 'Sun', 'Flame', 'Zap', 'Leaf', 'Award', 'MapPin'];

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-text">Bookshelves & Collections</h1>
          <p className="text-text-secondary">Organize your library into custom shelves.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Shelf
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shelves.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
            <LayoutGrid className="w-16 h-16 mb-4 text-text-muted opacity-50" />
            <h3 className="text-xl font-serif font-semibold text-text">No shelves yet</h3>
            <p className="text-text-secondary mb-6">Create your first collection to organize books.</p>
            <Button onClick={() => setOpen(true)}>Create Shelf</Button>
          </div>
        ) : (
          shelves.map((s) => {
            const shelfBooks = s.bookIds.map((id) => books.find((b) => b.id === id)).filter(Boolean);
            return (
              <ShelfCard key={s.id} shelf={s} shelfBooks={shelfBooks} onDelete={handleDelete} onClick={() => navigate(`/shelves/${s.id}`)} />
            );
          })
        )}
      </div>

      <DialogAddShelf open={open} onOpenChange={setOpen} form={form} setForm={setForm} icons={ICONS} onAdd={handleAdd} />
    </div>
  );
}

function ShelfCard({ shelf, shelfBooks, onDelete, onClick }: { shelf: any; shelfBooks: any[]; onDelete: (id: string) => void; onClick: () => void }) {
  const bookCount = shelfBooks.length;
  const preview = shelfBooks.slice(0, 3);
  return (
    <Card className="p-5 group relative overflow-hidden cursor-pointer transition-transform hover:-translate-y-0.5" onClick={onClick}>
      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl border border-input bg-elevated/50">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ background: `radial-gradient(120% 100% at 50% 0%, ${shelf.color || '#E65A45'} 0%, transparent 70%)` }}
        />
        {preview.length > 0 ? (
          <div className="absolute inset-0 flex items-end justify-center gap-2 px-4 pb-4">
            {preview.map((b) => (
              <div key={b.id} className="w-[30%] shadow-cover">
                <CoverImage coverImageId={b.coverImageId} coverUrl={b.coverUrl} title={b.title} genre={b.genres?.[0]} alt={b.title} radius="md" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <Book className="w-12 h-12 opacity-40" />
          </div>
        )}
      </div>
      <div style={{ borderLeft: `4px solid ${shelf.color || '#E65A45'}` }} className="pl-3">
        <h4 className="text-lg font-serif font-semibold text-text">{shelf.name}</h4>
        <p className="text-xs text-text-secondary">{shelf.description || 'No description'}</p>
      </div>
      <p className="text-xs text-text-muted mt-2">{bookCount} book{bookCount !== 1 ? 's' : ''}</p>
      <div className="mt-4 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ background: shelf.color || '#E65A45' }} />
        <span className="text-xs font-medium text-text-secondary">{shelf.coverStyle === 'spine' ? 'Spine view' : 'Cover view'}</span>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDelete(shelf.id); }} className="absolute top-3 right-3 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity">
        <Trash2 className="w-4 h-4" />
      </button>
    </Card>
  );
}

function DialogAddShelf({ open, onOpenChange, form, setForm, icons, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; form: any; setForm: any; icons: string[]; onAdd: () => void }) {
  if (!open) return null;
  const IconMap: Record<string, any> = { Book, Heart, Star, Moon, Sun, Flame, Zap, Leaf, Award, MapPin };
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-input bg-card shadow-cover animate-scale-in">
        <div className="p-6">
          <h2 className="text-lg font-serif font-semibold text-text mb-4">Create Shelf</h2>
          <form onSubmit={(e) => { e.preventDefault(); onAdd(); onOpenChange(false); }} className="space-y-3">
            <Input label="Shelf Name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
              <select value={form.coverStyle} onChange={(e) => setForm({ ...form, coverStyle: e.target.value as any })} className="w-full h-10 rounded-xl border border-input bg-surface px-3 py-2 text-text focus:outline-none focus:ring-1 focus:ring-accent">
                <option value="cover">Cover-based</option>
                <option value="spine">Book-spine</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="text-xs font-medium text-text-secondary">Icon</label>
              {icons.map((ic) => {
                const Icon = IconMap[ic];
                return (
                  <button
                    key={ic}
                    onClick={() => setForm({ ...form, icon: ic })}
                    className={cn(
                      'w-8 h-8 rounded flex items-center justify-center transition-all',
                      form.icon === ic ? 'bg-accent text-text' : 'bg-surface text-text-secondary hover:bg-elevated'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => onOpenChange(false)} className="flex-1 h-10 rounded-xl border border-input bg-surface text-text-secondary hover:bg-elevated">
                Cancel
              </button>
              <button type="submit" className="flex-1 h-10 rounded-xl bg-accent text-text">Create Shelf</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
