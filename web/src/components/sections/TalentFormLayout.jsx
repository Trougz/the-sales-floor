import { Lock } from 'lucide-react';
import Reveal from '../ui/Reveal.jsx';
import CandidateForm from '../forms/CandidateForm.jsx';

const AFTER_JOINING = [
  { title: 'We review your profile', body: 'A sales-focused recruiter looks at your background and what you told us you want.' },
  { title: 'We reach out when there’s a fit', body: 'No blasts. If something is relevant, we’ll contact you directly.' },
  { title: 'You decide what happens next', body: 'Every introduction is your call. You’re never obligated to move forward.' },
];

export default function TalentFormLayout() {
  return (
    <div className="container form-layout">
      <div className="form-layout__aside">
        <Reveal className="form-layout__sticky">
          <span className="eyebrow">Join the network</span>
          <h2 id="join-title">
            Tell us about yourself and <em>what you want.</em>
          </h2>
          <p className="lead">One profile, about two minutes. When there’s a genuine fit, we reach out directly.</p>

          <ol className="next-steps" aria-label="What happens after you join">
            {AFTER_JOINING.map((item, index) => (
              <li key={item.title}>
                <span className="next-steps__num" aria-hidden="true">
                  {index + 1}
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="form-layout__privacy">
            <Lock size={15} aria-hidden="true" /> Your resume is only shared with a company when you’re being considered for a role there.
          </p>
        </Reveal>
      </div>
      <div className="form-layout__main">
        <CandidateForm />
      </div>
    </div>
  );
}
