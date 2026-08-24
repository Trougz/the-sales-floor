"""Recruiting portal: the two endpoints that mutate Match rows.

create_match backs two UI entry points (candidate search/detail's "add to
requisition" control, and the requisition board's own candidate picker) with
one endpoint -- both just POST a candidate_id and a requisition_id.

update_match backs both drag-and-drop stage changes and inline fit_score/
notes edits on a pipeline card -- it only touches whichever of stage/
fit_score/notes was actually posted, so one endpoint serves both triggers.
"""
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import get_object_or_404, render
from django.template.loader import render_to_string
from django.views.decorators.http import require_POST

from .decorators import recruiter_required
from .models import Candidate, Match, Requisition


@require_POST
@recruiter_required
def create_match(request):
    candidate = get_object_or_404(Candidate, pk=request.POST.get('candidate_id'))
    requisition = get_object_or_404(Requisition, pk=request.POST.get('requisition_id'))
    match, created = Match.objects.get_or_create(candidate=candidate, requisition=requisition)

    if created and candidate.status == 'new':
        # Being put into a pipeline is what actually starts screening --
        # a candidate just sitting in the pool untouched stays 'new'.
        candidate.status = 'screening'
        candidate.save(update_fields=['status'])

    status_html = render_to_string('candidates/portal/_add_status.html', {
        'created': created, 'requisition': requisition, 'candidate': candidate,
    }, request=request)

    if not created:
        return HttpResponse(status_html)

    # Out-of-band swap: when this fires from the requisition board's own
    # picker, "#stage-screening" exists on the page and htmx appends the new
    # card live. When it fires from candidate search/detail (a different
    # page, no such id present), htmx just ignores this fragment -- harmless
    # either way, so create_match doesn't need to know which caller it is.
    board_card = render_to_string('candidates/portal/_match_card.html', {'match': match}, request=request)
    oob = f'<div id="stage-screening" hx-swap-oob="beforeend">{board_card}</div>'
    return HttpResponse(status_html + oob)


@require_POST
@recruiter_required
def update_match(request, match_id):
    match = get_object_or_404(Match, pk=match_id)

    if 'stage' in request.POST:
        stage = request.POST['stage']
        if stage not in dict(Match.STAGE_CHOICES):
            return HttpResponseBadRequest('Invalid stage.')
        match.stage = stage

    if 'fit_score' in request.POST:
        raw = request.POST['fit_score'].strip()
        if raw:
            try:
                match.fit_score = max(0, min(100, int(raw)))
            except ValueError:
                return HttpResponseBadRequest('Invalid fit_score.')
        else:
            match.fit_score = None

    if 'notes' in request.POST:
        match.notes = request.POST['notes']

    match.save()
    return render(request, 'candidates/portal/_match_card.html', {'match': match})
