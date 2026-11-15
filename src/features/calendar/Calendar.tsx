import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Calendar as CalendarIcon, Book, Clock, History } from 'lucide-react';
import { todayISO, formatDate, getMonthRange, isSameDay } from '@/utils/date';

export default function Calendar() {
  const { toast } = useToast();

  const sessions = useLiveQuery(() => db.readingSessions.toArray(), []) ?? [];
  const books = useLiveQuery(() => db.books.toArray(), []) ?? [];
  const [date, setDate] = useState(todayISO());

  const [year, month] = date.split('-').map(Number);
  const { start, end } = getMonthRange(year, month - 1);

  const monthSessions = sessions.filter((s) => s.date >= start && s.date <= end);
  const bookById = (id: string) => books.find((b) => b.id === id);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const prevMonth = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const nextMonth = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  const daySessionsForSelected = monthSessions.filter((s) => s.date === date);

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-text">Reading Calendar</h1>
          <p className="text-text-secondary">View your reading sessions by date.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setDate(`${prevMonth.y}-${String(prevMonth.m).padStart(2, '0')}-01`)}>
            <CalendarIcon className="w-3 h-3 mr-1" /> Prev
          </Button>
          <span className="text-xl font-serif font-bold text-text px-4">{monthName} {year}</span>
          <Button size="sm" onClick={() => setDate(`${nextMonth.y}-${String(nextMonth.m).padStart(2, '0')}-01`)}>
            Next <CalendarIcon className="w-3 h-3 ml-1" />
          </Button>
          <Button size="sm" onClick={() => setDate(todayISO())}>Today</Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-text-muted">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`blank-${i}`} className="h-24" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const daySessions = monthSessions.filter((s) => s.date === dateStr);
          const isToday = isSameDay(dateStr, todayISO());
          return (
            <div
              key={d}
              className={`h-24 rounded-xl border border-transparent transition-all flex flex-col items-center justify-center p-1 cursor-pointer ${
                isToday ? 'ring-2 ring-accent' : ''
              } ${daySessions.length > 0 ? 'bg-accent/10 border-accent/30' : 'bg-surface hover:bg-elevated'}`}
            >
              <span className="text-sm font-semibold text-text {isToday ? 'text-accent' : ''}">{d}</span>
              {daySessions.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {daySessions.slice(0, 3).map((s) => (
                    <div key={s.id} className="w-2 h-2 rounded-full bg-accent" />
                  ))}
                  {daySessions.length > 3 && <span className="text-[10px] text-text-muted">+{daySessions.length - 3}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-serif font-semibold text-text mb-4">Activity on {formatDate(date)}</h2>
        {daySessionsForSelected.length === 0 ? (
          <div className="text-center py-10 text-text-muted">
            <Book className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No reading activity on this date.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {daySessionsForSelected.map((s) => {
              const b = bookById(s.bookId);
              return (
                <Card key={s.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-serif font-semibold text-text">{b ? b.title : 'Unknown Book'}</h4>
                    <span className="text-xs font-mono text-text-muted">{s.date}</span>
                  </div>
                  <p className="text-sm text-text-secondary">{s.pagesRead ?? 0} pages • {s.durationMinutes ?? 0} min</p>
                  {s.notes && <p className="text-xs text-text-muted mt-1">{s.notes}</p>}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
