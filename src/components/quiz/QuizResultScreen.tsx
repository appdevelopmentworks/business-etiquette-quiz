"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { formatAccuracy } from "@/lib/quiz";
import { getResultSummary } from "@/lib/storage";
import type { QuizResultSummary } from "@/lib/types";

type QuizResultScreenProps = {
  sessionId: string;
};

export const QuizResultScreen = ({ sessionId }: QuizResultScreenProps) => {
  const [summary, setSummary] = useState<QuizResultSummary | null>(null);

  useEffect(() => {
    setSummary(getResultSummary(sessionId));
  }, [sessionId]);

  if (!summary) {
    return (
      <section className="card page-stack">
        <h1>結果が見つかりません</h1>
        <p className="muted">新しくクイズを開始すると、ここに学習結果が表示されます。</p>
        <Link href="/quiz" className="button button--primary">
          クイズ設定へ
        </Link>
      </section>
    );
  }

  return (
    <section className="page-stack">
      <header className="page-header">
        <span className="eyebrow">Result</span>
        <h1>{summary.title}の結果</h1>
        <p className="lead">点数だけでなく、次にどこを伸ばせばよいかも見える形にしています。</p>
      </header>

      <div className="stats-grid">
        <article className="stat-card">
          <span className="stat-card__label">正答率</span>
          <strong className="stat-card__value">{formatAccuracy(summary.accuracyRate)}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">正解数</span>
          <strong className="stat-card__value">{summary.correctCount}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">復習候補</span>
          <strong className="stat-card__value">{summary.reviewQuestionIds.length}</strong>
        </article>
      </div>

      <article className="card card--soft page-stack">
        <h2 className="section-title">苦手になりやすいタグ</h2>
        <div className="chip-row">
          {summary.weakestTags.length > 0 ? (
            summary.weakestTags.map((tag) => (
              <span key={tag} className="chip chip--static">
                {tag}
              </span>
            ))
          ) : (
            <span className="muted">今回は大きな偏りはありませんでした。</span>
          )}
        </div>
      </article>

      <article className="card">
        <h2 className="section-title">トピック別のふりかえり</h2>
        <div className="topic-summary-list">
          {summary.topicSummaries.map((topicSummary) => (
            <div key={topicSummary.topicId} className="topic-summary-row">
              <div>
                <strong>{topicSummary.topicName}</strong>
                <p className="muted">
                  {topicSummary.correctCount} / {topicSummary.answeredCount} 正解
                </p>
              </div>
              <span className="pill">{formatAccuracy(topicSummary.accuracyRate)}</span>
            </div>
          ))}
        </div>
      </article>

      <div className="actions-row">
        <Link href="/review" className="button button--secondary">
          復習へ進む
        </Link>
        <Link href="/quiz" className="button button--primary">
          もう一度学ぶ
        </Link>
      </div>
    </section>
  );
};
