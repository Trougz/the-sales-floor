import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { Briefcase, Check, UserRound } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta.js';
import TalentFormLayout from '../components/sections/TalentFormLayout.jsx';
import CompanyFormLayout from '../components/sections/CompanyFormLayout.jsx';
import Button from '../components/ui/Button.jsx';
import { COMMUNITY_ACTION } from '../data/navigation.js';

const OPTIONS = [
  { id: 'talent', Icon: UserRound, tone: 'talent', title: 'I’m Sales Talent', desc: 'Join the network and get introduced to relevant companies.' },
  { id: 'company', Icon: Briefcase, tone: 'hiring', title: 'I’m Hiring', desc: 'Tell us who you’re hiring and meet the salespeople who fit.' },
];

const FORMS = {
  talent: { Layout: TalentFormLayout, titleId: 'join-title' },
  company: { Layout: CompanyFormLayout, titleId: 'hire-title' },
};

/**
 * The combined intake: one page, one choice, then the matching form. The choice lives in the URL
 * (`/join?as=talent` | `/join?as=company`) so any link can preselect a side. The forms themselves are
 * the same components the Talent and Companies pages use.
 */
export default function Join() {
  usePageMeta('Join The Sales Floor', 'Join The Sales Floor as sales talent or as a company that’s hiring. Pick your side and tell us a little about yourself.');
  const [params, setParams] = useSearchParams();
  const asParam = params.get('as');
  const audience = Object.hasOwn(FORMS, asParam) ? asParam : null;

  const choiceRef = useRef(null);
  const picked = useRef(false);

  const choose = (id) => {
    picked.current = true;
    setParams({ as: id }, { replace: true });
  };

  // After a click, scroll so the choice buttons sit at the top and the form starts right beneath them,
  // which keeps the switch reachable. Not on a deep link, where the page should open at the top.
  useEffect(() => {
    if (!audience || !picked.current) return;
    picked.current = false;
    choiceRef.current?.scrollIntoView({ block: 'start' });
  }, [audience]);

  const form = audience ? FORMS[audience] : null;

  return (
    <>
      <section className="page-hero page-hero--center" aria-labelledby="join-page-title">
        <div className="page-hero__bg" aria-hidden="true" />
        <div className="container">
          <div className="page-hero__inner">
            <span className="eyebrow hero-in">Join The Sales Floor</span>
            <h1 id="join-page-title" className="hero-in" style={{ '--d': '80ms' }}>
              Which side of <em>the floor</em> are you on?
            </h1>
            <p className="lead hero-in" style={{ '--d': '180ms' }}>
              Pick the one that fits and we’ll show you the right form.
            </p>
          </div>

          <div ref={choiceRef} className="join-choice hero-in" style={{ '--d': '280ms' }} role="group" aria-label="I am">
            {OPTIONS.map(({ id, Icon, tone, title, desc }) => {
              const selected = audience === id;
              return (
                <button key={id} type="button" className={`join-choice__option join-choice__option--${tone}`} aria-pressed={selected} onClick={() => choose(id)}>
                  <span className="icon-tile">
                    <Icon size={26} aria-hidden="true" />
                  </span>
                  <span className="join-choice__title">{title}</span>
                  <span className="join-choice__desc">{desc}</span>
                  <span className="join-choice__check" aria-hidden="true">
                    <Check size={15} strokeWidth={3} />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="join-community hero-in" style={{ '--d': '380ms' }}>
            <Button to={COMMUNITY_ACTION.to} variant="outline" size="lg">
              {COMMUNITY_ACTION.label}
            </Button>
          </div>
        </div>
      </section>

      {form && (
        <section className="section" id="join-form" aria-labelledby={form.titleId}>
          <form.Layout />
        </section>
      )}
    </>
  );
}
