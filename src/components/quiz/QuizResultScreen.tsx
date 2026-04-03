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
        <p className="muted">新しくクイズを始めると、ここに学習結果が表示されます。</p>
        <Link href="/quiz" className="button button--primary">
          クイズ設定へ
        </Link>
      </section>
    );
  }

  const weakTagSummaries = summary.weakTagSummaries?.slice(0, 4) ?? [];
  const primaryWeakTag = weakTagSummaries[0]?.tag;

  return (
    <section className="page-stack">
      <header className="page-header">
        <span className="eyebrow">Result</span>
        <h1>{summary.title}の結果</h1>
        <p className="lead">
          数字だけで終わらせず、次にどのタグを復習すると伸びやすいかまで、すぐ分かる形でまとめています。
        </p>
      </header>

      <div className="stats-grid">
        <article className="stat-card">
          <span className="stat-card__label">回答数</span>
          <strong className="stat-card__value">{summary.answeredCount}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">正答率</span>
          <strong className="stat-card__value">{formatAccuracy(summary.accuracyRate)}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">この回の要復習</span>
          <strong className="stat-card__value">{summary.reviewQuestionIds.length}</strong>
        </article>
      </div>

      <article className="card card--soft page-stack">
        <div className="section-head">
          <div>
            <h2 className="section-title">優先して見直したいタグ</h2>
            <p className="muted">
              直近の誤答と苦手の重なりから、復習効果が高いタグを抽出しています。
            </p>
          </div>
          <Link href="/review" className="text-link">
            復習一覧へ
          </Link>
        </div>

        {weakTagSummaries.length > 0 ? (
          <div className="tag-summary-grid">
            {weakTagSummaries.map((tagSummary) => (
              <article key={tagSummary.tag} className="tag-summary-card">
                <div className="tag-summary-card__head">
                  <strong>{tagSummary.tag}</strong>
                  <span className="pill">{tagSummary.accuracyRate}%</span>
                </div>
                <p className="muted">
                  間違い {tagSummary.incorrectCount}問 / 要復習 {tagSummary.reviewQuestionIds.length}問 /
                  回答 {tagSummary.answeredCount}問
                </p>
                <Link
                  href={`/review?tag=${encodeURIComponent(tagSummary.tag)}`}
                  className="button button--secondary"
                >
                  このタグを復習
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">
            今回は大きく崩れたタグがありませんでした。この調子で別テーマも広げていきましょう。
          </p>
        )}
      </article>

      <article className="card">
        <h2 className="section-title">トピック別のふりかえり</h2>
        <div className="topic-summary-list">
          {summary.topicSummaries.map((topicSummary) => (
            <div key={topicSummary.topicId} className="topic-summary-row">
              <div>
                <strong>{topicSummary.topicName}</strong>
                <p className="muted">
                  {topicSummary.correctCount} / {topicSummary.answeredCount} 正答
                </p>
              </div>
              <span className="pill">{formatAccuracy(topicSummary.accuracyRate)}</span>
            </div>
          ))}
        </div>
      </article>

      <div className="actions-row">
        <Link
          href={primaryWeakTag ? `/review?tag=${encodeURIComponent(primaryWeakTag)}` : "/review"}
          className="button button--secondary"
        >
          {primaryWeakTag ? `${primaryWeakTag}を復習` : "復習一覧へ"}
        </Link>
        <Link href="/quiz" className="button button--primary">
          もう一度学ぶ
        </Link>
      </div>
    </section>
  );
};
