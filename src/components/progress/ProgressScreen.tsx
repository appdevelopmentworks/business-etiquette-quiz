"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  aggregateTopicProgress,
  buildTagImprovementSummaries,
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
  const tagImprovementSummaries = useMemo(
    () =>
      buildTagImprovementSummaries(attempts)
        .filter((summary) => summary.studiedSessionCount >= 2)
        .slice(0, 8),
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

      <article className="card page-stack">
        <div className="section-head">
          <div>
            <h2 className="section-title">タグごとの改善履歴</h2>
            <p className="muted">
              同じタグを複数回学んだときの正答率の変化です。初回から最新までの伸び幅を確認できます。
            </p>
          </div>
        </div>

        {tagImprovementSummaries.length > 0 ? (
          <div className="tag-history-grid">
            {tagImprovementSummaries.map((summary) => {
              const historyPoints = summary.history.slice(-6);

              return (
                <article key={summary.tag} className="tag-history-card">
                  <div className="tag-history-card__head">
                    <div>
                      <strong>{summary.tag}</strong>
                      <p className="muted">
                        初回 {summary.firstAccuracyRate}% → 最新 {summary.latestAccuracyRate}%
                      </p>
                    </div>
                    <span
                      className={`trend-badge trend-badge--${
                        summary.improvementDelta > 0
                          ? "up"
                          : summary.improvementDelta < 0
                            ? "down"
                            : "flat"
                      }`}
                    >
                      {formatSignedPoints(summary.improvementDelta)}
                    </span>
                  </div>

                  <div
                    className="history-sparkline"
                    aria-hidden="true"
                    style={{ gridTemplateColumns: `repeat(${historyPoints.length}, minmax(0, 1fr))` }}
                  >
                    {historyPoints.map((point, index) => (
                      <span
                        key={`${summary.tag}-${point.sessionId}`}
                        className={`history-sparkline__bar${
                          index === historyPoints.length - 1 ? " is-latest" : ""
                        }`}
                        style={{ height: `${Math.max(point.accuracyRate, 12)}%` }}
                      />
                    ))}
                  </div>

                  <div
                    className="history-meta"
                    style={{ gridTemplateColumns: `repeat(${historyPoints.length}, minmax(0, 1fr))` }}
                  >
                    {historyPoints.map((point) => (
                      <span key={`${summary.tag}-${point.sessionId}-label`}>{point.label}</span>
                    ))}
                  </div>

                  <p className="muted">
                    {summary.studiedSessionCount}回の学習で最高 {summary.bestAccuracyRate}% まで到達 /
                    最終学習 {historyPoints.at(-1)?.label}
                  </p>

                  <Link
                    href={`/review?tag=${encodeURIComponent(summary.tag)}`}
                    className="button button--secondary"
                  >
                    このタグを復習
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="muted">
            改善履歴は、同じタグを2回以上学ぶと表示されます。まずは復習を重ねて変化を育てていきましょう。
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

const formatSignedPoints = (value: number) => {
  if (value > 0) {
    return `+${value}pt`;
  }

  if (value < 0) {
    return `${value}pt`;
  }

  return "±0pt";
};
