import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ビジネスマナークイズ",
    short_name: "マナークイズ",
    description: "新卒女性社員向けの、やさしく可愛いビジネスマナー学習アプリ",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fffaf7",
    theme_color: "#ef7f8e",
    lang: "ja",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/pwa/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/pwa/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "今すぐ学習",
        short_name: "学習",
        description: "クイズ設定を開く",
        url: "/quiz",
        icons: [{ src: "/pwa/icon-192x192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "苦手タグ復習",
        short_name: "復習",
        description: "苦手タグの復習一覧を開く",
        url: "/review",
        icons: [{ src: "/pwa/icon-192x192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
