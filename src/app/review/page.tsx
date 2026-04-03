import { ReviewScreen } from "@/components/review/ReviewScreen";

type ReviewPageProps = {
  searchParams: Promise<{ tag?: string }>;
};

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const { tag } = await searchParams;
  return <ReviewScreen initialTag={tag} />;
}
