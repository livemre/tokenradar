'use client';

import useSWR from 'swr';
import { useState, useCallback, useMemo } from 'react';
import type { TrendingToken, TrendingPeriod, TokenSource, SafetyLevel } from '@/lib/types/token';

interface TrendingListResponse {
  data: TrendingToken[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface TrendingFilters {
  period: TrendingPeriod;
  source: TokenSource | '';
  safety: SafetyLevel | '';
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useTrendingTokens() {
  const [filters, setFilters] = useState<TrendingFilters>({
    period: '6h',
    source: '',
    safety: '',
  });
  const [page, setPage] = useState(1);
  const pageSize = 30;

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());
    params.set('period', filters.period);
    if (filters.source) params.set('source', filters.source);
    if (filters.safety) params.set('safety', filters.safety);
    return params.toString();
  }, [filters, page]);

  const { data, error, isLoading, mutate } = useSWR<TrendingListResponse>(
    `/api/tokens/trending?${queryString}`,
    fetcher,
    { refreshInterval: 30000, keepPreviousData: true }
  );

  const updateFilter = useCallback((key: keyof TrendingFilters, value: string) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  return {
    tokens: data?.data || [],
    total: data?.total || 0,
    page,
    totalPages: data?.totalPages || 1,
    pageSize,
    isLoading,
    error,
    filters,
    setPage,
    updateFilter,
    refresh: mutate,
  };
}
