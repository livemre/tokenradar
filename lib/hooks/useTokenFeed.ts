'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { Token } from '@/lib/types/token';

const MAX_TOKENS = 50;
const POLL_INTERVAL_MS = 15_000; // 15 seconds

/**
 * Polls /api/tokens every 10s instead of Supabase Realtime.
 * Edge-cached API means thousands of users share one DB query.
 * No WebSocket = no connection limit bottleneck.
 */
export function useTokenFeed(onNewToken?: (token: Token) => void) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [newTokenIds, setNewTokenIds] = useState<Set<string>>(new Set());
  const knownMintsRef = useRef<Set<string>>(new Set());
  const newTokenTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const onNewTokenRef = useRef(onNewToken);

  useEffect(() => {
    onNewTokenRef.current = onNewToken;
  }, [onNewToken]);

  const fetchTokens = useCallback(async () => {
    try {
      const res = await fetch(`/api/tokens?page=1&pageSize=${MAX_TOKENS}&sort=detected_at&order=desc`);
      if (!res.ok) return;

      const { data } = await res.json() as { data: Token[] };
      if (!data) return;

      setIsConnected(true);

      // Detect new tokens by comparing with known mints
      if (knownMintsRef.current.size > 0) {
        for (const token of data) {
          if (!knownMintsRef.current.has(token.mint)) {
            // New token detected
            onNewTokenRef.current?.(token);

            setNewTokenIds((prev) => new Set(prev).add(token.mint));
            const timer = setTimeout(() => {
              setNewTokenIds((prev) => {
                const next = new Set(prev);
                next.delete(token.mint);
                return next;
              });
            }, 5000);
            newTokenTimers.current.set(token.mint, timer);
          }
        }
      }

      // Update known mints
      knownMintsRef.current = new Set(data.map((t) => t.mint));
      setTokens(data);
    } catch {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchTokens();

    // Poll every 10s
    const interval = setInterval(fetchTokens, POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      newTokenTimers.current.forEach((timer) => clearTimeout(timer));
    };
  }, [fetchTokens]);

  return { tokens, isConnected, newTokenIds };
}
