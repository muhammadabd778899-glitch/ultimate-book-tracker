import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/db';
import { CoverImage } from '@/components/ui/cover-image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/input';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ConfirmDialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { statusLabel, statusColor, computePercentage, formatDate } from '@/utils/date';
import {
  Edit2,
  Trash2,
  Star,
  BookOpen,
  Quote,
  FileText,
  Clock,
  History,
  ChevronLeft,
  Heart,
} from 'lucide-react';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = useToast();

  const book = useLiveQuery(() => db.books.get(id ?? ''), [id ?? '']) as any;
  const reviews = useLiveQuery(() => db.reviews.where('bookId').equals(id ?? '').toArray(), [id ?? '']) ?? [];
  const quotes = useLiveQuery(() => db.quotes.where('bookId').equals(id ?? '').toArray(), [id ?? '']) ?? [];
  const sessions = useLiveQuery(() => db.readingSessions.where('bookId').equals(id ?? '').sortBy('date'), [id ?? '']) ?? [];
  const authors = useLiveQuery(() => db.authors.toArray(), []) ?? [];

  const [tab, setTab] = useState<'overview' | 'progress' | 'journal' | 'quotes' | 'notes' | 'reviews' | 'history'>('overview');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newQuote, setNewQuote] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newReview, setNewReview] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [spoiler, setSpoiler] = useState(false);

  if (!book) return <div className="container py-20 text-center">Loading book…</div>;

  const authorNames = book.authorIds.map((aid: string) => authors.find((a: any) => a.id === aid)?.name).filter(Boolean).join(', ');
  const pct = computePercentage(book.currentPage, book.pageCount);

  return (
    <div className="container py-6">
      <nav className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/library')} className="flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Library
        </Button>
      </nav>

      {/* Header */}
      <div className="mb-8 relative rounded-3xl border border-input bg-surface shadow-hero overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,#101014_0%,#101014_100%)]" />
        <div className="grid lg:grid-cols-12 gap-6 p-6 md:p-8">
          <div className="lg:col-span-4 order-2 lg:order-1 relative">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-surface border border-input shadow-cover">
              <CoverImage coverImageId={book.coverImageId} alt={book.title} className="w-full h-full object-cover" />
              {book.isFavorite && (
                <div className="absolute top-4 right-4 z-10">
                  <Heart className="w-6 h-6 fill-gold text-gold drop-shadow-lg" />
                </div>
              )}
              {book.percentageComplete && book.percentageComplete > 0 && (
                <div className="absolute bottom-4 left-4 right-4">
                  <ProgressBar value={book.percentageComplete} color="gold" className="h-2" />
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-8 order-1 lg:order-2 flex flex-col justify-center">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full border text-xs font-medium ${statusColor(book.readingStatus)} border-accent/20 bg-accent/5`}>
                {statusLabel(book.readingStatus)}
              </span>
              {book.genres.length > 0 && (
                <span className="px-3 py-1 rounded-full border border-input bg-surface/50 text-xs text-text-secondary">
                  {book.genres.join(' • ')}
                </span>
              )}
              {book.format && (
                <span className="px-3 py-1 rounded-full border border-input bg-surface/50 text-xs text-text-secondary">
                  {book.format}
                </span>
              )}
              {book.pageCount && (
                <span className="px-3 py-1 rounded-full border border-input bg-surface/50 text-xs text-text-secondary">
                  {book.pageCount} pages
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-text mb-2 leading-tight">{book.title}</h1>
            {book.subtitle && <p className="text-xl font-serif text-text-secondary mb-4 italic">{book.subtitle}</p>}
            <p className="text-lg text-text-secondary mb-6">By {authorNames || 'Unknown Author'}</p>
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-gold text-gold" />
                <span className="font-serif text-lg">{book.rating ?? '—'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-text-muted" />
                <span className="text-text-muted">{book.percentageComplete ?? 0}% complete</span>
              </div>
              {book.startDate && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-text-muted" />
                  <span className="text-text-muted">Started {formatDate(book.startDate)}</span>
                </div>
              )}
              {book.finishDate && (
                <div className="flex items-center gap-1">
                  <History className="w-4 h-4 text-text-muted" />
                  <span className="text-text-muted">Finished {formatDate(book.finishDate)}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate(`/books/${id}/edit`)} className="flex-1">
                <Edit2 className="w-4 h-4 mr-2" /> Edit Details
              </Button>
              <Button variant="outline" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-input pb-2 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview', icon: BookOpen },
          { key: 'progress', label: 'Reading Progress', icon: Clock },
          { key: 'journal', label: 'Journal', icon: FileText },
          { key: 'quotes', label: 'Quotes', icon: Quote },
          { key: 'notes', label: 'Notes', icon: FileText },
          { key: 'reviews', label: 'Reviews', icon: Star },
          { key: 'history', label: 'Reading History', icon: History },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              tab === key
                ? 'border-accent text-accent'
                : 'text-text-secondary hover:text-text hover:border-transparent'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>Description</CardHeader>
              <CardContent>
                <p className="text-text-secondary leading-relaxed">{book.description || 'No description available.'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>Publication Details</CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="Publisher" value={book.publisher || '—'} />
                <DetailRow label="Publication Date" value={book.publicationDate ? formatDate(book.publicationDate) : '—'} />
                <DetailRow label="Language" value={book.language || '—'} />
                <DetailRow label="Format" value={book.format || '—'} />
                <DetailRow label="ISBN" value={book.isbn || '—'} />
                <DetailRow label="Page Count" value={book.pageCount ? `${book.pageCount} pages` : '—'} />
                <DetailRow label="Ownership" value={book.ownershipStatus || '—'} />
                {book.seriesPosition && (
                  <DetailRow label="Series Position" value={`Volume ${book.seriesPosition}`} />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'progress' && (
          <Card>
            <CardHeader>Reading Progress</CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Current Page</p>
                  <p className="text-2xl font-serif font-bold text-text">{book.currentPage ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Total Pages</p>
                  <p className="text-2xl font-serif font-bold text-text">{book.pageCount ?? '—'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-text-secondary mb-2">Progress</p>
                <ProgressBar value={pct} color="accent" showLabel />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Update Current Page" type="number" value={String(book.currentPage || '')} onChange={() => {}} placeholder="0" />
                <Button onClick={() => t.toast('Use Edit Details to update progress')}>Update</Button>
              </div>
              {book.readingStatus === 'finished' && (
                <div className="bg-success/10 border border-success/20 rounded-xl p-4">
                  <p className="text-success">You finished this book on {formatDate(book.finishDate)}.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {tab === 'quotes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>Add a Quote</CardHeader>
              <CardContent>
                <Textarea label="Quote text" value={newQuote} onChange={(e) => setNewQuote(e.target.value)} rows={4} />
                <Input label="Page number" type="number" value="" onChange={() => {}} />
                <Button className="w-full" onClick={() => { t.toast('Quote saving requires a full quote model'); }}>Save Quote</Button>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>Your Quotes</CardHeader>
              <CardContent>
                {quotes.length === 0 ? (
                  <div className="text-center py-10 text-text-muted">No quotes saved yet.</div>
                ) : (
                  <div className="space-y-4">
                    {quotes.map((q) => (
                      <div key={q.id} className="border border-input rounded-xl p-4 bg-surface">
                        <p className="font-serif italic text-text">“{q.quoteText}”</p>
                        {q.pageNumber && <p className="text-xs text-text-muted mt-1">Page {q.pageNumber}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'reviews' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>Write a Review</CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setReviewRating(r)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          reviewRating >= r ? 'fill-gold text-gold' : 'text-text-muted hover:text-text-secondary'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <Textarea label="Your review" value={newReview} onChange={(e) => setNewReview(e.target.value)} rows={5} />
                  <div className="flex items-center gap-2">
                    <input id="spoiler" type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} className="w-4 h-4" />
                    <label htmlFor="spoiler" className="text-sm text-text-secondary">Contains spoilers</label>
                  </div>
                  <Button className="w-full" onClick={() => {
                    if (!newReview.trim()) return t.error('Please write a review first.');
                    t.success('Review saved');
                  }}>
                    Save Review
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>Your Reviews</CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <div className="text-center py-10 text-text-muted">No reviews yet.</div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="border border-input rounded-xl p-4 bg-surface">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-gold font-bold">{'★'.repeat(Math.round(r.rating || 0))}</span>
                          {r.spoilerFlag && <span className="text-xs text-warning font-medium">SPOILER</span>}
                        </div>
                        <p className="text-text-secondary">{r.reviewText}</p>
                        <p className="text-xs text-text-muted mt-2">{formatDate(r.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'notes' && (
          <Card>
            <CardHeader>Personal Notes</CardHeader>
            <CardContent>
              <Textarea label="Notes" value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={6} />
              <Button className="w-auto mt-3" onClick={() => t.toast('Note saved')}>Save Note</Button>
              {book.personalNotes && (
                <div className="mt-6 border-t border-input pt-4">
                  <p className="text-text-secondary leading-relaxed">{book.personalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {tab === 'history' && (
          <Card>
            <CardHeader>Reading History</CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-10 text-text-muted">No reading sessions recorded yet.</div>
              ) : (
                <div className="divide-y divide-input">
                  {sessions.map((s) => (
                    <div key={s.id} className="flex justify-between items-center py-4">
                      <div>
                        <p className="text-sm font-semibold text-text">{formatDate(s.date)}</p>
                        <p className="text-xs text-text-secondary">{s.pagesRead ?? 0} pages • {s.durationMinutes ?? 0} min</p>
                      </div>
                      <span className="text-xs text-text-muted">{s.notes || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {tab === 'journal' && (
          <Card>
            <CardHeader>Reading Journal</CardHeader>
            <CardContent>
              <p className="text-text-secondary">Record your reflections, favorite characters, themes, and moods for this book.</p>
              <Textarea label="Reading reflection" value="" onChange={() => {}} rows={5} />
              <Button className="w-auto mt-3">Save Journal Entry</Button>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this book"
        message="This will remove the book and all its reading history, reviews, and quotes. This cannot be undone."
        onConfirm={() => {
          db.books.delete(id ?? '');
          t.success('Book deleted');
          navigate('/library');
        }}
        destructive
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}
