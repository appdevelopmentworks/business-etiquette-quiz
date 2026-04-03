import { questions } from "@/data/questions";
import { topicMap, topics } from "@/data/topics";
import type {
  AttemptRecord,
  Difficulty,
  Question,
  QuizMode,
  QuizResultSummary,
  StoredQuizSession,
  TagSummary,
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
      ? getQuestionsByTopicIds(topicIds).filter((question) => reviewQuestionIds.includes(question.id))
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
      return;
    }

    topicSummary.incorrectCount += 1;
    reviewQuestionIds.add(question.id);
  });

  const topicSummaries = Array.from(topicSummaryMap.values()).map((summary) => ({
    ...summary,
    accuracyRate:
      summary.answeredCount === 0
        ? 0
        : Math.round((summary.correctCount / summary.answeredCount) * 100),
  }));

  const weakTagSummaries = buildTagSummaries(session.attempts)
    .filter(isReviewWorthyTagSummary)
    .slice(0, 5);
  const weakestTags = weakTagSummaries.slice(0, 3).map((summary) => summary.tag);

  return {
    sessionId: session.id,
    title: session.title,
    answeredCount,
    correctCount,
    incorrectCount,
    accuracyRate,
    weakestTags,
    weakTagSummaries,
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
  const questionStats = buildQuestionReviewStats(attempts);

  return Array.from(questionStats.values())
    .filter((stat) => stat.priorityScore > 0)
    .sort((a, b) => b.priorityScore - a.priorityScore || b.incorrectCount - a.incorrectCount)
    .map((stat) => stat.questionId);
};

export const formatAccuracy = (value: number) => `${value}%`;

export const buildTagSummaries = (attempts: AttemptRecord[]): TagSummary[] => {
  const questionStats = buildQuestionReviewStats(attempts);
  const summaryMap = new Map<
    string,
    {
      tag: string;
      answeredCount: number;
      correctCount: number;
      incorrectCount: number;
      reviewQuestionIds: Set<string>;
      priorityScore: number;
    }
  >();

  attempts.forEach((attempt) => {
    const question = getQuestionById(attempt.questionId);
    if (!question) {
      return;
    }

    question.tags.forEach((tag) => {
      if (!summaryMap.has(tag)) {
        summaryMap.set(tag, {
          tag,
          answeredCount: 0,
          correctCount: 0,
          incorrectCount: 0,
          reviewQuestionIds: new Set<string>(),
          priorityScore: 0,
        });
      }

      const summary = summaryMap.get(tag);
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
  });

  questionStats.forEach((stat) => {
    const question = getQuestionById(stat.questionId);
    if (!question) {
      return;
    }

    question.tags.forEach((tag) => {
      const summary = summaryMap.get(tag);
      if (!summary) {
        return;
      }

      if (stat.priorityScore > 0) {
        summary.reviewQuestionIds.add(stat.questionId);
      }

      summary.priorityScore += stat.priorityScore;
    });
  });

  return Array.from(summaryMap.values())
    .map((summary) => ({
      tag: summary.tag,
      answeredCount: summary.answeredCount,
      correctCount: summary.correctCount,
      incorrectCount: summary.incorrectCount,
      accuracyRate:
        summary.answeredCount === 0
          ? 0
          : Math.round((summary.correctCount / summary.answeredCount) * 100),
      reviewQuestionIds: Array.from(summary.reviewQuestionIds),
      priorityScore: summary.priorityScore,
    }))
    .filter((summary) => summary.answeredCount > 0)
    .sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      if (b.incorrectCount !== a.incorrectCount) {
        return b.incorrectCount - a.incorrectCount;
      }
      if (a.accuracyRate !== b.accuracyRate) {
        return a.accuracyRate - b.accuracyRate;
      }
      return b.answeredCount - a.answeredCount;
    });
};

export const getReviewQuestionIdsForTagSummaries = ({
  tagSummaries,
  maxTags = 3,
}: {
  tagSummaries: TagSummary[];
  maxTags?: number;
}) =>
  Array.from(
    new Set(
      tagSummaries
        .slice(0, maxTags)
        .flatMap((summary) => summary.reviewQuestionIds),
    ),
  );

export const getPrioritizedReviewQuestionIds = ({
  attempts,
  bookmarkedIds = [],
  maxTags = 3,
}: {
  attempts: AttemptRecord[];
  bookmarkedIds?: string[];
  maxTags?: number;
}) => {
  const weakTagSummaries = buildTagSummaries(attempts).filter(isReviewWorthyTagSummary);

  return Array.from(
    new Set([
      ...getReviewQuestionIdsForTagSummaries({ tagSummaries: weakTagSummaries, maxTags }),
      ...getReviewCandidates(attempts),
      ...bookmarkedIds,
    ]),
  );
};

export const getTagReviewQuestionIds = ({
  attempts,
  tag,
  bookmarkedIds = [],
}: {
  attempts: AttemptRecord[];
  tag: string;
  bookmarkedIds?: string[];
}) => {
  const bookmarkSet = new Set(bookmarkedIds);
  const questionStats = buildQuestionReviewStats(attempts);

  return questions
    .filter((question) => question.tags.includes(tag) && question.isActive)
    .map((question) => {
      const stat = questionStats.get(question.id);
      const bookmarkBoost = bookmarkSet.has(question.id) ? 2 : 0;
      const priorityScore = (stat?.priorityScore ?? 0) + bookmarkBoost;

      return {
        questionId: question.id,
        priorityScore,
        answeredCount: stat?.attemptCount ?? 0,
        latestAnsweredAt: stat?.latestAnsweredAt ?? "",
      };
    })
    .sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      if (a.answeredCount !== b.answeredCount) {
        return a.answeredCount - b.answeredCount;
      }
      return b.latestAnsweredAt.localeCompare(a.latestAnsweredAt);
    })
    .map((item) => item.questionId);
};

const shuffle = <T,>(items: T[]) => {
  const cloned = [...items];
  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
  }
  return cloned;
};

const buildQuestionReviewStats = (attempts: AttemptRecord[]) => {
  const sortedAttempts = attempts
    .slice()
    .sort((a, b) => new Date(a.answeredAt).getTime() - new Date(b.answeredAt).getTime());

  const stats = new Map<
    string,
    {
      questionId: string;
      attemptCount: number;
      incorrectCount: number;
      latestIsCorrect: boolean;
      latestAnsweredAt: string;
      priorityScore: number;
    }
  >();

  sortedAttempts.forEach((attempt) => {
    if (!stats.has(attempt.questionId)) {
      stats.set(attempt.questionId, {
        questionId: attempt.questionId,
        attemptCount: 0,
        incorrectCount: 0,
        latestIsCorrect: true,
        latestAnsweredAt: "",
        priorityScore: 0,
      });
    }

    const stat = stats.get(attempt.questionId);
    if (!stat) {
      return;
    }

    stat.attemptCount += 1;
    if (!attempt.isCorrect) {
      stat.incorrectCount += 1;
    }

    stat.latestIsCorrect = attempt.isCorrect;
    stat.latestAnsweredAt = attempt.answeredAt;
  });

  stats.forEach((stat) => {
    let priorityScore = stat.incorrectCount * 2;

    if (!stat.latestIsCorrect) {
      priorityScore += 4;
    }

    if (stat.attemptCount > 0 && stat.incorrectCount / stat.attemptCount >= 0.5) {
      priorityScore += 2;
    }

    stat.priorityScore = priorityScore;
  });

  return stats;
};

const isReviewWorthyTagSummary = (summary: TagSummary) =>
  summary.incorrectCount > 0 || summary.reviewQuestionIds.length > 0;
