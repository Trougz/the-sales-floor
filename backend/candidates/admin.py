from django.contrib import admin
from django.utils.html import format_html, format_html_join

from .ai.client import AIConfigurationError
from .ai.ranking import MAX_CANDIDATES_PER_BATCH, rank_candidate
from .models import Candidate, Company, CrmTool, Industry, Match, Requisition, WorkStyle


class MatchInline(admin.TabularInline):
    model = Match
    extra = 0
    autocomplete_fields = ['candidate', 'requisition']


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'current_title', 'screening_title', 'current_company_name', 'years_experience',
        'quota_attainment_pct', 'desired_ote', 'resume_link',
        'resume_extraction_status', 'status', 'ranking_score', 'manual_score',
        'score_gap', 'pass_fail', 'created_at',
    ]
    list_filter = [
        'status', 'current_title', 'pass_fail',
        'open_to_relocation', 'work_styles', 'industries', 'crm_tools',
    ]
    search_fields = ['name', 'email', 'phone', 'current_company_name', 'linkedin_url']
    filter_horizontal = ['work_styles', 'industries', 'crm_tools']
    list_editable = ['status', 'ranking_score']
    # ranking_notes/ranking_criteria/ranking_recommended_title are read-only
    # because they're overwritten wholesale on every re-rank -- hand edits
    # would just be lost on the next run. manual_score/manual_ranked_at/by/
    # screening_title are read-only here for a different reason: the /review/
    # pages (candidates.review_views) are the single write path, so
    # manual_ranked_at/by stay trustworthy -- editing straight in admin would
    # leave them stale.
    readonly_fields = [
        'resume_link', 'resume_extraction_status', 'ranking_notes',
        'ranking_criteria_display', 'ranking_recommended_title', 'manual_score',
        'manual_ranked_at', 'manual_ranked_by', 'screening_title',
    ]
    ordering = ['-created_at']
    inlines = [MatchInline]
    actions = ['re_rank_selected_candidates']

    def get_queryset(self, request):
        # resume_extraction_status/manual_ranked_by are shown on every
        # changelist row; avoid an extra query per candidate to fetch them.
        return super().get_queryset(request).select_related('resume_extraction', 'manual_ranked_by')

    @admin.display(description='resume')
    def resume_link(self, obj):
        # Convenience column for the changelist; MEDIA_URL is served by
        # serve_media, so obj.resume.url resolves here and in the file widget.
        if not obj.resume:
            return '—'
        return format_html(
            '<a href="{}" target="_blank" rel="noopener">Open</a>', obj.resume.url
        )

    @admin.display(description='resume text')
    def resume_extraction_status(self, obj):
        # Surfaces whether the AI ranking pipeline actually had resume text
        # to work with -- rank_candidate() extracts on demand now, but a
        # failed extraction (unsupported .doc, scanned PDF, etc.) still means
        # ranking ran on form fields alone, so make that visible rather than
        # silent.
        if not obj.resume:
            return '—'
        extraction = getattr(obj, 'resume_extraction', None)
        if not extraction:
            return 'Not yet extracted'
        if extraction.extraction_error:
            return format_html('<span style="color:#b00">Error: {}</span>', extraction.extraction_error)
        return f'OK ({len(extraction.raw_text)} chars)'

    @admin.display(description='ranking criteria')
    def ranking_criteria_display(self, obj):
        if not obj.ranking_criteria:
            return '—'
        rows = format_html_join(
            '',
            '<tr><td style="padding-right:1em">{}</td><td style="padding-right:1em">{}</td><td>{}</td></tr>',
            (
                (item.get('name', ''), item.get('score', ''), item.get('rationale', ''))
                for item in obj.ranking_criteria
            ),
        )
        return format_html('<table>{}</table>', rows)

    @admin.display(description='AI/human gap')
    def score_gap(self, obj):
        if obj.ranking_score is None or obj.manual_score is None:
            return '—'
        return abs(obj.ranking_score - obj.manual_score)

    @admin.action(description='Re-rank selected candidates (AI)')
    def re_rank_selected_candidates(self, request, queryset):
        if queryset.count() > MAX_CANDIDATES_PER_BATCH:
            self.message_user(
                request,
                f'Select {MAX_CANDIDATES_PER_BATCH} or fewer at a time -- for a '
                'larger batch, run `manage.py rank_candidates` instead.',
                level='warning',
            )
            return

        ranked = failed = 0
        for candidate in queryset.select_related('resume_extraction'):
            try:
                rank_candidate(candidate)
                ranked += 1
            except AIConfigurationError as exc:
                self.message_user(request, str(exc), level='error')
                return
            except Exception as exc:  # noqa: BLE001 - one bad candidate must not stop the rest
                failed += 1
                self.message_user(request, f'{candidate}: {exc}', level='warning')

        self.message_user(request, f'Re-ranked {ranked} candidate(s) ({failed} failed).')


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
