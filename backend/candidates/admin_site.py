from django.contrib.admin import AdminSite


class SalesFloorAdminSite(AdminSite):
    """Reorders/filters the candidates app's sidebar to match how recruiters
    actually triage (by AI-screened role), instead of Django's default
    alphabetical model list. Anything not listed here (CrmTool, Company,
    Industry, Match, Requisition, WorkStyle) is hidden from the menu but
    stays registered and reachable by direct URL -- see 2026-08-24 admin
    reorg.
    """
    CANDIDATES_APP_MODEL_ORDER = [
        'candidate', 'candidateae', 'candidatesalesmanager',
        'candidatesdrbdr', 'candidaterejected',
    ]

    # Default AdminSite.site_url is '/', which this project never wires to
    # anything -- "View site" would just 404. Point it at the recruiting
    # portal instead, since that's the actual internal-facing app now.
    site_url = '/portal/'

    def get_app_list(self, request, app_label=None):
        app_list = super().get_app_list(request, app_label)
        order = {name: i for i, name in enumerate(self.CANDIDATES_APP_MODEL_ORDER)}
        for app in app_list:
            if app['app_label'] == 'candidates':
                app['models'] = sorted(
                    (m for m in app['models'] if m['object_name'].lower() in order),
                    key=lambda m: order[m['object_name'].lower()],
                )
        return app_list
