"""Recruiting portal: outreach campaigns ("sequencing") -- CRUD for
Campaign/CampaignStep, plus enrollment. Same trust boundary as the rest of
the portal (recruiter_required). Mirrors requisition_views.py's
RequisitionForm pattern; step management uses individual plain views (add/
edit/delete/reorder) rather than a formset, matching this codebase's total
absence of Django formsets outside the Django admin's own inlines.
"""
from django import forms
from django.contrib import messages
from django.db.models import Count
from django.http import HttpResponseBadRequest
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from .campaign_engine import create_first_step_execution
from .decorators import recruiter_required
from .models import Campaign, CampaignEnrollment, CampaignStep, Candidate, Contact, Requisition

FIELD_CSS = 'w-full border border-neutral-300 rounded-md px-3 py-2 text-sm'


def _apply_field_css(form):
    for field in form.fields.values():
        widget_css = FIELD_CSS
        if isinstance(field.widget, forms.Textarea):
            widget_css += ' min-h-24'
        field.widget.attrs['class'] = widget_css


class CampaignForm(forms.ModelForm):
    class Meta:
        model = Campaign
        fields = ['name', 'audience_type', 'requisition', 'status']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['requisition'].queryset = Requisition.objects.filter(status='open')
        self.fields['requisition'].required = False
        _apply_field_css(self)

    def clean(self):
        cleaned = super().clean()
        if cleaned.get('audience_type') == 'contact':
            cleaned['requisition'] = None  # irrelevant/always-null for BD campaigns
        return cleaned


class CampaignStepForm(forms.ModelForm):
    class Meta:
        model = CampaignStep
        fields = ['order', 'step_type', 'subject', 'body', 'delay_days', 'send_window_start', 'send_window_end']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        _apply_field_css(self)


@recruiter_required
def campaign_list(request):
    status = request.GET.get('status', 'active')
    audience_type = request.GET.get('audience_type', '')
    qs = Campaign.objects.annotate(enrollment_count=Count('enrollments'))
    if status in dict(Campaign.STATUS_CHOICES):
        qs = qs.filter(status=status)
    if audience_type in dict(Campaign.AUDIENCE_CHOICES):
        qs = qs.filter(audience_type=audience_type)
    return render(request, 'candidates/portal/campaign_list.html', {
        'campaigns': qs,
        'status': status,
        'audience_type': audience_type,
        'status_choices': Campaign.STATUS_CHOICES,
        'audience_choices': Campaign.AUDIENCE_CHOICES,
        'active_nav': 'campaigns',
    })


@recruiter_required
def campaign_create(request):
    if request.method == 'POST':
        form = CampaignForm(request.POST)
        if form.is_valid():
            campaign = form.save(commit=False)
            campaign.created_by = request.user
            campaign.save()
            return redirect('portal-campaign-detail', campaign_id=campaign.id)
    else:
        form = CampaignForm()
    return render(request, 'candidates/portal/campaign_form.html', {
        'form': form, 'campaign': None, 'active_nav': 'campaigns',
    })


@recruiter_required
def campaign_edit(request, campaign_id):
    campaign = get_object_or_404(Campaign, pk=campaign_id)
    if request.method == 'POST':
        form = CampaignForm(request.POST, instance=campaign)
        if form.is_valid():
            form.save()
            return redirect('portal-campaign-detail', campaign_id=campaign.id)
    else:
        form = CampaignForm(instance=campaign)
    return render(request, 'candidates/portal/campaign_form.html', {
        'form': form, 'campaign': campaign, 'active_nav': 'campaigns',
    })


@recruiter_required
def campaign_detail(request, campaign_id):
    campaign = get_object_or_404(Campaign.objects.select_related('requisition__company'), pk=campaign_id)
    enrollments = (
        campaign.enrollments
        .select_related('candidate', 'contact__company')
        .prefetch_related('step_executions')
        .order_by('-enrolled_at')
    )
    return render(request, 'candidates/portal/campaign_detail.html', {
        'campaign': campaign,
        'steps': campaign.steps.all(),
        'scheduling_summary': campaign.scheduling_summary(),
        'enrollments': enrollments,
        'active_nav': 'campaigns',
    })


@recruiter_required
def campaign_step_create(request, campaign_id):
    campaign = get_object_or_404(Campaign, pk=campaign_id)
    if request.method == 'POST':
        form = CampaignStepForm(request.POST)
        if form.is_valid():
            step = form.save(commit=False)
            step.campaign = campaign
            step.save()
            return redirect('portal-campaign-detail', campaign_id=campaign.id)
    else:
        form = CampaignStepForm(initial={'order': campaign.steps.count() + 1})
    return render(request, 'candidates/portal/campaign_step_form.html', {
        'form': form, 'campaign': campaign, 'step': None, 'active_nav': 'campaigns',
    })


@recruiter_required
def campaign_step_edit(request, step_id):
    step = get_object_or_404(CampaignStep.objects.select_related('campaign'), pk=step_id)
    if request.method == 'POST':
        form = CampaignStepForm(request.POST, instance=step)
        if form.is_valid():
            form.save()
            return redirect('portal-campaign-detail', campaign_id=step.campaign_id)
    else:
        form = CampaignStepForm(instance=step)
    return render(request, 'candidates/portal/campaign_step_form.html', {
        'form': form, 'campaign': step.campaign, 'step': step, 'active_nav': 'campaigns',
    })


@require_POST
@recruiter_required
def campaign_step_delete(request, step_id):
    step = get_object_or_404(CampaignStep.objects.select_related('campaign'), pk=step_id)
    campaign_id = step.campaign_id
    if step.step_executions.filter(status='pending').exists():
        messages.error(request, 'This step has an enrollment currently waiting on it -- cannot delete.')
    else:
        step.delete()
    return redirect('portal-campaign-detail', campaign_id=campaign_id)


@require_POST
@recruiter_required
def campaign_step_reorder(request, campaign_id):
    """Body: step_id[] in the new order (from a Sortable.js drag) --
    reassigns order 1..N by position, same drag-and-drop pattern already
    live on the pipeline board (requisition_detail.html)."""
    campaign = get_object_or_404(Campaign, pk=campaign_id)
    step_ids = request.POST.getlist('step_id')
    steps_by_id = {s.id: s for s in campaign.steps.filter(id__in=step_ids)}
    for position, raw_id in enumerate(step_ids, start=1):
        step = steps_by_id.get(int(raw_id))
        if step and step.order != position:
            step.order = position
            step.save(update_fields=['order'])
    return render(request, 'candidates/portal/_campaign_steps.html', {'campaign': campaign, 'steps': campaign.steps.all()})


@require_POST
@recruiter_required
def create_enrollment(request):
    campaign = get_object_or_404(Campaign, pk=request.POST.get('campaign_id'), status='active')
    candidate_id = request.POST.get('candidate_id')
    contact_id = request.POST.get('contact_id')

    if candidate_id:
        if campaign.audience_type != 'candidate':
            return HttpResponseBadRequest("This campaign doesn't enroll candidates.")
        target = get_object_or_404(Candidate, pk=candidate_id)
        enrollment, created = CampaignEnrollment.objects.get_or_create(campaign=campaign, candidate=target)
    elif contact_id:
        if campaign.audience_type != 'contact':
            return HttpResponseBadRequest("This campaign doesn't enroll contacts.")
        target = get_object_or_404(Contact, pk=contact_id)
        enrollment, created = CampaignEnrollment.objects.get_or_create(campaign=campaign, contact=target)
    else:
        return HttpResponseBadRequest('candidate_id or contact_id required.')

    if created:
        create_first_step_execution(enrollment)

    return render(request, 'candidates/portal/_enroll_status.html', {'created': created, 'campaign': campaign})
