from django.conf import settings
from django.utils import timezone

from . import rubric
from .client import extract_structured


def rank_candidate(candidate) -> dict:
    """Score `candidate` and write ranking_score/ranking_computed_at/
    ranking_model_version/ranking_notes back onto it. Returns the full model
    response (including `summary`/`flags`) for callers that also want to
    surface it immediately (e.g. the admin action's message_user calls).
    """
    extraction = getattr(candidate, 'resume_extraction', None)
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
    candidate.save(update_fields=[
        'ranking_score', 'ranking_computed_at', 'ranking_model_version', 'ranking_notes',
    ])

    return result
