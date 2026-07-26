from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import Candidate, Company, CrmTool, Industry, Requisition, WorkStyle

REQUIRED_FIELDS = [
    'name', 'email', 'phone', 'company',
    'years', 'desired_ote', 'relocation',
]

EMPLOYER_REQUIRED_FIELDS = [
    'company_name', 'contact_name', 'contact_email',
    'role_title', 'role_type', 'timeline',
]


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
        # Atomic so a bad requisition value can't leave behind an orphan
        # Company row from the get_or_create above.
        with transaction.atomic():
            # Company.name is unique, so a company posting a second role must
            # reuse its existing row rather than blowing up on the constraint.
            company, created = Company.objects.get_or_create(
                name=data['company_name'].strip(),
                defaults={
                    'contact_name': data['contact_name'].strip(),
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
                    ('contact_name', data['contact_name'].strip()),
                    ('contact_email', data['contact_email'].strip()),
                    ('contact_phone', data.get('contact_phone', '').strip()),
                ):
                    if value and getattr(company, field) != value:
                        setattr(company, field, value)
                        updated.append(field)
                if updated:
                    company.save(update_fields=updated)

            requisition = Requisition.objects.create(
                company=company,
                title=data['role_title'].strip(),
                role_type=data['role_type'],
                timeline=data['timeline'],
                # 'Other' (and anything unseeded) has no Industry row -- leave
                # null rather than rejecting an otherwise valid submission.
                industry=Industry.objects.filter(name=data.get('industry', '')).first(),
                comp_min=int(data['comp_min']) if data.get('comp_min') else None,
                comp_max=int(data['comp_max']) if data.get('comp_max') else None,
                notes=data.get('notes', '').strip(),
            )
    except (ValueError, KeyError) as err:
        return JsonResponse({'result': 'error', 'message': f'Invalid field value: {err}'}, status=400)

    return JsonResponse({'result': 'success', 'id': requisition.id})
