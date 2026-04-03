import Link from "next/link";

import { HomeProgressSnapshot } from "@/components/home/HomeProgressSnapshot";
import { questions } from "@/data/questions";
import { topics } from "@/data/topics";

export default function HomePage() {
  return (
    <section className="page-stack">
      <header className="hero-card">
        <div className="hero-card__content">
          <span className="eyebrow">Business Etiquette Quiz</span>
          <h1>かわいく学べて、現場でも使える。</h1>
          <p className="lead">
            敬語、電話、メール、名刺交換、席次まで。新卒研修でつまずきやすい内容を、スマホでやさしく反復できます。
          </p>
          <div className="actions-row">
            <Link href="/quiz" className="button button--primary">
              今すぐ学習を始める
            </Link>
            <Link href="/topics" className="button button--secondary">
              トピックを見る
            </Link>
          </div>
        </div>
        <div className="hero-card__aside">
          <div className="mini-panel">
            <span className="mini-panel__label">初期MVP</span>
            <strong>
              {topics.length}トピック / {questions.length}問
            </strong>
            <p>まず触れる版として、実装しやすい構成からスタートしています。</p>
          </div>
        </div>
      </header>

      <HomeProgressSnapshot />

      <section className="card page-stack">
        <div className="section-head">
          <div>
            <span className="eyebrow">Recommended</span>
            <h2 className="section-title">最初に学ぶと安心なテーマ</h2>
          </div>
          <Link href="/topics" className="text-link">
            すべて見る
          </Link>
        </div>
        <div className="topic-grid">
          {topics.slice(0, 4).map((topic) => (
            <article key={topic.id} className={`topic-card topic-card--${topic.accent}`}>
              <span className="pill">{topic.id}</span>
              <h3>{topic.name}</h3>
              <p>{topic.shortDescription}</p>
              <Link href={`/quiz?topicId=${topic.id}`} className="text-link">
                このテーマを始める
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="dual-grid">
        <article className="card card--soft">
          <span className="eyebrow">Design Tone</span>
          <h2 className="section-title">女性向けだけど、幼すぎない</h2>
          <p className="muted">
            淡いピンク、コーラル、ミントを使いながら、余白と文字の読みやすさをしっかり確保しています。
          </p>
        </article>
        <article className="card card--soft">
          <span className="eyebrow">Responsive</span>
          <h2 className="section-title">スマホで迷わない導線</h2>
          <p className="muted">
            1画面1目的の設計で、片手操作でも進めやすいように構成しています。
          </p>
        </article>
      </section>
    </section>
  );
}
