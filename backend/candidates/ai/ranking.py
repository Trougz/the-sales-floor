from django.conf import settings
from django.utils import timezone

from . import rubric
from .client import extract_structured
from ..resume_text import ensure_resume_extraction

# One Claude call per candidate, run synchronously inside a gunicorn request
# (admin action, automation endpoint) -- gunicorn kills the worker if the
# request runs longer than its --timeout (see render.yaml), so any caller
# doing this inline must cap its batch to this size. The `rank_candidates`
# management command isn't bound by this since it runs outside gunicorn.
#
# Confirmed in production (2026-08-07): 5 sequential live calls to the Opus
# model, each carrying resume text in the prompt, blew past the 90s gunicorn
# timeout and got the worker killed mid-batch (CRITICAL WORKER TIMEOUT) --
# harmless (each candidate saves individually, so nothing corrupts), but the
# in-flight request 500s. Keep this low enough that a full batch reliably
# finishes with room to spare, even if an individual call runs slow.
MAX_CANDIDATES_PER_BATCH = 2


def rank_candidate(candidate) -> dict:
    """Score `candidate` and write ranking_score/ranking_computed_at/
    ranking_model_version/ranking_notes/ranking_criteria/pass_fail back onto
    it. Returns the full model response (including `summary`/`flags`) for
    callers that also want to surface it immediately (e.g. the admin
    action's message_user calls).

    Parses the resume on demand (via ensure_resume_extraction) if it hasn't
    been extracted yet, so ranking never silently runs on form fields alone
    just because extract_resumes wasn't run first.
    """
    extraction = ensure_resume_extraction(candidate)
    resume_text = extraction.raw_text if extraction and not extraction.extraction_error else ''

    result = extract_structured(
        system=rubric.SYSTEM_PROMPT,
        user_content=rubric.build_user_content(candidate, resume_text),
        schema=rubric.RANKING_SCHEMA,
    )

    notes = result['summary']
    if result['flags']:
        notes += '\n\nFlags:\n' + '\n'.join(f'- {flag}' for flag in result['flags'])

    candidate.ranking_score = result['ranking_score']
    candidate.ranking_computed_at = timezone.now()
    candidate.ranking_model_version = settings.AI_MODEL
    candidate.ranking_notes = notes
    candidate.ranking_criteria = [result['criteria'][f'dimension_{i}'] for i in range(1, 5)]
    candidate.pass_fail = 'pass' if candidate.ranking_score >= rubric.PASS_THRESHOLD else 'fail'
    candidate.save(update_fields=[
        'ranking_score', 'ranking_computed_at', 'ranking_model_version', 'ranking_notes',
        'ranking_criteria', 'pass_fail',
    ])

    return result
