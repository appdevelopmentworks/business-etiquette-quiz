import type { Metadata } from "next";
import Link from "next/link";

import { BottomNav } from "@/components/BottomNav";

import "./globals.css";

export const metadata: Metadata = {
  title: "ビジネスマナークイズ",
  description: "新卒女性社員向けの、やさしく可愛いビジネスマナー学習アプリ",
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
