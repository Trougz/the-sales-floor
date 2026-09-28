import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import Accordion from '../ui/Accordion.jsx';
import { TabPanel, Tabs } from '../ui/Tabs.jsx';
import SectionHead from '../ui/SectionHead.jsx';
import Reveal from '../ui/Reveal.jsx';
import { FAQ_ITEMS } from '../../data/faq.js';

const TABS = [
  { id: 'talent', label: 'For sales talent' },
  { id: 'companies', label: 'For companies' },
];

const toAccordionItems = (audience) =>
  FAQ_ITEMS.filter((item) => item.audiences.includes(audience)).map((item) => ({
    id: item.id,
    q: item.q,
    a: (
      <>
        {item.a.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        {item.link && (
          <p>
            <Link to={item.link.to} className="link-arrow">
              {item.link.label} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </p>
        )}
      </>
    ),
  }));

/** Tabbed FAQ (talent / companies) with an accordion in each tab. */
export default function FaqSection({ id = 'faq', defaultTab = 'talent' }) {
  const [tab, setTab] = useState(defaultTab);

  return (
    <section className="section" id={id} aria-labelledby={`${id}-title`}>
      <div className="container container--narrow">
        <SectionHead
          center
          eyebrow="FAQ"
          title={<span id={`${id}-title`}>Good questions, straight answers.</span>}
          lead="Everything you’d want to know before you join the network or start hiring."
        />
        <Reveal className="faq__tabs">
          <Tabs tabs={TABS} value={tab} onChange={setTab} idBase={`${id}-tabs`} label="FAQ audience" />
        </Reveal>
        {TABS.map((t) => (
          <TabPanel key={t.id} id={t.id} value={tab} idBase={`${id}-tabs`}>
            <Accordion key={t.id} items={toAccordionItems(t.id)} defaultOpen={toAccordionItems(t.id)[0].id} />
          </TabPanel>
        ))}
      </div>
    </section>
  );
}
