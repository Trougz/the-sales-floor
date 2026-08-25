"""Recruiting portal: requisitions ("projects") -- CRUD plus each
requisition's pipeline board.

Same trust boundary as portal_views.py (recruiter_required). Company itself
is a separate CRUD surface, see company_views.py -- this form's `company`
field just picks from existing ones (with a link to add one on the fly).
"""
from django import forms
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render

from .decorators import recruiter_required
from .models import Candidate, Company, Match, Requisition


FIELD_CSS = 'w-full border border-neutral-300 rounded-md px-3 py-2 text-sm'


class RequisitionForm(forms.ModelForm):
    class Meta:
        model = Requisition
        fields = ['company', 'title', 'role_type', 'timeline', 'industry', 'comp_min', 'comp_max', 'status', 'notes']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Don't offer rejected companies for a *new* assignment -- but if
        # this requisition is already tied to one (e.g. it was rejected
        # after the project was opened), keep it selectable so editing the
        # req doesn't force a company change.
        company_qs = Company.objects.filter(status='active')
        if self.instance and self.instance.company_id:
            company_qs = Company.objects.filter(Q(status='active') | Q(pk=self.instance.company_id))
        self.fields['company'].queryset = company_qs
        for field in self.fields.values():
            widget_css = FIELD_CSS
            if isinstance(field.widget, forms.Textarea):
                widget_css += ' min-h-24'
            field.widget.attrs['class'] = widget_css


@recruiter_required
def requisition_list(request):
    status = request.GET.get('status', 'open')
    qs = Requisition.objects.select_related('company')
    if status in dict(Requisition.STATUS_CHOICES):
        qs = qs.filter(status=status)
    qs = qs.order_by('company__name', '-created_at')
    return render(request, 'candidates/portal/requisition_list.html', {
        'requisitions': qs,
        'status': status,
        'status_choices': Requisition.STATUS_CHOICES,
        'active_nav': 'requisitions',
    })


@recruiter_required
def requisition_create(request):
    if request.method == 'POST':
        form = RequisitionForm(request.POST)
        if form.is_valid():
            requisition = form.save()
            return redirect('portal-requisition-detail', requisition_id=requisition.id)
    else:
        form = RequisitionForm()
    return render(request, 'candidates/portal/requisition_form.html', {
        'form': form, 'requisition': None, 'active_nav': 'requisitions',
    })


@recruiter_required
def requisition_edit(request, requisition_id):
    requisition = get_object_or_404(Requisition, pk=requisition_id)
    if request.method == 'POST':
        form = RequisitionForm(request.POST, instance=requisition)
        if form.is_valid():
            form.save()
            return redirect('portal-requisition-detail', requisition_id=requisition.id)
    else:
        form = RequisitionForm(instance=requisition)
    return render(request, 'candidates/portal/requisition_form.html', {
        'form': form, 'requisition': requisition, 'active_nav': 'requisitions',
    })


@recruiter_required
def requisition_detail(request, requisition_id):
    requisition = get_object_or_404(Requisition.objects.select_related('company'), pk=requisition_id)
    matches = list(requisition.matches.select_related('candidate').order_by('-created_at'))
    # A list of (stage_key, stage_label, [matches in that stage]) rather than
    # a dict, so the template can iterate it directly -- Django templates
    # can't do a dict lookup keyed by a loop variable without a custom filter.
    board = [
        (stage_key, stage_label, [m for m in matches if m.stage == stage_key])
        for stage_key, stage_label in Match.STAGE_CHOICES
    ]
    return render(request, 'candidates/portal/requisition_detail.html', {
        'requisition': requisition,
        'board': board,
        'active_nav': 'requisitions',
    })


@recruiter_required
def candidate_search_for_requisition(request, requisition_id):
    """HTMX-only: the "add a candidate to this board" picker on the
    requisition detail page. Excludes candidates already matched to *this*
    requisition (re-adding them is a no-op the create_match endpoint already
    handles, but filtering them out here keeps the picker itself useful)."""
    requisition = get_object_or_404(Requisition, pk=requisition_id)
    q = request.GET.get('q', '').strip()
    candidates = Candidate.objects.exclude(matches__requisition=requisition)
    if q:
        candidates = candidates.filter(
            Q(name__icontains=q) | Q(email__icontains=q) | Q(current_company_name__icontains=q)
        )
    candidates = candidates.order_by('-created_at')[:20]
    return render(request, 'candidates/portal/_requisition_candidate_results.html', {
        'candidates': candidates,
        'requisition': requisition,
    })
