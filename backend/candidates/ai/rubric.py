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

# Valid values for RANKING_SCHEMA's recommended_title enum -- mirrors
# candidates.models.TITLE_CHOICES values (not imported, to keep this module
# free of a models dependency; ROLE_CRITERIA's keys already duplicate the
# same values the same way). No blank/'' option: a blank current_title is
# treated as 'Other' for screening purposes, same as ROLE_CRITERIA[''].
TITLE_VALUES = ['SDR', 'BDR', 'AE', 'Sales Manager', 'Other']

# The one-rung-down screening target per title, when the candidate wouldn't
# be competitively placed at their stated level -- see SYSTEM_PROMPT and
# candidates.models.Candidate.screening_title. SDR/BDR/Other have no rung
# below. AE steps down to BDR specifically only because SDR and BDR already
# share an identical ROLE_CRITERIA list, so the choice is purely cosmetic for
# scoring purposes.
ONE_RUNG_DOWN = {
    'Sales Manager': 'AE',
    'AE': 'BDR',
}

# Minimum ranking_score (inclusive) for Candidate.pass_fail to be 'pass'.
# Applied uniformly across roles -- see candidates.ai.ranking.rank_candidate().
PASS_THRESHOLD = 60

SYSTEM_PROMPT = """\
You are helping a B2B sales recruiting firm rank a candidate's overall \
strength as a hire, on a 0-100 scale where 100 is an outstanding candidate \
and 0 is a very weak one. Base your judgment only on the information given \
-- do not invent facts not present in the resume text or the structured \
fields.

Anchor the score to these bands so scores are comparable across different \
candidates and different reviewers, not just relative to how the resume reads:
- 90-100: exceptional -- clear, verifiable top-decile performance for the role \
  (e.g. sustained over-quota attainment, strong tenure, no red flags).
- 75-89: strong -- solid evidence of success in the role with at most a minor \
  gap or unknown.
- 60-74: passing (the hire bar -- 60 is the minimum passing score) -- meets \
  the basic bar for the role but with a real, named weakness or an important \
  unknown (e.g. missing quota data, short tenure, unclear ownership).
- 40-59: below the bar -- meaningful gaps or inconsistencies that make this a \
  weak fit, but not disqualifying red flags.
- 0-39: weak -- little relevant evidence of success, or a genuine red flag \
  (e.g. resume contradicts stated title, pattern of very short tenures).

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

Before scoring, decide which title to actually screen this candidate \
against -- `recommended_title`. This is *not* about whether the resume \
proves they held the stated title (that's a `flags` case below, and is \
rare) -- it's about whether they'd be competitively placed at a client \
company at that level. Step the title down exactly one rung -- Sales \
Manager -> AE, or AE -> SDR/BDR (pick whichever of the two fits the resume \
better; it doesn't change how they're scored) -- when the stated level \
isn't realistic to place, e.g.:
- Industry misalignment: their experience is in an industry the resume \
  suggests wouldn't transfer to the industries this pool typically places \
  into.
- Company caliber: the stated title was at a small or low-caliber company \
  -- limited scope, likely a small team or book of business -- not the \
  scale a client would expect at that title.
- Weak results: quota attainment or other performance signals are weak \
  relative to what the stated title should show.
Never step down more than one rung, and never step up. SDR/BDR/Other have \
no rung below -- for those, and for any candidate who is realistically \
placeable at their stated level, `recommended_title` is just their current \
title. Explain your call in one or two sentences in \
`recommendation_reasoning`.

You will be given the 4 named criteria for the candidate's stated title, \
and (when a rung exists) the 4 for the one-rung-down title too -- see \
"Criteria to score" in the user message. Score the 4 criteria for whichever \
title you land on in `recommended_title`, 0-100 each with a one-line, \
evidence-based rationale. Use the criteria names exactly as given for that \
title, in the order given -- do not rename, reorder, add, or drop any.

Flag (in `flags`) anything that looks like a red flag or is worth a \
recruiter's attention: unusually short tenure at multiple companies, \
quota/comp figures that seem inconsistent with the stated experience level, \
vague or unverifiable achievement claims, or a resume that doesn't support \
the candidate's stated current title (title inflation/fabrication -- \
distinct from the placement-level judgment above). An empty list is fine if \
nothing stands out.

Respond only with the requested JSON.
"""

RANKING_SCHEMA = {
    'type': 'object',
    'properties': {
        'recommended_title': {
            'type': 'string',
            'enum': TITLE_VALUES,
            'description': (
                'The title to actually screen this candidate against -- their '
                'stated current title, or one rung down (see the system prompt). '
                'The criteria dimensions below must be scored against this title.'
            ),
        },
        'recommendation_reasoning': {
            'type': 'string',
            'description': '1-2 sentences on why this title was kept or stepped down.',
        },
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
    'required': [
        'recommended_title', 'recommendation_reasoning', 'ranking_score', 'summary', 'flags', 'criteria',
    ],
    'additionalProperties': False,
}


def build_user_content(candidate, resume_text: str) -> str:
    """Assemble the structured-fields + resume/awards text sent to the model."""
    title = candidate.current_title or 'Other'
    criteria_names = ROLE_CRITERIA.get(title, ROLE_CRITERIA['Other'])
    step_down_title = ONE_RUNG_DOWN.get(title)

    criteria_lines = [
        f'Criteria for {title} (use if recommended_title stays {title}):',
        *(f'- {name}' for name in criteria_names),
    ]
    if step_down_title:
        step_down_criteria = ROLE_CRITERIA[step_down_title]
        criteria_lines += [
            '',
            f'Criteria for {step_down_title} (use if recommended_title steps down to {step_down_title}):',
            *(f'- {name}' for name in step_down_criteria),
        ]

    lines = [
        f'Current (self-reported) title: {candidate.current_title or "(not specified)"}',
        f'Current company: {candidate.current_company_name}',
        f'Years of experience: {candidate.years_experience}',
        f'Quota attainment last period: '
        f'{candidate.quota_attainment_pct if candidate.quota_attainment_pct is not None else "(not provided)"}%',
        f'Current OTE: {candidate.ote if candidate.ote is not None else "(not provided)"}',
        f'Desired OTE: {candidate.desired_ote}',
        f'Industries: {", ".join(i.name for i in candidate.industries.all()) or "(none listed)"}',
        f'CRM/tools used: {", ".join(t.name for t in candidate.crm_tools.all()) or "(none listed)"}',
        '',
        *criteria_lines,
        '',
        'Awards / notable achievements (as submitted by the candidate):',
        candidate.awards.strip() or '(none provided)',
        '',
        'Resume text (extracted from the uploaded file):',
        resume_text.strip() or '(no resume text available)',
    ]
    return '\n'.join(lines)
