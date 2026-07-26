from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html

from .models import Candidate, Company, CrmTool, Industry, Match, Requisition, WorkStyle


class MatchInline(admin.TabularInline):
    model = Match
    extra = 0
    autocomplete_fields = ['candidate', 'requisition']


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'current_title', 'current_company_name', 'years_experience',
        'quota_attainment_pct', 'desired_ote', 'resume_link', 'status',
        'ranking_score', 'created_at',
    ]
    list_filter = [
        'status', 'current_title', 'open_to_relocation', 'work_styles', 'industries', 'crm_tools',
    ]
    search_fields = ['name', 'email', 'phone', 'current_company_name', 'linkedin_url']
    filter_horizontal = ['work_styles', 'industries', 'crm_tools']
    list_editable = ['status', 'ranking_score']
    readonly_fields = ['resume_link']
    ordering = ['-created_at']
    inlines = [MatchInline]

    @admin.display(description='resume')
    def resume_link(self, obj):
        # The FileField widget's own link points at MEDIA_URL, which nothing
        # serves -- link to the staff-only download view instead.
        if not obj.resume:
            return '—'
        return format_html(
            '<a href="{}" target="_blank" rel="noopener">Open</a>',
            reverse('candidate-resume', args=[obj.pk]),
        )


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_name', 'contact_email', 'contact_phone', 'created_at']
    search_fields = ['name', 'contact_name', 'contact_email']


@admin.register(Requisition)
class RequisitionAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'company', 'role_type', 'timeline', 'industry',
        'status', 'comp_min', 'comp_max', 'created_at',
    ]
    list_filter = ['status', 'role_type', 'timeline', 'industry']
    search_fields = ['title', 'company__name']
    autocomplete_fields = ['company']
    list_editable = ['status']
    inlines = [MatchInline]


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'requisition', 'stage', 'fit_score', 'updated_at']
    list_filter = ['stage']
    search_fields = ['candidate__name', 'requisition__title', 'requisition__company__name']
    autocomplete_fields = ['candidate', 'requisition']


@admin.register(Industry)
class IndustryAdmin(admin.ModelAdmin):
    search_fields = ['name']


@admin.register(CrmTool)
class CrmToolAdmin(admin.ModelAdmin):
    search_fields = ['name']


@admin.register(WorkStyle)
class WorkStyleAdmin(admin.ModelAdmin):
    search_fields = ['name']
