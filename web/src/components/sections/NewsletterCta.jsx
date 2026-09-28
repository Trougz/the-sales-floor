import Reveal from '../ui/Reveal.jsx';
import NewsletterForm from '../forms/NewsletterForm.jsx';

/** Dark newsletter band. The newsletter isn't live yet — copy says so honestly. */
export default function NewsletterCta({ id }) {
  return (
    <section className="section section--dark newsletter" id={id} aria-labelledby={`${id ?? 'newsletter'}-title`}>
      <div className="newsletter__glow" aria-hidden="true" />
      <div className="container">
        <Reveal className="newsletter__inner">
          <div>
            <span className="eyebrow">Newsletter</span>
            <h2 id={`${id ?? 'newsletter'}-title`}>
              Be first to read <em>what we publish.</em>
            </h2>
            <p className="lead">Career advice, hiring insights, and notes on the sales market. We’ll email you when the first issue is ready, and only then.</p>
          </div>
          <NewsletterForm />
        </Reveal>
      </div>
    </section>
  );
}
