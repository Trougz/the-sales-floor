"""Recruiting portal: candidate search and candidate detail.

Staff-facing, session + 'Recruiters' group gated (see decorators.py), same
trust boundary as qa_views.py/review_views.py. This is a read/search surface
over Candidate, not an editing one -- candidates are created only through the
public intake form (candidates.views.submit_candidate); recruiting workflow
fields (status, ranking, manual_score, etc.) stay editable only in /admin/ and
/review/, not duplicated here.
"""
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render

from .decorators import recruiter_required
from .models import Candidate, CrmTool, Industry, Requisition, TITLE_CHOICES

RESULTS_PER_PAGE = 25


@recruiter_required
def index(request):
    return redirect('portal-candidate-search')


@recruiter_required
def candidate_search(request):
    qs = Candidate.objects.all()

    q = request.GET.get('q', '').strip()
    if q:
        qs = qs.filter(
            Q(name__icontains=q) | Q(email__icontains=q) | Q(phone__icontains=q)
            | Q(current_company_name__icontains=q) | Q(linkedin_url__icontains=q)
        )

    title = request.GET.get('title', '')
    if title:
        qs = qs.filter(current_title=title)

    status = request.GET.get('status', '')
    if status:
        qs = qs.filter(status=status)

    pass_fail = request.GET.get('pass_fail', '')
    if pass_fail:
        qs = qs.filter(pass_fail=pass_fail)

    relocation = request.GET.get('relocation', '')
    if relocation:
        qs = qs.filter(open_to_relocation=(relocation == 'yes'))

    # isdigit() guards against a hand-edited querystring crashing the page
    # with a 500 -- these are just filter values, not lookups by trusted id.
    industry_ids = [i for i in request.GET.getlist('industry') if i.isdigit()]
    if industry_ids:
        qs = qs.filter(industries__id__in=industry_ids)

    crm_ids = [i for i in request.GET.getlist('crm_tool') if i.isdigit()]
    if crm_ids:
        qs = qs.filter(crm_tools__id__in=crm_ids)

    # distinct() guards against row duplication from the M2M filters above
    # (a candidate matching two selected industries would otherwise appear twice).
    qs = qs.distinct().prefetch_related('industries', 'crm_tools').order_by('-created_at')

    page_obj = Paginator(qs, RESULTS_PER_PAGE).get_page(request.GET.get('page'))

    ctx = {
        'page_obj': page_obj,
        'title_choices': TITLE_CHOICES,
        'status_choices': Candidate.STATUS_CHOICES,
        'pass_fail_choices': Candidate.PASS_FAIL_CHOICES,
        'industries': Industry.objects.all(),
        'crm_tools': CrmTool.objects.all(),
        'selected_industries': {int(i) for i in industry_ids},
        'selected_crm_tools': {int(i) for i in crm_ids},
        # Used by each result row's "add to requisition" control. Not
        # excluded per-candidate here (that'd mean a query per row) --
        # re-adding an already-matched candidate is a harmless no-op that
        # create_match reports back as "already in this pipeline".
        'open_requisitions': Requisition.objects.filter(status='open').select_related('company').order_by('company__name', 'title'),
        'active_nav': 'candidates',
    }

    # Same view, same querying logic, two templates: the HTMX swap only ever
    # needs the results fragment, the first load needs the full page (which
    # itself includes that same fragment) -- see candidate_search.html.
    if request.headers.get('HX-Request') == 'true':
        return render(request, 'candidates/portal/_candidate_results.html', ctx)
    return render(request, 'candidates/portal/candidate_search.html', ctx)


@recruiter_required
def candidate_detail(request, candidate_id):
    candidate = get_object_or_404(
        Candidate.objects.prefetch_related('industries', 'crm_tools', 'work_styles'),
        pk=candidate_id,
    )
    matches = candidate.matches.select_related('requisition__company').order_by('-created_at')
    open_requisitions = (
        Requisition.objects.filter(status='open')
        .exclude(matches__candidate=candidate)
        .select_related('company')
        .order_by('company__name', 'title')
    )
    return render(request, 'candidates/portal/candidate_detail.html', {
        'candidate': candidate,
        'matches': matches,
        'open_requisitions': open_requisitions,
        'active_nav': 'candidates',
    })
