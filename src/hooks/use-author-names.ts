import { useMemo } from 'react';
import { db } from '@/db';
import { useSafeLiveQuery } from '@/hooks/use-safe-live-query';

export function useAuthorNames() {
  const authors = useSafeLiveQuery(() => db.authors.toArray(), []) ?? [];
  const map = useMemo(() => new Map(authors.map((a) => [a.id, a.name])), [authors]);

  const nameFor = (ids?: string[] | null, fallback = 'Unknown author'): string => {
    const names = (ids ?? []).map((id) => map.get(id)).filter(Boolean) as string[];
    return names.length > 0 ? names.join(', ') : fallback;
  };

  return { authors, nameFor };
}
