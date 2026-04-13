'use client';

import useSWR from 'swr';
import { useState, useCallback, useMemo } from 'react';
import type { Token, TokenSource, SafetyLevel } from '@/lib/types/token';

export interface TokenListFilters {
  search: string;
  source: TokenSource | '';
  safety: SafetyLevel | '';
  sort: string;
  order: 'asc' | 'desc';
  minMcap: string;
  maxMcap: string;
  minHolders: string;
  enrichedOnly: boolean;
}

interface TokenListResponse {
  data: Token[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const DEFAULT_FILTERS: TokenListFilters = {
  search: '',
  source: '',
  safety: '',
  sort: 'detected_at',
  order: 'desc',
  minMcap: '',
  maxMcap: '',
  minHolders: '',
  enrichedOnly: false,
};

export function useTokenList(initialFilters?: Partial<TokenListFilters>) {
  const [filters, setFilters] = useState<TokenListFilters>({ ...DEFAULT_FILTERS, ...initialFilters });
  const [page, setPage] = useState(1);
  const pageSize = 30;

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());

    if (filters.search) params.set('search', filters.search);
    if (filters.source) params.set('source', filters.source);
    if (filters.safety) params.set('safety', filters.safety);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.order) params.set('order', filters.order);
    if (filters.minMcap) params.set('minMcap', filters.minMcap);
    if (filters.maxMcap) params.set('maxMcap', filters.maxMcap);
    if (filters.minHolders) params.set('minHolders', filters.minHolders);
    if (filters.enrichedOnly) params.set('enrichedOnly', 'true');

    return params.toString();
  }, [filters, page]);

  const { data, error, isLoading, mutate } = useSWR<TokenListResponse>(
    `/api/tokens?${queryString}`,
    fetcher,
    { refreshInterval: 15000, keepPreviousData: true }
  );

  const updateFilter = useCallback((key: keyof TokenListFilters, value: string | boolean) => {
    setPage(1); // Reset to page 1 on filter change
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setPage(1);
    setFilters(DEFAULT_FILTERS);
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
    resetFilters,
    refresh: mutate,
  };
}
