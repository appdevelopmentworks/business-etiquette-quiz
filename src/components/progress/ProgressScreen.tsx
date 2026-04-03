"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  aggregateTopicProgress,
  buildTagSummaries,
  formatAccuracy,
  getPrioritizedReviewQuestionIds,
} from "@/lib/quiz";
import { getAttemptHistory, getBookmarks } from "@/lib/storage";
import type { AttemptRecord } from "@/lib/types";

export const ProgressScreen = () => {
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    setAttempts(getAttemptHistory());
    setBookmarkedIds(getBookmarks().map((bookmark) => bookmark.questionId));
  }, []);

  const correctCount = attempts.filter((attempt) => attempt.isCorrect).length;
  const accuracyRate = attempts.length === 0 ? 0 : Math.round((correctCount / attempts.length) * 100);
  const topicProgress = useMemo(() => aggregateTopicProgress(attempts), [attempts]);
  const weakTagSummaries = useMemo(
    () =>
      buildTagSummaries(attempts)
        .filter((summary) => summary.incorrectCount > 0 || summary.reviewQuestionIds.length > 0)
        .slice(0, 6),
    [attempts],
  );
  const reviewQuestionIds = useMemo(
    () =>
      getPrioritizedReviewQuestionIds({
        attempts,
        bookmarkedIds,
        maxTags: 3,
      }),
    [attempts, bookmarkedIds],
  );

  return (
    <section className="page-stack">
      <header className="page-header">
        <span className="eyebrow">Progress</span>
        <h1>学習の進み具合を見る</h1>
        <p className="lead">
          どのトピックが進んでいて、どのタグにまだ不安が残っているかを一画面で確認できます。
        </p>
      </header>

      <div className="stats-grid">
        <article className="stat-card">
          <span className="stat-card__label">総回答数</span>
          <strong className="stat-card__value">{attempts.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">平均正答率</span>
          <strong className="stat-card__value">{formatAccuracy(accuracyRate)}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">おすすめ復習候補</span>
          <strong className="stat-card__value">{reviewQuestionIds.length}</strong>
        </article>
      </div>

      <article className="card card--soft page-stack">
        <div className="section-head">
          <div>
            <h2 className="section-title">苦手タグのランキング</h2>
            <p className="muted">
              間違いの多さと直近のつまずきを合わせて、今復習すると伸びやすいタグ順に表示しています。
            </p>
          </div>
          <Link href="/review" className="text-link">
            復習一覧へ
          </Link>
        </div>

        {weakTagSummaries.length > 0 ? (
          <div className="tag-summary-grid">
            {weakTagSummaries.map((summary) => (
              <article key={summary.tag} className="tag-summary-card">
                <div className="tag-summary-card__head">
                  <strong>{summary.tag}</strong>
                  <span className="pill">{summary.accuracyRate}%</span>
                </div>
                <p className="muted">
                  間違い {summary.incorrectCount}問 / 要復習 {summary.reviewQuestionIds.length}問 / 回答
                  {summary.answeredCount}問
                </p>
                <Link
                  href={`/review?tag=${encodeURIComponent(summary.tag)}`}
                  className="button button--secondary"
                >
                  このタグを復習
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="muted">
            まだ履歴が少ないため、苦手タグの判定はこれから育っていきます。まずはクイズを数回解くと精度が上がります。
          </p>
        )}
      </article>

      <article className="card">
        <h2 className="section-title">トピック別の進み具合</h2>
        <div className="progress-list">
          {topicProgress.map((item) => (
            <div key={item.topicId} className="progress-item">
              <div className="progress-item__head">
                <strong>{item.topicName}</strong>
                <span className="pill">{formatAccuracy(item.accuracyRate)}</span>
              </div>
              <div className="progress-bar progress-bar--muted" aria-hidden="true">
                <span className="progress-bar__fill" style={{ width: `${item.accuracyRate}%` }} />
              </div>
              <p className="muted">
                {item.answeredCount === 0
                  ? "まだ学習前です"
                  : `${item.correctCount} / ${item.answeredCount} 問正答`}
              </p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
};
