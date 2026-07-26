from django.contrib.admin.views.decorators import staff_member_required
from django.http import FileResponse, Http404, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import Candidate, Company, CrmTool, Industry, WorkStyle

REQUIRED_FIELDS = [
    'name', 'email', 'phone', 'company',
    'years', 'desired_ote', 'relocation',
]

# The public employer form is a networking capture, not a job post -- it only
# collects who the company is and how to reach them. Requisitions (role,
# comp, timeline) are entered by a recruiter in the admin after a real
# conversation, so nothing here creates one.
EMPLOYER_REQUIRED_FIELDS = ['company_name', 'contact_email']


@csrf_exempt
@require_POST
def submit_candidate(request):
    data = request.POST
    resume = request.FILES.get('resume')

    missing = [f for f in REQUIRED_FIELDS if not data.get(f)]
    if not resume:
        missing.append('resume')
    if missing:
        return JsonResponse(
            {'result': 'error', 'message': f'Missing required field(s): {", ".join(missing)}'},
            status=400,
        )

    try:
        candidate = Candidate.objects.create(
            name=data['name'].strip(),
            email=data['email'].strip(),
            phone=data['phone'].strip(),
            linkedin_url=data.get('linkedin', '').strip(),
            current_company_name=data['company'].strip(),
            current_title=data.get('title', ''),
            years_experience=int(data['years']),
            quota_attainment_pct=int(data['quota']) if data.get('quota') else None,
            base_salary=int(data['base']) if data.get('base') else None,
            ote=int(data['ote']) if data.get('ote') else None,
            desired_ote=int(data['desired_ote']),
            open_to_relocation=data['relocation'] == 'yes',
            awards=data.get('awards', '').strip(),
            resume=resume,
        )
    except (ValueError, KeyError) as err:
        return JsonResponse({'result': 'error', 'message': f'Invalid field value: {err}'}, status=400)

    candidate.work_styles.set(WorkStyle.objects.filter(name__in=data.getlist('location')))
    candidate.industries.set(Industry.objects.filter(name__in=data.getlist('industry')))
    candidate.crm_tools.set(CrmTool.objects.filter(name__in=data.getlist('crm')))

    return JsonResponse({'result': 'success', 'id': candidate.id})


@csrf_exempt
@require_POST
def submit_employer_request(request):
    data = request.POST

    missing = [f for f in EMPLOYER_REQUIRED_FIELDS if not data.get(f)]
    if missing:
        return JsonResponse(
            {'result': 'error', 'message': f'Missing required field(s): {", ".join(missing)}'},
            status=400,
        )

    try:
        # Company.name is unique, so someone submitting twice reuses their
        # existing row rather than blowing up on the constraint.
        company, created = Company.objects.get_or_create(
            name=data['company_name'].strip(),
            defaults={
                'contact_email': data['contact_email'].strip(),
                'contact_phone': data.get('contact_phone', '').strip(),
            },
        )
        if not created:
            # Refresh contact details from the latest submission, but only
            # where a value was actually supplied -- omitting an optional
            # field must not wipe what we already have on file.
            updated = []
            for field, value in (
                ('contact_email', data['contact_email'].strip()),
                ('contact_phone', data.get('contact_phone', '').strip()),
            ):
                if value and getattr(company, field) != value:
                    setattr(company, field, value)
                    updated.append(field)
            if updated:
                company.save(update_fields=updated)
    except (ValueError, KeyError) as err:
        return JsonResponse({'result': 'error', 'message': f'Invalid field value: {err}'}, status=400)

    return JsonResponse({'result': 'success', 'id': company.id})


@staff_member_required
def download_resume(request, pk):
    """Serve a candidate's resume to logged-in staff only.

    Resumes live under MEDIA_ROOT, which nothing serves in production --
    whitenoise only covers STATIC_ROOT, and the `static()` helper in
    salesfloor/urls.py is DEBUG-only. Rather than exposing MEDIA_URL
    publicly (these are candidate PII, and the paths are guessable),
    the admin links here and Django streams the file behind auth.
    """
    candidate = get_object_or_404(Candidate, pk=pk)
    if not candidate.resume:
        raise Http404('This candidate has no resume on file.')

    try:
        handle = candidate.resume.open('rb')
    except FileNotFoundError:
        # Row survived but the file didn't -- e.g. uploaded before the
        # persistent disk was mounted, so it went to ephemeral storage.
        raise Http404('Resume file is missing from storage.')

    # as_attachment=False so PDFs open in a browser tab instead of downloading.
    return FileResponse(handle, as_attachment=False, filename=candidate.resume.name.rsplit('/', 1)[-1])
