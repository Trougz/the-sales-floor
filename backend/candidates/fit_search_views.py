"""Recruiting portal: "Search for project" -- project picker, AI-vs-manual
mode choice, and AI-mode scored results. See fit_search.py for the actual
scoring; this module is just the request/response plumbing around it.

Reuses portal-create-match (pipeline_views.create_match) for the "Add"
action on AI-mode results -- no new match-creation endpoint.
"""
from django.shortcuts import get_object_or_404, render
from django.urls import reverse

from .decorators import recruiter_required
from .fit_search import find_candidates_for_requisition
from .models import Requisition


@recruiter_required
def project_picker(request):
    """Step 1 -- only reached when not already coming from a specific
    project's page (requisition_detail.html's shortcut skips straight to
    fit_search_mode_choice). Choosing a project goes to the mode-choice step.
    """
    requisitions = (
        Requisition.objects.filter(status='open')
        .select_related('company')
        .order_by('company__name', 'title')
    )
    return render(request, 'candidates/portal/fit_search_picker.html', {
        'requisitions': requisitions,
        'active_nav': 'candidates',
    })


@recruiter_required
def fit_search_mode_choice(request, requisition_id):
    """Step 2 -- 'Use AI' vs 'Search manually' for a chosen project.
    'Search manually' sends the recruiter to the existing, unmodified
    candidate_search view with `title` pre-filled from the project's
    role_type -- a courtesy default, not a restriction; freely changeable
    once there.
    """
    requisition = get_object_or_404(Requisition.objects.select_related('company'), pk=requisition_id)
    manual_search_url = reverse('portal-candidate-search')
    if requisition.role_type:
        manual_search_url += f'?title={requisition.role_type}'
    return render(request, 'candidates/portal/fit_search_mode_choice.html', {
        'requisition': requisition,
        'manual_search_url': manual_search_url,
        'active_nav': 'candidates',
    })


@recruiter_required
def fit_search_results(request, requisition_id):
    """Step 3 (AI mode only) -- runs the deterministic scoring pipeline and
    shows ranked results with a hard-cutoff exclusion summary. Each row's
    'Add' action posts straight to the existing portal-create-match
    endpoint, same pattern as _candidate_results.html /
    _requisition_candidate_results.html.
    """
    requisition = get_object_or_404(Requisition.objects.select_related('company'), pk=requisition_id)
    ranked, counts = find_candidates_for_requisition(requisition)
    return render(request, 'candidates/portal/fit_search_results.html', {
        'requisition': requisition,
        'ranked': ranked,
        'counts': counts,
        'active_nav': 'candidates',
    })
