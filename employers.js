const API_URL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://127.0.0.1:8000/api/employers/'
  : 'https://salesfloor-api.onrender.com/api/employers/';

const form = document.getElementById('employer-intake-form');
const success = document.getElementById('employer-success');
const formHeader = document.querySelector('.form-header');
const submitBtn = form.querySelector('.btn-submit');

form.addEventListener('submit', async e => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitBtn.textContent = 'Submitting…';
  submitBtn.disabled = true;

  try {
    // Field names on the <form> already match what the API expects, so the
    // raw form can be sent as-is.
    const res = await fetch(API_URL, { method: 'POST', body: new FormData(form) });
    const result = await res.json();
    if (result.result !== 'success') {
      throw new Error(result.message || 'Submission failed');
    }

    // Hide the pitch copy too -- leaving "Free to post. Takes 2 minutes."
    // sitting above a confirmation message reads as if nothing happened.
    formHeader.hidden = true;
    form.hidden = true;
    success.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    submitBtn.textContent = "Let's Connect";
    submitBtn.disabled = false;
    alert("Something went wrong sending your details. Please try again — if it keeps failing, email us directly so we don't lose them.");
  }
});
