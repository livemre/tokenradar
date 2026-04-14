import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.dexscreener.com' },
      { protocol: 'https', hostname: 'arweave.net' },
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.jup.ag https://api.dexscreener.com https://api.geckoterminal.com https://blog.tokenradar.site https://www.google-analytics.com https://mainnet.helius-rpc.com",
              "frame-src 'self' https://www.youtube.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
