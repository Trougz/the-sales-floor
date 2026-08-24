"""Shared access-control decorator for staff-facing, non-admin views.

Extracted out of review_views.py once a third+ caller (the recruiting portal,
see portal_views.py/requisition_views.py/pipeline_views.py) needed the same
check -- keeping one copy means a future change to who counts as a Recruiter
only has to happen in one place. qa_views.qa_reviewer_required stays where it
is: it's gated on a different group ('QA Reviewers') with a single caller, so
generalizing it now would be speculative.
"""
from functools import wraps

from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied

RECRUITERS_GROUP_NAME = 'Recruiters'


def recruiter_required(view):
    @wraps(view)
    @login_required
    @staff_member_required
    def wrapper(request, *args, **kwargs):
        # Superusers already have unrestricted access via /admin/ -- the group
        # check exists to let a non-superuser recruiter in without granting
        # that, not to gate the superusers themselves. Same reasoning as
        # qa_views.qa_reviewer_required.
        if not (request.user.is_superuser or request.user.groups.filter(name=RECRUITERS_GROUP_NAME).exists()):
            raise PermissionDenied('Not a Recruiter.')
        return view(request, *args, **kwargs)
    return wrapper
