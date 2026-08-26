"""Recruiting portal: contacts, always scoped to one Company (never browsed
globally) -- same shape as Match's create_match/update_match in
pipeline_views.py, so no top-level CRUD file here, just small mutating
endpoints rendered inline on company_detail.html.
"""
from django import forms
from django.contrib import messages
from django.shortcuts import get_object_or_404, render
from django.views.decorators.http import require_POST

from .decorators import recruiter_required
from .models import Campaign, Company, Contact

FIELD_CSS = 'w-full border border-neutral-300 rounded-md px-3 py-2 text-sm'


class ContactForm(forms.ModelForm):
    class Meta:
        model = Contact
        fields = ['name', 'email', 'phone', 'title', 'linkedin_url', 'notes']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            widget_css = FIELD_CSS
            if isinstance(field.widget, forms.Textarea):
                widget_css += ' min-h-16'
            field.widget.attrs['class'] = widget_css


def _contact_list_context(company):
    return {
        'company': company,
        'contacts': company.contacts.all(),
        'form': ContactForm(),
        'active_contact_campaigns': Campaign.objects.filter(audience_type='contact', status='active'),
    }


@require_POST
@recruiter_required
def contact_create(request, company_id):
    company = get_object_or_404(Company, pk=company_id)
    form = ContactForm(request.POST)
    if form.is_valid():
        form.instance.company = company
        form.save()
        form = ContactForm()
    ctx = _contact_list_context(company)
    ctx['form'] = form
    return render(request, 'candidates/portal/_contact_list.html', ctx)


@recruiter_required
def contact_edit(request, contact_id):
    contact = get_object_or_404(Contact, pk=contact_id)
    if request.method == 'POST':
        form = ContactForm(request.POST, instance=contact)
        if form.is_valid():
            form.save()
        return render(request, 'candidates/portal/_contact_row.html', {
            'contact': contact,
            'active_contact_campaigns': Campaign.objects.filter(audience_type='contact', status='active'),
        })
    form = ContactForm(instance=contact)
    return render(request, 'candidates/portal/_contact_row_edit.html', {'contact': contact, 'form': form})


@require_POST
@recruiter_required
def contact_delete(request, contact_id):
    contact = get_object_or_404(Contact, pk=contact_id)
    company = contact.company
    if contact.campaign_enrollments.exists():
        messages.error(request, f'{contact.name} is enrolled in a campaign and cannot be deleted.')
        return render(request, 'candidates/portal/_contact_row.html', {
            'contact': contact,
            'active_contact_campaigns': Campaign.objects.filter(audience_type='contact', status='active'),
        })
    contact.delete()
    return render(request, 'candidates/portal/_contact_list.html', _contact_list_context(company))
