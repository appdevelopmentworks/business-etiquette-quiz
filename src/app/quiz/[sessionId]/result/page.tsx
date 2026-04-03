import { QuizResultScreen } from "@/components/quiz/QuizResultScreen";

type QuizResultPageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function QuizResultPage({ params }: QuizResultPageProps) {
  const { sessionId } = await params;
  return <QuizResultScreen sessionId={sessionId} />;
}
