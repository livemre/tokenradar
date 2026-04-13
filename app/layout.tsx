import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import { Providers } from "@/components/Providers";
import "./globals.css";

const GA_ID = "G-J4NCC9G52Q";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TokenRadar | Solana Token Radar",
  description:
    "Real-time token detection and safety analysis for Solana. Track new tokens from Pump.fun, Raydium, and Moonshot.",
  metadataBase: new URL("https://tokenradar.site"),
  openGraph: {
    title: "TokenRadar | Solana Token Radar",
    description: "Real-time token detection and safety analysis for Solana.",
    url: "https://tokenradar.site",
    siteName: "TokenRadar",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TokenRadar | Solana Token Radar",
    description: "Real-time token detection and safety analysis for Solana.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

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
