"""Recruiting portal: "Find candidates for this project" -- AI-vs-manual mode
choice, and AI-mode scored results. Always entered from a specific project's
detail page (requisition_detail.html), so both the mode choice and the results
stay under the Projects nav and link back to that project. See fit_search.py
for the actual scoring; this module is just the request/response plumbing.

Reuses portal-create-match (pipeline_views.create_match) for the "Add"
action on AI-mode results -- no new match-creation endpoint.
"""
from django.shortcuts import get_object_or_404, render
from django.urls import reverse
from django.utils.http import urlencode

from .decorators import recruiter_required
from .fit_search import find_candidates_for_requisition
from .models import Campaign, Requisition


@recruiter_required
def fit_search_mode_choice(request, requisition_id):
    """Step 1 -- 'Use AI' vs 'Search manually' for the project.
    'Search manually' sends the recruiter to the existing candidate_search
    view with `title` pre-filled from the project's role_type (a courtesy
    default, freely changeable) and `from_project` set so that page keeps
    the Projects nav and a link back here.
    """
    requisition = get_object_or_404(Requisition.objects.select_related('company'), pk=requisition_id)
    params = {'from_project': requisition.id}
    if requisition.role_type:
        params['title'] = requisition.role_type
    manual_search_url = reverse('portal-candidate-search') + '?' + urlencode(params)
    return render(request, 'candidates/portal/fit_search_mode_choice.html', {
        'requisition': requisition,
        'manual_search_url': manual_search_url,
        'active_nav': 'requisitions',
    })


@recruiter_required
def fit_search_results(request, requisition_id):
    """Step 2 (AI mode only) -- runs the deterministic scoring pipeline and
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
        'active_candidate_campaigns': Campaign.objects.filter(audience_type='candidate', status='active'),
        'active_nav': 'requisitions',
    })
