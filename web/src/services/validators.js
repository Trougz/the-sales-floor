/** Small, dependency-free validators. Each returns an error string, or '' when valid. */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const required = (message = 'This field is required.') => (value) => {
  if (Array.isArray(value)) return value.length ? '' : message;
  if (value instanceof File) return '';
  return String(value ?? '').trim() ? '' : message;
};

export const email = (value) => {
  const v = String(value ?? '').trim();
  if (!v) return 'Enter your email address.';
  return EMAIL.test(v) ? '' : 'Enter a valid email address, like you@company.com.';
};

export const phone = (value, { optional = false } = {}) => {
  const v = String(value ?? '').trim();
  if (!v) return optional ? '' : 'Enter a phone number.';
  const digits = v.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15 && /^[+\d\s().-]+$/.test(v) ? '' : 'Enter a valid phone number.';
};

/** Accepts "linkedin.com/in/you" without a protocol. */
export const url = (value, { optional = false, host = '' } = {}) => {
  const v = String(value ?? '').trim();
  if (!v) return optional ? '' : 'Enter a URL.';
  try {
    const parsed = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    if (!parsed.hostname.includes('.')) throw new Error('bad host');
    if (host && !parsed.hostname.toLowerCase().includes(host)) return `That doesn't look like a ${host} link.`;
    return '';
  } catch {
    return 'Enter a valid URL.';
  }
};

export const wholeNumber = (value, { min = 0, max = 999, optional = false, label = 'a number' } = {}) => {
  const v = String(value ?? '').trim();
  if (!v) return optional ? '' : `Enter ${label}.`;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) return `Enter ${label} between ${min} and ${max}.`;
  return '';
};

export const RESUME_TYPES = ['pdf', 'doc', 'docx'];
export const RESUME_MAX_BYTES = 10 * 1024 * 1024;

export const resumeFile = (file) => {
  if (!file) return 'Upload your resume so we can review your background.';
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!RESUME_TYPES.includes(ext)) return 'Please upload a PDF, DOC, or DOCX file.';
  if (file.size > RESUME_MAX_BYTES) return 'That file is over 10 MB. Try a smaller export.';
  return '';
};

/** Drops empty results so callers can just check Object.keys(errors).length. */
export const compact = (errors) => Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
