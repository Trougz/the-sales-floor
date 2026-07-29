import sys

from django.core.management.base import BaseCommand

from candidates.ai.client import AIConfigurationError
from candidates.ai.ranking import rank_candidate
from candidates.models import Candidate


class Command(BaseCommand):
    help = (
        'Score candidates with the AI ranking pipeline, writing '
        'Candidate.ranking_score/ranking_computed_at/ranking_model_version. '
        'Run extract_resumes first so resume text is available to rank against.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--candidate-id', type=int, default=None,
            help='Only rank this one candidate (still respects --force).',
        )
        parser.add_argument(
            '--force', action='store_true',
            help='Re-rank even if ranking_computed_at is already set.',
        )

    def handle(self, *args, **options):
        # Ensure UTF-8 output on Windows (handles non-ASCII in resume text / Claude summaries)
        if sys.stdout.encoding != 'utf-8':
            sys.stdout.reconfigure(encoding='utf-8')

        candidates = Candidate.objects.select_related('resume_extraction')
        if options['candidate_id'] is not None:
            candidates = candidates.filter(pk=options['candidate_id'])
        elif not options['force']:
            candidates = candidates.filter(ranking_computed_at__isnull=True)

        ranked = failed = 0
        for candidate in candidates:
            try:
                result = rank_candidate(candidate)
            except AIConfigurationError as exc:
                self.stderr.write(self.style.ERROR(str(exc)))
                return
            except Exception as exc:  # noqa: BLE001 - one bad candidate must not kill the batch
                failed += 1
                self.stderr.write(self.style.WARNING(f'{candidate}: {type(exc).__name__}: {exc}'))
                continue

            ranked += 1
            self.stdout.write(f'{candidate}: {result["ranking_score"]} -- {result["summary"]}')
            if result['flags']:
                self.stdout.write(self.style.WARNING(f'  flags: {", ".join(result["flags"])}'))

        self.stdout.write(self.style.SUCCESS(f'Ranked {ranked} candidate(s) ({failed} failed).'))
