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
    "Best free Solana memecoin tracker and token scanner. Detect new Solana tokens in under 5 seconds with automatic safety analysis, rug check, holder data, and live charts from Pump.fun, Raydium & Moonshot.",
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
    title: "TokenRadar — Best Free Solana Memecoin Tracker & Token Scanner",
    description:
      "Best free Solana memecoin tracker. Detect new tokens in under 5 seconds with memecoin safety checker, rug check, real-time token alerts & live charts from Pump.fun, Raydium & Moonshot.",
    url: SITE_URL,
    siteName: "TokenRadar",
    type: "website",
    locale: "en_US",
    alternateLocale: ["tr_TR", "es_ES", "pt_BR", "de_DE", "fr_FR", "ko_KR", "ja_JP", "zh_CN"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TokenRadar — Best Free Solana Memecoin Tracker",
    description:
      "Best free Solana memecoin tracker & token scanner. Real-time token alerts, safety checker, rug check & live charts. 24/7 monitoring.",
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
    "memecoin screener",
    "memecoin safety checker",
    "new solana tokens",
    "pump.fun new tokens",
    "solana rug check",
    "solana token safety",
    "real-time token alerts",
    "best memecoin tracker 2026",
    "pump.fun tracker",
    "raydium new tokens",
    "moonshot tokens",
    "rug pull detector",
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
      "Best free Solana memecoin tracker and token scanner. Real-time detection, memecoin safety checker, rug check, and live charts for new Solana tokens from Pump.fun, Raydium, and Moonshot.",
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
      "Best free Solana memecoin tracker and token scanner. Detect new Solana tokens in real-time with memecoin safety checker, Solana rug check, real-time token alerts, and live charts from Pump.fun, Raydium & Moonshot.",
    featureList: [
      "Real-time new Solana token detection in under 5 seconds",
      "Memecoin safety checker with automatic rug check",
      "Solana token scanner across Pump.fun, Raydium & Moonshot",
      "Real-time token alerts and notifications",
      "Mint & freeze authority verification",
      "Top holder concentration analysis",
      "Live OHLCV candlestick price charts",
      "Jupiter swap integration for instant trading",
      "Memecoin screener with advanced filters",
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
      {
        "@type": "Question",
        name: "Is TokenRadar the best memecoin tracker in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "TokenRadar is the only free Solana memecoin tracker that combines real-time token detection, automatic memecoin safety checker, trending algorithms, and live charts in one platform. Unlike other memecoin screeners, every feature is completely free.",
        },
      },
      {
        "@type": "Question",
        name: "How does the memecoin safety checker work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "TokenRadar's memecoin safety checker runs an automatic Solana rug check on every new token. It analyzes mint authority, freeze authority, top holder concentration, liquidity depth, and RugCheck data to assign a Safe, Warning, or Danger rating.",
        },
      },
      {
        "@type": "Question",
        name: "Can I get real-time token alerts for new Solana tokens?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. TokenRadar provides real-time token alerts for every new Solana token from Pump.fun, Raydium, and Moonshot. The Solana token scanner detects launches in under 5 seconds. Enable browser notifications to get alerted instantly.",
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
