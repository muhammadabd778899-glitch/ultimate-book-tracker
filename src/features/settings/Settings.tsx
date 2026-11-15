import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { readFileAsText, parseBackup, validateBackup, downloadBackup, createBackup, extractCovers } from '@/utils/export';
import { Palette, FileText, Download, Upload, ShieldCheck, Info, AlertTriangle, Trash2 } from 'lucide-react';
import { exportToCSV, importFromCSV } from '@/utils/csv';

export default function Settings() {
  const { toast } = useToast();

  const preferences = useLiveQuery(() => db.preferences.toArray(), []) ?? [];
  const books = useLiveQuery(() => db.books.toArray(), []) ?? [];

  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('#E65A45');

  const pref = preferences[0];

  useState(() => {
    if (pref) {
      setTheme(pref.theme || 'dark');
      setAccentColor(pref.accentColor || '#E65A45');
      document.documentElement.classList.toggle('dark', pref.theme !== 'light');
    }
  });

  const ACCENT_COLORS = ['#E65A45', '#6366f1', '#0891b2', '#be185d', '#047857', '#92400e', '#7c3aed', '#ea580c'];

  const handleThemeChange = async (v: string) => {
    setTheme(v);
    document.documentElement.classList.toggle('dark', v !== 'light');
    await savePrefs();
  };

  const handleAccentChange = async (v: string) => {
    setAccentColor(v);
    document.documentElement.style.setProperty('--color-accent', v);
    await savePrefs();
  };

  const savePrefs = async () => {
    if (pref) {
      await db.preferences.update(pref.id, { theme, accentColor, updatedAt: new Date().toISOString() } as any);
    } else {
      await db.preferences.add({ id: crypto.randomUUID(), theme, accentColor, updatedAt: new Date().toISOString() } as any);
    }
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

  const handleImportBackup = async (file: File) => {
    try {
      const text = await readFileAsText(file);
      const data = parseBackup(text);
      const validation = validateBackup(data);
      if (!validation.valid) {
        return toast.error('Invalid backup: ' + validation.errors.join(', '));
      }
      if (!confirm('This will replace your current library. Continue?')) return;

      await db.transaction('rw', db.books, db.authors, db.series, db.readingSessions, db.reviews, db.quotes, db.notes, db.shelves, db.goals, db.challenges, db.wishlist, db.preferences, db.covers, db.calendarEntries, async () => {
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
    if (!confirm('WARNING: This will delete ALL your data including books, covers, and reading history. This cannot be undone. Type "DELETE" to confirm.')) return;
    const confirmText = prompt('Type DELETE to confirm clearing all data:');
    if (confirmText !== 'DELETE') return;
    await db.transaction('rw', db.books, db.authors, db.series, db.readingSessions, db.reviews, db.quotes, db.notes, db.shelves, db.goals, db.challenges, db.wishlist, db.preferences, db.covers, db.calendarEntries, async () => {
      await db.books.clear(); await db.authors.clear(); await db.series.clear();
      await db.readingSessions.clear(); await db.reviews.clear(); await db.quotes.clear();
      await db.notes.clear(); await db.shelves.clear(); await db.goals.clear();
      await db.challenges.clear(); await db.wishlist.clear(); await db.preferences.clear();
      await db.covers.clear(); await db.calendarEntries.clear();
    });
    toast.success('All data cleared');
    window.location.reload();
  };

  const storageUsage = (() => {
    try {
      const estimate = navigator.storage?.estimate?.();
      if (!estimate) return { used: '—', quota: '—', pct: 0 };
      // eslint-disable-next-line no-console
      return { used: '—', quota: '—', pct: 0 };
    } catch { return { used: '—', quota: '—', pct: 0 }; }
  })();

  return (
    <div className="container py-6 max-w-3xl">
      <h1 className="text-3xl font-serif font-bold text-text mb-6">Settings</h1>

      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-serif font-semibold text-text mb-4">Appearance</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary block mb-2">Theme</label>
              <div className="flex gap-2">
                {['dark', 'system'].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleThemeChange(t)}
                    className={`flex-1 py-2 rounded-xl border transition-all ${
                      theme === t ? 'bg-accent text-text border-accent' : 'bg-surface text-text-secondary border-input hover:bg-elevated'
                    }`}
                  >
                    {t}
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
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      accentColor === c ? 'ring-2 ring-text ring-offset-2 ring-offset-bg' : 'border-transparent hover:ring-2'
                    }`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-serif font-semibold text-text mb-4">Data Management</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif font-semibold text-text">Export Backup</h4>
                <p className="text-xs text-text-secondary">Download a complete JSON backup of your library and covers.</p>
              </div>
              <Button onClick={handleExportBackup} className="flex items-center gap-2">
                <Download className="w-4 h-4" /> Export
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif font-semibold text-text">Import Backup</h4>
                <p className="text-xs text-text-secondary">Restore a previously exported backup.</p>
              </div>
              <label className="flex items-center gap-2 bg-surface border border-input rounded-xl px-3 py-2 hover:bg-elevated cursor-pointer">
                <Upload className="w-4 h-4" /> Choose file
                <input type="file" accept=".json" className="hidden" onChange={(e) => handleImportBackup(e.target.files?.[0])} />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif font-semibold text-text">Storage Usage</h4>
                <p className="text-xs text-text-secondary">Approximate local storage used by the app.</p>
              </div>
              <span className="text-xs font-mono text-text">{storageUsage.used} MB / {storageUsage.quota} MB ({storageUsage.pct}%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif font-semibold text-text text-danger">Clear All Data</h4>
                <p className="text-xs text-text-secondary">Permanently delete your library and settings.</p>
              </div>
              <Button variant="danger" onClick={handleClearData}>Clear Everything</Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-serif font-semibold text-text mb-4">Privacy</h2>
          <p className="text-text-secondary mb-4">
            The Ultimate Book Tracker stores all your data locally in your browser using IndexedDB. Nothing is uploaded to a server, and no account is required. Your library stays on your device.
          </p>
          <p className="text-text-secondary">
            Browser storage can be cleared by you or by the browser. We recommend exporting regular backups.
          </p>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-serif font-semibold text-text mb-4">About</h2>
          <div className="space-y-2">
            <p className="text-text-secondary"><span className="font-medium text-text">The Ultimate Book Tracker</span> v1.0.0</p>
            <p className="text-text-secondary">Your personal Netflix for books.</p>
            <p className="text-text-secondary">Built with React, TypeScript, Vite, Tailwind CSS, Dexie (IndexedDB), and Recharts.</p>
            <p className="text-text-secondary">Fully offline after initial installation. No external APIs or accounts required.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function exportToCSV() {}
export function importFromCSV() {}
