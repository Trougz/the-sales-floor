"""Staff-facing manual ranking pages: let a recruiter read a candidate's full
file (resume, structured fields, AI score/criteria) and record their own
0-100 score. This is the write path for Candidate.manual_score/
manual_ranked_at/manual_ranked_by -- candidates.admin.CandidateAdmin makes
those fields read-only so this stays the single source of truth, and
candidates.management.commands.rank_agreement compares manual_score against
ranking_score once both are set.

Same trust-boundary shape as qa_views.py (staff session + group membership),
gated on 'Recruiters' rather than 'QA Reviewers' -- scoring a candidate is a
core recruiting judgment call, not the QA/outreach step qa_views.py covers.
"""
from functools import wraps

from django import forms
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.db.models import F
from django.db.models.functions import Abs
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from .models import Candidate, TITLE_CHOICES

RECRUITERS_GROUP_NAME = 'Recruiters'


def recruiter_required(view):
    @wraps(view)
    @login_required
    @staff_member_required
    def wrapper(request, *args, **kwargs):
        # Superusers already have unrestricted access via /admin/ -- the group
        # check exists to let a non-superuser recruiter in without granting
        # that, not to gate the superusers themselves. Same reasoning as
        # qa_views.qa_reviewer_required.
        if not (request.user.is_superuser or request.user.groups.filter(name=RECRUITERS_GROUP_NAME).exists()):
            raise PermissionDenied('Not a Recruiter.')
        return view(request, *args, **kwargs)
    return wrapper


class ManualScoreForm(forms.Form):
    manual_score = forms.IntegerField(min_value=0, max_value=100, label='Your score (0-100)')
    screening_title = forms.ChoiceField(
        choices=TITLE_CHOICES,
        label="Screen as (the role you'd actually place them for -- may be a rung below their stated title)",
    )
    reasoning = forms.CharField(
        widget=forms.Textarea, required=False,
        label='Why (appended to internal notes -- the reasoning is what makes this useful for tuning the AI rubric later)',
    )


@recruiter_required
def review_queue(request):
    """All candidates -- not just pass/fail ones, unlike the QA queue.

    Default order puts candidates nobody has manually scored yet first, so
    working top-down reads through the backlog. ?sort=gap instead orders by
    |ranking_score - manual_score| descending, for jumping straight to the
    candidates where the AI and a human disagreed most.
    """
    sort = request.GET.get('sort', '')

    # gap is null whenever either score is missing -- shown as "—" in the
    # template on every view, not just ?sort=gap.
    candidates = (
        Candidate.objects.select_related('manual_ranked_by')
        .annotate(gap=Abs(F('ranking_score') - F('manual_score')))
    )
    if sort == 'gap':
        candidates = candidates.filter(
            ranking_score__isnull=False, manual_score__isnull=False,
        ).order_by('-gap')
    else:
        # nulls_first is explicit because SQLite (local) and Postgres (prod)
        # disagree on default NULL ordering -- SQLite sorts NULLs first on
        # ASC, Postgres sorts them last.
        candidates = candidates.order_by(F('manual_score').asc(nulls_first=True), '-created_at')

    return render(request, 'candidates/review_queue.html', {'candidates': candidates, 'sort': sort})


@recruiter_required
def review_detail(request, candidate_id):
    candidate = get_object_or_404(Candidate, pk=candidate_id)

    if request.method == 'POST':
        form = ManualScoreForm(request.POST)
        if form.is_valid():
            candidate.manual_score = form.cleaned_data['manual_score']
            candidate.screening_title = form.cleaned_data['screening_title']
            candidate.manual_ranked_at = timezone.now()
            candidate.manual_ranked_by = request.user
            reasoning = form.cleaned_data['reasoning'].strip()
            if reasoning:
                candidate.internal_notes = (
                    f'{candidate.internal_notes}\n\n{reasoning}' if candidate.internal_notes else reasoning
                )
            candidate.save(update_fields=[
                'manual_score', 'screening_title', 'manual_ranked_at', 'manual_ranked_by', 'internal_notes',
            ])
            messages.success(request, f'Saved your score for {candidate.name}.')

            if 'save_next' in request.POST:
                next_unscored = (
                    Candidate.objects.filter(manual_score__isnull=True)
                    .exclude(pk=candidate.pk)
                    .order_by('-created_at')
                    .first()
                )
                if next_unscored:
                    return redirect('review-detail', candidate_id=next_unscored.id)
                messages.success(request, "That's everyone -- no unscored candidates left.")
                return redirect('review-queue')

            return redirect('review-queue')
    else:
        form = ManualScoreForm(initial={
            'manual_score': candidate.manual_score,
            'screening_title': (
                candidate.screening_title or candidate.ranking_recommended_title
                or candidate.current_title or 'Other'
            ),
        })

    # Simple sequential prev/next through the whole pool (default ordering),
    # independent of scored state, so a reviewer can page straight through
    # everyone rather than only jumping via the queue.
    ordered_ids = list(Candidate.objects.order_by('-created_at').values_list('id', flat=True))
    idx = ordered_ids.index(candidate.id)
    prev_id = ordered_ids[idx - 1] if idx > 0 else None
    next_id = ordered_ids[idx + 1] if idx < len(ordered_ids) - 1 else None

    return render(request, 'candidates/review_detail.html', {
        'candidate': candidate,
        'form': form,
        'prev_id': prev_id,
        'next_id': next_id,
    })
