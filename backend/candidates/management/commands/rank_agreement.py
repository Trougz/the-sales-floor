import statistics
import sys

from django.core.management.base import BaseCommand
from django.db.models import Avg, Count, F, IntegerField
from django.db.models.functions import Abs

from candidates.ai.rubric import PASS_THRESHOLD
from candidates.models import Candidate


class Command(BaseCommand):
    help = (
        'Measure how closely Candidate.ranking_score (AI) agrees with '
        'Candidate.manual_score (recruiter), for candidates that have both. '
        'Run this after scoring candidates on /review/candidates/ to see '
        'where -- and by how much -- the AI ranking is off.'
    )

    def handle(self, *args, **options):
        if sys.stdout.encoding != 'utf-8':
            sys.stdout.reconfigure(encoding='utf-8')

        scored = Candidate.objects.filter(
            ranking_score__isnull=False, manual_score__isnull=False,
        )
        count = scored.count()
        if count == 0:
            self.stdout.write(self.style.WARNING(
                'No candidates have both an AI score and a manual score yet -- '
                'score some at /review/candidates/ first.'
            ))
            return

        ai_scores = list(scored.values_list('ranking_score', flat=True))
        manual_scores = list(scored.values_list('manual_score', flat=True))
        mae = statistics.mean(abs(a - m) for a, m in zip(ai_scores, manual_scores))
        # Needs at least 2 distinct values on each side or it's undefined.
        try:
            correlation = statistics.correlation(ai_scores, manual_scores)
        except statistics.StatisticsError:
            correlation = None

        self.stdout.write(self.style.SUCCESS(f'{count} candidate(s) with both an AI and a manual score.'))
        self.stdout.write(f'Mean absolute error: {mae:.1f} points')
        self.stdout.write(f'Correlation: {correlation:.2f}' if correlation is not None else 'Correlation: n/a (not enough variation)')

        disagreements = scored.filter(
            pass_fail='pass', manual_score__lt=PASS_THRESHOLD,
        ).count() + scored.filter(
            pass_fail='fail', manual_score__gte=PASS_THRESHOLD,
        ).count()
        self.stdout.write(
            f"Pass/fail disagreement: {disagreements}/{count} candidate(s) where the AI's "
            f'pass_fail disagrees with manual_score against the {PASS_THRESHOLD} threshold.'
        )

        self.stdout.write('\nBy role:')
        by_role = (
            scored.annotate(gap=Abs(F('ranking_score') - F('manual_score'), output_field=IntegerField()))
            .values('current_title')
            .annotate(n=Count('id'), avg_gap=Avg('gap'), avg_ai=Avg('ranking_score'), avg_manual=Avg('manual_score'))
            .order_by('-avg_gap')
        )
        for row in by_role:
            title = row['current_title'] or '(blank)'
            self.stdout.write(
                f"  {title:<16} n={row['n']:<3} avg gap={row['avg_gap']:.1f}  "
                f"avg AI={row['avg_ai']:.1f}  avg manual={row['avg_manual']:.1f}"
            )
