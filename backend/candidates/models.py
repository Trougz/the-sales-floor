from django.conf import settings
from django.db import models

# Shared by Candidate.current_title and Requisition.role_type so both sides of
# a match speak the same vocabulary -- changing one without the other would
# silently break filtering candidates against an open req.
TITLE_CHOICES = [
    ('SDR', 'SDR'),
    ('BDR', 'BDR'),
    ('AE', 'AE'),
    ('Sales Manager', 'Sales Manager'),
    ('Other', 'Other'),
]

# OTE bands rather than a raw number -- coarser, but candidates give more
# honest answers to a range than a specific figure, and it's what this
# pool's recruiting conversations actually work off of.
DESIRED_OTE_RANGE_CHOICES = [
    ('$50k-$80k', '$50k – $80k'),
    ('$80k-$110k', '$80k – $110k'),
    ('$110k-$140k', '$110k – $140k'),
    ('$140k-$250k', '$140k – $250k'),
    ('$250k+', '$250k+'),
]


class Industry(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name_plural = 'industries'
        ordering = ['name']

    def __str__(self):
        return self.name


class CrmTool(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name = 'CRM/tool'
        verbose_name_plural = 'CRM/tools'
        ordering = ['name']

    def __str__(self):
        return self.name


class WorkStyle(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name_plural = 'work styles'
        ordering = ['name']

    def __str__(self):
        return self.name


class Candidate(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('screening', 'Screening'),
        ('active', 'Active'),
        ('placed', 'Placed'),
        ('rejected', 'Rejected'),
    ]

    # Contact
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    linkedin_url = models.URLField(blank=True)

    # Current role
    current_company_name = models.CharField(max_length=200)
    current_title = models.CharField(max_length=20, choices=TITLE_CHOICES, blank=True)
    years_experience = models.PositiveIntegerField()
    quota_attainment_pct = models.PositiveIntegerField(
        null=True, blank=True, help_text='% to quota, last period'
    )

    # Compensation
    ote = models.PositiveIntegerField(null=True, blank=True, verbose_name='current OTE')
    desired_ote = models.CharField(max_length=20, choices=DESIRED_OTE_RANGE_CHOICES)

    # Preferences
    open_to_relocation = models.BooleanField()
    work_styles = models.ManyToManyField(WorkStyle, blank=True, related_name='candidates')
    industries = models.ManyToManyField(Industry, blank=True, related_name='candidates')
    crm_tools = models.ManyToManyField(CrmTool, blank=True, related_name='candidates')

    # Additional
    awards = models.TextField(blank=True)
    resume = models.FileField(upload_to='resumes/%Y/%m/')

    # Recruiting workflow
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    ranking_score = models.PositiveSmallIntegerField(
        null=True, blank=True, help_text='0-100, higher is better'
    )
    # Set by the AI ranking pipeline (candidates.ai.ranking) whenever it writes
    # ranking_score, so recruiters/admin can tell a fresh score from a stale
    # one, or from a value someone hand-typed (which leaves these blank).
    ranking_computed_at = models.DateTimeField(null=True, blank=True)
    ranking_model_version = models.CharField(max_length=100, blank=True)
    # Overwritten wholesale on every re-rank -- separate from internal_notes,
    # which is recruiter-authored and must never be clobbered by the AI.
    ranking_notes = models.TextField(
        blank=True, help_text="AI-generated summary/flags from the last ranking run."
    )
    # The 4 fixed, role-specific dimensions (see candidates.ai.rubric.ROLE_CRITERIA)
    # behind ranking_score: list of {name, score, rationale}. Also overwritten
    # wholesale on every re-rank.
    ranking_criteria = models.JSONField(default=list, blank=True)
    # The AI's recommendation for which title to actually screen this
    # candidate against (same as current_title, or one rung down -- see
    # candidates.ai.rubric.ONE_RUNG_DOWN). Overwritten wholesale on every
    # re-rank, like ranking_notes -- screening_title below is the field that
    # actually sticks once a human has weighed in.
    ranking_recommended_title = models.CharField(max_length=20, choices=TITLE_CHOICES, blank=True)
    internal_notes = models.TextField(blank=True)

    # The role this candidate is actually screened/matched against -- may
    # differ from the self-reported current_title (see ranking_recommended_title
    # above). rank_candidate() auto-syncs this to its own recommendation only
    # while manual_ranked_at is still null; once a human has reviewed the
    # candidate once, re-ranking never silently overwrites their call. Set
    # via the /review/ pages alongside manual_score, reusing the same
    # manual_ranked_at/by stamps -- see CandidateAdmin.
    screening_title = models.CharField(max_length=20, choices=TITLE_CHOICES, blank=True)

    # A recruiter's own 0-100 score from actually reading the file, kept
    # separate from the AI's ranking_score so the two can be compared (see
    # candidates.management.commands.rank_agreement). Written only by the
    # /review/ pages (candidates.review_views), not the admin, so
    # manual_ranked_at/by stay accurate -- see CandidateAdmin.
    manual_score = models.PositiveSmallIntegerField(
        null=True, blank=True, help_text="Recruiter's own 0-100 score, independent of the AI ranking."
    )
    manual_ranked_at = models.DateTimeField(null=True, blank=True)
    manual_ranked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='manually_ranked_candidates',
    )

    PASS_FAIL_CHOICES = [
        ('pass', 'Pass'),
        ('fail', 'Fail'),
    ]
    # Set by rank_candidate() alongside ranking_score (see candidates.ai.rubric.
    # PASS_THRESHOLD) -- blank until ranked.
    pass_fail = models.CharField(max_length=4, choices=PASS_FAIL_CHOICES, blank=True)
    # Idempotency guards for the n8n outreach automation: set once the
    # corresponding message has actually been sent, so a re-run of the
    # twice-daily workflow doesn't nurture/invite the same candidate twice.
    nurture_started_at = models.DateTimeField(null=True, blank=True)
    booking_invite_sent_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} ({self.current_title})'


# Proxy models below back the admin's role-filtered sidebar entries (AE's,
# Sales Managers, SDR/BDRs, Rejected) -- same table as Candidate, filtered by
# screening_title/pass_fail in each one's ModelAdmin.get_queryset(). See
# candidates/admin.py and candidates/admin_site.py.
class CandidateAE(Candidate):
    class Meta:
        proxy = True
        verbose_name = 'AE'
        verbose_name_plural = "AE's"


class CandidateSalesManager(Candidate):
    class Meta:
        proxy = True
        verbose_name = 'Sales Manager'
        verbose_name_plural = 'Sales Managers'


class CandidateSDRBDR(Candidate):
    class Meta:
        proxy = True
        verbose_name = 'SDR/BDR'
        verbose_name_plural = 'SDR/BDRs'


class CandidateRejected(Candidate):
    class Meta:
        proxy = True
        verbose_name = 'Rejected Candidate'
        verbose_name_plural = 'Rejected'


class Company(models.Model):
    name = models.CharField(max_length=200, unique=True)
    contact_name = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'companies'
        ordering = ['name']

    def __str__(self):
        return self.name


class Requisition(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('filled', 'Filled'),
        ('closed', 'Closed'),
    ]

    TIMELINE_CHOICES = [
        ('ASAP', 'ASAP'),
        ('Within 30 days', 'Within 30 days'),
        ('This quarter', 'This quarter'),
        ('Just exploring', 'Just exploring'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='requisitions')
    title = models.CharField(max_length=200, help_text='Role being hired for, e.g. "Senior AE"')
    role_type = models.CharField(
        max_length=20, choices=TITLE_CHOICES, blank=True,
        help_text='Normalised role, matched against a candidate\'s current title',
    )
    timeline = models.CharField(max_length=20, choices=TIMELINE_CHOICES, blank=True)
    industry = models.ForeignKey(
        Industry, on_delete=models.SET_NULL, null=True, blank=True, related_name='requisitions'
    )
    comp_min = models.PositiveIntegerField(null=True, blank=True)
    comp_max = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} @ {self.company}'


class Match(models.Model):
    STAGE_CHOICES = [
        ('submitted', 'Submitted'),
        ('interviewing', 'Interviewing'),
        ('offer', 'Offer'),
        ('placed', 'Placed'),
        ('rejected', 'Rejected'),
    ]

    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='matches')
    requisition = models.ForeignKey(Requisition, on_delete=models.CASCADE, related_name='matches')
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='submitted')
    fit_score = models.PositiveSmallIntegerField(
        null=True, blank=True, help_text='0-100, higher is a better fit for this requisition'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(fields=['candidate', 'requisition'], name='unique_candidate_requisition')
        ]

    def __str__(self):
        return f'{self.candidate} -> {self.requisition} ({self.stage})'


class ResumeExtraction(models.Model):
    """Cached plain-text extraction of a Candidate's resume file.

    Kept separate from Candidate rather than a field on it, since it's a
    derived artifact (re-computed by the extract_resumes management command)
    with its own error state, not part of the candidate's submitted data.
    source_filename is the cache-invalidation key: extract_resumes only
    re-parses when it no longer matches candidate.resume.name, i.e. the
    resume file was replaced.
    """
    candidate = models.OneToOneField(
        Candidate, on_delete=models.CASCADE, related_name='resume_extraction'
    )
    source_filename = models.CharField(max_length=255)
    raw_text = models.TextField(blank=True)
    # Non-empty means extraction failed for this file (e.g. unsupported
    # legacy .doc, corrupt PDF); raw_text will be empty in that case.
    extraction_error = models.TextField(blank=True)
    extracted_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'Resume extraction for {self.candidate}'
