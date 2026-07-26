const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://127.0.0.1:8000/api/candidates/'
  : 'https://salesfloor-api.onrender.com/api/candidates/';

const form = document.getElementById('intake-form');
const success = document.getElementById('success');
const fileInput = document.getElementById('resume');
const fileName = document.getElementById('file-name');
const submitBtn = form.querySelector('.btn-submit');

fileInput.addEventListener('change', () => {
  fileName.textContent = fileInput.files[0]?.name || 'Upload PDF, DOC, or DOCX';
});

form.addEventListener('submit', async e => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitBtn.textContent = 'Submitting…';
  submitBtn.disabled = true;

  try {
    // Field names on the <form> already match what the API expects, file
    // included, so the raw multipart form can be sent as-is.
    const res = await fetch(API_URL, { method: 'POST', body: new FormData(form) });
    const result = await res.json();
    if (result.result !== 'success') {
      throw new Error(result.message || 'Submission failed');
    }

    form.hidden = true;
    success.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    submitBtn.textContent = 'Submit Application';
    submitBtn.disabled = false;
    alert("Something went wrong submitting your application. Please try again — if it keeps failing, email us directly so we don't lose your info.");
  }
});
