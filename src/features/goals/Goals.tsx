import { useState } from 'react';
import { db, newId, nowISO } from '@/db';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { computeLibraryStats, booksFinishedInRange, pagesReadInRange, readingHoursInRange, getYearRange, todayISO } from '@/utils/date';
import { Book, Target, Flag, Trophy, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSafeLiveQuery } from '@/hooks/use-safe-live-query';

export default function Goals() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const books = useSafeLiveQuery(() => db.books.toArray(), []) ?? [];
  const goals = useSafeLiveQuery(() => db.goals.toArray(), []) ?? [];
  const sessions = useSafeLiveQuery(() => db.readingSessions.toArray(), []) ?? [];
  const challenges = useSafeLiveQuery(() => db.challenges.toArray(), []) ?? [];

  const [form, setForm] = useState({ name: 'Annual Goal', target: '12', period: 'year' as const, startDate: '', endDate: '' });
  const [open, setOpen] = useState(false);

  const year = new Date().getFullYear();
  const { start, end } = getYearRange(year);
  if (!form.startDate) form.startDate = start;
  if (!form.endDate) form.endDate = end;

  const finishedThisYear = booksFinishedInRange(books, start, end).length;
  const pagesThisYear = pagesReadInRange(sessions, start, end);
  const hoursThisYear = readingHoursInRange(sessions, start, end);
  const stats = computeLibraryStats(books);

  const handleAddGoal = async () => {
    if (!form.name.trim() || !form.target) return toast.error('Name and target required.');
    await db.goals.add({
      id: newId(),
      name: form.name.trim(),
      goalType: 'books',
      target: Number(form.target),
      period: form.period,
      startDate: form.startDate || start,
      endDate: form.endDate || end,
      currentProgress: finishedThisYear,
      status: 'active',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    } as any);
    setForm({ name: 'Annual Goal', target: '12', period: 'year', startDate: start, endDate: end });
    setOpen(false);
    toast.success('Goal created');
  };

  const handleUpdateProgress = async (id: string) => {
    const g = await db.goals.get(id);
    if (!g) return;
    await db.goals.update(id, { currentProgress: finishedThisYear, status: finishedThisYear >= (g.target || 0) ? 'completed' : 'active', updatedAt: nowISO() } as any);
    toast.success('Goal progress updated');
  };

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-text">Reading Goals & Challenges</h1>
          <p className="text-text-secondary">Set goals, track progress, and earn achievements.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Books Finished This Year" value={finishedThisYear} target={12} icon={Book} />
        <StatCard label="Pages Read This Year" value={pagesThisYear} icon={Book} />
        <StatCard label="Reading Hours" value={hoursThisYear} icon={Book} />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-serif font-semibold text-text mb-4">Active Goals</h2>
        <div className="space-y-3">
          {goals.length === 0 ? (
            <div className="text-center py-10 text-text-muted">No goals set yet.</div>
          ) : (
            goals.map((g) => {
              const pct = g.target ? Math.min(Math.round((g.currentProgress / g.target) * 100), 100) : 0;
              return (
                <Card className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-serif font-semibold text-text">{g.name}</h4>
                      <p className="text-xs text-text-secondary">{g.period} • {g.status}</p>
                    </div>
                    <span className="text-xs font-mono text-accent font-bold">{g.currentProgress} / {g.target}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-elevated overflow-hidden mb-2">
                    <div className="h-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-text-muted">{pct}% complete</p>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-serif font-semibold text-text mb-4">Challenges</h2>
        <div className="space-y-3">
          {challenges.length === 0 ? (
            <div className="text-center py-10 text-text-muted">No challenges yet.</div>
          ) : (
            challenges.map((c) => (
              <Card key={c.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-serif font-semibold text-text">{c.name}</h4>
                    <p className="text-xs text-text-secondary">{c.description || ''}</p>
                  </div>
                  <span className="text-xs font-mono text-accent">{c.progress} / {c.target}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-elevated overflow-hidden mb-2">
                  <div className="h-full bg-gold transition-all duration-500" style={{ width: `${Math.min(Math.round((c.progress / c.target) * 100), 100)}%` }} />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <DialogAddGoal open={open} onOpenChange={setOpen} form={form} setForm={setForm} onAdd={handleAddGoal} />

      <div className="mt-8">
        <Button onClick={() => navigate('/statistics')} className="flex items-center gap-2">
          View Statistics <ArrowUpRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );

  function StatCard({ label, value, target, icon: Icon }: { label: string; value: number; target?: number; icon: any }) {
    const pct = target ? Math.min(Math.round((value / target) * 100), 100) : 0;
    return (
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-2xl font-serif font-bold text-text">{value}</p>
        {target && <p className="text-xs text-text-secondary">of {target} target ({pct}%)</p>}
      </Card>
    );
  }
}

function DialogAddGoal({ open, onOpenChange, form, setForm, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; form: any; setForm: any; onAdd: () => void }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-input bg-card shadow-cover animate-scale-in">
        <div className="p-6">
          <h2 className="text-lg font-serif font-semibold text-text mb-4">Create Goal</h2>
          <form onSubmit={(e) => { e.preventDefault(); onAdd(); onOpenChange(false); }} className="space-y-3">
            <Input label="Goal Name *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Target" type="number" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
              <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className="w-full h-10 rounded-xl border border-input bg-surface px-3 py-2 text-text focus:outline-none focus:ring-1 focus:ring-accent">
                <option value="year">Year</option>
                <option value="month">Month</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start Date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
              <Input label="End Date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => onOpenChange(false)} className="flex-1 h-10 rounded-xl border border-input bg-surface text-text-secondary hover:bg-elevated">
                Cancel
              </button>
              <button type="submit" className="flex-1 h-10 rounded-xl bg-accent text-text">Create Goal</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
