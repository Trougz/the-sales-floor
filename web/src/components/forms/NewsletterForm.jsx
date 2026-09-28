import { Check } from 'lucide-react';
import useForm from '../../hooks/useForm.js';
import { submitForm } from '../../services/forms.js';
import { compact, email } from '../../services/validators.js';
import { TextField } from './Field.jsx';
import SubmitButton from './SubmitButton.jsx';

const validate = (v) => compact({ email: email(v.email) });

/** Compact inline signup used on dark sections. */
export default function NewsletterForm() {
  const form = useForm({ initialValues: { email: '' }, validate, onSubmit: (values) => submitForm('newsletter', values) });

  if (form.status === 'success') {
    return (
      <p className="newsletter-success" role="status">
        <span>
          <Check size={18} strokeWidth={3} aria-hidden="true" />
        </span>
        You’re on the list. We’ll send the first issue when it’s ready.
      </p>
    );
  }

  return (
    <form ref={form.formRef} className="newsletter-form" onSubmit={form.handleSubmit} noValidate aria-label="Newsletter signup">
      <TextField form={form} name="email" type="email" label="Email address" required autoComplete="email" placeholder="you@company.com" />
      <SubmitButton status={form.status} pending="Joining…" size="md">
        Notify me
      </SubmitButton>
    </form>
  );
}
