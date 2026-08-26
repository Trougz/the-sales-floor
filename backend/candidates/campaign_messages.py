"""Variable substitution for CampaignStep subject/body -- used by the n8n
email-step feed (automation_views.pending_campaign_emails). Mirrors
fit_search.py's role as a focused module separate from its callers.
"""
from .models import Candidate


def get_recipient(enrollment):
    return enrollment.candidate or enrollment.contact


def _company_name(recipient):
    return recipient.current_company_name if isinstance(recipient, Candidate) else recipient.company.name


def _title(recipient):
    return recipient.get_current_title_display() if isinstance(recipient, Candidate) else recipient.title


TOKENS = {
    '{First Name}': lambda r: r.name.split()[0] if r.name else '',
    '{Full Name}': lambda r: r.name,
    '{Company}': _company_name,
    '{Title}': _title,
}


def render(text, recipient):
    for token, resolver in TOKENS.items():
        if token in text:
            text = text.replace(token, resolver(recipient) or '')
    return text


def render_step_message(step_execution):
    recipient = get_recipient(step_execution.enrollment)
    step = step_execution.campaign_step
    return render(step.subject, recipient), render(step.body, recipient)
