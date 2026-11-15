import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { useToast } from '@/components/ui/toast';
import { computeLibraryStats, booksFinishedInRange, pagesReadInRange, readingHoursInRange, getYearRange, formatDate } from '@/utils/date';
import { Book, BarChart3, PieChart as PieIcon, BookOpen, Clock, Users } from 'lucide-react';

const COLORS = ['#E65A45', '#0891b2', '#be185d', '#047857', '#92400e', '#7c3aed', '#ea580c', '#c026d3', '#475569', '#0f172a'];

export default function Statistics() {
  const { toast } = useToast();

  const books = useLiveQuery(() => db.books.toArray(), []) ?? [];
  const sessions = useLiveQuery(() => db.readingSessions.toArray(), []) ?? [];

  const year = new Date().getFullYear();
  const { start, end } = getYearRange(year);
  const stats = computeLibraryStats(books);
  const finishedThisYear = booksFinishedInRange(books, start, end);
  const pagesThisYear = pagesReadInRange(sessions, start, end);
  const hoursThisYear = readingHoursInRange(sessions, start, end);

  // Books per month (this year)
  const booksPerMonth = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map((m) => {
      const s = `${year}-${String(m).padStart(2, '0')}-01`;
      const e = `${year}-${String(m).padStart(2, '0')}-${new Date(year, m, 0).getDate()}`;
      return { month: new Date(year, m - 1).toLocaleString('default', { month: 'short' }), count: booksFinishedInRange(books, s, e).length };
    });
  }, [books, year]);

  // Pages per month
  const pagesPerMonth = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map((m) => {
      const s = `${year}-${String(m).padStart(2, '0')}-01`;
      const e = `${year}-${String(m).padStart(2, '0')}-${new Date(year, m, 0).getDate()}`;
      return { month: new Date(year, m - 1).toLocaleString('default', { month: 'short' }), pages: pagesReadInRange(sessions, s, e) };
    });
  }, [sessions, year]);

  // Books by genre
  const genreCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach((b) => b.genres.forEach((g) => { counts[g] = (counts[g] || 0) + 1; }));
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [books]);

  // Books by format
  const formatCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach((b) => { counts[b.format || 'Unknown'] = (counts[b.format || 'Unknown'] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [books]);

  // Rating distribution
  const ratingDist = useMemo(() => {
    const counts: Record<number, number> = {};
    books.forEach((b) => { if (b.rating) { const r = Math.round(b.rating); counts[r] = (counts[r] || 0) + 1; } });
    return [1, 2, 3, 4, 5].map((r) => ({ rating: `${r}★`, value: counts[r] || 0 }));
  }, [books]);

  // Reading status breakdown
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach((b) => { counts[b.readingStatus || 'want-to-read'] = (counts[b.readingStatus || 'want-to-read'] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [books]);

  // Most read authors
  const authorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach((b) => b.authorIds.forEach((aid) => { counts[aid] = (counts[aid] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([aid, value]) => ({ name: aid, value }));
  }, [books]);

  const RADIANS = [0, 90, 180, 270];
  const RADIAN_MAP: Record<number, number> = { 0: 0, 90: 90, 180: 180, 270: 270 };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-text">Statistics</h1>
          <p className="text-text-secondary">Insights from your actual reading records.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Books" value={stats.totalBooks} icon={Book} />
        <StatCard title="Finished This Year" value={finishedThisYear.length} icon={BookOpen} />
        <StatCard title="Pages Read This Year" value={pagesThisYear} icon={Book} />
        <StatCard title="Reading Hours" value={hoursThisYear} icon={Clock} />
        <StatCard title="Average Rating" value={stats.averageRating || '—'} icon={Users} />
        <StatCard title="Favorites" value={stats.favoriteCount} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-serif font-semibold text-text mb-4">Books Read Per Month</h3>
              <BarChart width={600} height={300} data={booksPerMonth} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <Tooltip />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#77747E' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#77747E' }} />
                <Bar dataKey="count" fill="#E65A45" radius={[4, 4, 0, 0]} />
              </BarChart>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MiniChart title="Pages Read Per Month" data={pagesPerMonth} dataKey="pages" color="#0891b2" />
        <MiniChart title="Books by Genre" data={genreCounts} dataKey="value" color="#be185d" type="pie" />
        <MiniChart title="Books by Format" data={formatCounts} dataKey="value" color="#92400e" type="pie" />
        <MiniChart title="Rating Distribution" data={ratingDist} dataKey="value" color="#047857" type="pie" />
        <MiniChart title="Reading Status" data={statusCounts} dataKey="value" color="#7c3aed" type="pie" />
        <MiniChart title="Most Read Authors" data={authorCounts} dataKey="value" color="#ea580c" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-serif font-semibold text-text mb-4">Reading Insights</h3>
            <div className="space-y-3">
              <InsightRow label="Books in library" value={stats.totalBooks} />
              <InsightRow label="Currently reading" value={stats.currentlyReading} />
              <InsightRow label="Want to read" value={stats.wantToRead} />
              <InsightRow label="Finished" value={stats.finished} />
              <InsightRow label="On hold" value={stats.onHold} />
              <InsightRow label="Did not finish" value={stats.didNotFinish} />
              <InsightRow label="Average rating" value={stats.ratedBooks > 0 ? stats.averageRating.toFixed(1) : '—'} />
              <InsightRow label="Total pages tracked" value={stats.totalPages} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-serif font-semibold text-text mb-4">Milestones</h3>
            <div className="space-y-4">
              <Milestone title="First Book Finished" unlocked={stats.finished > 0} />
              <Milestone title="Five Books Read" unlocked={stats.finished >= 5} />
              <Milestone title="Ten Books Read" unlocked={stats.finished >= 10} />
              <Milestone title="Series Finisher" unlocked={false} />
              <Milestone title="Genre Explorer" unlocked={genreCounts.length >= 3} />
              <Milestone title="Hundred Hours Read" unlocked={hoursThisYear >= 100} />
            </div>
          </div>
        </Card>
      </div>

      {books.length === 0 && (
        <div className="text-center py-20 text-text-muted">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-serif font-semibold text-text">No data yet</h3>
          <p>Add books and log reading sessions to see your analytics.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: number | string; icon: any }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs text-text-muted uppercase tracking-wider">{title}</span>
      </div>
      <p className="text-2xl font-serif font-bold text-text">{value}</p>
    </Card>
  );
}

function InsightRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="text-text font-medium">{value}</span>
    </div>
  );
}

function Milestone({ title, unlocked }: { title: string; unlocked: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-accent/30 transition-colors">
      <div className={`w-3 h-3 rounded-full ${unlocked ? 'bg-success' : 'bg-surface/50'}`} />
      <span className={`text-sm ${unlocked ? 'text-text' : 'text-text-muted'}`}>{title}</span>
      {unlocked && <span className="text-xs text-success font-medium ml-auto">Unlocked</span>}
    </div>
  );
}

function MiniChart({ title, data, dataKey, color, type }: { title: string; data: any[]; dataKey: string; color: string; type?: 'bar' | 'pie' }) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-serif font-semibold text-text mb-3">{title}</h3>
      <div className="h-48">
        {type === 'pie' ? (
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
              fill="#888"
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        ) : (
          <BarChart>
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </div>
    </Card>
  );
}
