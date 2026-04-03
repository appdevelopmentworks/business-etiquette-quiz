import Link from "next/link";
import { notFound } from "next/navigation";

import { questions } from "@/data/questions";
import { topicMap } from "@/data/topics";

type TopicDetailPageProps = {
  params: Promise<{ topicId: string }>;
};

export default async function TopicDetailPage({ params }: TopicDetailPageProps) {
  const { topicId } = await params;
  const topic = topicMap.get(topicId);

  if (!topic) {
    notFound();
  }

  const topicQuestions = questions.filter((question) => question.topicId === topicId);

  return (
    <section className="page-stack">
      <header className={`hero-card hero-card--compact hero-card--${topic.accent}`}>
        <div className="hero-card__content">
          <span className="eyebrow">{topic.id}</span>
          <h1>{topic.name}</h1>
          <p className="lead">{topic.description}</p>
          <div className="actions-row">
            <Link href={`/quiz?topicId=${topic.id}`} className="button button--primary">
              このテーマで学習開始
            </Link>
            <Link href="/topics" className="button button--secondary">
              一覧へ戻る
            </Link>
          </div>
        </div>
      </header>

      <article className="card card--soft">
        <h2 className="section-title">このテーマで学べること</h2>
        <ul className="clean-list">
          <li>実務に近い4択問題で判断のポイントを確認する</li>
          <li>正解理由だけでなく、不適切な行動がなぜ避けられるのかを理解する</li>
          <li>要復習として残し、あとからまとめて学び直す</li>
        </ul>
      </article>

      <article className="card">
        <h2 className="section-title">収録中の問題</h2>
        <div className="review-list">
          {topicQuestions.map((question) => (
            <div key={question.id} className="review-item">
              <div className="review-item__meta">
                <span className="pill">{question.difficulty}</span>
                <span className="muted">{question.tags.join(" / ")}</span>
              </div>
              <strong>{question.question}</strong>
              <p className="muted">{question.explanation}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
