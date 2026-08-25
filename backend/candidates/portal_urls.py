from django.urls import path

from . import company_views, import_views, pipeline_views, portal_views, requisition_views

urlpatterns = [
    path('', portal_views.index, name='portal-index'),
    path('candidates/', portal_views.candidate_search, name='portal-candidate-search'),
    path('candidates/import/', import_views.import_linkedin_candidates, name='portal-import-candidates'),
    path('candidates/<int:candidate_id>/', portal_views.candidate_detail, name='portal-candidate-detail'),
    path('companies/', company_views.company_list, name='portal-company-list'),
    path('companies/new/', company_views.company_create, name='portal-company-create'),
    path('companies/<int:company_id>/', company_views.company_detail, name='portal-company-detail'),
    path('companies/<int:company_id>/edit/', company_views.company_edit, name='portal-company-edit'),
    # URL name identifiers keep "requisition" (matches the Requisition model)
    # -- only the path segments and user-facing text say "project", which is
    # what recruiters actually call these.
    path('projects/', requisition_views.requisition_list, name='portal-requisition-list'),
    path('projects/new/', requisition_views.requisition_create, name='portal-requisition-create'),
    path('projects/<int:requisition_id>/', requisition_views.requisition_detail, name='portal-requisition-detail'),
    path('projects/<int:requisition_id>/edit/', requisition_views.requisition_edit, name='portal-requisition-edit'),
    path(
        'projects/<int:requisition_id>/candidate-search/',
        requisition_views.candidate_search_for_requisition,
        name='portal-requisition-candidate-search',
    ),
    path('matches/create/', pipeline_views.create_match, name='portal-create-match'),
    path('matches/<int:match_id>/update/', pipeline_views.update_match, name='portal-update-match'),
]
