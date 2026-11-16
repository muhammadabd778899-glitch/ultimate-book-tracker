import { useMemo, useState, type ComponentType } from 'react';
import { db } from '@/db';
import { Card } from '@/components/ui/card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { computeLibraryStats, booksFinishedInRange, pagesReadInRange, readingHoursInRange, getYearRange, statusLabel } from '@/utils/date';
import { Book as BookIcon, BarChart3, BookOpen, Clock, Star, Heart, Flame, Target } from 'lucide-react';
import { useSafeLiveQuery } from '@/hooks/use-safe-live-query';

const COLORS = ['#E65A45', '#0891b2', '#be185d', '#047857', '#92400e', '#7c3aed', '#ea580c', '#c026d3', '#475569', '#0f172a'];

const AXIS_TICK = { fontSize: 12, fill: 'rgb(var(--c-text-muted))' };
const TOOLTIP_STYLE = {
  background: 'rgb(var(--c-card))',
  border: '1px solid rgb(var(--c-border))',
  borderRadius: 12,
  color: 'rgb(var(--c-text))',
  boxShadow: '0 10px 30px -10px rgba(0,0,0,0.45)',
};

export default function Statistics() {
  const books = useSafeLiveQuery(() => db.books.toArray(), []) ?? [];
  const sessions = useSafeLiveQuery(() => db.readingSessions.toArray(), []) ?? [];
  const authors = useSafeLiveQuery(() => db.authors.toArray(), []) ?? [];

  const currentYear = new Date().getFullYear();
  const dataYears = useMemo(() => {
    const years = new Set<number>();
    books.forEach((b) => {
      if (b.finishDate) years.add(Number(b.finishDate.slice(0, 4)));
      else if (b.startDate) years.add(Number(b.startDate.slice(0, 4)));
    });
    sessions.forEach((s) => years.add(Number(s.date.slice(0, 4))));
    years.add(currentYear);
    return Array.from(years).filter((y) => Number.isFinite(y) && y > 1900).sort((a, b) => b - a);
  }, [books, sessions, currentYear]);

  const [year, setYear] = useState<number | null>(null);
  const activeYear = year ?? dataYears[0] ?? currentYear;

  const { start, end } = getYearRange(activeYear);
  const stats = computeLibraryStats(books);
  const finishedThisYear = booksFinishedInRange(books, start, end);
  const pagesThisYear = pagesReadInRange(sessions, start, end);
  const hoursThisYear = readingHoursInRange(sessions, start, end);

  const booksPerMonth = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const s = `${activeYear}-${String(month).padStart(2, '0')}-01`;
      const e = `${activeYear}-${String(month).padStart(2, '0')}-${new Date(activeYear, month, 0).getDate()}`;
      return {
        month: new Date(activeYear, i).toLocaleString('en', { month: 'short' }),
        books: booksFinishedInRange(books, s, e).length,
      };
    });
  }, [books, activeYear]);

  const pagesPerMonth = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const s = `${activeYear}-${String(month).padStart(2, '0')}-01`;
      const e = `${activeYear}-${String(month).padStart(2, '0')}-${new Date(activeYear, month, 0).getDate()}`;
      return {
        month: new Date(activeYear, i).toLocaleString('en', { month: 'short' }),
        pages: pagesReadInRange(sessions, s, e),
      };
    });
  }, [sessions, activeYear]);

  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach((b) => b.genres.forEach((g) => { counts[g] = (counts[g] || 0) + 1; }));
    return Object.entries(counts)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [books]);

  const formatCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach((b) => { const key = b.format || 'Unknown'; counts[key] = (counts[key] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [books]);

  const ratingDist = useMemo(() => {
    const counts: Record<number, number> = {};
    books.forEach((b) => {
      if (b.rating) {
        const r = Math.round(b.rating);
        counts[r] = (counts[r] || 0) + 1;
      }
    });
    return [1, 2, 3, 4, 5].map((r) => ({ name: `${r}★`, value: counts[r] || 0 }));
  }, [books]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach((b) => {
      const key = b.readingStatus || 'want-to-read';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: statusLabel(name), value }));
  }, [books]);

  const authorCounts = useMemo(() => {
    const nameById = new Map(authors.map((a) => [a.id, a.name]));
    const counts: Record<string, number> = {};
    books.forEach((b) => b.authorIds.forEach((aid) => {
      const name = nameById.get(aid) ?? 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, [books, authors]);

  const bestMonth = [...booksPerMonth].sort((a, b) => b.books - a.books)[0];
  const topGenre = genreCounts[0];

  if (books.length === 0) {
    return (
      <div className="container py-20 text-center">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
        <h1 className="text-2xl font-serif font-bold text-text mb-2">No data yet</h1>
        <p className="text-text-secondary">Add books and log reading sessions to unlock your analytics.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-text">Statistics</h1>
          <p className="text-text-secondary">Insights from your actual reading records.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {dataYears.slice(0, 5).map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors border ${
                y === activeYear ? 'bg-accent text-white border-accent' : 'bg-surface text-text-secondary border-input hover:bg-elevated'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Books in library" value={stats.totalBooks} icon={BookIcon} />
        <StatCard title={`Finished in ${activeYear}`} value={finishedThisYear.length} icon={BookOpen} />
        <StatCard title={`Pages in ${activeYear}`} value={pagesThisYear.toLocaleString()} icon={FilePagesIcon} />
        <StatCard title={`Hours in ${activeYear}`} value={hoursThisYear} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-lg font-serif font-semibold text-text">Books finished per month</h3>
              <span className="text-xs text-text-muted">{activeYear}</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={booksPerMonth} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--c-border))" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={AXIS_TICK} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={AXIS_TICK} />
                  <Tooltip cursor={{ fill: 'rgb(var(--c-elevated))' }} contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="books" name="Books" fill="rgb(var(--c-accent))" radius={[6, 6, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-serif font-semibold text-text mb-4">Highlights</h3>
            <div className="space-y-4">
              <Highlight icon={Star} label="Average rating" value={stats.ratedBooks > 0 ? `${stats.averageRating.toFixed(1)} / 5` : 'Not rated yet'} />
              <Highlight icon={Flame} label="Best reading month" value={bestMonth && bestMonth.books > 0 ? `${bestMonth.month} · ${bestMonth.books} book${bestMonth.books === 1 ? '' : 's'}` : 'No finishes yet'} />
              <Highlight icon={Target} label="Top genre" value={topGenre ? `${topGenre.name} · ${topGenre.value} titles` : 'Add genres to see this'} />
              <Highlight icon={Heart} label="Favorites" value={`${stats.favoriteCount} book${stats.favoriteCount === 1 ? '' : 's'}`} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-serif font-semibold text-text mb-4">Pages read per month</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pagesPerMonth} margin={{ top: 8, right: 12, bottom: 0, left: -14 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--c-border))" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={AXIS_TICK} />
                  <YAxis tickLine={false} axisLine={false} tick={AXIS_TICK} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line type="monotone" dataKey="pages" name="Pages" stroke="rgb(var(--c-accent))" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <MiniChart title="Books by genre" data={genreCounts} type="pie" />
        <MiniChart title="Books by format" data={formatCounts} type="pie" />
        <MiniChart title="Rating distribution" data={ratingDist} type="pie" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="p-6">
            <h3 className="text-lg font-serif font-semibold text-text mb-4">Most read authors</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={authorCounts} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 22 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgb(var(--c-border))" />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={AXIS_TICK} />
                  <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} tick={AXIS_TICK} />
                  <Tooltip cursor={{ fill: 'rgb(var(--c-elevated))' }} contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="Books" fill="rgb(var(--c-gold))" radius={[0, 6, 6, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-serif font-semibold text-text mb-4">Library breakdown</h3>
            <div className="space-y-3">
              {statusCounts.map((s) => (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">{s.name}</span>
                  <span className="font-medium text-text">{s.value}</span>
                </div>
              ))}
              <div className="border-t border-input pt-3 flex items-center justify-between text-sm">
                <span className="text-text-secondary">Total pages</span>
                <span className="font-medium text-text">{stats.totalPages.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function FilePagesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" />
    </svg>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: number | string; icon: ComponentType<{ className?: string }> }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[11px] text-text-muted uppercase tracking-wider leading-tight">{title}</span>
      </div>
      <p className="text-2xl font-serif font-bold text-text">{value}</p>
    </Card>
  );
}

function Highlight({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-elevated text-text-secondary flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wider text-text-muted">{label}</p>
        <p className="text-sm font-medium text-text">{value}</p>
      </div>
    </div>
  );
}

function MiniChart({ title, data, type }: { title: string; data: { name: string; value: number }[]; type: 'pie' }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-serif font-semibold text-text mb-4">{title}</h3>
        {total === 0 ? (
          <p className="text-sm text-text-muted py-10 text-center">No data yet.</p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="h-48 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={38} outerRadius={72} paddingAngle={2} stroke="none">
                    {data.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-1.5 min-w-0">
              {data.slice(0, 6).map((d, i) => (
                <li key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-text-secondary truncate">{d.name}</span>
                  <span className="ml-auto text-text font-medium">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
