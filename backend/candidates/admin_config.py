from django.contrib.admin.apps import AdminConfig

# Kept in its own module, separate from candidates/apps.py: Django's
# automatic default-AppConfig detection for the bare 'candidates'
# INSTALLED_APPS entry scans every AppConfig subclass visible in
# candidates/apps.py's module namespace, including imported ones -- having
# AdminConfig (imported, default=True) and this subclass alongside
# CandidatesConfig there raised "declares more than one default AppConfig".


class CandidatesAdminConfig(AdminConfig):
    """Points django.contrib.admin's default site at SalesFloorAdminSite
    (candidates/admin_site.py), so every existing @admin.register(...) call
    keeps working unchanged while get_app_list() reorders/filters the
    sidebar. See settings.INSTALLED_APPS.
    """
    default_site = 'candidates.admin_site.SalesFloorAdminSite'
