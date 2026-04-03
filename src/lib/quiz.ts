import { questions } from "@/data/questions";
import { topicMap, topics } from "@/data/topics";
import type {
  AttemptRecord,
  Difficulty,
  Question,
  QuizMode,
  QuizResultSummary,
  StoredQuizSession,
  TopicSummary,
} from "@/lib/types";

export const questionMap = new Map(questions.map((question) => [question.id, question]));

export const getQuestionById = (id: string) => questionMap.get(id);

export const getQuestionsByTopicIds = (topicIds: string[]) =>
  questions.filter((question) => topicIds.includes(question.topicId) && question.isActive);

export const getQuestionsForMode = ({
  topicIds,
  difficulty,
  mode,
  reviewQuestionIds = [],
}: {
  topicIds: string[];
  difficulty?: Difficulty | "おまかせ";
  mode: QuizMode;
  reviewQuestionIds?: string[];
}) => {
  let pool =
    mode === "review"
      ? questions.filter((question) => reviewQuestionIds.includes(question.id))
      : getQuestionsByTopicIds(topicIds);

  if (difficulty && difficulty !== "おまかせ") {
    pool = pool.filter((question) => question.difficulty === difficulty);
  }

  return shuffle(pool);
};

export const buildSession = ({
  title,
  topicIds,
  mode,
  questionsToUse,
}: {
  title: string;
  topicIds: string[];
  mode: QuizMode;
  questionsToUse: Question[];
}): StoredQuizSession => ({
  id: crypto.randomUUID(),
  title,
  mode,
  topicIds,
  questionIds: questionsToUse.map((question) => question.id),
  currentIndex: 0,
  attempts: [],
  startedAt: new Date().toISOString(),
});

export const buildResultSummary = (session: StoredQuizSession): QuizResultSummary => {
  const answeredCount = session.attempts.length;
  const correctCount = session.attempts.filter((attempt) => attempt.isCorrect).length;
  const incorrectCount = answeredCount - correctCount;
  const accuracyRate = answeredCount === 0 ? 0 : Math.round((correctCount / answeredCount) * 100);

  const topicSummaryMap = new Map<string, TopicSummary>();
  const tagMistakes = new Map<string, number>();
  const reviewQuestionIds = new Set<string>();

  session.attempts.forEach((attempt) => {
    const question = getQuestionById(attempt.questionId);
    if (!question) {
      return;
    }

    if (!topicSummaryMap.has(question.topicId)) {
      topicSummaryMap.set(question.topicId, {
        topicId: question.topicId,
        topicName: topicMap.get(question.topicId)?.name ?? question.topicId,
        answeredCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        accuracyRate: 0,
      });
    }

    const topicSummary = topicSummaryMap.get(question.topicId);
    if (!topicSummary) {
      return;
    }

    topicSummary.answeredCount += 1;
    if (attempt.isCorrect) {
      topicSummary.correctCount += 1;
    } else {
      topicSummary.incorrectCount += 1;
      reviewQuestionIds.add(question.id);
      question.tags.forEach((tag) => {
        tagMistakes.set(tag, (tagMistakes.get(tag) ?? 0) + 1);
      });
    }
  });

  const topicSummaries = Array.from(topicSummaryMap.values()).map((summary) => ({
    ...summary,
    accuracyRate:
      summary.answeredCount === 0
        ? 0
        : Math.round((summary.correctCount / summary.answeredCount) * 100),
  }));

  const weakestTags = Array.from(tagMistakes.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);

  return {
    sessionId: session.id,
    title: session.title,
    answeredCount,
    correctCount,
    incorrectCount,
    accuracyRate,
    weakestTags,
    topicSummaries,
    reviewQuestionIds: Array.from(reviewQuestionIds),
    finishedAt: new Date().toISOString(),
  };
};

export const aggregateTopicProgress = (attempts: AttemptRecord[]) => {
  const summaryMap = new Map<string, TopicSummary>();

  attempts.forEach((attempt) => {
    if (!summaryMap.has(attempt.topicId)) {
      summaryMap.set(attempt.topicId, {
        topicId: attempt.topicId,
        topicName: topicMap.get(attempt.topicId)?.name ?? attempt.topicId,
        answeredCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        accuracyRate: 0,
      });
    }

    const summary = summaryMap.get(attempt.topicId);
    if (!summary) {
      return;
    }

    summary.answeredCount += 1;
    if (attempt.isCorrect) {
      summary.correctCount += 1;
    } else {
      summary.incorrectCount += 1;
    }
  });

  return topics.map((topic) => {
    const base = summaryMap.get(topic.id) ?? {
      topicId: topic.id,
      topicName: topic.name,
      answeredCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      accuracyRate: 0,
    };

    return {
      ...base,
      accuracyRate:
        base.answeredCount === 0 ? 0 : Math.round((base.correctCount / base.answeredCount) * 100),
    };
  });
};

export const getReviewCandidates = (attempts: AttemptRecord[]) => {
  const latestAttempts = new Map<string, AttemptRecord>();

  attempts
    .slice()
    .sort((a, b) => new Date(a.answeredAt).getTime() - new Date(b.answeredAt).getTime())
    .forEach((attempt) => {
      latestAttempts.set(attempt.questionId, attempt);
    });

  return Array.from(latestAttempts.values())
    .filter((attempt) => !attempt.isCorrect)
    .map((attempt) => attempt.questionId);
};

export const formatAccuracy = (value: number) => `${value}%`;

const shuffle = <T,>(items: T[]) => {
  const cloned = [...items];
  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
  }
  return cloned;
};
