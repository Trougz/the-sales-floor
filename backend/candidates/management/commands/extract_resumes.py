import sys

import pdfplumber
from django.core.management.base import BaseCommand
from docx import Document

from candidates.models import Candidate, ResumeExtraction


def _extract_pdf(fileobj):
    with pdfplumber.open(fileobj) as pdf:
        pages = [page.extract_text() or '' for page in pdf.pages]
    return '\n\n'.join(pages).strip()


def _extract_docx(fileobj):
    document = Document(fileobj)
    return '\n'.join(p.text for p in document.paragraphs).strip()


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

            ok = self._extract_one(candidate)
            extracted += 1
            if not ok:
                failed += 1

        self.stdout.write(self.style.SUCCESS(
            f'Extracted {extracted} resume(s) ({failed} failed), skipped {skipped} already up to date.'
        ))

    def _extract_one(self, candidate):
        filename = candidate.resume.name
        suffix = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''

        raw_text = ''
        error = ''
        try:
            with candidate.resume.open('rb') as fileobj:
                if suffix == 'pdf':
                    raw_text = _extract_pdf(fileobj)
                elif suffix == 'docx':
                    raw_text = _extract_docx(fileobj)
                elif suffix == 'doc':
                    error = 'Legacy .doc files are not supported for text extraction.'
                elif suffix == 'txt':
                    raw_text = fileobj.read().decode('utf-8', errors='replace').strip()
                else:
                    error = f'Unsupported resume file type: .{suffix or "?"}'
        except Exception as exc:  # noqa: BLE001 - one bad file must not kill the batch
            error = f'{type(exc).__name__}: {exc}'

        if not error and not raw_text:
            error = 'No text could be extracted from this file (it may be a scanned image).'

        ResumeExtraction.objects.update_or_create(
            candidate=candidate,
            defaults={
                'source_filename': filename,
                'raw_text': raw_text,
                'extraction_error': error,
            },
        )

        if error:
            self.stderr.write(self.style.WARNING(f'{candidate}: {error}'))
        return not error
