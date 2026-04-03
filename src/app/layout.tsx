import type { Metadata } from "next";
import Link from "next/link";

import { BottomNav } from "@/components/BottomNav";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ビジネスマナークイズ",
  description: "新卒女性社員向けの、やさしく可愛いビジネスマナー学習アプリ",
  applicationName: "ビジネスマナークイズ",
  icons: {
    icon: [{ url: "/brand/app-icon.png", type: "image/png" }],
    shortcut: ["/brand/app-icon.png"],
    apple: [{ url: "/brand/app-icon.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    title: "ビジネスマナークイズ",
    description: "新卒女性社員向けの、やさしく可愛いビジネスマナー学習アプリ",
    images: [
      {
        url: "/brand/link-preview.png",
        width: 1200,
        height: 630,
        alt: "ビジネスマナークイズのリンクプレビュー画像",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ビジネスマナークイズ",
    description: "新卒女性社員向けの、やさしく可愛いビジネスマナー学習アプリ",
    images: ["/brand/link-preview.png"],
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
