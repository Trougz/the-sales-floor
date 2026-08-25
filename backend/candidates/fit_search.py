"""Deterministic, synchronous candidate-vs-project fit scoring for the
"Search for project -> Use AI" flow (see fit_search_views.py).

Deliberately makes NO live Anthropic API calls -- reuses Candidate.ranking_score
as already computed by the existing candidates.ai.ranking pipeline elsewhere
(admin action / n8n endpoint / rank_candidates management command), rather
than re-ranking anything here. That pipeline is capped to
candidates.ai.ranking.MAX_CANDIDATES_PER_BATCH == 2 candidates per web
request (gunicorn --timeout, see that module's docstring) specifically
because it can't safely run against a whole candidate pool synchronously --
this module exists precisely so a whole-pool ranking IS possible in one
request, by only ever touching already-stored fields.

Requisition.job_listing is NOT parsed here -- see its field comment in
models.py.
"""
from dataclasses import dataclass
from typing import Optional

from .models import Candidate, Requisition

# Composite score weights. AI rank carries the majority of the weight since
# it's the richest signal (a full resume read by Claude against a role-
# specific rubric -- see candidates.ai.rubric). Tool parity is secondary but
# meaningful. Comp overlap is the smallest factor -- a nice-to-have signal,
# not a strong predictor of fit on its own. These three sum to 1.0; when a
# factor doesn't apply to a given requisition/candidate pair (see
# _score_candidate) its weight is dropped from both the numerator and the
# denominator (renormalized) rather than treated as 0 -- a project with no
# required_crm_tools shouldn't drag every candidate's score down for
# something the project never asked about.
WEIGHT_AI = 0.70
WEIGHT_TOOLS = 0.25
WEIGHT_COMP = 0.05

# desired_ote band string -> (min, max) numeric tuple. max=None means
# open-ended ("$250k+"). Kept local to this module since nothing else needs
# the parsed form.
OTE_BAND_RANGES = {
    '$50k-$80k': (50_000, 80_000),
    '$80k-$110k': (80_000, 110_000),
    '$110k-$140k': (110_000, 140_000),
    '$140k-$250k': (140_000, 250_000),
    '$250k+': (250_000, None),
}


@dataclass
class RankedCandidate:
    candidate: Candidate
    composite_score: int  # 0-100, rounded, for display
    ai_component: float  # 0.0-1.0 -- candidate.ranking_score / 100, or 0.0 if never ranked
    ai_is_unranked: bool  # True if candidate.ranking_score is None -- UI must flag this, not imply a real 0
    tool_fraction: Optional[float]  # 0.0-1.0, or None if the requisition specified no required tools (factor skipped)
    comp_overlaps: Optional[bool]  # True/False, or None if not determinable (factor skipped)


@dataclass
class ExclusionCounts:
    total_pool: int = 0
    already_failed: int = 0
    already_matched: int = 0
    wrong_location: int = 0
    wrong_role: int = 0

    @property
    def total_excluded(self):
        return self.already_failed + self.already_matched + self.wrong_location + self.wrong_role

    @property
    def total_remaining(self):
        return self.total_pool - self.total_excluded


def _parse_ote_band(desired_ote):
    return OTE_BAND_RANGES.get(desired_ote)


def _ranges_overlap(a_min, a_max, b_min, b_max):
    """Inclusive overlap check; a None max means unbounded above."""
    a_lo, a_hi = a_min or 0, a_max if a_max is not None else float('inf')
    b_lo, b_hi = b_min or 0, b_max if b_max is not None else float('inf')
    return a_lo <= b_hi and b_lo <= a_hi


def _passes_location(candidate, requisition):
    if not requisition.location_required:
        return True  # no requirement -- skip this filter entirely
    if candidate.state_province == requisition.location_required:
        return True
    # Explicitly `is True` -- open_to_relocation is nullable/three-valued,
    # and None (unknown, common on LinkedIn imports) must NOT pass here.
    return candidate.open_to_relocation is True


def _passes_role(candidate, requisition):
    if not requisition.role_type:
        return True  # project doesn't specify -- skip this filter entirely
    effective_title = candidate.screening_title or candidate.current_title
    return effective_title == requisition.role_type


def _score_candidate(candidate, requisition):
    ai_is_unranked = candidate.ranking_score is None
    ai_component = (candidate.ranking_score / 100.0) if not ai_is_unranked else 0.0

    required_tools = list(requisition.required_crm_tools.all())
    if required_tools:
        candidate_tool_ids = {t.id for t in candidate.crm_tools.all()}
        required_tool_ids = {t.id for t in required_tools}
        tool_fraction = len(candidate_tool_ids & required_tool_ids) / len(required_tool_ids)
    else:
        tool_fraction = None  # requisition didn't specify -- factor skipped

    band = _parse_ote_band(candidate.desired_ote) if candidate.desired_ote else None
    has_req_comp = requisition.comp_min is not None or requisition.comp_max is not None
    if band and has_req_comp:
        comp_overlaps = _ranges_overlap(band[0], band[1], requisition.comp_min, requisition.comp_max)
    else:
        comp_overlaps = None  # missing on either side -- factor skipped

    weight_sum = WEIGHT_AI
    weighted = WEIGHT_AI * ai_component
    if tool_fraction is not None:
        weight_sum += WEIGHT_TOOLS
        weighted += WEIGHT_TOOLS * tool_fraction
    if comp_overlaps is not None:
        weight_sum += WEIGHT_COMP
        weighted += WEIGHT_COMP * (1.0 if comp_overlaps else 0.0)

    composite_score = round(100 * weighted / weight_sum)

    return RankedCandidate(
        candidate=candidate,
        composite_score=composite_score,
        ai_component=ai_component,
        ai_is_unranked=ai_is_unranked,
        tool_fraction=tool_fraction,
        comp_overlaps=comp_overlaps,
    )


def find_candidates_for_requisition(requisition):
    """Hard-cutoff filter + composite-score the whole candidate pool against
    `requisition`. Returns (ranked list sorted by composite_score desc,
    exclusion counts for the UI's transparency summary).

    Hard cutoffs (exclude entirely, don't just score lower), checked in this
    order -- a candidate failing both location and role is counted only
    under "wrong location", so the exclusion buckets stay mutually exclusive
    and the numbers in the UI summary add up cleanly:
      1. pass_fail == 'fail' (same exclusion as portal_views.candidate_search)
      2. already matched to *this* requisition (same exclusion as
         requisition_views.candidate_search_for_requisition)
      3. wrong location (see _passes_location)
      4. wrong role/title (see _passes_role)
    """
    counts = ExclusionCounts()
    counts.total_pool = Candidate.objects.count()
    counts.already_failed = Candidate.objects.filter(pass_fail='fail').count()
    counts.already_matched = (
        Candidate.objects.filter(matches__requisition=requisition)
        .exclude(pass_fail='fail')
        .count()
    )

    pool = (
        Candidate.objects.exclude(pass_fail='fail')
        .exclude(matches__requisition=requisition)
        .prefetch_related('crm_tools')
    )

    ranked = []
    for candidate in pool:
        if not _passes_location(candidate, requisition):
            counts.wrong_location += 1
            continue
        if not _passes_role(candidate, requisition):
            counts.wrong_role += 1
            continue
        ranked.append(_score_candidate(candidate, requisition))

    ranked.sort(key=lambda rc: rc.composite_score, reverse=True)
    return ranked, counts
