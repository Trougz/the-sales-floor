import { Lock } from 'lucide-react';
import Reveal from '../ui/Reveal.jsx';
import CompanyForm from '../forms/CompanyForm.jsx';

const INCLUDE = ['The role and seniority', 'Industry and experience you want', 'Compensation and location', 'Your hiring timeline'];

export default function CompanyFormLayout() {
  return (
    <div className="container form-layout">
      <div className="form-layout__aside">
        <Reveal className="form-layout__sticky">
          <span className="eyebrow">Hire sales talent</span>
          <h2 id="hire-title">
            Start with a few <em>details.</em>
          </h2>
          <p className="lead">Only the basics are required. The more you share, the sharper our first conversation.</p>
          <div className="include-list">
            <h3>Helpful to include</h3>
            <ul>
              {INCLUDE.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <p className="form-layout__privacy">
            <Lock size={15} aria-hidden="true" /> We’ll be in touch personally to talk through the profile.
          </p>
        </Reveal>
      </div>
      <div className="form-layout__main">
        <CompanyForm />
      </div>
    </div>
  );
}
