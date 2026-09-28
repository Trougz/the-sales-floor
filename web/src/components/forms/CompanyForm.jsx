import { Lock } from 'lucide-react';
import useForm from '../../hooks/useForm.js';
import { submitForm } from '../../services/forms.js';
import { compact, email, phone, required, url } from '../../services/validators.js';
import { COMP_RANGES, HIRE_COUNTS, HIRING_ROLES, HIRING_TIMELINES } from '../../data/formOptions.js';
import Button from '../ui/Button.jsx';
import { SelectField, TextField } from './Field.jsx';
import FormSuccess from './FormSuccess.jsx';
import SubmitButton from './SubmitButton.jsx';

const INITIAL = {
  company_name: '',
  contact_email: '',
  contact_phone: '',
  website: '',
  role: '',
  hires: '',
  location: '',
  compensation: '',
  timeline: '',
};

const validate = (v) =>
  compact({
    company_name: required('Enter your business name.')(v.company_name),
    contact_email: email(v.contact_email),
    contact_phone: phone(v.contact_phone, { optional: true }),
    website: url(v.website, { optional: true }),
    role: required('Tell us which role you’re hiring for.')(v.role),
  });

/** `tone="dark"` styles the card for use on a dark section. */
export default function CompanyForm({ tone = 'light' }) {
  const form = useForm({ initialValues: INITIAL, validate, onSubmit: (values) => submitForm('company', values) });

  if (form.status === 'success') {
    return (
      <div className={`form-card form-card--success form-card--${tone}`}>
        <FormSuccess
          title="We’re connected."
          actions={
            <>
              <Button to="/process" variant="dark" arrow>
                See how it works
              </Button>
              <Button to="/resources" variant="outline">
                Read our insights
              </Button>
            </>
          }
        >
          <p>Thanks for telling us who you’re looking for. We’ll be in touch personally to talk through the profile.</p>
        </FormSuccess>
      </div>
    );
  }

  return (
    <form ref={form.formRef} className={`form-card form-card--${tone}`} onSubmit={form.handleSubmit} noValidate aria-label="Hire sales talent">
      <div className="form-section__body">
        <div className="form-grid">
          <TextField form={form} name="company_name" label="Business name" required autoComplete="organization" placeholder="Acme Corp" />
          <TextField form={form} name="contact_email" type="email" label="Work email" required autoComplete="email" placeholder="you@company.com" />
          <TextField form={form} name="contact_phone" type="tel" label="Phone" optional autoComplete="tel" placeholder="+1 (555) 000-0000" />
          <TextField form={form} name="website" type="url" label="Company website" optional autoComplete="url" placeholder="acme.com" />
        </div>
        <div className="form-grid">
          <SelectField form={form} name="role" label="Role you’re hiring" required options={HIRING_ROLES} placeholder="Select a role" />
          <SelectField form={form} name="hires" label="Number of hires" optional options={HIRE_COUNTS} placeholder="How many?" />
          <TextField form={form} name="location" label="Location" optional placeholder="e.g. Austin, TX or Remote" />
          <SelectField form={form} name="compensation" label="Compensation (OTE)" optional options={COMP_RANGES} placeholder="Select a range" />
        </div>
        <SelectField form={form} name="timeline" label="Hiring timeline" optional options={HIRING_TIMELINES} placeholder="When do you want someone in seat?" />
      </div>

      <div className="form-footer">
        <p className="form-footer__note">
          <Lock size={15} aria-hidden="true" /> We’ll only use this to follow up about your hiring needs.
        </p>
        <SubmitButton status={form.status} pending="Sending…">
          Hire Sales Talent
        </SubmitButton>
      </div>
      {form.status === 'error' && (
        <p className="form-error" role="alert">
          Something went wrong sending your request. Please try again.
        </p>
      )}
    </form>
  );
}
