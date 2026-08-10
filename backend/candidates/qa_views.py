"""Staff-facing QA review pages: let a QA Reviewer see today's passing
candidates (resume, score, why), and trigger the Calendly invite email with
one click. This is a third trust boundary alongside views.py (public,
unauthenticated intake) and automation_views.py (n8n's shared-secret
X-Automation-Key) -- these pages are gated on a real staff session plus
membership in the 'QA Reviewers' group, since they expose candidate PII to
whoever's logged in without needing full Django admin access.

Sending the invite email itself is n8n's job, not Django's (same ownership
split as automation_views.py) -- send_invite below only triggers an n8n
webhook and records nothing; the existing mark_contacted endpoint is what
actually records that the invite went out, once n8n's workflow confirms it
sent.
"""
import json
import logging
import urllib.error
import urllib.request
from functools import wraps

from django.conf import settings
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_POST

from .models import Candidate

logger = logging.getLogger(__name__)

QA_GROUP_NAME = 'QA Reviewers'


def qa_reviewer_required(view):
    @wraps(view)
    @login_required
    @staff_member_required
    def wrapper(request, *args, **kwargs):
        # Superusers already have unrestricted access to everything these
        # pages show (and far more, via /admin/) -- the group requirement
        # exists to let a non-superuser reviewer in without granting them
        # that, not to gate the superusers themselves.
        if not (request.user.is_superuser or request.user.groups.filter(name=QA_GROUP_NAME).exists()):
            raise PermissionDenied('Not a QA Reviewer.')
        return view(request, *args, **kwargs)
    return wrapper


@qa_reviewer_required
def review_queue(request):
    """The QA backlog: passed candidates not yet invited, best score first.

    Deliberately not scoped to "ranked today" -- a reviewer who misses a day
    shouldn't lose candidates off this list. The daily digest email (built
    from automation_views.daily_report) is what's scoped to today; this page
    is the durable backlog, same filter as the pending_invite automation feed.
    """
    candidates = (
        Candidate.objects.filter(pass_fail='pass', booking_invite_sent_at__isnull=True)
        .order_by('-ranking_score')
    )
    return render(request, 'candidates/qa_review_queue.html', {'candidates': candidates})


@qa_reviewer_required
def review_detail(request, candidate_id):
    # Scoped to pass_fail='pass' so a reviewer can't act on a failed
    # candidate by guessing/editing the URL.
    candidate = get_object_or_404(Candidate, pk=candidate_id, pass_fail='pass')
    return render(request, 'candidates/qa_review_detail.html', {'candidate': candidate})


@require_POST
@qa_reviewer_required
def send_invite(request, candidate_id):
    candidate = get_object_or_404(Candidate, pk=candidate_id, pass_fail='pass')

    if not settings.N8N_INVITE_WEBHOOK_URL:
        messages.error(request, 'N8N_INVITE_WEBHOOK_URL is not configured -- nothing was sent.')
        return redirect(request.META.get('HTTP_REFERER') or reverse('qa-review-detail', args=[candidate.id]))

    payload = json.dumps({
        'candidate_id': candidate.id,
        'name': candidate.name,
        'email': candidate.email,
        'calendly_url': settings.CALENDLY_SCHEDULING_URL,
    }).encode('utf-8')

    req = urllib.request.Request(
        settings.N8N_INVITE_WEBHOOK_URL,
        data=payload,
        method='POST',
        headers={
            'Content-Type': 'application/json',
            'X-Automation-Key': settings.AUTOMATION_API_KEY,
        },
    )
    try:
        # Short timeout: this runs synchronously inside a gunicorn worker
        # request/response cycle (--timeout 90, render.yaml) -- an
        # unreachable n8n must fail fast, not hang the worker.
        with urllib.request.urlopen(req, timeout=5) as resp:
            resp.read()
        messages.success(request, f'Invite email triggered for {candidate.name}.')
    except (urllib.error.URLError, TimeoutError) as exc:
        logger.exception('send_invite: webhook call failed for candidate %s', candidate.id)
        messages.error(
            request,
            f'Could not reach the invite workflow for {candidate.name}: {exc}. '
            'Nothing was sent -- try again.',
        )
    # Deliberately does NOT set candidate.booking_invite_sent_at here -- that
    # only happens when n8n calls POST /api/automation/candidates/mark-contacted/
    # after the email has actually been sent (see automation_views.mark_contacted).
    # Triggering the webhook is not the same as the email having gone out.
    return redirect(request.META.get('HTTP_REFERER') or reverse('qa-review-detail', args=[candidate.id]))
