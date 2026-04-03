import { QuizSetupScreen } from "@/components/quiz/QuizSetupScreen";

type QuizSetupPageProps = {
  searchParams: Promise<{ topicId?: string }>;
};

export default async function QuizSetupPage({ searchParams }: QuizSetupPageProps) {
  const { topicId } = await searchParams;
  return <QuizSetupScreen initialTopicId={topicId ?? "all"} />;
}
