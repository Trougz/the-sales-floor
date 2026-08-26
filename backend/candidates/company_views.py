"""Recruiting portal: companies -- the clients whose open roles become
Requisitions ("projects"). Same trust boundary as the rest of the portal
(recruiter_required). Mirrors requisition_views.py's list/create/edit
pattern.
"""
from django import forms
from django.contrib import messages
from django.db.models import Count
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from .contact_views import ContactForm
from .decorators import recruiter_required
from .models import Campaign, Company

FIELD_CSS = 'w-full border border-neutral-300 rounded-md px-3 py-2 text-sm'


class CompanyForm(forms.ModelForm):
    class Meta:
        model = Company
        fields = ['name', 'contact_name', 'contact_email', 'contact_phone', 'notes']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            widget_css = FIELD_CSS
            if isinstance(field.widget, forms.Textarea):
                widget_css += ' min-h-24'
            field.widget.attrs['class'] = widget_css


@recruiter_required
def company_list(request):
    status = request.GET.get('status', 'active')
    q = request.GET.get('q', '').strip()
    qs = Company.objects.annotate(project_count=Count('requisitions'))
    if status in dict(Company.STATUS_CHOICES):
        qs = qs.filter(status=status)
    if q:
        qs = qs.filter(name__icontains=q)
    return render(request, 'candidates/portal/company_list.html', {
        'companies': qs,
        'status': status,
        'status_choices': Company.STATUS_CHOICES,
        'active_nav': 'companies',
    })


@recruiter_required
def company_create(request):
    if request.method == 'POST':
        form = CompanyForm(request.POST)
        if form.is_valid():
            company = form.save()
            return redirect('portal-company-detail', company_id=company.id)
    else:
        form = CompanyForm()
    return render(request, 'candidates/portal/company_form.html', {
        'form': form, 'company': None, 'active_nav': 'companies',
    })


@recruiter_required
def company_edit(request, company_id):
    company = get_object_or_404(Company, pk=company_id)
    if request.method == 'POST':
        form = CompanyForm(request.POST, instance=company)
        if form.is_valid():
            form.save()
            return redirect('portal-company-detail', company_id=company.id)
    else:
        form = CompanyForm(instance=company)
    return render(request, 'candidates/portal/company_form.html', {
        'form': form, 'company': company, 'active_nav': 'companies',
    })


@recruiter_required
def company_detail(request, company_id):
    company = get_object_or_404(Company, pk=company_id)
    requisitions = company.requisitions.order_by('-created_at')
    return render(request, 'candidates/portal/company_detail.html', {
        'company': company,
        'requisitions': requisitions,
        'contacts': company.contacts.all(),
        'form': ContactForm(),
        'active_contact_campaigns': Campaign.objects.filter(audience_type='contact', status='active'),
        'active_nav': 'companies',
    })


@require_POST
@recruiter_required
def company_reject(request, company_id):
    """"Delete" a company from the portal without actually deleting it --
    Requisition.company CASCADEs, so a real delete would silently wipe out
    that company's projects and every candidate's pipeline history on them.
    Marking it rejected instead keeps all of that intact; it just drops out
    of the default (active) company list and picker.
    """
    company = get_object_or_404(Company, pk=company_id)
    company.status = 'rejected'
    company.save(update_fields=['status'])
    messages.success(request, f'{company.name} marked rejected. Its projects and candidate history are unchanged.')
    return redirect(request.POST.get('next') or 'portal-company-list')


@require_POST
@recruiter_required
def company_reactivate(request, company_id):
    company = get_object_or_404(Company, pk=company_id)
    company.status = 'active'
    company.save(update_fields=['status'])
    messages.success(request, f'{company.name} reactivated.')
    return redirect(request.POST.get('next') or 'portal-company-list')
