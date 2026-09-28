import usePageMeta from '../hooks/usePageMeta.js';
import Button from '../components/ui/Button.jsx';

export default function NotFound() {
  usePageMeta('Page not found');
  return (
    <section className="page-hero page-hero--center not-found">
      <div className="page-hero__bg" aria-hidden="true" />
      <div className="container">
        <div className="page-hero__inner">
          <span className="eyebrow">404</span>
          <h1>
            That page isn’t <em>on the floor.</em>
          </h1>
          <p className="lead">The link may be old, or the page may have moved. Here’s a way back.</p>
          <div className="page-hero__ctas">
            <Button to="/" size="lg" arrow>
              Back to home
            </Button>
            <Button to="/contact" size="lg" variant="outline">
              Contact us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
