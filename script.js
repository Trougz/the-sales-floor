const form = document.getElementById('intake-form');
const success = document.getElementById('success');
const fileInput = document.getElementById('resume');
const fileName = document.getElementById('file-name');

fileInput.addEventListener('change', () => {
  fileName.textContent = fileInput.files[0]?.name || 'Upload PDF, DOC, or DOCX';
});

form.addEventListener('submit', e => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // TODO: wire up real submission endpoint here
  // e.g. POST FormData to your backend or a service like Formspree/Make/Zapier

  form.hidden = true;
  success.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
