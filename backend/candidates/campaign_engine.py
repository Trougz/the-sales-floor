"""Shared campaign-sequencing engine: computes due dates and owns the one
"advance an enrollment to its next step" operation, used identically by a
recruiter's manual "mark done"/"skip" click (todo_views.py) and n8n's
automated email-sent confirmation (automation_views.mark_campaign_step_sent),
so that logic exists in exactly one place. Mirrors fit_search.py's role as a
focused module separate from its *_views.py callers.
"""
import datetime
from zoneinfo import ZoneInfo

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from .models import StepExecution


def compute_due_at(campaign_step, base_time):
    """base_time is the tz-aware datetime the delay counts from --
    enrollment.enrolled_at for step 1, or the previous step's completion
    time for step N+1.
    """
    naive_due = base_time + datetime.timedelta(days=campaign_step.delay_days)

    if campaign_step.step_type != 'email' or not (
        campaign_step.send_window_start and campaign_step.send_window_end
    ):
        return naive_due

    tz = ZoneInfo(settings.CAMPAIGN_SEND_TIMEZONE)
    local_due = naive_due.astimezone(tz)
    local_time = local_due.time()

    if local_time < campaign_step.send_window_start:
        local_due = local_due.replace(
            hour=campaign_step.send_window_start.hour,
            minute=campaign_step.send_window_start.minute,
            second=0, microsecond=0,
        )
    elif local_time > campaign_step.send_window_end:
        local_due = (local_due + datetime.timedelta(days=1)).replace(
            hour=campaign_step.send_window_start.hour,
            minute=campaign_step.send_window_start.minute,
            second=0, microsecond=0,
        )
    # else: already inside the window -- leave as-is.

    return local_due.astimezone(datetime.timezone.utc)


def create_first_step_execution(enrollment):
    """Call immediately after a CampaignEnrollment row is created."""
    first_step = enrollment.campaign.steps.order_by('order').first()
    if first_step is None:
        enrollment.status = 'completed'
        enrollment.save(update_fields=['status'])
        return None
    return StepExecution.objects.create(
        enrollment=enrollment,
        campaign_step=first_step,
        due_at=compute_due_at(first_step, enrollment.enrolled_at),
    )


@transaction.atomic
def _resolve_step_execution(step_execution, resolved_status, *, completed_by=None):
    """Call on every step completion event -- a recruiter's 'mark done'/
    'skip' click, or n8n's 'the email actually sent' confirmation. Both
    completion paths funnel through here so "advance to next step" logic
    isn't duplicated. Idempotent: calling this on an already-resolved
    step_execution is a no-op that just returns the enrollment's current
    pending row (or None) rather than creating a duplicate next step.
    """
    if step_execution.status != 'pending':
        return step_execution.enrollment.step_executions.filter(status='pending').first()

    now = timezone.now()
    step_execution.status = resolved_status
    step_execution.completed_at = now
    step_execution.completed_by = completed_by
    step_execution.save(update_fields=['status', 'completed_at', 'completed_by'])

    enrollment = step_execution.enrollment
    next_step = (
        enrollment.campaign.steps
        .filter(order__gt=step_execution.campaign_step.order)
        .order_by('order')
        .first()
    )
    if next_step is None:
        enrollment.status = 'completed'
        enrollment.save(update_fields=['status'])
        return None

    return StepExecution.objects.create(
        enrollment=enrollment,
        campaign_step=next_step,
        due_at=compute_due_at(next_step, now),
    )


def complete_step_execution(step_execution, *, completed_by=None):
    return _resolve_step_execution(step_execution, 'done', completed_by=completed_by)


def skip_step_execution(step_execution, *, completed_by=None):
    return _resolve_step_execution(step_execution, 'skipped', completed_by=completed_by)
