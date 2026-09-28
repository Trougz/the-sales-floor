import Reveal from '../ui/Reveal.jsx';

/** Companies named by the team as current partners. Rendered as plain wordmarks — no logo assets used. */
export default function LogoStrip() {
  return (
    <section className="logo-strip" aria-label="Companies we work with">
      <div className="container">
        <Reveal className="logo-strip__inner">
          <p className="logo-strip__label">Working with growth-stage teams like</p>
          <ul className="logo-strip__names">
            <li>Pepper</li>
            <li aria-hidden="true" className="logo-strip__dot" />
            <li>NOSO Labs</li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
