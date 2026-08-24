"""Resume text extraction, shared by the extract_resumes management command
and the AI ranking pipeline (candidates/ai/ranking.py), so ranking can never
silently run against an unparsed resume.
"""
import pdfplumber
from docx import Document

from .models import ResumeExtraction


def _extract_pdf(fileobj):
    with pdfplumber.open(fileobj) as pdf:
        pages = [page.extract_text() or '' for page in pdf.pages]
    return '\n\n'.join(pages).strip()


def _extract_docx(fileobj):
    document = Document(fileobj)
    return '\n'.join(p.text for p in document.paragraphs).strip()


def ensure_resume_extraction(candidate, force=False):
    """Return an up-to-date ResumeExtraction for `candidate`, parsing the
    resume file now if there's no cached extraction yet or the cached one is
    for a different file (candidate.resume was replaced).

    Returns None if the candidate has no resume file at all.
    """
    if not candidate.resume:
        return None

    existing = getattr(candidate, 'resume_extraction', None)
    up_to_date = existing and existing.source_filename == candidate.resume.name
    if up_to_date and not force:
        return existing

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
    except Exception as exc:  # noqa: BLE001 - one bad file must not kill a batch
        error = f'{type(exc).__name__}: {exc}'

    if not error and not raw_text:
        error = 'No text could be extracted from this file (it may be a scanned image).'

    # PDF/docx extraction occasionally yields literal NUL bytes (malformed
    # font/glyph mappings) -- harmless in SQLite locally, but Postgres (prod)
    # rejects any text field containing one outright, which otherwise fails
    # this save and everything downstream (ranking) that depends on it.
    raw_text = raw_text.replace('\x00', '')

    extraction, _ = ResumeExtraction.objects.update_or_create(
        candidate=candidate,
        defaults={
            'source_filename': filename,
            'raw_text': raw_text,
            'extraction_error': error,
        },
    )
    candidate.resume_extraction = extraction
    return extraction
