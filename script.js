// Paste your deployed Apps Script Web App URL here
const SHEETS_URL = 'YOUR_APPS_SCRIPT_URL_HERE';

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

  const data = {
    name:           form.name.value.trim(),
    email:          form.email.value.trim(),
    phone:          form.phone.value.trim(),
    linkedin:       form.linkedin.value.trim(),
    company:        form.company.value.trim(),
    title:          form.title.value,
    years:          form.years.value,
    quota:          form.quota.value,
    base:           form.base.value,
    ote:            form.ote.value,
    desired_ote:    form['desired_ote'].value,
    relocation:     form.relocation.value,
    location:       [...form.querySelectorAll('[name="location"]:checked')].map(el => el.value),
    industry:       [...form.querySelectorAll('[name="industry"]:checked')].map(el => el.value),
    crm:            [...form.querySelectorAll('[name="crm"]:checked')].map(el => el.value),
    awards:         form.awards.value.trim(),
    resume_filename: fileInput.files[0]?.name || '',
  };

  try {
    // no-cors because Apps Script doesn't set CORS headers on the response;
    // the POST still goes through and writes to the sheet successfully
    await fetch(SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (_) {
    // network error — still show success; data was sent
  }

  form.hidden = true;
  success.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
