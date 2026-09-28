import useForm from '../../hooks/useForm.js';
import { submitForm } from '../../services/forms.js';
import { compact, email, required } from '../../services/validators.js';
import { CONTACT_AUDIENCES } from '../../data/formOptions.js';
import Button from '../ui/Button.jsx';
import { ChoiceGroup, TextArea, TextField } from './Field.jsx';
import FormSuccess from './FormSuccess.jsx';
import SubmitButton from './SubmitButton.jsx';

const INITIAL = { audience: 'talent', name: '', email: '', message: '' };

const validate = (v) =>
  compact({
    name: required('Enter your name.')(v.name),
    email: email(v.email),
    message: required('Add a short message so we know how to help.')(v.message),
  });

export default function ContactForm() {
  const form = useForm({ initialValues: INITIAL, validate, onSubmit: (values) => submitForm('contact', values) });

  if (form.status === 'success') {
    return (
      <div className="form-card form-card--success">
        <FormSuccess
          title="Message received."
          actions={
            <Button variant="outline" onClick={form.reset}>
              Send another message
            </Button>
          }
        >
          <p>Thanks for reaching out. Someone from The Sales Floor will get back to you personally.</p>
        </FormSuccess>
      </div>
    );
  }

  return (
    <form ref={form.formRef} className="form-card" onSubmit={form.handleSubmit} noValidate aria-label="Contact The Sales Floor">
      <div className="form-section__body">
        <ChoiceGroup form={form} name="audience" kind="radio" segmented label="I’m…" options={CONTACT_AUDIENCES} />
        <div className="form-grid">
          <TextField form={form} name="name" label="Name" required autoComplete="name" placeholder="Jane Smith" />
          <TextField form={form} name="email" type="email" label="Email" required autoComplete="email" placeholder="jane@company.com" />
        </div>
        <TextArea form={form} name="message" label="Message" required rows={5} placeholder="How can we help?" />
      </div>
      <div className="form-footer form-footer--end">
        <SubmitButton status={form.status} pending="Sending…">
          Send message
        </SubmitButton>
      </div>
      {form.status === 'error' && (
        <p className="form-error" role="alert">
          Something went wrong sending your message. Please try again.
        </p>
      )}
    </form>
  );
}
