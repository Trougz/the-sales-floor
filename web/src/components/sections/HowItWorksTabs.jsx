import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { TabPanel, Tabs } from '../ui/Tabs.jsx';
import Reveal from '../ui/Reveal.jsx';
import StepList from './StepList.jsx';
import { COMPANY_STEPS, TALENT_STEPS } from '../../data/steps.js';

const TABS = [
  { id: 'talent', label: 'For sales talent' },
  { id: 'companies', label: 'For companies' },
];

/** Compact "how it works" with an audience toggle (Home). The full version lives on /process. */
export default function HowItWorksTabs() {
  const [tab, setTab] = useState('talent');
  return (
    <div className="hiw">
      <Reveal className="hiw__tabs">
        <Tabs tabs={TABS} value={tab} onChange={setTab} idBase="hiw" label="How it works audience" />
      </Reveal>
      <TabPanel id="talent" value={tab} idBase="hiw">
        <StepList steps={TALENT_STEPS} />
      </TabPanel>
      <TabPanel id="companies" value={tab} idBase="hiw">
        <StepList steps={COMPANY_STEPS} />
      </TabPanel>
      <Reveal className="hiw__more">
        <Link to="/process" className="link-arrow">
          See the full process <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </Reveal>
    </div>
  );
}
