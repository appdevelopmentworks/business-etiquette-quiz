import { QuizPlayer } from "@/components/quiz/QuizPlayer";

type QuizPageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function QuizPage({ params }: QuizPageProps) {
  const { sessionId } = await params;
  return <QuizPlayer sessionId={sessionId} />;
}
