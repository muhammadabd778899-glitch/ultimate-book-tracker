import { Routes, Route, useLocation } from 'react-router-dom';
import Home from '@/features/home/Home';
import Library from '@/features/library/Library';
import AddEditBook from '@/features/books/AddEditBook';
import BookDetail from '@/features/books/BookDetail';
import ReadingTracker from '@/features/reading/ReadingTracker';
import ReadingTimer from '@/features/reading/ReadingTimer';
import TBR from '@/features/tbr/TBR';
import Wishlist from '@/features/wishlist/Wishlist';
import Series from '@/features/series/Series';
import Shelves from '@/features/shelves/Shelves';
import ShelfDetail from '@/features/shelves/ShelfDetail';
import Journal from '@/features/journal/Journal';
import Goals from '@/features/goals/Goals';
import Calendar from '@/features/calendar/Calendar';
import Statistics from '@/features/statistics/Statistics';
import YearInBooks from '@/features/year-in-books/YearInBooks';
import Settings from '@/features/settings/Settings';
import Onboarding from '@/features/onboarding/Onboarding';
import Navbar from '@/components/layout/Navbar';
import { db } from '@/db';
import { refreshLegacyDemo, seedDemoData } from '@/seed';
import { applyTheme } from '@/lib/theme';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

function Splash() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-bg">
      <div className="h-14 w-14 rounded-2xl bg-accent text-text font-serif font-bold text-2xl flex items-center justify-center shadow-cover animate-pulse-slow">
        B
      </div>
      <p className="text-sm text-text-secondary tracking-wide">Opening your library…</p>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-border">
        <div className="h-full w-1/3 rounded-full bg-accent animate-loading" />
      </div>
    </div>
  );
}

function StorageError({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-md rounded-2xl border border-input bg-card p-8 text-center shadow-hero">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
        </div>
        <h1 className="text-xl font-serif font-bold text-text mb-2">Your library can’t be opened</h1>
        <p className="text-sm text-text-secondary mb-1">
          This app stores your books in the browser. It looks like local storage is blocked.
        </p>
        <p className="text-xs text-text-muted mb-6">
          Private browsing, strict tracking protection or a full disk can cause this. Try a normal window, allow site data, then reload.
        </p>
        <Button onClick={() => window.location.reload()} className="w-full">Try again</Button>
        <p className="mt-4 break-words text-[11px] text-text-muted">{error.message}</p>
      </div>
    </div>
  );
}

function Shell() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <main className="flex-1 relative">
        <ErrorBoundary
          key={location.pathname}
          onError={(error, info) => console.error('[App] Render error caught:', error, info)}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/books/add" element={<AddEditBook />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/books/:id/edit" element={<AddEditBook />} />
            <Route path="/reading" element={<ReadingTracker />} />
            <Route path="/timer" element={<ReadingTimer />} />
            <Route path="/tbr" element={<TBR />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/series" element={<Series />} />
            <Route path="/shelves" element={<Shelves />} />
            <Route path="/shelves/:id" element={<ShelfDetail />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/year-in-books" element={<YearInBooks />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </>
  );
}

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const prefCount = await db.preferences.count();
        if (prefCount === 0) await seedDemoData();
        else await refreshLegacyDemo();
        const pref = (await db.preferences.toArray())[0];
        applyTheme(pref?.theme, pref?.accentColor);
        if (mounted) setInitialized(true);
      } catch (err) {
        console.error('Failed to initialize database', err);
        if (mounted) {
          setDbError(err as Error);
          setInitialized(true);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!initialized) return <Splash />;
  if (dbError) return <StorageError error={dbError} />;
  return <Shell />;
}
