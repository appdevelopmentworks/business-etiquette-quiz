"use client";

import { useEffect, useMemo, useState } from "react";

import { aggregateTopicProgress, formatAccuracy } from "@/lib/quiz";
import { getAttemptHistory } from "@/lib/storage";
import type { AttemptRecord } from "@/lib/types";

export const ProgressScreen = () => {
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);

  useEffect(() => {
    setAttempts(getAttemptHistory());
  }, []);

  const correctCount = attempts.filter((attempt) => attempt.isCorrect).length;
  const accuracyRate = attempts.length === 0 ? 0 : Math.round((correctCount / attempts.length) * 100);
  const topicProgress = useMemo(() => aggregateTopicProgress(attempts), [attempts]);

  return (
    <section className="page-stack">
      <header className="page-header">
        <span className="eyebrow">Progress</span>
        <h1>学習の積み上がり</h1>
        <p className="lead">がんばりが数値でも見えると、次の一歩が決めやすくなります。</p>
      </header>

      <div className="stats-grid">
        <article className="stat-card">
          <span className="stat-card__label">総回答数</span>
          <strong className="stat-card__value">{attempts.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">総正解数</span>
          <strong className="stat-card__value">{correctCount}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-card__label">平均正答率</span>
          <strong className="stat-card__value">{formatAccuracy(accuracyRate)}</strong>
        </article>
      </div>

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
                  ? "まだ未学習です"
                  : `${item.correctCount} / ${item.answeredCount} 問 正解`}
              </p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
};
