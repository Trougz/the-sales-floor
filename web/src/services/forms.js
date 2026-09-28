/**
 * Front-end-only form submission (preview mode). This is the single seam to
 * replace when the backend is wired up — nothing else in the UI needs to change.
 *
 * The live Django API (backend/, deployed at salesfloor-api.onrender.com) currently accepts:
 *   POST /api/candidates/  multipart: name, email, phone, linkedin, company, title, years, quota,
 *                          ote, desired_ote, state, relocation, location[], industry[], crm[], awards, resume
 *   POST /api/employers/   company_name, contact_email, contact_phone
 *
 * Fields these forms collect that the API does NOT accept yet (need backend support before sending):
 *   candidate: target_roles
 *   company:   website, role, hires, location, compensation, timeline
 *   contact + newsletter: no endpoint yet
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function submitForm(kind, values) {
  await wait(900);

  // Log field names only — never the values — so preview testing doesn't leak PII into consoles.
  console.info(`[preview] "${kind}" form submitted (not sent anywhere). Fields:`, Object.keys(values));
  return { ok: true };
}
