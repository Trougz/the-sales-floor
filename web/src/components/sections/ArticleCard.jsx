import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
import Reveal from '../ui/Reveal.jsx';
import Flame from '../ui/Flame.jsx';
import { categoryLabel } from '../../data/articles.js';

/** Sample article card. Cover art is generated from CSS per category — no stock imagery. */
export default function ArticleCard({ article, delay = 0, featured = false }) {
  return (
    <Reveal as="article" delay={delay} className={`article-card${featured ? ' article-card--featured' : ''} article-card--${article.category}`}>
      <Link to={`/resources/${article.slug}`} className="article-card__link">
        <div className="article-card__cover" aria-hidden="true">
          <Flame className="article-card__flame" />
          <Badge tone="sample">Sample</Badge>
        </div>
        <div className="article-card__body">
          <span className="article-card__category">{categoryLabel(article.category)}</span>
          <h3>{article.title}</h3>
          <p>{article.excerpt}</p>
          <span className="article-card__more">
            Preview layout <ArrowUpRight size={16} aria-hidden="true" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
