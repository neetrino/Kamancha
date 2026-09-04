import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { staticAssetUrl } from "@/lib/media/static-asset-url";

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

/**
 * Same pattern as ToonExpo: explicit public PNG (not App Router
 * `/opengraph-image?hash`). Prefer absolute R2 CDN URL so Telegram fetches
 * an image without our CSP / X-Frame-Options (toonexpo.com uses CDN the same way).
 */
const SHARE_IMAGE_PATH = "/assets/brand/og-share.png";
const SHARE_IMAGE_WIDTH = 1200;
const SHARE_IMAGE_HEIGHT = 630;

function resolveShareImageUrl(): string {
  const fromHelper = staticAssetUrl(SHARE_IMAGE_PATH);
  if (fromHelper.startsWith("http://") || fromHelper.startsWith("https://")) {
    return fromHelper;
  }

  const r2Base =
    process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_STATIC_ASSET_BASE_URL?.replace(/\/$/, "");
  if (r2Base) {
    return `${r2Base}${SHARE_IMAGE_PATH}`;
  }

  return SHARE_IMAGE_PATH;
}

const shareImageUrl = resolveShareImageUrl();

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: {
    default: "Kamancha",
    template: "%s · Kamancha",
  },
  description: "Multilingual e-commerce storefront",
  icons: {
    icon: {
      url: staticAssetUrl("/assets/brand/favicon.svg"),
      type: "image/svg+xml",
    },
    apple: staticAssetUrl("/assets/brand/apple-icon.png"),
  },
  openGraph: {
    type: "website",
    siteName: "Kamancha",
    title: "Kamancha",
    description: "Multilingual e-commerce storefront",
    url: "/",
    images: [
      {
        url: shareImageUrl,
        width: SHARE_IMAGE_WIDTH,
        height: SHARE_IMAGE_HEIGHT,
        alt: "Kamancha",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kamancha",
    description: "Multilingual e-commerce storefront",
    images: [shareImageUrl],
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
