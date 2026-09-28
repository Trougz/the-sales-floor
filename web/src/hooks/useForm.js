import { useCallback, useId, useMemo, useRef, useState } from 'react';

/**
 * Minimal form state manager.
 *  - `validate(values)` is a pure function returning { field: message }.
 *  - Errors surface after a field is blurred, or for every field after a submit attempt.
 *  - On an invalid submit, focus jumps to the first invalid field.
 *  - `status`: idle | submitting | success | error
 */
export default function useForm({ initialValues, validate, onSubmit }) {
  const idBase = useId();
  const formRef = useRef(null);
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState('idle');

  const errors = useMemo(() => validate(values), [validate, values]);

  const setValue = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
  }, []);

  const touch = useCallback((name) => {
    setTouched((current) => (current[name] ? current : { ...current, [name]: true }));
  }, []);

  const errorFor = (name) => (touched[name] || attempted ? errors[name] : undefined);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === 'submitting') return;
    setAttempted(true);

    if (Object.keys(errors).length > 0) {
      requestAnimationFrame(() => {
        const field = formRef.current?.querySelector('.field[data-invalid="true"]');
        field?.querySelector('input, select, textarea, button')?.focus();
      });
      return;
    }

    setStatus('submitting');
    try {
      await onSubmit(values);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const reset = () => {
    setValues(initialValues);
    setTouched({});
    setAttempted(false);
    setStatus('idle');
  };

  return { idBase, formRef, values, errors, errorFor, setValue, touch, status, handleSubmit, reset, attempted };
}
