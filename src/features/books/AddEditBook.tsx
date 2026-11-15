import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, newId, nowISO } from '@/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useToast } from '@/components/ui/toast';
import { generateFallbackCover } from '@/utils/cover';
import { imageFileToDataUrl } from '@/utils/cover';
import { X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useSafeLiveQuery } from '@/hooks/use-safe-live-query';

const GENRES = [
  'Fantasy', 'Science Fiction', 'Mystery', 'Thriller', 'Romance', 'Historical Fiction',
  'Self-Help', 'Business', 'Psychology', 'Biography', 'Personal Development', 'Classics',
  'Nonfiction', 'Poetry', 'Comics', 'Graphic Novels',
];
const FORMATS = ['Paperback', 'Hardcover', 'eBook', 'Audiobook'];
const OWNERSHIP = ['Owned', 'Borrowed', 'Library', 'Gifted'];
const STATUSES = [
  { id: 'want-to-read', label: 'Want to Read' },
  { id: 'currently-reading', label: 'Currently Reading' },
  { id: 'finished', label: 'Finished' },
  { id: 'on-hold', label: 'On Hold' },
  { id: 'did-not-finish', label: 'Did Not Finish' },
];

export default function AddEditBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, success, error: showError } = useToast();

  const authors = useSafeLiveQuery(() => db.authors.toArray(), []) ?? [];
  const book = id ? useSafeLiveQuery(() => db.books.get(id), [id]) : null;

  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<any>({
    title: '',
    subtitle: '',
    author: '',
    additionalAuthors: '',
    isbn: '',
    description: '',
    publisher: '',
    publicationDate: '',
    pageCount: '',
    language: 'English',
    genre: '',
    format: 'Paperback',
    ownershipStatus: 'Owned',
    readingStatus: 'want-to-read',
    series: '',
    seriesPosition: '',
    dateAdded: new Date().toISOString().slice(0, 10),
    startDate: '',
    finishDate: '',
    currentPage: '',
    rating: '',
    detailedScore: '',
    isFavorite: false,
    isOwned: true,
    isWishlistItem: false,
    personalNotes: '',
    readingUnit: 'pages',
    currentPosition: '',
    totalPosition: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverRemoved, setCoverRemoved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (book && !form.title) {
      setMode('edit');
      setForm({
        title: book.title || '',
        subtitle: book.subtitle || '',
        author: (authors.find((a) => a.id === book.authorIds[0])?.name || ''),
        additionalAuthors: book.authorIds.slice(1).map((aid: string) => authors.find((a) => a.id === aid)?.name).join(', '),
        isbn: book.isbn || '',
        description: book.description || '',
        publisher: book.publisher || '',
        publicationDate: book.publicationDate || '',
        pageCount: String(book.pageCount || ''),
        language: book.language || 'English',
        genre: book.genres[0] || '',
        format: book.format || 'Paperback',
        ownershipStatus: book.ownershipStatus || 'Owned',
        readingStatus: book.readingStatus || 'want-to-read',
        series: '',
        seriesPosition: String(book.seriesPosition || ''),
        dateAdded: book.dateAdded ? new Date(book.dateAdded).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        startDate: book.startDate ? new Date(book.startDate).toISOString().slice(0, 10) : '',
        finishDate: book.finishDate ? new Date(book.finishDate).toISOString().slice(0, 10) : '',
        currentPage: String(book.currentPage || ''),
        rating: String(book.rating || ''),
        detailedScore: String(book.detailedScore || ''),
        isFavorite: !!book.isFavorite,
        isOwned: !!book.isOwned,
        isWishlistItem: !!book.isWishlistItem,
        personalNotes: book.personalNotes || '',
        readingUnit: book.readingUnit || 'pages',
        currentPosition: String(book.currentPosition || ''),
        totalPosition: String(book.totalPosition || ''),
      });
      if (book.coverImageId) {
        // Try to load existing cover
        db.covers.get(book.coverImageId).then((c: any) => {
          if (c) setCoverPreview(c.dataUrl);
        });
      }
    }
  }, [book, authors]);

  // Compute cover display
  const [computedCover, setComputedCover] = useState<string | null>(null);
  useEffect(() => {
    if (coverPreview) {
      setComputedCover(coverPreview);
    } else if (form.title) {
      setComputedCover(generateFallbackCover({ title: form.title, author: form.author, genre: form.genre, width: 300, height: 450 }));
    } else {
      setComputedCover(null);
    }
  }, [coverPreview, form.title, form.author, form.genre]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('Image must be under 5 MB.');
      return;
    }
    setCoverFile(file);
    setCoverRemoved(false);
    const dataUrl = await imageFileToDataUrl(file);
    setCoverPreview(dataUrl);
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    setCoverRemoved(true);
    setComputedCover(generateFallbackCover({ title: form.title, author: form.author, genre: form.genre, width: 300, height: 450 }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required.';
    if (form.pageCount && isNaN(Number(form.pageCount))) e.pageCount = 'Enter a valid number.';
    if (form.rating && (Number(form.rating) < 0 || Number(form.rating) > 5)) e.rating = 'Rating must be 0–5.';
    if (form.detailedScore && (Number(form.detailedScore) < 0 || Number(form.detailedScore) > 100)) e.detailedScore = 'Score must be 0–100.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      // Resolve authors
      let authorIds: string[] = [];
      const primaryAuthor = form.author.trim();
      if (primaryAuthor) {
        let a = authors.find((x) => x.name.toLowerCase() === primaryAuthor.toLowerCase());
        if (!a) {
          const authorId = await db.authors.add({
            id: newId(),
            name: primaryAuthor,
            biography: null,
            notes: null,
            createdAt: nowISO(),
            updatedAt: nowISO(),
          });
          authors.push({ id: authorId, name: primaryAuthor, biography: null, notes: null, createdAt: nowISO(), updatedAt: nowISO() } as any);
          authorIds.push(authorId);
        } else {
          authorIds.push(a.id);
        }
      }
      const additional = form.additionalAuthors.split(',').map((s: string) => s.trim()).filter(Boolean);
      for (const name of additional) {
        let a = authors.find((x) => x.name.toLowerCase() === name.toLowerCase());
        if (!a) {
          const authorId = await db.authors.add({
            id: newId(),
            name,
            biography: null,
            notes: null,
            createdAt: nowISO(),
            updatedAt: nowISO(),
          });
          authors.push({ id: authorId, name, biography: null, notes: null, createdAt: nowISO(), updatedAt: nowISO() } as any);
          authorIds.push(authorId);
        } else {
          authorIds.push(a.id);
        }
      }

      // Handle cover
      let coverImageId: string | null = null;
      if (coverFile && coverPreview) {
        const coverId = await db.covers.add({
          id: newId(),
          dataUrl: coverPreview,
          mimeType: coverFile.type,
          width: 400,
          height: 600,
          updatedAt: nowISO(),
        } as any);
        coverImageId = coverId;
      } else if (book?.coverImageId && !coverRemoved) {
        coverImageId = book.coverImageId;
      }

      const now = nowISO();
      const percentage = form.currentPage && form.pageCount ? Math.round((Number(form.currentPage) / Number(form.pageCount)) * 100) : null;

      const record: any = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || null,
        authorIds,
        isbn: form.isbn.trim() || null,
        description: form.description.trim() || null,
        publisher: form.publisher.trim() || null,
        publicationDate: form.publicationDate || null,
        pageCount: form.pageCount ? Number(form.pageCount) : null,
        language: form.language || 'English',
        genres: form.genre ? [form.genre] : [],
        format: form.format,
        ownershipStatus: form.ownershipStatus,
        readingStatus: form.readingStatus,
        coverImageId,
        seriesId: null,
        seriesPosition: form.seriesPosition ? Number(form.seriesPosition) : null,
        dateAdded: form.dateAdded || now,
        startDate: form.startDate || null,
        finishDate: form.finishDate || null,
        currentPage: form.currentPage ? Number(form.currentPage) : null,
        percentageComplete: percentage,
        rating: form.rating ? Number(form.rating) : null,
        detailedScore: form.detailedScore ? Number(form.detailedScore) : null,
        isFavorite: form.isFavorite,
        isOwned: form.isOwned,
        isWishlistItem: form.isWishlistItem,
        personalNotes: form.personalNotes.trim() || null,
        readingUnit: form.readingUnit,
        currentPosition: form.currentPosition ? Number(form.currentPosition) : null,
        totalPosition: form.totalPosition ? Number(form.totalPosition) : null,
        updatedAt: now,
      };

      if (mode === 'add') {
        record.id = newId();
        record.createdAt = now;
        await db.books.add(record);
        success(`“${record.title}” added to your library`);
      } else {
        record.id = id;
        record.createdAt = book?.createdAt || now;
        await db.books.put(record);
        toast.success(`“${record.title}” updated`);
      }
      navigate(`/books/${id || record.id}`);
    } catch (err) {
      showError('Failed to save book. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="hidden md:block">
          <X className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-serif font-bold text-text">{mode === 'add' ? 'Add a New Book' : 'Edit Book'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: form fields */}
          <div className="space-y-6">
            <Card className="p-0">
              <div className="p-6 border-b border-input">
                <h3 className="text-lg font-serif font-semibold text-text">Details</h3>
              </div>
              <div className="p-6 space-y-4">
                <Input label="Title *" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} />
                <Input label="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
                <Input label="Author *" required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} error={errors.author} placeholder="e.g. Elara Voss" />
                <Input label="Additional Authors" value={form.additionalAuthors} onChange={(e) => setForm({ ...form, additionalAuthors: e.target.value })} placeholder="comma-separated" />
                <Input label="ISBN" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} placeholder="978-0-000-00000-0" />
                <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
                <Input label="Publisher" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Publication Date" type="date" value={form.publicationDate} onChange={(e) => setForm({ ...form, publicationDate: e.target.value })} />
                  <Input label="Page Count" type="number" value={form.pageCount} onChange={(e) => setForm({ ...form, pageCount: e.target.value })} error={errors.pageCount} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
                  <select
                    value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                    className="w-full h-11 rounded-xl border border-input bg-surface px-4 py-2 text-text focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="">Select a genre</option>
                    {GENRES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value })}
                    className="w-full h-11 rounded-xl border border-input bg-surface px-4 py-2 text-text focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <select
                    value={form.ownershipStatus}
                    onChange={(e) => setForm({ ...form, ownershipStatus: e.target.value })}
                    className="w-full h-11 rounded-xl border border-input bg-surface px-4 py-2 text-text focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    {OWNERSHIP.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </Card>

            <Card className="p-0">
              <div className="p-6 border-b border-input">
                <h3 className="text-lg font-serif font-semibold text-text">Reading Status</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Reading Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setForm({ ...form, readingStatus: s.id })}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                          form.readingStatus === s.id ? 'bg-accent text-text border-accent' : 'bg-surface text-text-secondary border-input hover:bg-elevated'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  <Input label="Finish Date" type="date" value={form.finishDate} onChange={(e) => setForm({ ...form, finishDate: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Current Page" type="number" value={form.currentPage} onChange={(e) => setForm({ ...form, currentPage: e.target.value })} />
                  <Input label="Total Pages" type="number" value={form.pageCount} onChange={(e) => setForm({ ...form, pageCount: e.target.value })} />
                </div>
                {form.readingStatus === 'currently-reading' && form.pageCount && form.currentPage && (
                  <div>
                    <label className="text-xs font-medium text-text-secondary block mb-1">Progress</label>
                    <ProgressBar value={Math.round((Number(form.currentPage) / Number(form.pageCount)) * 100)} color="accent" showLabel />
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right: cover + metadata */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-0">
              <div className="p-6 border-b border-input">
                <h3 className="text-lg font-serif font-semibold text-text">Cover Image</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-surface border border-input flex items-center justify-center mb-2 relative">
                  {computedCover ? (
                    <img src={computedCover} alt={form.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-text-muted">
                      <ImageIcon className="w-10 h-10 opacity-50 mb-2" />
                      <p className="text-xs">No cover</p>
                    </div>
                  )}
                  <label className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 text-text px-3 py-1.5 rounded-full text-xs backdrop-blur">
                    <ImageIcon className="w-3 h-3" /> Upload cover
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
                  </label>
                  {coverPreview && !coverRemoved && (
                    <button onClick={handleRemoveCover} className="absolute top-2 right-2 p-1.5 text-danger hover:bg-danger/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-text-muted">JPEG, PNG, or WebP. Max 5 MB.</p>
              </div>
            </Card>

            <Card className="p-0">
              <div className="p-6 border-b border-input">
                <h3 className="text-lg font-serif font-semibold text-text">Ratings & Notes</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Rating (0–5)</label>
                  <div className="flex gap-1">
                    {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setForm({ ...form, rating: String(r) })}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          Number(form.rating) === r ? 'bg-accent text-text' : 'bg-surface text-text-secondary hover:bg-elevated'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <Input label="Detailed Score (0–100)" type="number" value={form.detailedScore} onChange={(e) => setForm({ ...form, detailedScore: e.target.value })} error={errors.detailedScore} />
                <div className="flex items-center gap-2">
                  <input id="favorite" type="checkbox" checked={form.isFavorite} onChange={(e) => setForm({ ...form, isFavorite: e.target.checked })} className="w-4 h-4 rounded border-input bg-surface text-accent focus:ring-accent" />
                  <label htmlFor="favorite" className="text-sm text-text-secondary">Mark as favorite</label>
                </div>
                <div className="flex items-center gap-2">
                  <input id="owned" type="checkbox" checked={form.isOwned} onChange={(e) => setForm({ ...form, isOwned: e.target.checked })} className="w-4 h-4 rounded border-input bg-surface text-accent focus:ring-accent" />
                  <label htmlFor="owned" className="text-sm text-text-secondary">I own this book</label>
                </div>
                <Textarea label="Personal Notes" value={form.personalNotes} onChange={(e) => setForm({ ...form, personalNotes: e.target.value })} rows={3} />
              </div>
            </Card>
          </div>
        </div>

        <div className="pt-8 flex gap-3 justify-end md:justify-between">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : mode === 'add' ? 'Add Book to Library' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
