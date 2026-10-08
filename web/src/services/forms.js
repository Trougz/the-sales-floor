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
 *
 * `years` is now a range dropdown ('0', '1-3', '3-5', '5+'), but the Django view does int(data['years']) and
 * the AI ranking reads it as a number: a real POST would crash that view until it accepts ranges (or maps
 * them to a number).
 *
 * Fields the API still REQUIRES (or uses) that the candidate form no longer collects: company and
 * desired_ote are in the Django view's REQUIRED_FIELDS, so a real POST would be rejected (400) until
 * the view is relaxed; title, quota and ote are optional there but feed the AI ranking.
 *
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
