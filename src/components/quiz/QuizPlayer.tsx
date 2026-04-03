"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { buildResultSummary, getQuestionById } from "@/lib/quiz";
import {
  appendAttemptHistory,
  clearCurrentSession,
  getCurrentSession,
  isBookmarked,
  saveCurrentSession,
  saveResultSummary,
  toggleBookmark,
} from "@/lib/storage";
import type { AttemptRecord, ChoiceKey, StoredQuizSession } from "@/lib/types";

type QuizPlayerProps = {
  sessionId: string;
};

export const QuizPlayer = ({ sessionId }: QuizPlayerProps) => {
  const router = useRouter();
  const [session, setSession] = useState<StoredQuizSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [bookmarkState, setBookmarkState] = useState(false);

  useEffect(() => {
    const stored = getCurrentSession();
    setSession(stored?.id === sessionId ? stored : null);
    setLoaded(true);
  }, [sessionId]);

  const currentQuestion = useMemo(() => {
    if (!session) {
      return null;
    }

    return getQuestionById(session.questionIds[session.currentIndex]) ?? null;
  }, [session]);

  useEffect(() => {
    if (currentQuestion) {
      setBookmarkState(isBookmarked(currentQuestion.id));
      setStartedAt(Date.now());
    }
  }, [currentQuestion]);

  if (!loaded) {
    return <section className="card">読み込み中です…</section>;
  }

  if (!session || !currentQuestion) {
    return (
      <section className="card page-stack">
        <h1>学習セッションが見つかりません</h1>
        <p className="muted">設定画面から新しくクイズを始めてみましょう。</p>
        <Link href="/quiz" className="button button--primary">
          クイズ設定へ
        </Link>
      </section>
    );
  }

  const existingAttempt = session.attempts.find((attempt) => attempt.questionId === currentQuestion.id);
  const isAnswered = Boolean(existingAttempt);
  const progressRate = Math.round(((session.currentIndex + 1) / session.questionIds.length) * 100);

  const handleChoice = (choice: ChoiceKey) => {
    if (isAnswered) {
      return;
    }

    const nextAttempt: AttemptRecord = {
      id: crypto.randomUUID(),
      sessionId: session.id,
      questionId: currentQuestion.id,
      topicId: currentQuestion.topicId,
      selectedAnswer: choice,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: choice === currentQuestion.correctAnswer,
      responseMs: Date.now() - startedAt,
      answeredAt: new Date().toISOString(),
    };

    const nextSession = {
      ...session,
      attempts: [...session.attempts, nextAttempt],
    };

    setSession(nextSession);
    saveCurrentSession(nextSession);
  };

  const handleNext = () => {
    if (!existingAttempt) {
      return;
    }

    const isLast = session.currentIndex >= session.questionIds.length - 1;
    if (isLast) {
      const summary = buildResultSummary(session);
      appendAttemptHistory(session.attempts);
      saveResultSummary(summary);
      clearCurrentSession();
      router.push(`/quiz/${session.id}/result`);
      return;
    }

    const nextSession = {
      ...session,
      currentIndex: session.currentIndex + 1,
    };

    setSession(nextSession);
    saveCurrentSession(nextSession);
  };

  const handleBookmark = () => {
    const next = toggleBookmark(currentQuestion.id);
    setBookmarkState(next);
  };

  return (
    <section className="page-stack">
      <header className="page-header page-header--compact">
        <div className="progress-meta">
          <span className="pill">{session.title}</span>
          <span className="muted">
            {session.currentIndex + 1} / {session.questionIds.length}
          </span>
        </div>
        <div className="progress-bar" aria-hidden="true">
          <span className="progress-bar__fill" style={{ width: `${progressRate}%` }} />
        </div>
      </header>

      <article className="quiz-card">
        <div className="quiz-card__header">
          <div>
            <span className="eyebrow">Question</span>
            <h1>{currentQuestion.question}</h1>
          </div>
          <button type="button" className="button button--ghost" onClick={handleBookmark}>
            {bookmarkState ? "ブックマーク済み" : "あとで見返す"}
          </button>
        </div>

        {currentQuestion.situation ? <p className="muted">{currentQuestion.situation}</p> : null}

        <div className="choice-list">
          {currentQuestion.choices.map((choice) => {
            const isCorrect = isAnswered && currentQuestion.correctAnswer === choice.key;
            const isIncorrect = isAnswered && existingAttempt?.selectedAnswer === choice.key && !isCorrect;

            return (
              <button
                key={choice.key}
                type="button"
                className={`choice-button${isCorrect ? " is-correct" : ""}${
                  isIncorrect ? " is-incorrect" : ""
                }`}
                onClick={() => handleChoice(choice.key)}
                disabled={isAnswered}
              >
                <span className="choice-button__key">{choice.key}</span>
                <span>{choice.text}</span>
              </button>
            );
          })}
        </div>

        {isAnswered ? (
          <div className={`feedback-card${existingAttempt?.isCorrect ? " is-correct" : " is-incorrect"}`}>
            <strong>{existingAttempt?.isCorrect ? "正解です" : "ここは復習ポイントです"}</strong>
            <p>{currentQuestion.explanation}</p>
            {currentQuestion.takeaway ? <p className="muted">{currentQuestion.takeaway}</p> : null}
            {currentQuestion.note ? <p className="muted">{currentQuestion.note}</p> : null}
          </div>
        ) : (
          <p className="muted">気持ちが落ち着いて選べるよう、1問ずつ丁寧に進められます。</p>
        )}

        <div className="actions-row">
          <Link href="/topics" className="button button--secondary">
            トピック一覧へ
          </Link>
          <button
            type="button"
            className="button button--primary"
            onClick={handleNext}
            disabled={!isAnswered}
          >
            {session.currentIndex >= session.questionIds.length - 1 ? "結果を見る" : "次の問題へ"}
          </button>
        </div>
      </article>
    </section>
  );
};
