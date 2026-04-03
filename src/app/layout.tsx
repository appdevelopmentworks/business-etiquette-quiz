import type { Metadata } from "next";
import Link from "next/link";

import { BottomNav } from "@/components/BottomNav";

import "./globals.css";

const siteUrl = resolveSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ビジネスマナークイズ",
  description: "新卒女性社員向けの、やさしく可愛いビジネスマナー学習アプリ",
  applicationName: "ビジネスマナークイズ",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "/",
    title: "ビジネスマナークイズ",
    description: "新卒女性社員向けの、やさしく可愛いビジネスマナー学習アプリ",
  },
  twitter: {
    card: "summary_large_image",
    title: "ビジネスマナークイズ",
    description: "新卒女性社員向けの、やさしく可愛いビジネスマナー学習アプリ",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <div className="site-frame">
          <header className="site-header">
            <Link href="/" className="brand">
              <span className="brand__badge">MVP</span>
              <div>
                <strong>ビジネスマナークイズ</strong>
                <p>新卒女性社員研修向けのやさしい学習アプリ</p>
              </div>
            </Link>
          </header>
          <main className="site-main">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}

function resolveSiteUrl() {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_BRANCH_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";

  return candidate.startsWith("http") ? candidate : `https://${candidate}`;
}
