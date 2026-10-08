import { Lock } from 'lucide-react';
import useForm from '../../hooks/useForm.js';
import { submitForm } from '../../services/forms.js';
import { compact, email, phone, required, resumeFile, url, wholeNumber } from '../../services/validators.js';
import { CRM_TOOLS, INDUSTRIES, STATE_GROUPS, TARGET_ROLES } from '../../data/formOptions.js';
import Button from '../ui/Button.jsx';
import { ChoiceGroup, FileField, SelectField, TextArea, TextField } from './Field.jsx';
import FormSuccess from './FormSuccess.jsx';
import SubmitButton from './SubmitButton.jsx';

const INITIAL = {
  // About you
  name: '',
  email: '',
  phone: '',
  linkedin: '',
  state: '',
  relocation: '',
  // Sales experience
  target_roles: [],
  years: '',
  crm: [],
  awards: '',
  // Industry, resume
  industry: [],
  resume: null,
};

// No longer mirrors the live intake form / Django view, which still require `company` and `desired_ote`
// (see the header of services/forms.js).
const REQUIRED_FIELDS = ['name', 'email', 'phone', 'linkedin', 'years', 'state', 'relocation', 'resume'];

const validate = (v) =>
  compact({
    name: required('Enter your full name.')(v.name),
    email: email(v.email),
    phone: phone(v.phone),
    linkedin: url(v.linkedin, { host: 'linkedin.com' }),
    years: wholeNumber(v.years, { min: 0, max: 50, label: 'your years in B2B sales' }),
    state: required('Select your state or province.')(v.state),
    relocation: required('Let us know whether you’d relocate.')(v.relocation),
    resume: resumeFile(v.resume),
  });

function FormSection({ number, title, description, children }) {
  return (
    <fieldset className="form-section">
      <legend className="form-section__legend">
        <span className="form-section__number" aria-hidden="true">
          {number}
        </span>
        <span>
          <span className="form-section__title">{title}</span>
          {description && <span className="form-section__desc">{description}</span>}
        </span>
      </legend>
      <div className="form-section__body">{children}</div>
    </fieldset>
  );
}

export default function CandidateForm() {
  const form = useForm({ initialValues: INITIAL, validate, onSubmit: (values) => submitForm('candidate', values) });
  const done = REQUIRED_FIELDS.filter((name) => !form.errors[name]).length;
  const percent = Math.round((done / REQUIRED_FIELDS.length) * 100);

  if (form.status === 'success') {
    return (
      <div className="form-card form-card--success">
        <FormSuccess
          title="You’re in the network."
          actions={
            <>
              <Button to="/process" variant="dark" arrow>
                See how it works
              </Button>
              <Button to="/" variant="outline">
                Back to home
              </Button>
            </>
          }
        >
          <p>Thanks for the details. We’ll review your profile and reach out directly when there’s a relevant opportunity — no recruiter spam, no black hole.</p>
        </FormSuccess>
      </div>
    );
  }

  return (
    <form ref={form.formRef} className="form-card" onSubmit={form.handleSubmit} noValidate aria-label="Talent network profile">
      <div className="form-progress" role="group" aria-label="Form progress">
        <div className="form-progress__text">
          <span>
            <strong>{done}</strong> of {REQUIRED_FIELDS.length} required fields complete
          </span>
          <span className="form-progress__percent">{percent}%</span>
        </div>
        <div className="form-progress__track" aria-hidden="true">
          <span className="form-progress__bar" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <FormSection number="1" title="About you" description="How we’ll reach you, and where you’re based.">
        <div className="form-grid">
          <TextField form={form} name="name" label="Full name" required autoComplete="name" placeholder="Jane Smith" />
          <TextField form={form} name="email" type="email" label="Email" required autoComplete="email" placeholder="jane@company.com" />
          <TextField form={form} name="phone" type="tel" label="Phone" required autoComplete="tel" placeholder="+1 (555) 000-0000" />
          <TextField form={form} name="linkedin" type="url" label="LinkedIn URL" required autoComplete="url" placeholder="linkedin.com/in/yourname" />
          <SelectField form={form} name="state" label="State / province" required groups={STATE_GROUPS} placeholder="Select your state or province" autoComplete="address-level1" />
          <ChoiceGroup form={form} name="relocation" kind="radio" segmented label="Open to relocation?" required options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} />
        </div>
      </FormSection>

      <FormSection number="2" title="Sales experience" description="Your experience and what you’re looking for.">
        <div className="form-grid">
          <TextField form={form} name="years" label="Years in B2B sales" required numeric maxDigits={2} placeholder="e.g. 3" />
        </div>
        <ChoiceGroup form={form} name="target_roles" label="Role you’re looking for" optional options={TARGET_ROLES} />
        <ChoiceGroup form={form} name="crm" label="CRM and sales tools" optional options={CRM_TOOLS} hint="Tools you’ve used day to day." />
        <TextArea form={form} name="awards" label="President’s Club / awards" optional rows={3} placeholder="e.g. President’s Club 2024, Top SDR Q3 2023…" />
      </FormSection>

      <FormSection number="3" title="Industry" description="Where you’d like to sell.">
        <ChoiceGroup form={form} name="industry" label="Industries you’re interested in" optional options={INDUSTRIES} />
      </FormSection>

      <FormSection number="4" title="Resume" description="Only shared with a company when you’re being considered for a role there.">
        <FileField form={form} name="resume" label="Resume" required />
      </FormSection>

      <div className="form-footer">
        <p className="form-footer__note">
          <Lock size={15} aria-hidden="true" /> Free to join. Takes about two minutes. We never sell your information.
        </p>
        <SubmitButton status={form.status} pending="Joining…">
          Join the Talent Network
        </SubmitButton>
      </div>
      {form.status === 'error' && (
        <p className="form-error" role="alert">
          Something went wrong sending your profile. Please try again.
        </p>
      )}
      {form.attempted && Object.keys(form.errors).length > 0 && (
        <p className="sr-only" role="alert">
          {Object.keys(form.errors).length} fields need your attention.
        </p>
      )}
    </form>
  );
}
