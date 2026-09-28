import usePageMeta from '../hooks/usePageMeta.js';
import SectionHead from '../components/ui/SectionHead.jsx';
import PathCards from '../components/sections/PathCards.jsx';
import ContactForm from '../components/forms/ContactForm.jsx';

export default function Contact() {
  usePageMeta('Contact', 'Talk to The Sales Floor. Join the talent network, hire sales talent, or send us a note.');

  return (
    <>
      <section className="page-hero page-hero--center" aria-labelledby="contact-title">
        <div className="page-hero__bg" aria-hidden="true" />
        <div className="container">
          <div className="page-hero__inner">
            <span className="eyebrow hero-in">Contact</span>
            <h1 id="contact-title" className="hero-in" style={{ '--d': '80ms' }}>
              Let’s make <em>the introduction.</em>
            </h1>
          </div>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="paths-title">
        <div className="container">
          <h2 id="paths-title" className="sr-only">
            Choose your path
          </h2>
          <PathCards />
        </div>
      </section>

      <section className="section" id="message" aria-labelledby="message-title">
        <div className="container container--narrow">
          <SectionHead center eyebrow="Or send a note" title={<span id="message-title">Not sure where you fit?</span>} lead="Tell us a little and we’ll point you the right way." />
          <ContactForm />
        </div>
      </section>
    </>
  );
}
