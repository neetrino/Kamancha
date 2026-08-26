import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function isLocalhostUrl(value: string): boolean {
  try {
    const { hostname } = new URL(value);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/**
 * Absolute origin for OG/Twitter images.
 * Never emit localhost in production builds — crawlers cannot fetch it.
 */
function resolveMetadataBase(): URL {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl && !isLocalhostUrl(appUrl)) {
    return new URL(appUrl);
  }

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) {
    return new URL(
      productionHost.startsWith("http")
        ? productionHost
        : `https://${productionHost}`,
    );
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return new URL(
      vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`,
    );
  }

  if (appUrl) {
    return new URL(appUrl);
  }

  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: {
    default: "Kamancha",
    template: "%s · Kamancha",
  },
  description: "Multilingual e-commerce storefront",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Kamancha",
    title: "Kamancha",
    description: "Multilingual e-commerce storefront",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kamancha",
    description: "Multilingual e-commerce storefront",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hy" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-dvh flex-col antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
