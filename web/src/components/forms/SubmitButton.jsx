import { Loader2 } from 'lucide-react';
import Button from '../ui/Button.jsx';

export default function SubmitButton({ status, children, pending = 'Sending…', size = 'lg', variant = 'primary', ...rest }) {
  const submitting = status === 'submitting';
  return (
    <Button type="submit" size={size} variant={variant} disabled={submitting} aria-busy={submitting} arrow={!submitting} {...rest}>
      {submitting ? (
        <>
          <Loader2 size={18} className="spin" aria-hidden="true" /> {pending}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
