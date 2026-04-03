import Link from "next/link";

import { questions } from "@/data/questions";
import { topics } from "@/data/topics";

export default function TopicsPage() {
  return (
    <section className="page-stack">
      <header className="page-header">
        <span className="eyebrow">Topics</span>
        <h1>学びたいテーマから選ぶ</h1>
        <p className="lead">最初は敬語や電話から、慣れてきたら席次や情報管理まで広げられます。</p>
      </header>

      <div className="topic-grid">
        {topics.map((topic) => {
          const count = questions.filter((question) => question.topicId === topic.id).length;
          return (
            <article key={topic.id} className={`topic-card topic-card--${topic.accent}`}>
              <div className="topic-card__top">
                <span className="pill">{topic.id}</span>
                <span className="muted">{count}問</span>
              </div>
              <h2>{topic.name}</h2>
              <p>{topic.description}</p>
              <div className="actions-row">
                <Link href={`/topics/${topic.id}`} className="button button--secondary">
                  詳細を見る
                </Link>
                <Link href={`/quiz?topicId=${topic.id}`} className="button button--primary">
                  このテーマで学ぶ
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
