export type ChoiceKey = "A" | "B" | "C" | "D";
export type Difficulty = "初級" | "中級" | "上級";
export type QuizMode = "normal" | "review" | "unlearned";

export type Topic = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  sortOrder: number;
  accent: "blush" | "peach" | "mint" | "sky";
  isActive: boolean;
};

export type Choice = {
  key: ChoiceKey;
  text: string;
};

export type Question = {
  id: string;
  topicId: string;
  objectiveId: string;
  difficulty: Difficulty;
  tags: string[];
  question: string;
  situation?: string;
  choices: Choice[];
  correctAnswer: ChoiceKey;
  explanation: string;
  incorrectExplanations?: Partial<Record<ChoiceKey, string>>;
  takeaway?: string;
  sourceIds: string[];
  note?: string;
  version: string;
  isActive: boolean;
};

export type Source = {
  id: string;
  title: string;
  reliability: "A" | "B" | "C";
  url: string;
};

export type AttemptRecord = {
  id: string;
  sessionId: string;
  questionId: string;
  topicId: string;
  selectedAnswer: ChoiceKey;
  correctAnswer: ChoiceKey;
  isCorrect: boolean;
  responseMs: number;
  answeredAt: string;
};

export type StoredQuizSession = {
  id: string;
  mode: QuizMode;
  title: string;
  topicIds: string[];
  questionIds: string[];
  currentIndex: number;
  attempts: AttemptRecord[];
  startedAt: string;
};

export type TopicSummary = {
  topicId: string;
  topicName: string;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  accuracyRate: number;
};

export type TagSummary = {
  tag: string;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  accuracyRate: number;
  reviewQuestionIds: string[];
  priorityScore: number;
};

export type TagHistoryPoint = {
  sessionId: string;
  label: string;
  answeredAt: string;
  answeredCount: number;
  correctCount: number;
  accuracyRate: number;
};

export type TagImprovementSummary = {
  tag: string;
  answeredCount: number;
  studiedSessionCount: number;
  firstAccuracyRate: number;
  latestAccuracyRate: number;
  bestAccuracyRate: number;
  improvementDelta: number;
  trend: "up" | "flat" | "down";
  lastStudiedAt: string;
  history: TagHistoryPoint[];
};

export type QuizResultSummary = {
  sessionId: string;
  title: string;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  accuracyRate: number;
  weakestTags: string[];
  weakTagSummaries: TagSummary[];
  topicSummaries: TopicSummary[];
  reviewQuestionIds: string[];
  finishedAt: string;
};

export type Bookmark = {
  questionId: string;
  createdAt: string;
};
