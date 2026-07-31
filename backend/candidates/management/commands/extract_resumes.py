import sys

from django.core.management.base import BaseCommand

from candidates.models import Candidate
from candidates.resume_text import ensure_resume_extraction


class Command(BaseCommand):
    help = (
        'Extract plain text from candidate resumes into ResumeExtraction, '
        'so the AI ranking pipeline has resume content to read without '
        're-parsing the file on every run.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--candidate-id', type=int, default=None,
            help='Only extract this one candidate (still respects --force).',
        )
        parser.add_argument(
            '--force', action='store_true',
            help='Re-extract even if a matching-filename extraction already exists.',
        )

    def handle(self, *args, **options):
        # Ensure UTF-8 output on Windows (handles non-ASCII in candidate names / resume text)
        if sys.stdout.encoding != 'utf-8':
            sys.stdout.reconfigure(encoding='utf-8')
        if sys.stderr.encoding != 'utf-8':
            sys.stderr.reconfigure(encoding='utf-8')

        candidates = Candidate.objects.exclude(resume='').select_related('resume_extraction')
        if options['candidate_id'] is not None:
            candidates = candidates.filter(pk=options['candidate_id'])

        extracted = skipped = failed = 0
        for candidate in candidates:
            existing = getattr(candidate, 'resume_extraction', None)
            up_to_date = existing and existing.source_filename == candidate.resume.name
            if up_to_date and not options['force']:
                skipped += 1
                continue

            extraction = ensure_resume_extraction(candidate, force=options['force'])
            extracted += 1
            if extraction.extraction_error:
                failed += 1
                self.stderr.write(self.style.WARNING(f'{candidate}: {extraction.extraction_error}'))

        self.stdout.write(self.style.SUCCESS(
            f'Extracted {extracted} resume(s) ({failed} failed), skipped {skipped} already up to date.'
        ))
