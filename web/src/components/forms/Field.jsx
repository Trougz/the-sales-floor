import { useRef, useState } from 'react';
import { AlertCircle, Check, FileText, UploadCloud, X } from 'lucide-react';

/**
 * Form controls. Each one takes the object returned by useForm() plus a `name`,
 * and wires up value / blur / error / aria attributes itself.
 * `data-invalid` on the wrapper is what useForm uses to focus the first bad field.
 */

function Label({ htmlFor, as: Tag = 'label', required, optional, children }) {
  return (
    <Tag htmlFor={htmlFor} className="field__label">
      {children}
      {required && (
        <span className="field__req" aria-hidden="true">
          {' '}
          *
        </span>
      )}
      {optional && <span className="field__opt">Optional</span>}
    </Tag>
  );
}

function Message({ id, hint, error }) {
  if (error) {
    return (
      <p id={`${id}-error`} className="field__error" role="alert">
        <AlertCircle size={15} aria-hidden="true" /> {error}
      </p>
    );
  }
  return hint ? (
    <p id={`${id}-hint`} className="field__hint">
      {hint}
    </p>
  ) : null;
}

const describedBy = (id, hint, error) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export function TextField({ form, name, label, type = 'text', required, optional, hint, prefix, className = '', numeric = false, maxDigits, ...rest }) {
  const id = `${form.idBase}-${name}`;
  const error = form.errorFor(name);

  const onChange = (event) => {
    // Strip first, then cap, so a pasted "4x2" becomes "42" rather than being truncated to "4x" by the browser.
    const digits = numeric ? event.target.value.replace(/\D/g, '') : event.target.value;
    const next = numeric && maxDigits ? digits.slice(0, maxDigits) : digits;
    form.setValue(name, next);
  };

  return (
    <div className={`field ${className}`.trim()} data-invalid={error ? 'true' : undefined}>
      <Label htmlFor={id} required={required} optional={optional}>
        {label}
      </Label>
      <div className={`control${prefix ? ' control--prefix' : ''}`}>
        {prefix && <span className="control__prefix">{prefix}</span>}
        <input
          id={id}
          name={name}
          type={type}
          inputMode={numeric ? 'numeric' : rest.inputMode}
          className="input"
          value={form.values[name]}
          onChange={onChange}
          onBlur={() => form.touch(name)}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy(id, hint, error)}
          {...rest}
        />
      </div>
      <Message id={id} hint={hint} error={error} />
    </div>
  );
}

export function TextArea({ form, name, label, required, optional, hint, rows = 4, className = '', ...rest }) {
  const id = `${form.idBase}-${name}`;
  const error = form.errorFor(name);
  return (
    <div className={`field ${className}`.trim()} data-invalid={error ? 'true' : undefined}>
      <Label htmlFor={id} required={required} optional={optional}>
        {label}
      </Label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        className="input input--textarea"
        value={form.values[name]}
        onChange={(event) => form.setValue(name, event.target.value)}
        onBlur={() => form.touch(name)}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...rest}
      />
      <Message id={id} hint={hint} error={error} />
    </div>
  );
}

/** `options` are strings or { value, label }; pass `groups` ([{label, options}]) for <optgroup>s. */
export function SelectField({ form, name, label, options = [], groups, placeholder = 'Select…', required, optional, hint, className = '', ...rest }) {
  const id = `${form.idBase}-${name}`;
  const error = form.errorFor(name);
  const asOption = (option) => {
    const value = typeof option === 'string' ? option : option.value;
    const text = typeof option === 'string' ? option : option.label;
    return (
      <option key={value} value={value}>
        {text}
      </option>
    );
  };
  return (
    <div className={`field ${className}`.trim()} data-invalid={error ? 'true' : undefined}>
      <Label htmlFor={id} required={required} optional={optional}>
        {label}
      </Label>
      <div className="control control--select">
        <select
          id={id}
          name={name}
          className="input input--select"
          value={form.values[name]}
          onChange={(event) => form.setValue(name, event.target.value)}
          onBlur={() => form.touch(name)}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy(id, hint, error)}
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {groups
            ? groups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map(asOption)}
                </optgroup>
              ))
            : options.map(asOption)}
        </select>
      </div>
      <Message id={id} hint={hint} error={error} />
    </div>
  );
}

/**
 * Chip-style choices. kind="checkbox" → multi-select (value is an array);
 * kind="radio" → single-select (value is a string).
 */
export function ChoiceGroup({ form, name, label, options, kind = 'checkbox', required, optional, hint, className = '', segmented = false }) {
  const id = `${form.idBase}-${name}`;
  const error = form.errorFor(name);
  const current = form.values[name];

  const isChecked = (value) => (kind === 'checkbox' ? current.includes(value) : current === value);
  const onToggle = (value) => {
    if (kind === 'radio') {
      form.setValue(name, value);
    } else {
      form.setValue(name, current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
    }
    form.touch(name);
  };

  return (
    <fieldset className={`field field--group ${className}`.trim()} data-invalid={error ? 'true' : undefined} aria-describedby={describedBy(id, hint, error)}>
      <Label as="legend" required={required} optional={optional}>
        {label}
      </Label>
      <div className={`choices${segmented ? ' choices--segmented' : ''}`}>
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value;
          const text = typeof option === 'string' ? option : option.label;
          return (
            <label key={value} className="choice">
              <input type={kind} name={name} value={value} checked={isChecked(value)} onChange={() => onToggle(value)} className="choice__input" aria-invalid={error ? 'true' : undefined} />
              <span className="choice__box">
                {kind === 'checkbox' && <Check size={14} strokeWidth={3} className="choice__check" aria-hidden="true" />}
                {text}
              </span>
            </label>
          );
        })}
      </div>
      <Message id={id} hint={hint} error={error} />
    </fieldset>
  );
}

const formatSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** Drag-and-drop (or click) file picker. The native input stays in the DOM (visually hidden) so it's keyboard + screen-reader operable. */
export function FileField({ form, name, label, required, optional, hint, accept = '.pdf,.doc,.docx', className = '' }) {
  const id = `${form.idBase}-${name}`;
  const error = form.errorFor(name);
  const file = form.values[name];
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const pick = (nextFile) => {
    form.setValue(name, nextFile || null);
    form.touch(name);
  };

  const clear = () => {
    if (inputRef.current) inputRef.current.value = '';
    pick(null);
    inputRef.current?.focus();
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    pick(event.dataTransfer.files?.[0]);
  };

  return (
    <div className={`field ${className}`.trim()} data-invalid={error ? 'true' : undefined}>
      <Label htmlFor={id} required={required} optional={optional}>
        {label}
      </Label>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        className="dropzone__input sr-only"
        onChange={(event) => pick(event.target.files?.[0])}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy(id, hint, error)}
      />

      {file ? (
        <div className="file-chip">
          <span className="file-chip__icon">
            <FileText size={20} aria-hidden="true" />
          </span>
          <span className="file-chip__meta">
            <span className="file-chip__name">{file.name}</span>
            <span className="file-chip__size">{formatSize(file.size)}</span>
          </span>
          <button type="button" className="file-chip__remove" onClick={clear} aria-label={`Remove ${file.name}`}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={`dropzone${dragging ? ' is-dragging' : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <span className="dropzone__icon">
            <UploadCloud size={24} aria-hidden="true" />
          </span>
          <span className="dropzone__title">
            <strong>Upload your resume</strong> or drag it here
          </span>
          <span className="dropzone__hint">PDF, DOC, or DOCX · up to 10 MB</span>
        </label>
      )}
      <Message id={id} hint={hint} error={error} />
    </div>
  );
}
