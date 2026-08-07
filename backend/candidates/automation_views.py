"""Endpoints for the n8n recruiting automation (bulk ranking, daily report,
pass/fail-based outreach feeds). Everything here is read/query/write only --
n8n owns all outbound email/SMS sending, this module just gives it data and
records what it did.

Every view requires the `X-Automation-Key` header to match
settings.AUTOMATION_API_KEY. These endpoints expose candidate PII (email,
phone) and can trigger paid Claude calls, so they're not public like
submit_candidate/submit_employer_request.
"""
import json
import logging
from functools import wraps

from django.conf import settings
from django.http import JsonResponse
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .ai.client import AIConfigurationError
from .ai.ranking import MAX_CANDIDATES_PER_BATCH, rank_candidate
from .models import Candidate

logger = logging.getLogger(__name__)


def automation_auth_required(view):
    @wraps(view)
    def wrapper(request, *args, **kwargs):
        configured_key = settings.AUTOMATION_API_KEY
        if not configured_key or request.headers.get('X-Automation-Key') != configured_key:
            return JsonResponse({'result': 'error', 'message': 'Unauthorized'}, status=401)
        return view(request, *args, **kwargs)
    return wrapper


@csrf_exempt
@require_POST
@automation_auth_required
def rank_unranked(request):
    """Rank up to MAX_CANDIDATES_PER_BATCH unranked candidates and report how
    many remain, so a caller (n8n's cron workflow) can loop until the whole
    backlog is processed without any single call risking gunicorn's timeout.
    """
    candidates = (
        Candidate.objects.filter(ranking_computed_at__isnull=True)
        .select_related('resume_extraction')[:MAX_CANDIDATES_PER_BATCH]
    )

    ranked = failed = 0
    for candidate in candidates:
        try:
            rank_candidate(candidate)
            ranked += 1
        except AIConfigurationError as exc:
            return JsonResponse({'result': 'error', 'message': str(exc)}, status=500)
        except Exception:  # noqa: BLE001 - one bad candidate must not stop the rest
            failed += 1
            # Unlike the admin action (which surfaces this via message_user),
            # there's no UI here for n8n to display -- without this, a failed
            # batch reports "5 failed" with zero way to find out why.
            logger.exception('rank-unranked: ranking failed for candidate %s (%s)', candidate.id, candidate.email)

    remaining = Candidate.objects.filter(ranking_computed_at__isnull=True).count()
    return JsonResponse({'result': 'success', 'ranked': ranked, 'failed': failed, 'remaining': remaining})


@require_GET
@automation_auth_required
def daily_report(request):
    """Candidates ranked on `date` (default today, server timezone), ordered
    best-first. Candidate.Meta.ordering defaults to -created_at, which is the
    wrong axis here, so this always overrides with an explicit order_by.
    """
    date_param = request.GET.get('date')
    if date_param:
        report_date = parse_date(date_param)
        if report_date is None:
            return JsonResponse(
                {'result': 'error', 'message': 'Invalid date, expected YYYY-MM-DD'}, status=400
            )
    else:
        report_date = timezone.localdate()

    candidates = (
        Candidate.objects.filter(ranking_computed_at__date=report_date)
        .order_by('-ranking_score')
    )

    return JsonResponse({
        'result': 'success',
        'date': report_date.isoformat(),
        'candidates': [
            {
                'id': c.id,
                'name': c.name,
                'email': c.email,
                'phone': c.phone,
                'current_title': c.current_title,
                'current_company_name': c.current_company_name,
                'ranking_score': c.ranking_score,
                'pass_fail': c.pass_fail,
                'ranking_notes': c.ranking_notes,
                'linkedin_url': c.linkedin_url,
            }
            for c in candidates
        ],
    })


def _contact_payload(candidates):
    return [
        {'id': c.id, 'name': c.name, 'email': c.email, 'phone': c.phone}
        for c in candidates
    ]


@require_GET
@automation_auth_required
def pending_nurture(request):
    """Failed candidates not yet enrolled in the nurture sequence."""
    candidates = Candidate.objects.filter(pass_fail='fail', nurture_started_at__isnull=True)
    return JsonResponse({'result': 'success', 'candidates': _contact_payload(candidates)})


@require_GET
@automation_auth_required
def pending_invite(request):
    """Passed candidates not yet sent the booking invite."""
    candidates = Candidate.objects.filter(pass_fail='pass', booking_invite_sent_at__isnull=True)
    return JsonResponse({'result': 'success', 'candidates': _contact_payload(candidates)})


@csrf_exempt
@require_POST
@automation_auth_required
def mark_contacted(request):
    """Record that n8n successfully sent the nurture or invite message for a
    candidate, so pending-nurture/pending-invite stop returning them on the
    next run. Idempotent -- calling this twice just overwrites the timestamp.
    """
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'result': 'error', 'message': 'Invalid JSON body'}, status=400)

    candidate_id = body.get('candidate_id')
    contact_type = body.get('type')
    field_by_type = {'nurture': 'nurture_started_at', 'invite': 'booking_invite_sent_at'}

    if contact_type not in field_by_type or not candidate_id:
        return JsonResponse(
            {'result': 'error', 'message': "Required: candidate_id, type ('nurture' or 'invite')"},
            status=400,
        )

    try:
        candidate = Candidate.objects.get(pk=candidate_id)
    except (Candidate.DoesNotExist, ValueError, TypeError):
        return JsonResponse({'result': 'error', 'message': 'No such candidate'}, status=404)

    field = field_by_type[contact_type]
    setattr(candidate, field, timezone.now())
    candidate.save(update_fields=[field])

    return JsonResponse({'result': 'success', 'id': candidate.id, 'type': contact_type})
