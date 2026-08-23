"""Staff-facing pages for a recruiter to read a candidate by hand and record
their own score, independent of the AI ranking. Compare the two via
manage.py rank_agreement once enough manual scores exist.

Same trust-boundary shape as qa_views.py (staff session + group membership,
not the n8n shared-secret surface), but gated on 'Recruiters' rather than
'QA Reviewers' since scoring a candidate is a recruiting judgment call, not
outreach QA -- and Recruiters already has change permission on Candidate.
"""
from functools import wraps

from django import forms
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.db.models import Case, F, IntegerField, Value, When
from django.db.models.functions import Abs
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone

from .models import Candidate

RECRUITERS_GROUP_NAME = 'Recruiters'


def recruiter_required(view):
    @wraps(view)
    @login_required
    @staff_member_required
    def wrapper(request, *args, **kwargs):
        # Same superuser carve-out as qa_views.qa_reviewer_required.
        if not (request.user.is_superuser or request.user.groups.filter(name=RECRUITERS_GROUP_NAME).exists()):
            raise PermissionDenied('Not a Recruiter.')
        return view(request, *args, **kwargs)
    return wrapper


class ManualScoreForm(forms.Form):
    score = forms.IntegerField(
        min_value=0, max_value=100, label='Your score (0-100)',
        widget=forms.NumberInput(attrs={'autofocus': True}),
    )
    notes = forms.CharField(
        label='Notes (why)', required=False,
        widget=forms.Textarea(attrs={'rows': 6}),
    )


@recruiter_required
def review_queue(request):
    """Every candidate, not just pass/fail ones (unlike the QA queue) --
    reading the whole pool by hand is the point. Unscored-by-you candidates
    sort first by default; ?sort=gap instead surfaces the biggest AI-vs-human
    disagreements, for spot-checking rather than reading start to finish.
    """
    candidates = Candidate.objects.select_related('manual_ranked_by').annotate(
        gap=Abs(F('manual_score') - F('ranking_score')),
        is_scored=Case(
            When(manual_score__isnull=False, then=Value(1)),
            default=Value(0), output_field=IntegerField(),
        ),
    )
    sort = request.GET.get('sort')
    if sort == 'gap':
        candidates = candidates.order_by(F('gap').desc(nulls_last=True))
    else:
        candidates = candidates.order_by('is_scored', '-created_at')

    return render(request, 'candidates/review_queue.html', {
        'candidates': candidates,
        'sort': sort or 'default',
    })


@recruiter_required
def review_detail(request, candidate_id):
    candidate = get_object_or_404(Candidate, pk=candidate_id)

    if request.method == 'POST':
        form = ManualScoreForm(request.POST)
        if form.is_valid():
            candidate.manual_score = form.cleaned_data['score']
            candidate.internal_notes = form.cleaned_data['notes']
            candidate.manual_ranked_at = timezone.now()
            candidate.manual_ranked_by = request.user
            candidate.save(update_fields=[
                'manual_score', 'internal_notes', 'manual_ranked_at', 'manual_ranked_by',
            ])
            messages.success(request, f'Saved your score for {candidate.name}.')

            if request.POST.get('action') == 'next':
                next_candidate = (
                    Candidate.objects.filter(manual_score__isnull=True)
                    .exclude(pk=candidate.pk)
                    .order_by('-created_at')
                    .first()
                )
                if next_candidate:
                    return redirect('review-detail', candidate_id=next_candidate.id)
                messages.success(request, "No more unscored candidates -- you're caught up.")
                return redirect('review-queue')
            return redirect('review-queue')
    else:
        form = ManualScoreForm(initial={
            'score': candidate.manual_score, 'notes': candidate.internal_notes,
        })

    return render(request, 'candidates/review_detail.html', {
        'candidate': candidate, 'form': form,
    })
