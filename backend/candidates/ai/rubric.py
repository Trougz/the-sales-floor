"""Ranking prompt + JSON schema for candidates.ai.ranking.

Produces an overall ranking_score (0-100) plus a fixed 4-dimension,
role-specific criteria breakdown. The criteria dimensions are fixed per
role (not model-chosen) so recruiters can compare candidates on the same
axis in the admin -- see ROLE_CRITERIA.
"""

# Fixed, ordered dimension names per current_title. Keys mirror
# candidates.models.TITLE_CHOICES values; '' covers blank/unset titles and
# doubles as the fallback for 'Other'. Always exactly 4 dimensions so
# RANKING_SCHEMA can enforce a fixed-length criteria array.
ROLE_CRITERIA = {
    'SDR': [
        'Outbound Activity & Pipeline Generation',
        'Qualification Quality',
        'Resilience & Coachability',
        'Tenure & Trajectory',
    ],
    'BDR': [
        'Outbound Activity & Pipeline Generation',
        'Qualification Quality',
        'Resilience & Coachability',
        'Tenure & Trajectory',
    ],
    'AE': [
        'Quota Attainment',
        'Deal Execution & Negotiation',
        'Discovery & Sales Process Discipline',
        'Full-Cycle Ownership & Comp Trajectory',
    ],
    'Sales Manager': [
        'Team Leadership & Coaching',
        'Hiring & Team Building',
        'Pipeline & Forecast Discipline',
        'Tenure & Scope of Leadership',
    ],
    'Other': [
        'Track Record & Achievements',
        'Skill Evidence (from resume)',
        'Career Trajectory',
        'Consistency / Red Flags',
    ],
}
ROLE_CRITERIA[''] = ROLE_CRITERIA['Other']

# Minimum ranking_score (inclusive) for Candidate.pass_fail to be 'pass'.
# Applied uniformly across roles -- see candidates.ai.ranking.rank_candidate().
PASS_THRESHOLD = 60

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
  negotiation language in the resume matters. Comp trajectory is a soft \
  signal of seniority -- current OTE is a specific figure, but desired OTE \
  is a band the candidate selected (e.g. "$140k-$250k"), not an exact \
  number, so compare whether current OTE falls within, below, or above \
  that band rather than computing a precise delta.
- Sales Manager: management, coaching, and team-building language; tenure \
  managing or leading others; title progression toward management.
- If current_title is "Other" or blank, score based on resume content and \
  the structured fields alone, without a title-match bonus.

You will also be given a list of exactly 4 named criteria for this \
candidate's role (see "Criteria to score" in the user message). Score each \
one 0-100 with a one-line, evidence-based rationale. Use the criteria names \
exactly as given, in the order given -- do not rename, reorder, add, or \
drop any.

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
        'criteria': {
            'type': 'object',
            'description': (
                'The 4 role-specific dimensions from "Criteria to score", in order. '
                "Anthropic's structured-output arrays can't enforce a fixed length "
                "(minItems > 1 isn't supported), so this is 4 fixed keys instead of "
                'a variable-length array.'
            ),
            'properties': {
                f'dimension_{i}': {
                    'type': 'object',
                    'properties': {
                        'name': {'type': 'string'},
                        'score': {'type': 'integer'},
                        'rationale': {'type': 'string'},
                    },
                    'required': ['name', 'score', 'rationale'],
                    'additionalProperties': False,
                }
                for i in range(1, 5)
            },
            'required': [f'dimension_{i}' for i in range(1, 5)],
            'additionalProperties': False,
        },
    },
    'required': ['ranking_score', 'summary', 'flags', 'criteria'],
    'additionalProperties': False,
}


def build_user_content(candidate, resume_text: str) -> str:
    """Assemble the structured-fields + resume/awards text sent to the model."""
    title = candidate.current_title
    criteria_names = ROLE_CRITERIA.get(title, ROLE_CRITERIA['Other'])

    lines = [
        f'Current title: {title or "(not specified)"}',
        f'Current company: {candidate.current_company_name}',
        f'Years of experience: {candidate.years_experience}',
        f'Quota attainment last period: '
        f'{candidate.quota_attainment_pct if candidate.quota_attainment_pct is not None else "(not provided)"}%',
        f'Current OTE: {candidate.ote if candidate.ote is not None else "(not provided)"}',
        f'Desired OTE: {candidate.desired_ote}',
        f'Industries: {", ".join(i.name for i in candidate.industries.all()) or "(none listed)"}',
        f'CRM/tools used: {", ".join(t.name for t in candidate.crm_tools.all()) or "(none listed)"}',
        '',
        'Criteria to score (use these exact names, in this order):',
        *(f'- {name}' for name in criteria_names),
        '',
        'Awards / notable achievements (as submitted by the candidate):',
        candidate.awards.strip() or '(none provided)',
        '',
        'Resume text (extracted from the uploaded file):',
        resume_text.strip() or '(no resume text available)',
    ]
    return '\n'.join(lines)
