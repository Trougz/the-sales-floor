import { useSearchParams } from 'react-router';
import usePageMeta from '../hooks/usePageMeta.js';
import Reveal from '../components/ui/Reveal.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import ArticleCard from '../components/sections/ArticleCard.jsx';
import NewsletterCta from '../components/sections/NewsletterCta.jsx';
import { ARTICLES, CATEGORIES } from '../data/articles.js';

export default function Resources() {
  usePageMeta('Resources & Insights', 'A content hub for sales career advice, hiring advice, compensation, interviewing, sales leadership, and the sales market. Sample content shown.');
  const [params, setParams] = useSearchParams();
  const requested = params.get('category');
  const category = CATEGORIES.some((c) => c.id === requested) ? requested : 'all';

  const setCategory = (id) => {
    const next = new URLSearchParams(params);
    if (id === 'all') next.delete('category');
    else next.set('category', id);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const featured = ARTICLES.find((article) => article.featured);
  const showFeatured = category === 'all' || featured.category === category;
  const grid = ARTICLES.filter((article) => article !== featured && (category === 'all' || article.category === category));

  return (
    <>
      <section className="page-hero" aria-labelledby="resources-title">
        <div className="page-hero__bg" aria-hidden="true" />
        <div className="container">
          <div className="page-hero__inner">
            <span className="eyebrow hero-in">Resources / Insights</span>
            <h1 id="resources-title" className="hero-in" style={{ '--d': '80ms' }}>
              Sales insights, <em>from the floor.</em>
            </h1>
            <p className="lead hero-in" style={{ '--d': '180ms' }}>
              A future content hub for sales careers, hiring, compensation, and the sales market.
            </p>
            <p className="hero-in resources-note" style={{ '--d': '260ms' }}>
              <Badge tone="sample">Sample content</Badge> The articles below show how the hub will look. They aren’t published yet.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--tight" id="latest" aria-labelledby="latest-title">
        <div className="container">
          <h2 id="latest-title" className="sr-only">
            Articles
          </h2>

          <Reveal className="filters" role="group" aria-label="Filter by category">
            <button type="button" className="filter" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
              All topics
            </button>
            {CATEGORIES.map((c) => (
              <button key={c.id} type="button" className="filter" aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
                {c.label}
              </button>
            ))}
          </Reveal>

          {showFeatured && (
            <div className="featured-slot">
              <ArticleCard article={featured} featured />
            </div>
          )}

          {grid.length > 0 ? (
            <div className="grid grid--3 article-grid" aria-live="polite">
              {grid.map((article, index) => (
                <ArticleCard key={article.slug} article={article} delay={index * 70} />
              ))}
            </div>
          ) : (
            !showFeatured && (
              <div className="empty-state">
                <p>No sample articles in this category yet.</p>
                <Button variant="outline" onClick={() => setCategory('all')}>
                  Show all topics
                </Button>
              </div>
            )
          )}
        </div>
      </section>

      <NewsletterCta id="newsletter" />
    </>
  );
}
