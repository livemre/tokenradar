import { logger } from '../utils/logger.js';

export interface TokenMetadata {
  name: string | null;
  symbol: string | null;
  image: string | null;
}

const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
];

function resolveUri(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    return IPFS_GATEWAYS[0] + uri.slice(7);
  }
  return uri;
}

export async function fetchTokenMetadata(uri: string | null): Promise<TokenMetadata | null> {
  if (!uri) return null;

  const resolvedUri = resolveUri(uri);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(resolvedUri, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();

    return {
      name: data.name || null,
      symbol: data.symbol || null,
      image: data.image || data.imageUrl || data.logo || null,
    };
  } catch {
    // Try alternative IPFS gateways if it's an IPFS URI
    if (uri.startsWith('ipfs://') || uri.includes('/ipfs/')) {
      const hash = uri.includes('/ipfs/')
        ? uri.split('/ipfs/').pop()
        : uri.slice(7);

      for (let i = 1; i < IPFS_GATEWAYS.length; i++) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);

          const res = await fetch(IPFS_GATEWAYS[i] + hash, {
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (!res.ok) continue;
          const data = await res.json();
          return {
            name: data.name || null,
            symbol: data.symbol || null,
            image: data.image || data.imageUrl || data.logo || null,
          };
        } catch {
          continue;
        }
      }
    }

    return null;
  }
}
