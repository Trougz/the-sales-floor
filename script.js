const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://127.0.0.1:8000/api/candidates/'
  : 'https://salesfloor-api.onrender.com/api/candidates/';

const form = document.getElementById('intake-form');
const success = document.getElementById('success');
const formHeader = document.querySelector('.form-header');
const fileInput = document.getElementById('resume');
const fileName = document.getElementById('file-name');
const fileHint = document.getElementById('file-hint');
const submitBtn = form.querySelector('.btn-submit');

// Not a hard cap -- the backend accepts any size -- just an early, non-blocking
// heads-up so a large scan doesn't silently stall/timeout on a slow connection
// without the candidate having any idea why.
const LARGE_FILE_WARNING_BYTES = 8 * 1024 * 1024;

function formatMB(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  fileName.textContent = file?.name || 'Upload PDF, DOC, or DOCX';

  if (file) {
    console.log(`[intake] resume selected: "${file.name}" (${formatMB(file.size)}, type: ${file.type || 'unknown'})`);
  }

  if (file && file.size > LARGE_FILE_WARNING_BYTES) {
    fileHint.textContent = `That's a large file (${formatMB(file.size)}) — on a slow connection it may take a while to upload, or time out. A text-based PDF/DOCX export is usually much smaller than a scanned/photographed one.`;
    fileHint.hidden = false;
  } else {
    fileHint.hidden = true;
  }
});

form.addEventListener('submit', async e => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitBtn.textContent = 'Submitting…';
  submitBtn.disabled = true;

  const resumeFile = fileInput.files[0];
  console.log(`[intake] submitting -- resume: ${resumeFile ? `"${resumeFile.name}" (${formatMB(resumeFile.size)})` : 'none'}`);

  try {
    // Field names on the <form> already match what the API expects, file
    // included, so the raw multipart form can be sent as-is.
    const res = await fetch(API_URL, { method: 'POST', body: new FormData(form) });

    // Read as text first (not res.json() directly) so a non-JSON response --
    // e.g. an HTML error page from a proxy/timeout -- can still be logged
    // instead of just throwing an opaque parse error.
    const bodyText = await res.text();
    let result;
    try {
      result = JSON.parse(bodyText);
    } catch (parseErr) {
      throw new Error(`Non-JSON response, HTTP ${res.status}: ${bodyText.slice(0, 300)}`);
    }

    if (result.result !== 'success') {
      throw new Error(result.message || `Submission failed, HTTP ${res.status}`);
    }

    // Hide the pitch copy too -- leaving "Free to join. Takes 2 minutes."
    // sitting above a confirmation message reads as if nothing happened.
    formHeader.hidden = true;
    form.hidden = true;
    success.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    // Logged for diagnosis -- the alert stays generic/friendly for the
    // candidate, but this is what tells us whether a reported "upload
    // doesn't work" is a network failure, a timeout, or a server rejection.
    console.error('[intake] submission failed:', err);
    submitBtn.textContent = 'Submit';
    submitBtn.disabled = false;
    alert("Something went wrong submitting your application. Please try again — if it keeps failing, email us directly so we don't lose your info.");
  }
});
