const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbx-BfqjKLgveHnFs7cxN5oyoJ7P7xuk0SOaDPNqDhNZ5Klz5kut9voxCPJnDMUgoVv7/exec';

const form       = document.getElementById('intake-form');
const step1      = document.getElementById('step-1');
const step2      = document.getElementById('step-2');
const ind1       = document.getElementById('ind-1');
const ind2       = document.getElementById('ind-2');
const btnNext    = document.getElementById('btn-next');
const btnBack    = document.getElementById('btn-back');
const success    = document.getElementById('success');
const fileInput  = document.getElementById('resume');
const fileName   = document.getElementById('file-name');
const submitBtn  = form.querySelector('.btn-submit');

// Step 1 → Step 2
btnNext.addEventListener('click', () => {
  const step1Fields = step1.querySelectorAll('input, select, textarea');
  let valid = true;
  step1Fields.forEach(field => {
    if (!field.checkValidity()) {
      field.reportValidity();
      valid = false;
    }
  });
  if (!valid) return;

  step1.hidden = true;
  step2.hidden = false;
  ind1.classList.remove('active');
  ind1.classList.add('done');
  ind2.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Step 2 → Step 1
btnBack.addEventListener('click', () => {
  step2.hidden = true;
  step1.hidden = false;
  ind2.classList.remove('active');
  ind1.classList.remove('done');
  ind1.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// File name display
fileInput.addEventListener('change', () => {
  fileName.textContent = fileInput.files[0]?.name || 'Upload PDF, DOC, or DOCX';
});

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Submit
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
  if (file) fileData = await readFileAsBase64(file);

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
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data),
    });
  } catch (_) {}

  form.hidden = true;
  success.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
