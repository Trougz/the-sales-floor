import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta.js';
import Badge from '../components/ui/Badge.jsx';
import Placeholder from '../components/ui/Placeholder.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import ArticleCard from '../components/sections/ArticleCard.jsx';
import NewsletterCta from '../components/sections/NewsletterCta.jsx';
import NotFound from './NotFound.jsx';
import { ARTICLES, categoryLabel } from '../data/articles.js';

/** Sample article template: shows the reading layout without pretending there's a real piece. */
export default function Article() {
  const { slug } = useParams();
  const article = ARTICLES.find((a) => a.slug === slug);
  usePageMeta(article ? `${article.title} (sample)` : 'Article not found', article?.excerpt);

  if (!article) return <NotFound />;

  const related = ARTICLES.filter((a) => a.slug !== article.slug && a.category === article.category).concat(ARTICLES.filter((a) => a.slug !== article.slug && a.category !== article.category)).slice(0, 2);

  return (
    <>
      <article className="section article-page">
        <div className="container container--narrow">
          <Link to="/resources" className="back-link">
            <ArrowLeft size={16} aria-hidden="true" /> All resources
          </Link>
          <header className="article-page__header">
            <div className="article-page__meta">
              <span className="article-card__category">{categoryLabel(article.category)}</span>
              <Badge tone="sample">Sample article</Badge>
            </div>
            <h1>{article.title}</h1>
            <p className="lead">{article.excerpt}</p>
          </header>

          <Reveal className="article-page__notice" role="note">
            <strong>This is a sample page.</strong> It shows how a published article will read. The real piece hasn’t been written yet.
          </Reveal>

          <div className="article-page__body">
            <Placeholder label="[Article body placeholder]" hint="Long-form copy, pull quotes, and subheads will render here in the same editorial layout." />
            <Placeholder label="[Author byline placeholder]" hint="Add a verified author and publish date once real articles exist." />
          </div>
        </div>
      </article>

      <section className="section section--soft section--tight" aria-labelledby="related-title">
        <div className="container">
          <h2 id="related-title" className="related-title">
            More sample articles
          </h2>
          <div className="grid grid--2">
            {related.map((item, index) => (
              <ArticleCard key={item.slug} article={item} delay={index * 80} />
            ))}
          </div>
        </div>
      </section>

      <NewsletterCta />
    </>
  );
}
