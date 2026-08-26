"""Recruiting portal: the unified To-Do's queue -- every manual CampaignStep
(LinkedIn InMail, LinkedIn connection request, phone call, general task)
currently due across every campaign. Email steps are NOT actionable here --
they get a read-only tab instead, so a stuck n8n feed is still visible
somewhere without implying a human can override it (see todo_list.html).
"""
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404, render
from django.utils import timezone
from django.views.decorators.http import require_POST

from .campaign_engine import complete_step_execution, skip_step_execution
from .decorators import recruiter_required
from .models import Campaign, CampaignStep, StepExecution

MANUAL_STEP_TYPES = ['linkedin_inmail', 'linkedin_connection', 'phone_call', 'general_task']
RESULTS_PER_PAGE = 25


@recruiter_required
def todo_list(request):
    step_type = request.GET.get('step_type', '')
    campaign_id = request.GET.get('campaign', '')
    bucket = request.GET.get('bucket', '')  # '', 'overdue', 'today', 'upcoming'
    is_email_tab = step_type == 'email'

    types = [step_type] if step_type and not is_email_tab else (['email'] if is_email_tab else MANUAL_STEP_TYPES)

    qs = (
        StepExecution.objects.filter(
            campaign_step__step_type__in=types,
            enrollment__status='active',
            enrollment__campaign__status='active',
        )
        .select_related(
            'campaign_step', 'enrollment__campaign', 'enrollment__candidate', 'enrollment__contact__company',
        )
    )
    if campaign_id:
        qs = qs.filter(enrollment__campaign_id=campaign_id)

    if is_email_tab:
        # Read-only visibility: both pending (awaiting n8n's next poll) and
        # done (already sent), most-recent-due first, so a stuck automation
        # feed is visible rather than invisible.
        qs = qs.order_by('-due_at')
    else:
        qs = qs.filter(status='pending')
        now = timezone.now()
        today_end = timezone.localtime(now).replace(hour=23, minute=59, second=59, microsecond=999999)
        if bucket == 'overdue':
            qs = qs.filter(due_at__lt=now)
        elif bucket == 'today':
            qs = qs.filter(due_at__gte=now, due_at__lte=today_end)
        elif bucket == 'upcoming':
            qs = qs.filter(due_at__gt=today_end)
        qs = qs.order_by('due_at')

    page_obj = Paginator(qs, RESULTS_PER_PAGE).get_page(request.GET.get('page'))
    ctx = {
        'page_obj': page_obj,
        'step_type': step_type,
        'is_email_tab': is_email_tab,
        'manual_step_types': [(k, v) for k, v in CampaignStep.STEP_TYPE_CHOICES if k in MANUAL_STEP_TYPES],
        'campaigns': Campaign.objects.filter(status='active'),
        'selected_campaign': campaign_id,
        'bucket': bucket,
        'active_nav': 'todos',
    }
    if request.headers.get('HX-Request') == 'true':
        return render(request, 'candidates/portal/_todo_results.html', ctx)
    return render(request, 'candidates/portal/todo_list.html', ctx)


@require_POST
@recruiter_required
def todo_complete(request, step_execution_id):
    step_execution = get_object_or_404(
        StepExecution, pk=step_execution_id, status='pending', campaign_step__step_type__in=MANUAL_STEP_TYPES,
    )
    complete_step_execution(step_execution, completed_by=request.user)
    return render(request, 'candidates/portal/_todo_row.html', {'se': step_execution})


@require_POST
@recruiter_required
def todo_skip(request, step_execution_id):
    step_execution = get_object_or_404(
        StepExecution, pk=step_execution_id, status='pending', campaign_step__step_type__in=MANUAL_STEP_TYPES,
    )
    skip_step_execution(step_execution, completed_by=request.user)
    return render(request, 'candidates/portal/_todo_row.html', {'se': step_execution})
