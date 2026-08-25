"""Recruiting portal: companies -- the clients whose open roles become
Requisitions ("projects"). Same trust boundary as the rest of the portal
(recruiter_required). Mirrors requisition_views.py's list/create/edit
pattern.
"""
from django import forms
from django.db.models import Count
from django.shortcuts import get_object_or_404, redirect, render

from .decorators import recruiter_required
from .models import Company

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
    q = request.GET.get('q', '').strip()
    qs = Company.objects.annotate(project_count=Count('requisitions'))
    if q:
        qs = qs.filter(name__icontains=q)
    return render(request, 'candidates/portal/company_list.html', {
        'companies': qs,
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
        'active_nav': 'companies',
    })
