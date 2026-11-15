import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Book,
  Timer,
  Target,
  Calendar,
  BarChart3,
  Settings,
  List,
  Menu,
  X,
  Bookmark,
  ShieldCheck,
  BookPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/library', label: 'My Library', icon: BookOpen },
  { path: '/tbr', label: 'TBR Queue', icon: Bookmark },
  { path: '/reading', label: 'Reading Tracker', icon: Timer },
  { path: '/statistics', label: 'Statistics', icon: BarChart3 },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/shelves', label: 'Shelves', icon: List },
  { path: '/series', label: 'Series', icon: Book },
  { path: '/journal', label: 'Reading Journal', icon: BookPlus },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/wishlist', label: 'Wishlist', icon: ShieldCheck },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleAddBook = () => {
    navigate('/books/add');
    setOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-input bg-surface/80 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-text font-serif font-bold text-xl">
              B
            </div>
            <span className="font-serif font-bold text-xl tracking-tight">The Ultimate Book Tracker</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
                    active
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'text-text-secondary hover:text-text hover:bg-elevated'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <Button onClick={handleAddBook} size="sm" className="flex items-center gap-2 px-3">
              <BookPlus className="w-4 h-4" /> Add Book
            </Button>
          </div>
          <button
            className="md:hidden p-2 text-text-secondary hover:text-text"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="fixed inset-y-0 left-0 z-50 w-full max-w-md bg-surface border-r border-input flex flex-col">
          <div className="p-4 flex items-center justify-between">
            <span className="font-serif font-bold text-lg">Menu</span>
            <button onClick={() => setOpen(false)} className="text-text-secondary hover:text-text">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors block',
                    active
                      ? 'bg-accent/10 text-accent border-r-2 border-accent'
                      : 'text-text-secondary hover:text-text hover:bg-elevated'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-6 pt-4 border-t border-input">
              <button
                onClick={handleAddBook}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-accent hover:bg-accent/5 rounded-xl"
              >
                <BookPlus className="w-5 h-5" /> Add Book
              </button>
            </div>
          </div>
        </div>
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      </div>
    </>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
