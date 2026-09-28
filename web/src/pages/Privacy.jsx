import usePageMeta from '../hooks/usePageMeta.js';

/**
 * Ported verbatim from the live privacy.html (effective August 25, 2026).
 * NOTE: the new forms collect a few extra fields (target roles; company website, role, hires,
 * location, compensation, timeline; contact messages). Have the policy reviewed before those go live.
 */
export default function Privacy() {
  usePageMeta('Privacy Policy', 'How The Sales Floor collects, uses, and protects the information you submit.');

  return (
    <>
      <section className="page-hero page-hero--compact" aria-labelledby="privacy-title">
        <div className="page-hero__bg" aria-hidden="true" />
        <div className="container container--narrow">
          <h1 id="privacy-title">Privacy Policy</h1>
        </div>
      </section>

      <section className="section section--tight">
        <div className="container container--narrow policy">
          <p className="policy__updated">Effective August 25, 2026</p>
          <p>
            The Sales Floor (“we,” “us,” “our”) is a U.S.-based company operating thesalesfloor.biz, a recruiting service that connects B2B sales professionals with U.S. companies hiring for sales roles. This policy is written to U.S. privacy standards and practices. This page explains what information we collect through this site, why we collect it, who we share it with, and how you can reach us about it.
          </p>

          <h2>Information We Collect</h2>
          <p>
            <strong>If you apply as a candidate</strong>, we collect what you submit through our intake form:
          </p>
          <ul>
            <li>Contact details: full name, email, phone number, LinkedIn URL</li>
            <li>Career information: current employer, title, years of experience, quota performance</li>
            <li>Compensation: current OTE and your desired OTE range</li>
            <li>Location: your state or province, and your relocation/work-style preferences</li>
            <li>Industries and CRM/sales tools you have experience with</li>
            <li>Awards or achievements you choose to share</li>
            <li>Your resume file (PDF, DOC, or DOCX)</li>
          </ul>
          <p>
            <strong>If you reach out as a hiring company</strong>, we collect your business name and the contact email and phone number you provide.
          </p>
          <p>We do not use tracking cookies or third-party analytics on this site. We only collect what you directly submit through our forms.</p>

          <h2>How We Use Your Information</h2>
          <p>Candidate information is used to:</p>
          <ul>
            <li>
              Review and evaluate your fit for open sales roles. As part of this, we use an AI system (Anthropic’s Claude) to help our recruiters summarize and score submissions based on your resume and the details you provide — a human recruiter reviews every result, and this never happens without a submission you’ve made yourself.
            </li>
            <li>Match you with specific hiring companies when we believe there’s a genuine fit for a role they’re trying to fill. This is the core of what we do: when you’re being considered for a specific opening, we share the relevant parts of your profile and resume with that hiring company.</li>
            <li>Contact you about roles, follow up on your application, or ask clarifying questions.</li>
          </ul>
          <p>Employer information is used to follow up about your hiring needs and, once we’ve had a real conversation, to set up the roles you’re looking to fill in our system.</p>

          <h2>Who We Share Your Information With</h2>
          <p>
            We do not sell your personal information. We share candidate information only with the specific hiring companies you’re actively being considered for, and with service providers who help us operate the site and store data (for example, our hosting and database providers, and Anthropic, whose Claude models we use to help review submissions). These providers only process data on our behalf and are not permitted to use it for their own purposes.
          </p>

          <h2>How We Store and Protect Your Information</h2>
          <p>
            Your information is stored in a private database and file storage that are not publicly accessible. Resumes in particular are only viewable by authenticated Sales Floor staff — there is no public or guessable link to any resume. We take reasonable technical and organizational measures to protect your information, but no system is perfectly secure, and we can’t guarantee absolute security.
          </p>

          <h2>How Long We Keep Your Information</h2>
          <p>We retain your information for as long as it’s useful for matching you with roles or for our own recruiting operations, unless you ask us to delete it sooner (see below).</p>

          <h2>Your Rights and Choices</h2>
          <p>You can ask us at any time to:</p>
          <ul>
            <li>See what information we have on file for you</li>
            <li>Correct information that’s inaccurate or out of date</li>
            <li>Delete your information from our systems</li>
          </ul>
          <p>
            To do any of this, email us at <a href="mailto:zach@thesalesfloor.biz">zach@thesalesfloor.biz</a> and we’ll take care of it.
          </p>

          <h2>Children’s Privacy</h2>
          <p>This site is intended for working professionals and is not directed at, or knowingly used to collect information from, anyone under 18.</p>

          <h2>Changes to This Policy</h2>
          <p>We may update this policy as our practices evolve. If we make material changes, we’ll update the effective date above.</p>

          <h2>Contact Us</h2>
          <p>
            Questions about this policy or your information? Email <a href="mailto:zach@thesalesfloor.biz">zach@thesalesfloor.biz</a>.
          </p>
        </div>
      </section>
    </>
  );
}
