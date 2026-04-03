"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { topicMap } from "@/data/topics";
import { buildSession, getReviewCandidates, questionMap } from "@/lib/quiz";
import { getAttemptHistory, getBookmarks, saveCurrentSession } from "@/lib/storage";

export const ReviewScreen = () => {
  const router = useRouter();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [attemptIds, setAttemptIds] = useState<string[]>([]);

  useEffect(() => {
    setBookmarkedIds(getBookmarks().map((bookmark) => bookmark.questionId));
    setAttemptIds(getReviewCandidates(getAttemptHistory()));
  }, []);

  const reviewQuestionIds = useMemo(
    () => Array.from(new Set([...attemptIds, ...bookmarkedIds])),
    [attemptIds, bookmarkedIds],
  );

  const handleStartReview = () => {
    const questionsToUse = reviewQuestionIds
      .map((questionId) => questionMap.get(questionId))
      .filter((question) => Boolean(question))
      .slice(0, 10)
      .map((question) => question!);

    if (questionsToUse.length === 0) {
      return;
    }

    const session = buildSession({
      title: "要復習クイズ",
      topicIds: Array.from(new Set(questionsToUse.map((question) => question.topicId))),
      mode: "review",
      questionsToUse,
    });

    saveCurrentSession(session);
    router.push(`/quiz/${session.id}`);
  };

  return (
    <section className="page-stack">
      <header className="page-header">
        <span className="eyebrow">Review</span>
        <h1>復習したい内容をまとめて確認</h1>
        <p className="lead">間違えた問題とブックマークした問題を、ひとつの一覧で見返せます。</p>
      </header>

      <article className="card card--soft page-stack">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-card__label">前回不正解</span>
            <strong className="stat-card__value">{attemptIds.length}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">ブックマーク</span>
            <strong className="stat-card__value">{bookmarkedIds.length}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">復習対象</span>
            <strong className="stat-card__value">{reviewQuestionIds.length}</strong>
          </div>
        </div>

        <button
          type="button"
          className="button button--primary"
          onClick={handleStartReview}
          disabled={reviewQuestionIds.length === 0}
        >
          復習クイズを始める
        </button>
      </article>

      {reviewQuestionIds.length === 0 ? (
        <article className="card">
          <h2 className="section-title">復習候補はまだありません</h2>
          <p className="muted">クイズに取り組むと、ここに見返したい問題がたまっていきます。</p>
          <Link href="/quiz" className="button button--secondary">
            まずはクイズを始める
          </Link>
        </article>
      ) : (
        <article className="card">
          <h2 className="section-title">対象一覧</h2>
          <div className="review-list">
            {reviewQuestionIds.map((questionId) => {
              const question = questionMap.get(questionId);
              if (!question) {
                return null;
              }

              const topic = topicMap.get(question.topicId);

              return (
                <div key={question.id} className="review-item">
                  <div className="review-item__meta">
                    <span className="pill">{topic?.name ?? question.topicId}</span>
                    <span className="muted">{question.difficulty}</span>
                  </div>
                  <strong>{question.question}</strong>
                  <p className="muted">{question.explanation}</p>
                </div>
              );
            })}
          </div>
        </article>
      )}
    </section>
  );
};
