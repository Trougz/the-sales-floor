import statistics
import sys

from django.core.management.base import BaseCommand
from django.db.models import Avg, Count, F, FloatField, Max
from django.db.models.functions import Abs, Cast

from candidates.ai import rubric
from candidates.models import Candidate


class Command(BaseCommand):
    help = (
        'Measure agreement between the AI ranking_score and manually-entered '
        'manual_score (set via /review/candidates/), so rubric tuning is based '
        'on a real measurement instead of a felt impression. Only considers '
        'candidates with both scores set.'
    )

    def handle(self, *args, **options):
        if sys.stdout.encoding != 'utf-8':
            sys.stdout.reconfigure(encoding='utf-8')

        qs = Candidate.objects.filter(ranking_score__isnull=False, manual_score__isnull=False)
        count = qs.count()

        if count == 0:
            self.stdout.write(self.style.WARNING(
                'No candidates have both an AI score and a manual score yet -- '
                'nothing to compare. Score some candidates at /review/candidates/ first.'
            ))
            return

        ai_scores = list(qs.values_list('ranking_score', flat=True))
        manual_scores = list(qs.values_list('manual_score', flat=True))
        diffs = [ai - manual for ai, manual in zip(ai_scores, manual_scores)]

        mae = statistics.mean(abs(d) for d in diffs)
        mean_signed_diff = statistics.mean(diffs)  # positive = AI scores higher than the human, on average
        correlation = (
            statistics.correlation(ai_scores, manual_scores)
            if count >= 2 and len(set(ai_scores)) > 1 and len(set(manual_scores)) > 1
            else None
        )

        self.stdout.write(self.style.SUCCESS(f'\n{count} candidate(s) with both scores.'))
        self.stdout.write(f'Mean absolute error: {mae:.1f} points')
        self.stdout.write(
            f'Mean signed difference (AI - human): {mean_signed_diff:+.1f} '
            f'({"AI scores higher on average" if mean_signed_diff > 0 else "AI scores lower on average" if mean_signed_diff < 0 else "no net bias"})'
        )
        self.stdout.write(
            f'Pearson correlation: {correlation:.2f}' if correlation is not None
            else 'Pearson correlation: n/a (need 2+ candidates with varying scores)'
        )

        # pass_fail disagreement -- does the AI's pass/fail call match what the
        # human's score would have produced against the same threshold?
        disagreements = [
            (ai >= rubric.PASS_THRESHOLD) != (manual >= rubric.PASS_THRESHOLD)
            for ai, manual in zip(ai_scores, manual_scores)
        ]
        disagree_count = sum(disagreements)
        self.stdout.write(
            f'Pass/fail disagreement (threshold {rubric.PASS_THRESHOLD}): '
            f'{disagree_count}/{count} candidate(s)\n'
        )

        # Screening-title agreement -- independent of the score gap above: a
        # candidate can have a small score gap but a title disagreement (or
        # vice versa). Scoped to candidates a human has actually reviewed
        # (manual_ranked_at set), since screening_title otherwise just mirrors
        # whatever the AI last recommended (see ranking.rank_candidate).
        title_reviewed = qs.filter(
            manual_ranked_at__isnull=False, ranking_recommended_title__gt='',
        )
        title_reviewed_count = title_reviewed.count()
        if title_reviewed_count:
            title_overrides = title_reviewed.exclude(screening_title=F('ranking_recommended_title')).count()
            self.stdout.write(
                f'Screening-title overrides: {title_overrides}/{title_reviewed_count} '
                f"reviewed candidate(s) where your screening_title differs from the AI's "
                f'ranking_recommended_title'
            )
            # ranking_recommended_title is overwritten wholesale on every
            # re-rank (see rank_candidate) -- if a candidate was re-ranked
            # *after* being reviewed, this is comparing your judgment against
            # an AI opinion you never actually saw, not a real disagreement.
            # Only meaningful while the prompt/schema is stable; noisy right
            # after a rubric change, since re-ranking everyone is exactly
            # what surfaces this.
            stale = title_reviewed.filter(ranking_computed_at__gt=F('manual_ranked_at')).count()
            if stale:
                self.stdout.write(self.style.WARNING(
                    f'  -> {stale}/{title_reviewed_count} of those were re-ranked *after* you reviewed them -- '
                    'the comparison above is stale for those and should not be trusted as-is. '
                    'Common right after a rubric/prompt change; re-run this after things settle.'
                ))
            self.stdout.write('')
        else:
            self.stdout.write('Screening-title overrides: n/a (no reviewed candidates with an AI title recommendation yet)\n')

        self.stdout.write(self.style.SUCCESS('By current_title:'))
        # Computed via the ORM (not the Python lists above) so this stays
        # correct if the command is later extended to filter/paginate qs.
        by_role = (
            qs.annotate(diff=Abs(Cast('ranking_score', FloatField()) - Cast('manual_score', FloatField())))
            .values('current_title')
            .annotate(
                n=Count('id'), avg_ai=Avg('ranking_score'), avg_manual=Avg('manual_score'),
                avg_abs_diff=Avg('diff'), last_ranked=Max('ranking_computed_at'),
            )
            .order_by('-avg_abs_diff')
        )
        for row in by_role:
            role = row['current_title'] or '(blank)'
            # avg AI/human at 1 decimal (not 0) and last_ranked included on
            # purpose -- whole-number rounding can hide real movement between
            # runs (36.6 and 37.4 both display as "37"), which is exactly what
            # made an earlier run of this command look like re-ranking hadn't
            # happened for a role when it actually had.
            last_ranked = row['last_ranked'].strftime('%Y-%m-%d %H:%M') if row['last_ranked'] else 'never'
            self.stdout.write(
                f"  {role:<16} n={row['n']:<3} "
                f"avg AI={row['avg_ai']:.1f}  avg human={row['avg_manual']:.1f}  "
                f"avg |diff|={row['avg_abs_diff']:.1f}  most recently ranked={last_ranked}"
            )
