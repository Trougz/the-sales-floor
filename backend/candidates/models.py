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

# Distinguishes a self-submitted public-form candidate from one a recruiter
# bulk-imported from a LinkedIn Recruiter export (see candidates/import_views.py).
# Matters because imported rows are allowed to leave several fields blank
# that the public form still requires -- see the fields below marked
# "recruiter-imported rows may leave this blank".
SOURCE_CHOICES = [
    ('form', 'Public form'),
    ('linkedin', 'LinkedIn sourcing'),
]

# Grouped (Django choices support an optgroup-style nested list) so the form
# and admin both show "United States" / "Canada" as visual sections rather
# than one flat alphabetical list of 64 names.
STATE_PROVINCE_CHOICES = [
    ('United States', [
        ('Alabama', 'Alabama'), ('Alaska', 'Alaska'), ('Arizona', 'Arizona'),
        ('Arkansas', 'Arkansas'), ('California', 'California'), ('Colorado', 'Colorado'),
        ('Connecticut', 'Connecticut'), ('Delaware', 'Delaware'),
        ('District of Columbia', 'District of Columbia'), ('Florida', 'Florida'),
        ('Georgia', 'Georgia'), ('Hawaii', 'Hawaii'), ('Idaho', 'Idaho'),
        ('Illinois', 'Illinois'), ('Indiana', 'Indiana'), ('Iowa', 'Iowa'),
        ('Kansas', 'Kansas'), ('Kentucky', 'Kentucky'), ('Louisiana', 'Louisiana'),
        ('Maine', 'Maine'), ('Maryland', 'Maryland'), ('Massachusetts', 'Massachusetts'),
        ('Michigan', 'Michigan'), ('Minnesota', 'Minnesota'), ('Mississippi', 'Mississippi'),
        ('Missouri', 'Missouri'), ('Montana', 'Montana'), ('Nebraska', 'Nebraska'),
        ('Nevada', 'Nevada'), ('New Hampshire', 'New Hampshire'), ('New Jersey', 'New Jersey'),
        ('New Mexico', 'New Mexico'), ('New York', 'New York'),
        ('North Carolina', 'North Carolina'), ('North Dakota', 'North Dakota'),
        ('Ohio', 'Ohio'), ('Oklahoma', 'Oklahoma'), ('Oregon', 'Oregon'),
        ('Pennsylvania', 'Pennsylvania'), ('Rhode Island', 'Rhode Island'),
        ('South Carolina', 'South Carolina'), ('South Dakota', 'South Dakota'),
        ('Tennessee', 'Tennessee'), ('Texas', 'Texas'), ('Utah', 'Utah'),
        ('Vermont', 'Vermont'), ('Virginia', 'Virginia'), ('Washington', 'Washington'),
        ('West Virginia', 'West Virginia'), ('Wisconsin', 'Wisconsin'), ('Wyoming', 'Wyoming'),
    ]),
    ('Canada', [
        ('Alberta', 'Alberta'), ('British Columbia', 'British Columbia'),
        ('Manitoba', 'Manitoba'), ('New Brunswick', 'New Brunswick'),
        ('Newfoundland and Labrador', 'Newfoundland and Labrador'),
        ('Northwest Territories', 'Northwest Territories'), ('Nova Scotia', 'Nova Scotia'),
        ('Nunavut', 'Nunavut'), ('Ontario', 'Ontario'),
        ('Prince Edward Island', 'Prince Edward Island'), ('Quebec', 'Quebec'),
        ('Saskatchewan', 'Saskatchewan'), ('Yukon', 'Yukon'),
    ]),
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
    linkedin_url = models.URLField()

    # Current role
    current_company_name = models.CharField(max_length=200)
    current_title = models.CharField(max_length=20, choices=TITLE_CHOICES, blank=True)
    # Required by the public form's own validation (views.REQUIRED_FIELDS);
    # nullable here only because a recruiter-imported LinkedIn row often
    # doesn't have this and shouldn't get a fabricated placeholder value.
    years_experience = models.PositiveIntegerField(null=True, blank=True)
    quota_attainment_pct = models.PositiveIntegerField(
        null=True, blank=True, help_text='% to quota, last period'
    )

    # Compensation
    ote = models.PositiveIntegerField(null=True, blank=True, verbose_name='current OTE')
    # blank=True for the same reason as years_experience above -- still
    # required by the public form itself.
    desired_ote = models.CharField(max_length=20, choices=DESIRED_OTE_RANGE_CHOICES, blank=True)

    # Preferences
    # blank=True for the same reason as years_experience above.
    state_province = models.CharField(max_length=30, choices=STATE_PROVINCE_CHOICES, blank=True)
    # null=True for the same reason as years_experience above.
    open_to_relocation = models.BooleanField(null=True, blank=True)
    work_styles = models.ManyToManyField(WorkStyle, blank=True, related_name='candidates')
    industries = models.ManyToManyField(Industry, blank=True, related_name='candidates')
    crm_tools = models.ManyToManyField(CrmTool, blank=True, related_name='candidates')

    # Additional
    awards = models.TextField(blank=True)
    resume = models.FileField(upload_to='resumes/%Y/%m/')

    # How this candidate entered the pool -- see SOURCE_CHOICES above.
    source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default='form')

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
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('rejected', 'Rejected'),
    ]

    name = models.CharField(max_length=200, unique=True)
    contact_name = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)
    notes = models.TextField(blank=True)
    # "Deleting" a company from the portal just sets this to 'rejected' --
    # the row (and any Requisitions/Matches under it) stays in the database
    # rather than being destroyed, since Requisition.company CASCADEs and a
    # real delete would silently wipe out projects and pipeline history.
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'companies'
        ordering = ['name']

    def __str__(self):
        return self.name


class Contact(models.Model):
    """A specific person at a Company, for business-development outreach --
    distinct from Company.contact_name/contact_email/contact_phone (the
    single "primary" contact shown on the company page today, kept as-is).
    A company can have several Contacts, each individually enrollable in a
    Campaign. Always scoped to one Company, never browsed globally -- see
    candidates/contact_views.py.
    """
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='contacts')
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    title = models.CharField(
        max_length=200, blank=True,
        help_text='Job title at this company, e.g. "VP Sales" -- free text, unrelated to TITLE_CHOICES.',
    )
    linkedin_url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.company.name})'


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
    # Full pasted job posting text -- informational only today. Not fed into
    # any AI call: doing that safely would need a background-job setup this
    # project doesn't have (see candidates.fit_search's module docstring).
    job_listing = models.TextField(blank=True)
    # Single-state hard requirement for candidates.fit_search's location
    # cutoff; blank means "no requirement / remote", not "unknown".
    location_required = models.CharField(max_length=30, choices=STATE_PROVINCE_CHOICES, blank=True)
    # Scored (not hard-cutoff) in candidates.fit_search -- mirrors
    # Candidate.crm_tools. related_name='requisitions' doesn't collide with
    # anything else on CrmTool (its only other reverse relation is
    # Candidate.crm_tools -> related_name='candidates').
    required_crm_tools = models.ManyToManyField(CrmTool, blank=True, related_name='requisitions')
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
        ('screening', 'Screening'),
        ('interviewing', 'Interviewing'),
        ('offer', 'Offer'),
        ('placed', 'Placed'),
        ('rejected', 'Rejected'),
    ]

    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='matches')
    requisition = models.ForeignKey(Requisition, on_delete=models.CASCADE, related_name='matches')
    # 'screening' (was 'submitted') doubles as the trigger for bumping
    # Candidate.status from 'new' -- see pipeline_views.create_match.
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='screening')
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


class Campaign(models.Model):
    """A multi-step outreach sequence -- see candidates/campaign_engine.py
    for the scheduling logic and candidates/campaign_views.py for the
    portal CRUD. Enrolls either Candidates (sourcing) or Contacts (business
    development), never both -- see audience_type.
    """
    AUDIENCE_CHOICES = [
        ('candidate', 'Candidate sourcing'),
        ('contact', 'Business development'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('archived', 'Archived'),
    ]

    name = models.CharField(max_length=200)
    audience_type = models.CharField(max_length=10, choices=AUDIENCE_CHOICES)
    # Only meaningful for audience_type='candidate' -- ties a shortlist
    # campaign to "invite this shortlist to screening for project X",
    # continuing the fit_search AI-shortlist workflow. Always null for
    # audience_type='contact' BD campaigns. SET_NULL (not CASCADE) since a
    # requisition going away shouldn't destroy campaign/send history.
    requisition = models.ForeignKey(
        Requisition, on_delete=models.SET_NULL, null=True, blank=True, related_name='campaigns',
    )
    # 'paused' stops both the n8n email feed and the to-do queue from
    # surfacing this campaign's steps without touching any StepExecution
    # data -- reactivating resumes exactly where it left off.
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='created_campaigns',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def scheduling_summary(self):
        """'N steps scheduled over M sending days' -- computed live from
        the steps' delay_days, not stored or dependent on any
        StepExecution having been materialized yet."""
        steps = list(self.steps.all())
        return {'step_count': len(steps), 'total_days': sum(s.delay_days for s in steps)}


class CampaignStep(models.Model):
    STEP_TYPE_CHOICES = [
        ('email', 'Email'),
        ('linkedin_inmail', 'LinkedIn InMail'),
        ('linkedin_connection', 'LinkedIn connection request'),
        ('phone_call', 'Phone call'),
        ('general_task', 'General task'),
    ]

    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='steps')
    order = models.PositiveIntegerField(help_text='1-based position in the sequence.')
    step_type = models.CharField(max_length=20, choices=STEP_TYPE_CHOICES)
    # Only meaningful for step_type='email' -- see save() below.
    subject = models.CharField(max_length=255, blank=True)
    # Drafted message (email/InMail) or instructions (call/general task).
    body = models.TextField(blank=True)
    delay_days = models.PositiveIntegerField(
        default=0,
        help_text='Days after the previous step (or enrollment, for step 1) before this step is due. 0 = immediately.',
    )
    # Email-only "between 9:00 AM and 6:00 PM" setting -- see save() below
    # and candidates.campaign_engine.compute_due_at.
    send_window_start = models.TimeField(null=True, blank=True)
    send_window_end = models.TimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['campaign', 'order']
        constraints = [
            models.UniqueConstraint(fields=['campaign', 'order'], name='unique_campaign_step_order'),
        ]

    def __str__(self):
        return f'Step {self.order} ({self.get_step_type_display()}) — {self.campaign.name}'

    def save(self, *args, **kwargs):
        # Enforced unconditionally here, not just in a form, so the
        # invariant holds regardless of call path (admin inline, shell,
        # a future bulk-edit view) -- a non-email step should never carry
        # a stale window from an earlier step-type change.
        if self.step_type != 'email':
            self.send_window_start = None
            self.send_window_end = None
        super().save(*args, **kwargs)


class CampaignEnrollment(models.Model):
    """A specific Candidate or Contact enrolled in a Campaign. Exactly one
    of candidate/contact is set, matching campaign.audience_type -- enforced
    at three layers: the creating view rejects a mismatched target before
    touching the DB, clean() catches it for any ModelForm/admin path, and
    the CheckConstraint below enforces "exactly one of candidate/contact" at
    the row level (a single-table CHECK can't also compare against
    campaign.audience_type, so that half stays app-layer only).
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('removed', 'Removed'),
    ]

    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='enrollments')
    candidate = models.ForeignKey(
        Candidate, on_delete=models.CASCADE, null=True, blank=True, related_name='campaign_enrollments',
    )
    contact = models.ForeignKey(
        Contact, on_delete=models.CASCADE, null=True, blank=True, related_name='campaign_enrollments',
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

    class Meta:
        ordering = ['-enrolled_at']
        constraints = [
            # A nullable FK on one side of each of these is fine -- SQL
            # treats every NULL as distinct for uniqueness, on both SQLite
            # and Postgres, so each constraint is silently inert for the
            # audience type it doesn't apply to.
            models.UniqueConstraint(fields=['campaign', 'candidate'], name='unique_campaign_candidate'),
            models.UniqueConstraint(fields=['campaign', 'contact'], name='unique_campaign_contact'),
            models.CheckConstraint(
                condition=(
                    models.Q(candidate__isnull=False, contact__isnull=True)
                    | models.Q(candidate__isnull=True, contact__isnull=False)
                ),
                name='campaign_enrollment_exactly_one_target',
            ),
        ]

    def __str__(self):
        return f'{self.candidate or self.contact} in {self.campaign.name}'

    def clean(self):
        from django.core.exceptions import ValidationError
        if bool(self.candidate_id) == bool(self.contact_id):
            raise ValidationError('Enrollment must have exactly one of candidate or contact set.')
        if self.campaign.audience_type == 'candidate' and not self.candidate_id:
            raise ValidationError('This campaign only enrolls candidates.')
        if self.campaign.audience_type == 'contact' and not self.contact_id:
            raise ValidationError('This campaign only enrolls contacts.')


class StepExecution(models.Model):
    """The concrete to-do/send record: 'step N for this enrollment is due
    at time X'. Only the current pending step exists for a given enrollment
    at any time (just-in-time materialization) -- see
    candidates.campaign_engine.complete_step_execution, the one place a new
    row gets created, called identically from a recruiter's manual
    'mark done' and n8n's automated send confirmation.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('done', 'Done'),
        ('skipped', 'Skipped'),
    ]

    enrollment = models.ForeignKey(CampaignEnrollment, on_delete=models.CASCADE, related_name='step_executions')
    campaign_step = models.ForeignKey(CampaignStep, on_delete=models.CASCADE, related_name='step_executions')
    due_at = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    completed_at = models.DateTimeField(null=True, blank=True)
    # Null for n8n-confirmed email sends; set for manual completions --
    # same "who/what did this" convention as Candidate.manual_ranked_by.
    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='completed_step_executions',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['due_at']
        constraints = [
            # Belt-and-suspenders for the just-in-time design: at most one
            # *pending* StepExecution per enrollment, enforced at the DB
            # level, not just by convention.
            models.UniqueConstraint(
                fields=['enrollment'],
                condition=models.Q(status='pending'),
                name='unique_pending_step_execution_per_enrollment',
            ),
        ]

    def __str__(self):
        return f'{self.campaign_step} for {self.enrollment} (due {self.due_at:%Y-%m-%d})'


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
