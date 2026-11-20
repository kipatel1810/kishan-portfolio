import { useEffect, useState } from 'react';
import type { Loaded } from '../api/client';
import type { DataSource } from '../api/types';

/** Runs an API loader once (or when deps change). Loaders never reject: they fall back to static data. */
export function useApi<T>(loader: () => Promise<Loaded<T>>, deps: unknown[] = []) {
  const [state, setState] = useState<{ data: T | null; source: DataSource | null; loading: boolean }>({
    data: null,
    source: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true }));
    loader().then(({ data, source }) => {
      if (active) setState({ data, source, loading: false });
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
