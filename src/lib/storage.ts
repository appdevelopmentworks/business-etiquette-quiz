import type { AttemptRecord, Bookmark, QuizResultSummary, StoredQuizSession } from "@/lib/types";

const STORAGE_KEYS = {
  currentSession: "beq.currentSession",
  attempts: "beq.attempts",
  bookmarks: "beq.bookmarks",
  resultPrefix: "beq.result.",
};

const isBrowser = () => typeof window !== "undefined";

const readJson = <T,>(key: string, fallback: T): T => {
  if (!isBrowser()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getCurrentSession = () => readJson<StoredQuizSession | null>(STORAGE_KEYS.currentSession, null);

export const saveCurrentSession = (session: StoredQuizSession) => {
  writeJson(STORAGE_KEYS.currentSession, session);
};

export const clearCurrentSession = () => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEYS.currentSession);
};

export const getAttemptHistory = () => readJson<AttemptRecord[]>(STORAGE_KEYS.attempts, []);

export const appendAttemptHistory = (attempts: AttemptRecord[]) => {
  const current = getAttemptHistory();
  writeJson(STORAGE_KEYS.attempts, [...current, ...attempts]);
};

export const getBookmarks = () => readJson<Bookmark[]>(STORAGE_KEYS.bookmarks, []);

export const isBookmarked = (questionId: string) =>
  getBookmarks().some((bookmark) => bookmark.questionId === questionId);

export const toggleBookmark = (questionId: string) => {
  const current = getBookmarks();
  const exists = current.some((bookmark) => bookmark.questionId === questionId);

  if (exists) {
    const next = current.filter((bookmark) => bookmark.questionId !== questionId);
    writeJson(STORAGE_KEYS.bookmarks, next);
    return false;
  }

  writeJson(STORAGE_KEYS.bookmarks, [
    ...current,
    {
      questionId,
      createdAt: new Date().toISOString(),
    },
  ]);

  return true;
};

export const saveResultSummary = (summary: QuizResultSummary) => {
  writeJson(`${STORAGE_KEYS.resultPrefix}${summary.sessionId}`, summary);
};

export const getResultSummary = (sessionId: string) =>
  readJson<QuizResultSummary | null>(`${STORAGE_KEYS.resultPrefix}${sessionId}`, null);
