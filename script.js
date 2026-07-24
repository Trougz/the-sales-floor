const SHEETS_URL = 'https://script.google.com/macros/s/AKfycby3PxfYA3OGmmhau38XbgZspVIJPHA3wMlPssIZGsMCU8gMO1gGSQUb1K-ABL3PgPEv/exec';

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

  const file = fileInput.files[0];
  let fileData = null;
  if (file) {
    fileData = await readFileAsBase64(file);
  }

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
    resume_data:     fileData,
  };

  try {
    await fetch(SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (_) {
    // with no-cors, fetch resolves opaquely — data still reaches the endpoint
  }

  form.hidden = true;
  success.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
