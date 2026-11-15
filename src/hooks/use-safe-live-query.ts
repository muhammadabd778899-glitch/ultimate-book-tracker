import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback } from 'react';

/**
 * Wraps useLiveQuery so that a throwing database query (e.g. IndexedDB blocked,
 * database not yet open) does not crash the React render tree.
 * Returns the live query result (or undefined while loading / on error).
 */
export function useSafeLiveQuery<T>(
  query: () => Promise<T> | T,
  deps: unknown[]
): T | undefined {
  const safeQuery = useCallback(() => {
    try {
      return query();
    } catch {
      return undefined as unknown as T;
    }
  }, deps);

  return useLiveQuery(safeQuery, deps);
}
