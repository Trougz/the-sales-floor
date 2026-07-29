from django.conf import settings
from django.utils import timezone

from . import rubric
from .client import extract_structured


def rank_candidate(candidate) -> dict:
    """Score `candidate` and write ranking_score/ranking_computed_at/
    ranking_model_version back onto it. Returns the full model response
    (including `summary`/`flags`) for the caller to surface to a recruiter --
    those aren't persisted anywhere in Phase 1.
    """
    extraction = getattr(candidate, 'resume_extraction', None)
    resume_text = extraction.raw_text if extraction and not extraction.extraction_error else ''

    result = extract_structured(
        system=rubric.SYSTEM_PROMPT,
        user_content=rubric.build_user_content(candidate, resume_text),
        schema=rubric.RANKING_SCHEMA,
    )

    candidate.ranking_score = result['ranking_score']
    candidate.ranking_computed_at = timezone.now()
    candidate.ranking_model_version = settings.AI_MODEL
    candidate.save(update_fields=['ranking_score', 'ranking_computed_at', 'ranking_model_version'])

    return result
