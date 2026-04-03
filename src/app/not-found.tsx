import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="card page-stack">
      <span className="eyebrow">Not Found</span>
      <h1>ページが見つかりません</h1>
      <p className="muted">学習の入口へ戻って、別のテーマから始めてみましょう。</p>
      <Link href="/" className="button button--primary">
        ホームへ戻る
      </Link>
    </section>
  );
}
