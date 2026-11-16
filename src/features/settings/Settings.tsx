import { useEffect, useState, type ReactNode } from 'react';
import { db, newId, nowISO } from '@/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import {
  readFileAsText,
  parseBackup,
  validateBackup,
  downloadBackup,
  createBackup,
  extractCovers,
  booksToCSV,
} from '@/utils/export';
import { Download, Upload, Info, AlertTriangle, FileText } from 'lucide-react';
import { applyTheme, DEFAULT_ACCENT } from '@/lib/theme';
import { useSafeLiveQuery } from '@/hooks/use-safe-live-query';

const ACCENT_COLORS = ['#E65A45', '#6366f1', '#0891b2', '#be185d', '#047857', '#92400e', '#7c3aed', '#ea580c'];
const THEMES = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
  { id: 'system', label: 'System' },
];

const ALL_TABLES = [
  db.books, db.authors, db.series, db.readingSessions, db.reviews, db.quotes, db.notes,
  db.shelves, db.goals, db.challenges, db.wishlist, db.preferences, db.covers, db.calendarEntries,
];

export default function Settings() {
  const { toast } = useToast();

  const preferences = useSafeLiveQuery(() => db.preferences.toArray(), []) ?? [];
  const books = useSafeLiveQuery(() => db.books.toArray(), []) ?? [];
  const pref = preferences[0];

  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState(DEFAULT_ACCENT);
  const [usage, setUsage] = useState<{ used: number; quota: number } | null>(null);

  useEffect(() => {
    if (!pref) return;
    setTheme(pref.theme || 'dark');
    setAccentColor(pref.accentColor || DEFAULT_ACCENT);
  }, [pref]);

  useEffect(() => {
    navigator.storage?.estimate?.().then((estimate) => {
      setUsage({ used: estimate.usage ?? 0, quota: estimate.quota ?? 0 });
    });
  }, []);

  const savePrefs = async (nextTheme: string, nextAccent: string) => {
    applyTheme(nextTheme, nextAccent);
    if (pref) {
      await db.preferences.update(pref.id, { theme: nextTheme, accentColor: nextAccent, updatedAt: new Date().toISOString() });
    } else {
      await db.preferences.add({ id: crypto.randomUUID(), theme: nextTheme, accentColor: nextAccent, updatedAt: new Date().toISOString() });
    }
  };

  const handleThemeChange = async (v: string) => {
    setTheme(v);
    await savePrefs(v, accentColor);
  };

  const handleAccentChange = async (v: string) => {
    setAccentColor(v);
    await savePrefs(theme, v);
  };

  const handleExportBackup = async () => {
    const authors = await db.authors.toArray();
    const series = await db.series.toArray();
    const sessions = await db.readingSessions.toArray();
    const reviews = await db.reviews.toArray();
    const quotes = await db.quotes.toArray();
    const notes = await db.notes.toArray();
    const shelves = await db.shelves.toArray();
    const goals = await db.goals.toArray();
    const challenges = await db.challenges.toArray();
    const wishlist = await db.wishlist.toArray();
    const covers = await db.covers.toArray();
    const calendarEntries = await db.calendarEntries.toArray();

    const json = createBackup({
      books, authors, series, readingSessions: sessions, reviews, quotes, notes,
      shelves, goals, challenges, wishlist, preferences, covers: extractCovers(covers), calendarEntries,
    });
    downloadBackup(json);
    toast.success('Backup exported');
  };

  const handleExportCSV = () => {
    if (books.length === 0) return toast.error('Your library is empty.');
    const csv = booksToCSV(books);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `book-tracker-library-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Library exported as CSV');
  };

  const handleImportBackup = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const data = parseBackup(text);
      const validation = validateBackup(data);
      if (!validation.valid) {
        return toast.error('Invalid backup: ' + validation.errors.join(', '));
      }
      if (!confirm('This will replace your current library. Continue?')) return;

      await db.transaction('rw', ALL_TABLES, async () => {
        await db.books.clear(); await db.authors.clear(); await db.series.clear();
        await db.readingSessions.clear(); await db.reviews.clear(); await db.quotes.clear();
        await db.notes.clear(); await db.shelves.clear(); await db.goals.clear();
        await db.challenges.clear(); await db.wishlist.clear(); await db.preferences.clear();
        await db.covers.clear(); await db.calendarEntries.clear();
        await db.books.bulkAdd(data.books);
        await db.authors.bulkAdd(data.authors);
        await db.series.bulkAdd(data.series);
        await db.readingSessions.bulkAdd(data.readingSessions);
        await db.reviews.bulkAdd(data.reviews);
        await db.quotes.bulkAdd(data.quotes);
        await db.notes.bulkAdd(data.notes);
        await db.shelves.bulkAdd(data.shelves);
        await db.goals.bulkAdd(data.goals);
        await db.challenges.bulkAdd(data.challenges);
        await db.wishlist.bulkAdd(data.wishlist);
        await db.preferences.bulkAdd(data.preferences);
        await db.covers.bulkAdd(data.covers);
        await db.calendarEntries.bulkAdd(data.calendarEntries);
      });
      toast.success('Backup restored');
      window.location.reload();
    } catch (err) {
      toast.error('Import failed: ' + (err as Error).message);
    }
  };

  const handleClearData = async () => {
    const confirmText = prompt('This deletes ALL books, covers and reading history permanently. Type DELETE to confirm:');
    if (confirmText !== 'DELETE') return;
    await db.transaction('rw', ALL_TABLES, async () => {
      for (const table of ALL_TABLES) await table.clear();
      // Keep a preferences row so the demo library is not re-seeded on reload.
      await db.preferences.add({
        id: newId(),
        theme,
        accentColor,
        defaultView: 'grid',
        defaultSort: 'recently-added',
        preferredReadingUnit: 'pages',
        weekStartDay: 0,
        dateFormat: 'MMM d, yyyy',
        language: 'en',
        animationsEnabled: true,
        compactMode: false,
        coverDisplayPreference: 'medium',
        updatedAt: nowISO(),
      });
    });
    toast.success('All data cleared');
    window.location.reload();
  };

  const usedMB = usage ? (usage.used / 1024 / 1024).toFixed(1) : '—';
  const quotaMB = usage ? Math.round(usage.quota / 1024 / 1024) : '—';
  const usagePct = usage && usage.quota > 0 ? Math.min(100, Math.round((usage.used / usage.quota) * 100)) : 0;

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-serif font-bold text-text mb-1">Settings</h1>
      <p className="text-text-secondary mb-6">Make the tracker look the way you like and keep your data safe.</p>

      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-serif font-semibold text-text mb-4">Appearance</h2>
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-2">Theme</label>
              <div className="flex gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`flex-1 py-2 rounded-xl border transition-all text-sm font-medium ${
                      theme === t.id
                        ? 'bg-accent/10 text-accent border-accent/50'
                        : 'bg-surface text-text-secondary border-input hover:bg-elevated'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-2">Accent Color</label>
              <div className="flex gap-2 flex-wrap">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleAccentChange(c)}
                    aria-label={`Accent ${c}`}
                    className={`w-9 h-9 rounded-full transition-all ${
                      accentColor === c
                        ? 'ring-2 ring-text ring-offset-2 ring-offset-card scale-105'
                        : 'ring-1 ring-black/10 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-serif font-semibold text-text mb-4">Data Management</h2>
          <div className="divide-y divide-input">
            <SettingRow
              title="Export Backup"
              description="Download a complete JSON backup of your library and covers."
              action={<Button onClick={handleExportBackup} className="flex items-center gap-2"><Download className="w-4 h-4" /> Export</Button>}
            />
            <SettingRow
              title="Export CSV"
              description="Download a spreadsheet-friendly list of every book."
              action={<Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2"><FileText className="w-4 h-4" /> CSV</Button>}
            />
            <SettingRow
              title="Import Backup"
              description="Restore a previously exported backup."
              action={
                <label className="flex items-center gap-2 bg-surface border border-input rounded-xl px-4 py-2 text-sm font-medium hover:bg-elevated cursor-pointer">
                  <Upload className="w-4 h-4" /> Choose file
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={(e) => {
                      handleImportBackup(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </label>
              }
            />
            <SettingRow
              title="Storage Usage"
              description="Approximate local storage used by the app."
              action={
                <div className="text-right text-xs font-mono text-text-secondary">
                  {usedMB} MB / {quotaMB} MB
                  <div className="mt-1 h-1.5 w-28 rounded-full bg-elevated overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${usagePct}%` }} />
                  </div>
                </div>
              }
            />
            <SettingRow
              title="Clear All Data"
              description="Permanently delete your library and settings."
              action={<Button variant="danger" onClick={handleClearData}>Clear everything</Button>}
            />
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-serif font-semibold text-text mb-4">Privacy</h2>
          <div className="flex gap-3 rounded-xl bg-success/10 p-4">
            <Info className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <p className="text-sm text-text-secondary">
              The Ultimate Book Tracker stores all your data locally in your browser using IndexedDB. Nothing is uploaded to a server, and no account is required. Your library stays on your device.
            </p>
          </div>
          <div className="mt-3 flex gap-3 rounded-xl bg-warning/10 p-4">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-text-secondary">
              Browser storage can be cleared by you or by the browser. Export a backup regularly so you never lose your reading history.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-serif font-semibold text-text mb-3">About</h2>
          <p className="text-text-secondary mb-1"><span className="font-medium text-text">The Ultimate Book Tracker</span> · v1.0.0</p>
          <p className="text-text-secondary">Your personal Netflix for books.</p>
          <p className="text-xs text-text-muted mt-3">Built with React, TypeScript, Vite, Tailwind CSS, Dexie (IndexedDB) and Recharts. Fully offline after the first load. No accounts, no external APIs.</p>
        </div>
      </Card>
    </div>
  );
}

function SettingRow({ title, description, action }: { title: string; description: string; action: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div>
        <h4 className="font-serif font-semibold text-text">{title}</h4>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
      {action}
    </div>
  );
}
