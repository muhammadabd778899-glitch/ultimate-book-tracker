import { useEffect, useRef, useState } from 'react';
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
  Menu,
  X,
  Bookmark,
  BookPlus,
  Library,
  ChevronDown,
  Heart,
  PenLine,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type NavItem = { path: string; label: string; icon: typeof Home };

const PRIMARY: NavItem[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/library', label: 'Library', icon: Library },
  { path: '/reading', label: 'Reading', icon: Timer },
  { path: '/statistics', label: 'Statistics', icon: BarChart3 },
];

const MORE: NavItem[] = [
  { path: '/tbr', label: 'TBR Queue', icon: Bookmark },
  { path: '/shelves', label: 'Shelves', icon: Layers },
  { path: '/series', label: 'Series', icon: Book },
  { path: '/journal', label: 'Reading Journal', icon: PenLine },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/goals', label: 'Goals & Challenges', icon: Target },
  { path: '/wishlist', label: 'Wishlist', icon: Heart },
  { path: '/year-in-books', label: 'Year in Books', icon: Sparkles },
];

const ALL = [...PRIMARY, ...MORE, { path: '/settings', label: 'Settings', icon: Settings }, { path: '/timer', label: 'Reading Timer', icon: Timer }];

function isActive(pathname: string, path: string): boolean {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [moreOpen]);

  const moreActive = MORE.some((item) => isActive(location.pathname, item.path));

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-input bg-surface/85 backdrop-blur-xl">
        <div className="container flex items-center gap-3 h-16">
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white font-serif font-bold text-lg shadow-cover transition-transform group-hover:scale-105">
              B
            </span>
            <span className="font-serif font-bold text-lg tracking-tight hidden xl:block">The Ultimate Book Tracker</span>
            <span className="font-serif font-bold text-lg tracking-tight xl:hidden hidden sm:block">Book Tracker</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 ml-4">
            {PRIMARY.map((item) => {
              const Icon = item.icon;
              const active = isActive(location.pathname, item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text hover:bg-elevated'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  moreActive || moreOpen ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text hover:bg-elevated'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                More
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreOpen && (
                <div className="absolute left-0 top-full mt-2 w-60 rounded-2xl border border-input bg-card p-2 shadow-hero animate-scale-in">
                  {MORE.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(location.pathname, item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                          active ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-elevated hover:text-text'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/settings"
              aria-label="Settings"
              className={`hidden md:flex w-9 h-9 items-center justify-center rounded-xl transition-colors ${
                isActive(location.pathname, '/settings') ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:bg-elevated hover:text-text'
              }`}
            >
              <Settings className="w-4 h-4" />
            </Link>
            <Button onClick={() => navigate('/books/add')} size="sm" className="hidden sm:flex items-center gap-2">
              <BookPlus className="w-4 h-4" /> Add Book
            </Button>
            <button
              className="md:hidden p-2 rounded-xl text-text-secondary hover:text-text hover:bg-elevated"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-50 md:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-[86%] max-w-sm bg-surface border-r border-input flex flex-col transition-transform duration-300 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 flex items-center justify-between border-b border-input">
            <span className="font-serif font-bold text-lg">Menu</span>
            <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-text-secondary hover:text-text hover:bg-elevated" aria-label="Close menu">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
            {ALL.map((item) => {
              const Icon = item.icon;
              const active = isActive(location.pathname, item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text hover:bg-elevated'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="p-4 border-t border-input">
            <Button
              onClick={() => {
                setMobileOpen(false);
                navigate('/books/add');
              }}
              className="w-full flex items-center justify-center gap-2"
            >
              <BookPlus className="w-4 h-4" /> Add a book
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}
