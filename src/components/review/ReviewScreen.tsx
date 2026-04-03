"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { topicMap } from "@/data/topics";
import {
  buildSession,
  buildTagSummaries,
  getPrioritizedReviewQuestionIds,
  getTagReviewQuestionIds,
  questionMap,
} from "@/lib/quiz";
import { getAttemptHistory, getBookmarks, saveCurrentSession } from "@/lib/storage";
import type { AttemptRecord, Question } from "@/lib/types";

type ReviewScreenProps = {
  initialTag?: string;
};

const REVIEW_LIMIT = 12;

export const ReviewScreen = ({ initialTag }: ReviewScreenProps) => {
  const router = useRouter();
  const [attemptHistory, setAttemptHistory] = useState<AttemptRecord[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState(initialTag ?? "");

  useEffect(() => {
    setAttemptHistory(getAttemptHistory());
    setBookmarkedIds(getBookmarks().map((bookmark) => bookmark.questionId));
  }, []);

  useEffect(() => {
    setSelectedTag(initialTag ?? "");
  }, [initialTag]);

  const tagSummaries = useMemo(() => buildTagSummaries(attemptHistory), [attemptHistory]);
  const weakTagSummaries = useMemo(
    () =>
      tagSummaries
        .filter((summary) => summary.incorrectCount > 0 || summary.reviewQuestionIds.length > 0)
        .slice(0, 6),
    [tagSummaries],
  );

  const selectedTagSummary = useMemo(
    () => tagSummaries.find((summary) => summary.tag === selectedTag) ?? null,
    [selectedTag, tagSummaries],
  );

  const autoReviewIds = useMemo(
    () =>
      getPrioritizedReviewQuestionIds({
        attempts: attemptHistory,
        bookmarkedIds,
        maxTags: 3,
      }),
    [attemptHistory, bookmarkedIds],
  );

  const tagReviewIds = useMemo(() => {
    if (!selectedTag) {
      return [];
    }

    return getTagReviewQuestionIds({
      attempts: attemptHistory,
      tag: selectedTag,
      bookmarkedIds,
    });
  }, [attemptHistory, bookmarkedIds, selectedTag]);

  const reviewQuestionIds = selectedTag ? tagReviewIds : autoReviewIds;

  const previewQuestions = useMemo(
    () =>
      reviewQuestionIds
        .map((questionId) => questionMap.get(questionId))
        .filter((question): question is Question => Boolean(question))
        .slice(0, REVIEW_LIMIT),
    [reviewQuestionIds],
  );

  const handleStartReview = () => {
    if (previewQuestions.length === 0) {
      return;
    }

    const session = buildSession({
      title: selectedTag ? `${selectedTag}の復習クイズ` : "苦手タグの復習クイズ",
      topicIds: Array.from(new Set(previewQuestions.map((question) => question.topicId))),
      mode: "review",
      questionsToUse: previewQuestions,
    });

    saveCurrentSession(session);
    router.push(`/quiz/${session.id}`);
  };

  return (
    <section className="page-stack">
      <header className="page-header">
        <span className="eyebrow">Review</span>
        <h1>苦手タグから復習する</h1>
        <p className="lead">
          間違いが重なったタグをまとめて見つけて、優先度の高い問題からやさしく復習できます。
        </p>
      </header>

      <article className="card card--soft page-stack">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-card__label">おすすめ復習候補</span>
            <strong className="stat-card__value">{autoReviewIds.length}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">ブックマーク</span>
            <strong className="stat-card__value">{bookmarkedIds.length}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">{selectedTag ? "このタグの候補" : "今回出題する候補"}</span>
            <strong className="stat-card__value">{reviewQuestionIds.length}</strong>
          </div>
        </div>

        {selectedTag && selectedTagSummary ? (
          <div className="callout">
            <div>
              <strong>{selectedTag} を選択中</strong>
              <p className="muted">
                正答率 {selectedTagSummary.accuracyRate}% / 間違い {selectedTagSummary.incorrectCount}問 /
                復習候補 {selectedTagSummary.reviewQuestionIds.length}問
              </p>
            </div>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setSelectedTag("")}
            >
              全体おすすめに戻す
            </button>
          </div>
        ) : null}

        {weakTagSummaries.length > 0 ? (
          <div className="page-stack">
            <div className="section-head">
              <div>
                <h2 className="section-title">優先して復習したいタグ</h2>
                <p className="muted">
                  直近の誤答と苦手の重なりをもとに、復習効果が高い順で並べています。
                </p>
              </div>
            </div>

            <div className="tag-summary-grid">
              {weakTagSummaries.map((summary) => (
                <button
                  key={summary.tag}
                  type="button"
                  className={`tag-summary-card${selectedTag === summary.tag ? " is-selected" : ""}`}
                  onClick={() => setSelectedTag(summary.tag)}
                >
                  <div className="tag-summary-card__head">
                    <strong>{summary.tag}</strong>
                    <span className="pill">{summary.accuracyRate}%</span>
                  </div>
                  <p className="muted">
                    間違い {summary.incorrectCount}問 / 要復習 {summary.reviewQuestionIds.length}問 / 回答
                    {summary.answeredCount}問
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : attemptHistory.length > 0 ? (
          <div className="card--outline">
            <h2 className="section-title">苦手タグはかなり解消できています</h2>
            <p className="muted">
              いまは明確な弱点タグが少ない状態です。ブックマークした問題や未学習のテーマを中心に進めるのがおすすめです。
            </p>
          </div>
        ) : null}

        <button
          type="button"
          className="button button--primary"
          onClick={handleStartReview}
          disabled={previewQuestions.length === 0}
        >
          {selectedTag ? `${selectedTag}を復習する` : "おすすめ復習を始める"}
        </button>
      </article>

      {previewQuestions.length === 0 ? (
        <article className="card">
          <h2 className="section-title">まだ復習候補がありません</h2>
          <p className="muted">
            まずはクイズを解いて履歴を作ると、苦手タグごとの復習候補が自動で育っていきます。
          </p>
          <Link href="/quiz" className="button button--secondary">
            まずはクイズを始める
          </Link>
        </article>
      ) : (
        <article className="card page-stack">
          <div className="section-head">
            <div>
              <h2 className="section-title">
                {selectedTag ? `${selectedTag}の復習候補` : "優先度の高い復習候補"}
              </h2>
              <p className="muted">
                {reviewQuestionIds.length > REVIEW_LIMIT
                  ? `優先度の高い ${REVIEW_LIMIT} 問を出題します。`
                  : `このまま ${previewQuestions.length} 問の復習クイズを始められます。`}
              </p>
            </div>
          </div>

          <div className="review-list">
            {previewQuestions.map((question) => {
              const topic = topicMap.get(question.topicId);

              return (
                <div key={question.id} className="review-item">
                  <div className="review-item__meta">
                    <span className="pill">{topic?.name ?? question.topicId}</span>
                    <span className="muted">{question.difficulty}</span>
                  </div>
                  <strong>{question.question}</strong>
                  <p className="muted">{question.explanation}</p>
                  <p className="muted">タグ: {question.tags.join(" / ")}</p>
                </div>
              );
            })}
          </div>
        </article>
      )}
    </section>
  );
};
