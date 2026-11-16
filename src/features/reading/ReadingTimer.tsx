import { useState, useEffect, useRef } from 'react';
import { db, newId, nowISO } from '@/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { computePercentage, todayISO } from '@/utils/date';
import { Play, Pause, RefreshCw, Timer, Plus, Trash2 } from 'lucide-react';
import { CoverImage } from '@/components/ui/cover-image';
import { useSafeLiveQuery } from '@/hooks/use-safe-live-query';

export default function ReadingTimer() {
  const { toast } = useToast();

  const books = useSafeLiveQuery(() => db.books.toArray(), []) ?? [];
  const sessions = useSafeLiveQuery(() => db.readingSessions.toArray(), []) ?? [];

  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [notes, setNotes] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const activeBook = books.find((b) => b.id === activeBookId);
  const existingSession = sessions.find((s) => s.bookId === activeBookId && !s.endedAt);

  useEffect(() => {
    if (isRunning && startTimeRef.current > 0) {
      timerRef.current = window.setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, startTimeRef.current]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const startTimer = async () => {
    if (!activeBookId) {
      toast.error('Please select a book first.');
      return;
    }
    setIsRunning(true);
    startTimeRef.current = Date.now() - elapsed * 1000;
    // Persist an active session marker
    await db.readingSessions.add({
      id: newId(),
      bookId: activeBookId,
      date: todayISO(),
      startTime: new Date().toTimeString().slice(0, 5),
      endTime: null,
      durationMinutes: null,
      startPage: startPage ? Number(startPage) : null,
      endPage: null,
      pagesRead: null,
      notes: null,
      readingUnit: 'pages',
      startedAt: new Date().toISOString(),
      endedAt: null,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    } as any);
    toast.success('Timer started');
  };

  const pauseTimer = () => {
    setIsRunning(false);
    toast.info('Timer paused');
  };

  const resumeTimer = () => {
    setIsRunning(true);
    startTimeRef.current = Date.now() - elapsed * 1000;
    toast.success('Timer resumed');
  };

  const finishTimer = async () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    const minutes = Math.round(elapsed / 60) || 1;
    const pagesRead = startPage && endPage ? Math.max(0, Number(endPage) - Number(startPage)) : null;
    // Update the active session
    const s = await db.readingSessions.where('bookId').equals(activeBookId ?? '').filter((x) => !x.endedAt).first();
    if (s) {
      await db.readingSessions.update(s.id, {
        endTime: new Date().toTimeString().slice(0, 5),
        durationMinutes: minutes,
        endPage: endPage ? Number(endPage) : null,
        pagesRead,
        notes: notes || null,
        endedAt: new Date().toISOString(),
        updatedAt: nowISO(),
      });
    }
    // Update book progress
    const b = await db.books.get(activeBookId ?? '');
    if (b) {
      const updates: any = { updatedAt: nowISO() };
      if (pagesRead && b.currentPage != null) updates.currentPage = b.currentPage + pagesRead;
      if (b.pageCount) updates.percentageComplete = computePercentage(updates.currentPage ?? b.currentPage, b.pageCount);
      if (updates.percentageComplete >= 100) updates.readingStatus = 'finished';
      await db.books.update(b.id, updates);
    }
    setElapsed(0);
    setStartPage('');
    setEndPage('');
    setNotes('');
    setActiveBookId(null);
    toast.success('Reading session saved');
  };

  const cancelTimer = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setElapsed(0);
    setStartPage('');
    setEndPage('');
    setNotes('');
    setActiveBookId(null);
    toast.info('Timer cancelled');
  };

  const logManualSession = async () => {
    if (!activeBookId) {
      toast.error('Select a book first.');
      return;
    }
    const minutes = Number(manualMinutes);
    if (!minutes || minutes <= 0) {
      toast.error('Enter how many minutes you read.');
      return;
    }
    const pagesRead = startPage && endPage ? Math.max(0, Number(endPage) - Number(startPage)) : null;
    const ended = new Date();
    const started = new Date(ended.getTime() - minutes * 60_000);
    await db.readingSessions.add({
      id: newId(),
      bookId: activeBookId,
      date: todayISO(),
      startTime: started.toTimeString().slice(0, 5),
      endTime: ended.toTimeString().slice(0, 5),
      durationMinutes: minutes,
      startPage: startPage ? Number(startPage) : null,
      endPage: endPage ? Number(endPage) : null,
      pagesRead,
      notes: notes || null,
      readingUnit: 'pages',
      startedAt: started.toISOString(),
      endedAt: ended.toISOString(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    } as any);
    const b = await db.books.get(activeBookId);
    if (b) {
      const updates: any = { updatedAt: nowISO() };
      if (pagesRead && b.currentPage != null) updates.currentPage = b.currentPage + pagesRead;
      if (b.pageCount) updates.percentageComplete = computePercentage(updates.currentPage ?? b.currentPage, b.pageCount);
      if (updates.percentageComplete >= 100) updates.readingStatus = 'finished';
      await db.books.update(b.id, updates);
    }
    setStartPage('');
    setEndPage('');
    setNotes('');
    setManualMinutes('');
    toast.success('Reading session logged');
  };

  const minutesRead = Math.floor(elapsed / 60);

  return (
    <div className="container py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-text">Reading Timer</h1>
          <p className="text-text-secondary">Time your reading sessions and log pages read.</p>
        </div>
      </div>

      {/* Book selector */}
      <Card className="mb-6 p-5">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-text-secondary">Select a book</label>
            <select
              value={activeBookId || ''}
              onChange={(e) => {
                setActiveBookId(e.target.value || null);
                if (!isRunning) setElapsed(0);
              }}
              className="w-full h-11 rounded-xl border border-input bg-surface px-4 py-2 text-text focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Choose a book…</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-4">
            {activeBook ? (
              <div className="flex items-center gap-3">
                <div className="w-20 h-28 rounded-lg overflow-hidden bg-surface border border-input">
                  <CoverImage coverImageId={activeBook.coverImageId} coverUrl={activeBook.coverUrl} title={activeBook.title} genre={activeBook.genres?.[0]} alt={activeBook.title} className="h-full w-full" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">{activeBook.title}</p>
                  <p className="text-xs text-text-muted">{activeBook.currentPage ?? 0} / {activeBook.pageCount ?? '—'} pages</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-text-muted">Select a book to begin</div>
            )}
          </div>
        </div>
      </Card>

      {/* Timer display */}
      <Card className="mb-6 p-8 text-center rounded-3xl shadow-hero relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(230,90,69,0.15),transparent_60%)]" />
        <div className="text-9xl font-mono font-bold text-text mb-2 font-serif">{formatTime(elapsed)}</div>
        <div className="text-lg text-text-secondary mb-6">{minutesRead} minute{minutesRead !== 1 ? 's' : ''} elapsed</div>

        <div className="flex justify-center gap-3">
          {!isRunning && !activeBookId ? (
            <Button size="lg" disabled>Start Timer</Button>
          ) : !isRunning && activeBookId ? (
            <>
              <Button size="lg" onClick={startTimer} disabled={isRunning}>
                <Play className="w-5 h-5 mr-2" /> Start
              </Button>
            </>
          ) : isRunning ? (
            <>
              <Button size="lg" variant="outline" onClick={pauseTimer}>
                <Pause className="w-5 h-5 mr-2" /> Pause
              </Button>
              <Button size="lg" onClick={finishTimer} className="bg-success text-text hover:bg-success/90">
                Finish
              </Button>
            </>
          ) : null}
        </div>

        {!isRunning && activeBookId && elapsed > 0 && (
          <Button variant="outline" size="sm" onClick={cancelTimer} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" /> Cancel
          </Button>
        )}
      </Card>

      {/* Manual entry */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif font-semibold text-text">Manual Session Entry</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input label="Start Page" type="number" value={startPage} onChange={(e) => setStartPage(e.target.value)} />
          <Input label="End Page" type="number" value={endPage} onChange={(e) => setEndPage(e.target.value)} />
          <Input label="Duration (min)" type="number" value={manualMinutes} onChange={(e) => setManualMinutes(e.target.value)} />
          <Button className="col-span-2 md:col-span-1" onClick={logManualSession}>Log Session</Button>
        </div>
        <Textarea label="Session notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-4" />
      </Card>

      <div className="mt-8">
        <h3 className="text-lg font-serif font-semibold text-text mb-4">Recent Sessions</h3>
        <div className="divide-y divide-input">
          {sessions
            .filter((s) => s.endedAt)
            .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
            .slice(0, 8)
            .map((s) => {
              const b = books.find((x) => x.id === s.bookId);
              return (
                <div key={s.id} className="flex justify-between items-center py-3">
                  <div>
                    <p className="text-sm font-semibold text-text">{b ? b.title : 'Unknown Book'}</p>
                    <p className="text-xs text-text-secondary">{s.date} • {s.pagesRead ?? 0} pages • {s.durationMinutes ?? 0} min</p>
                  </div>
                  <button onClick={() => {}} className="text-text-muted hover:text-text">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
