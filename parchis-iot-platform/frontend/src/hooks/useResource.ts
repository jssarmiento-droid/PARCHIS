import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';

interface ResourceState<T> {
  data: T | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setData: Dispatch<SetStateAction<T | null>>;
}

export function useResource<T>(loader: () => Promise<T>, deps: ReadonlyArray<unknown> = [], pollingMs = 0): ResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const hasData = useRef(false);

  const load = useCallback(async () => {
    const firstLoad = !hasData.current;
    if (firstLoad) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const result = await loader();
      if (mounted.current) {
        hasData.current = true;
        setData(result);
      }
    } catch {
      if (mounted.current) setError('No se pudo obtener la información. Revisa la conexión e inténtalo nuevamente.');
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, deps);

  useEffect(() => {
    mounted.current = true;
    load().catch(() => undefined);

    if (!pollingMs) {
      return () => {
        mounted.current = false;
      };
    }

    const interval = window.setInterval(() => {
      load().catch(() => undefined);
    }, pollingMs);

    return () => {
      mounted.current = false;
      window.clearInterval(interval);
    };
  }, [load, pollingMs]);

  return { data, loading, refreshing, error, reload: load, setData };
}
