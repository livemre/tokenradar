'use client';

import useSWR from 'swr';
import type { Token } from '@/lib/types/token';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useTokenDetail(mint: string) {
  const { data, error, isLoading } = useSWR(
    mint ? `/api/tokens/${mint}` : null,
    fetcher,
    { refreshInterval: 10000 }
  );

  return {
    token: data?.data as Token | undefined,
    isLoading,
    error,
  };
}
