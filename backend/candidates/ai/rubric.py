"""Ranking prompt + JSON schema for candidates.ai.ranking.

Phase 1 outputs a single overall ranking_score (0-100). The rubric text
still reasons per current_title (SDR/BDR/AE/Sales Manager have different
signal priorities) so that Phase 2 -- a per-role breakdown via RoleFitScore
-- is a natural extension of this prompt rather than a rewrite.
"""

SYSTEM_PROMPT = """\
You are helping a B2B sales recruiting firm rank a candidate's overall \
strength as a hire, on a 0-100 scale where 100 is an outstanding candidate \
and 0 is a very weak one. Base your judgment only on the information given \
-- do not invent facts not present in the resume text or the structured \
fields.

Weigh signals according to the candidate's current/target role:
- SDR / BDR: outbound prospecting activity, pipeline generation, \
  resilience/tenacity language, and any rookie/activity-based awards. \
  Quota attainment is a weaker signal for these roles than for AE, since \
  SDRs/BDRs are typically measured on activity rather than closed revenue.
- AE: quota attainment percentage is a strong signal. Deal-closing and \
  negotiation language in the resume matters. Comp trajectory (current OTE \
  vs desired OTE) is a soft signal of seniority.
- Sales Manager: management, coaching, and team-building language; tenure \
  managing or leading others; title progression toward management.
- If current_title is "Other" or blank, score based on resume content and \
  the structured fields alone, without a title-match bonus.

Flag (in `flags`) anything that looks like a red flag or is worth a \
recruiter's attention: unusually short tenure at multiple companies, \
quota/comp figures that seem inconsistent with the stated experience level, \
vague or unverifiable achievement claims, or a resume that doesn't support \
the candidate's stated current title. An empty list is fine if nothing \
stands out.

Respond only with the requested JSON.
"""

RANKING_SCHEMA = {
    'type': 'object',
    'properties': {
        'ranking_score': {
            'type': 'integer',
            'minimum': 0,
            'maximum': 100,
            'description': 'Overall hireability score, 0-100, higher is better.',
        },
        'summary': {
            'type': 'string',
            'description': '2-3 sentence justification for the score.',
        },
        'flags': {
            'type': 'array',
            'items': {'type': 'string'},
            'description': 'Notable concerns or red flags for a recruiter to review. Empty if none.',
        },
    },
    'required': ['ranking_score', 'summary', 'flags'],
    'additionalProperties': False,
}


def build_user_content(candidate, resume_text: str) -> str:
    """Assemble the structured-fields + resume/awards text sent to the model."""
    lines = [
        f'Current title: {candidate.current_title or "(not specified)"}',
        f'Current company: {candidate.current_company_name}',
        f'Years of experience: {candidate.years_experience}',
        f'Quota attainment last period: '
        f'{candidate.quota_attainment_pct if candidate.quota_attainment_pct is not None else "(not provided)"}%',
        f'Current base salary: {candidate.base_salary if candidate.base_salary is not None else "(not provided)"}',
        f'Current OTE: {candidate.ote if candidate.ote is not None else "(not provided)"}',
        f'Desired OTE: {candidate.desired_ote}',
        f'Industries: {", ".join(i.name for i in candidate.industries.all()) or "(none listed)"}',
        f'CRM/tools used: {", ".join(t.name for t in candidate.crm_tools.all()) or "(none listed)"}',
        '',
        'Awards / notable achievements (as submitted by the candidate):',
        candidate.awards.strip() or '(none provided)',
        '',
        'Resume text (extracted from the uploaded file):',
        resume_text.strip() or '(no resume text available)',
    ]
    return '\n'.join(lines)
