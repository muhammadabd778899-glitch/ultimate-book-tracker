import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/toast';
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
import { seedDemoData } from '@/seed';
import { useEffect, useState } from 'react';

const basename = import.meta.env.DEV ? '/' : '/ultimate-book-tracker/';

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Ensure preferences exist; seed demo if empty
        const prefCount = await db.preferences.count();
        if (prefCount === 0) {
          await seedDemoData();
        }
        if (mounted) setInitialized(true);
      } catch (err) {
        console.error('Failed to initialize database', err);
        if (mounted) setInitialized(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!initialized) {
    return null;
  }

  // Redirect to onboarding if no user choice recorded (simple: if library empty and demo not seeded, we seeded demo anyway)
  return (
    <BrowserRouter basename={basename}>
      <Navbar />
      <main className="flex-1 relative">
        <Routes location={location}>
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
      </main>
    </BrowserRouter>
  );
}
