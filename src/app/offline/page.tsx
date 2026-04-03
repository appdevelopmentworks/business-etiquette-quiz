import Link from "next/link";

export default function OfflinePage() {
  return (
    <section className="page-stack">
      <header className="page-header">
        <span className="eyebrow">Offline</span>
        <h1>オフラインでも続けられます</h1>
        <p className="lead">
          電波が不安定でも、いちど開いた主要画面はそのまま使えるようにしています。
        </p>
      </header>

      <article className="card page-stack">
        <h2 className="section-title">できること</h2>
        <ul className="clean-list">
          <li>ホーム、トピック、復習、学習状況などの主要画面を開く</li>
          <li>この端末に保存された学習履歴を見返す</li>
          <li>通信が戻ったらそのまま通常利用に戻る</li>
        </ul>
      </article>

      <article className="card card--soft page-stack">
        <h2 className="section-title">よく使う画面へ</h2>
        <div className="actions-row">
          <Link href="/" className="button button--secondary">
            ホームへ
          </Link>
          <Link href="/quiz" className="button button--secondary">
            学習開始
          </Link>
          <Link href="/review" className="button button--secondary">
            復習へ
          </Link>
          <Link href="/progress" className="button button--primary">
            学習状況へ
          </Link>
        </div>
      </article>
    </section>
  );
}
