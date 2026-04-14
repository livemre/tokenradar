import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import { Providers } from "@/components/Providers";
import "./globals.css";

const GA_ID = "G-J4NCC9G52Q";
const SITE_URL = "https://tokenradar.site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TokenRadar — Real-Time Solana Memecoin Tracker & Safety Scanner",
    template: "%s | TokenRadar",
  },
  description:
    "Detect new Solana memecoins in under 5 seconds. Free 24/7 rug-pull detection, safety scores, holder analysis, and live charts from Pump.fun, Raydium & Moonshot.",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    languages: {
      "en": "/",
      "tr": "/",
      "es": "/",
      "pt": "/",
      "de": "/",
      "fr": "/",
      "ko": "/",
      "ja": "/",
      "zh": "/",
    },
  },
  openGraph: {
    title: "TokenRadar — Free Solana Memecoin Radar & Safety Scanner",
    description:
      "Detect new Solana tokens in < 5s. Free rug-pull detection, safety scores, holder analysis & live charts. 24/7 monitoring from Pump.fun, Raydium & Moonshot.",
    url: SITE_URL,
    siteName: "TokenRadar",
    type: "website",
    locale: "en_US",
    alternateLocale: ["tr_TR", "es_ES", "pt_BR", "de_DE", "fr_FR", "ko_KR", "ja_JP", "zh_CN"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TokenRadar — Free Solana Memecoin Radar",
    description:
      "Detect new tokens in < 5s. Free rug-pull detection, safety scores & live charts. 24/7 monitoring.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  keywords: [
    "solana memecoin tracker",
    "solana token scanner",
    "pump.fun tracker",
    "memecoin radar",
    "rug pull detector",
    "solana token safety",
    "raydium new tokens",
    "moonshot tokens",
    "crypto safety scanner",
    "solana dex tracker",
  ],
  category: "Finance",
  other: {
    "theme-color": "#0a0a12",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TokenRadar",
    url: SITE_URL,
    description:
      "Real-time token detection and safety analysis for Solana. Track new tokens from Pump.fun, Raydium, and Moonshot.",
    publisher: {
      "@type": "Organization",
      name: "TokenRadar",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.ico`,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/tokens?tab=explore&q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "TokenRadar",
    url: SITE_URL,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free real-time Solana memecoin detection and safety analysis. Track tokens from Pump.fun, Raydium & Moonshot with rug-pull detection, safety scores, and live charts.",
    featureList: [
      "Real-time token detection in under 5 seconds",
      "Rug-pull safety scoring and analysis",
      "Mint & freeze authority checks",
      "Top holder concentration analysis",
      "Live price charts with OHLCV data",
      "Jupiter swap integration",
      "Push notifications for new tokens",
      "Multi-language support (9 languages)",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is TokenRadar?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "TokenRadar is a free real-time Solana memecoin tracker that detects new tokens from Pump.fun, Raydium, and Moonshot in under 5 seconds. It provides safety scores, rug-pull detection, holder analysis, and live price charts.",
        },
      },
      {
        "@type": "Question",
        name: "How fast does TokenRadar detect new tokens?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "TokenRadar detects new Solana tokens in under 5 seconds using real-time WebSocket connections to Pump.fun and polling DexScreener for Raydium and Moonshot migrations.",
        },
      },
      {
        "@type": "Question",
        name: "Is TokenRadar free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, TokenRadar is completely free. You can track tokens, view safety scores, check charts, and receive notifications without any payment or mandatory sign-up.",
        },
      },
      {
        "@type": "Question",
        name: "How does the safety score work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "TokenRadar calculates safety scores using multiple on-chain data points: RugCheck analysis, mint and freeze authority status, top holder concentration, and liquidity levels. Tokens are rated as Safe, Warning, or Danger based on a weighted composite score.",
        },
      },
      {
        "@type": "Question",
        name: "What DEX sources does TokenRadar monitor?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "TokenRadar monitors three Solana DEX sources: Pump.fun (new token launches), Raydium (graduated tokens), and Moonshot by DEXScreener. All sources are tracked 24/7 in real-time.",
        },
      },
    ],
  },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        <meta name="theme-color" content="#0a0a12" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <Toaster
              position="bottom-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: 'rgba(17, 17, 24, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#ededed',
                  backdropFilter: 'blur(12px)',
                },
              }}
            />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
