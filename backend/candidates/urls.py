from django.urls import path

from . import automation_views, views

urlpatterns = [
    path('candidates/', views.submit_candidate, name='submit-candidate'),
    path('employers/', views.submit_employer_request, name='submit-employer-request'),
    # n8n automation feed -- see candidates/automation_views.py.
    path('automation/rank-unranked/', automation_views.rank_unranked, name='automation-rank-unranked'),
    path('automation/daily-report/', automation_views.daily_report, name='automation-daily-report'),
    path(
        'automation/candidates/pending-nurture/',
        automation_views.pending_nurture,
        name='automation-pending-nurture',
    ),
    path(
        'automation/candidates/pending-invite/',
        automation_views.pending_invite,
        name='automation-pending-invite',
    ),
    path(
        'automation/candidates/mark-contacted/',
        automation_views.mark_contacted,
        name='automation-mark-contacted',
    ),
    path(
        'automation/campaigns/pending-emails/',
        automation_views.pending_campaign_emails,
        name='automation-pending-campaign-emails',
    ),
    path(
        'automation/campaigns/mark-step-sent/',
        automation_views.mark_campaign_step_sent,
        name='automation-mark-campaign-step-sent',
    ),
]
