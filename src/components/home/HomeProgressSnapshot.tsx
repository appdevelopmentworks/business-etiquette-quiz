"use client";

import { useEffect, useState } from "react";

import { formatAccuracy, getPrioritizedReviewQuestionIds } from "@/lib/quiz";
import { getAttemptHistory, getBookmarks } from "@/lib/storage";

type Snapshot = {
  answeredCount: number;
  accuracyRate: number;
  reviewCount: number;
};

export const HomeProgressSnapshot = () => {
  const [snapshot, setSnapshot] = useState<Snapshot>({
    answeredCount: 0,
    accuracyRate: 0,
    reviewCount: 0,
  });

  useEffect(() => {
    const attempts = getAttemptHistory();
    const bookmarkedIds = getBookmarks().map((bookmark) => bookmark.questionId);
    const correctCount = attempts.filter((attempt) => attempt.isCorrect).length;
    const accuracyRate =
      attempts.length === 0 ? 0 : Math.round((correctCount / attempts.length) * 100);

    setSnapshot({
      answeredCount: attempts.length,
      accuracyRate,
      reviewCount: getPrioritizedReviewQuestionIds({ attempts, bookmarkedIds, maxTags: 3 }).length,
    });
  }, []);

  return (
    <div className="stats-grid">
      <article className="stat-card">
        <span className="stat-card__label">総回答数</span>
        <strong className="stat-card__value">{snapshot.answeredCount}</strong>
      </article>
      <article className="stat-card">
        <span className="stat-card__label">平均正答率</span>
        <strong className="stat-card__value">{formatAccuracy(snapshot.accuracyRate)}</strong>
      </article>
      <article className="stat-card">
        <span className="stat-card__label">要復習</span>
        <strong className="stat-card__value">{snapshot.reviewCount}</strong>
      </article>
    </div>
  );
};
