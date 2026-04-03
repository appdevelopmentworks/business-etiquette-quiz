"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { questions } from "@/data/questions";
import { topics } from "@/data/topics";
import {
  buildSession,
  getQuestionsByTopicIds,
  getQuestionsForMode,
  getReviewCandidates,
} from "@/lib/quiz";
import { getAttemptHistory, saveCurrentSession } from "@/lib/storage";
import type { Difficulty, Question, QuizMode } from "@/lib/types";

type QuizSetupScreenProps = {
  initialTopicId?: string;
};

const counts = [5, 10, 20, 30];

export const QuizSetupScreen = ({ initialTopicId = "all" }: QuizSetupScreenProps) => {
  const router = useRouter();

  const [selectedTopicId, setSelectedTopicId] = useState(initialTopicId);
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty | "おまかせ">("おまかせ");
  const [mode, setMode] = useState<QuizMode>("normal");
  const [errorMessage, setErrorMessage] = useState("");

  const reviewCandidates = useMemo(() => getReviewCandidates(getAttemptHistory()), []);
  const selectedTopicIds =
    selectedTopicId === "all" ? topics.map((topic) => topic.id) : [selectedTopicId];

  const availableCount = useMemo(() => {
    if (mode === "review") {
      return reviewCandidates.length;
    }

    if (mode === "unlearned") {
      const attempted = new Set(getAttemptHistory().map((attempt) => attempt.questionId));
      return getQuestionsByTopicIds(selectedTopicIds).filter((question) => !attempted.has(question.id))
        .length;
    }

    return getQuestionsForMode({
      topicIds: selectedTopicIds,
      difficulty,
      mode,
    }).length;
  }, [difficulty, mode, reviewCandidates.length, selectedTopicIds]);

  const handleStart = () => {
    setErrorMessage("");

    const attempted = new Set(getAttemptHistory().map((attempt) => attempt.questionId));
    let pool: Question[] = [];

    if (mode === "review") {
      pool = getQuestionsForMode({
        topicIds: selectedTopicIds,
        difficulty,
        mode,
        reviewQuestionIds: reviewCandidates,
      });
    } else if (mode === "unlearned") {
      pool = getQuestionsByTopicIds(selectedTopicIds).filter((question) => !attempted.has(question.id));
      if (difficulty !== "おまかせ") {
        pool = pool.filter((question) => question.difficulty === difficulty);
      }
    } else {
      pool = getQuestionsForMode({
        topicIds: selectedTopicIds,
        difficulty,
        mode,
      });
    }

    if (pool.length === 0) {
      setErrorMessage("条件に合う問題がまだありません。条件を少し広げてみましょう。");
      return;
    }

    const session = buildSession({
      title:
        selectedTopicId === "all"
          ? "おすすめクイズ"
          : `${topics.find((topic) => topic.id === selectedTopicId)?.name ?? "トピック"}クイズ`,
      topicIds: selectedTopicIds,
      mode,
      questionsToUse: pool.slice(0, Math.min(questionCount, pool.length)),
    });

    saveCurrentSession(session);
    router.push(`/quiz/${session.id}`);
  };

  return (
    <section className="page-stack">
      <header className="page-header">
        <span className="eyebrow">Quiz Setup</span>
        <h1>学習内容をえらぶ</h1>
        <p className="lead">
          今日はどのテーマをどれくらい学ぶか、やさしく決められる設定画面です。
        </p>
      </header>

      <div className="card card--soft page-stack">
        <label className="field">
          <span className="field__label">トピック</span>
          <select
            className="select"
            value={selectedTopicId}
            onChange={(event) => setSelectedTopicId(event.target.value)}
          >
            <option value="all">おすすめ全体ミックス</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </label>

        <div className="field">
          <span className="field__label">出題数</span>
          <div className="chip-row">
            {counts.map((count) => (
              <button
                key={count}
                type="button"
                className={`chip${questionCount === count ? " is-selected" : ""}`}
                onClick={() => setQuestionCount(count)}
              >
                {count}問
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field__label">難易度</span>
          <div className="chip-row">
            {(["おまかせ", "初級", "中級", "上級"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={`chip${difficulty === value ? " is-selected" : ""}`}
                onClick={() => setDifficulty(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field__label">モード</span>
          <div className="mode-grid">
            <button
              type="button"
              className={`mode-card${mode === "normal" ? " is-selected" : ""}`}
              onClick={() => setMode("normal")}
            >
              <strong>通常学習</strong>
              <span>まずは標準の流れで学ぶ</span>
            </button>
            <button
              type="button"
              className={`mode-card${mode === "review" ? " is-selected" : ""}`}
              onClick={() => setMode("review")}
            >
              <strong>苦手復習</strong>
              <span>前に間違えた問題を中心に学ぶ</span>
            </button>
            <button
              type="button"
              className={`mode-card${mode === "unlearned" ? " is-selected" : ""}`}
              onClick={() => setMode("unlearned")}
            >
              <strong>未学習優先</strong>
              <span>まだ触れていない問題を優先する</span>
            </button>
          </div>
        </div>

        <div className="callout">
          <span className="callout__title">使える問題数</span>
          <strong>{availableCount}問</strong>
        </div>

        {errorMessage ? <p className="inline-message">{errorMessage}</p> : null}

        <button type="button" className="button button--primary" onClick={handleStart}>
          この内容でスタート
        </button>
      </div>

      <div className="card card--outline">
        <h2 className="section-title">いま入っている初期問題</h2>
        <p className="muted">
          現在は {questions.length} 問のMVPデータを登録しています。要件定義どおり、今後は問題バンクを広げて
          80〜100問以上へ拡張しやすい構成です。
        </p>
      </div>
    </section>
  );
};
