const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbx-BfqjKLgveHnFs7cxN5oyoJ7P7xuk0SOaDPNqDhNZ5Klz5kut9voxCPJnDMUgoVv7/exec';

// The Django backend isn't hosted anywhere public yet, so production
// (thesalesfloor.biz) keeps posting to Apps Script for now. Once it's
// deployed, replace SHEETS_URL usage below with the real API URL for
// everyone, and delete this branch.
const IS_LOCAL = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const DJANGO_API_URL = 'http://127.0.0.1:8000/api/candidates/';

const form = document.getElementById('intake-form');
const success = document.getElementById('success');
const fileInput = document.getElementById('resume');
const fileName = document.getElementById('file-name');
const submitBtn = form.querySelector('.btn-submit');

fileInput.addEventListener('change', () => {
  fileName.textContent = fileInput.files[0]?.name || 'Upload PDF, DOC, or DOCX';
});

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]); // strip data URL prefix
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

form.addEventListener('submit', async e => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitBtn.textContent = 'Submitting…';
  submitBtn.disabled = true;

  try {
    let res;
    if (IS_LOCAL) {
      // Django takes the raw multipart form directly — field names on
      // the <form> already match what the API expects, file included.
      res = await fetch(DJANGO_API_URL, { method: 'POST', body: new FormData(form) });
    } else {
      const file = fileInput.files[0];
      const data = {
        name:            form.name.value.trim(),
        email:           form.email.value.trim(),
        phone:           form.phone.value.trim(),
        linkedin:        form.linkedin.value.trim(),
        company:         form.company.value.trim(),
        title:           form.title.value,
        years:           form.years.value,
        quota:           form.quota.value,
        base:            form.base.value,
        ote:             form.ote.value,
        desired_ote:     form['desired_ote'].value,
        relocation:      form.relocation.value,
        location:        [...form.querySelectorAll('[name="location"]:checked')].map(el => el.value),
        industry:        [...form.querySelectorAll('[name="industry"]:checked')].map(el => el.value),
        crm:             [...form.querySelectorAll('[name="crm"]:checked')].map(el => el.value),
        awards:          form.awards.value.trim(),
        resume_filename: file?.name || '',
        resume_type:     file?.type || '',
        resume_data:     file ? await readFileAsBase64(file) : null,
      };
      // Content-Type must stay text/plain so this remains a CORS "simple
      // request" (no preflight) — Apps Script reads the raw body via
      // e.postData.contents regardless, and its response carries
      // Access-Control-Allow-Origin, so we can read the real result below
      // instead of firing blind with mode: 'no-cors'.
      res = await fetch(SHEETS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data),
      });
    }

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
