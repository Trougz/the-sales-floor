from django.urls import path

from . import pipeline_views, portal_views, requisition_views

urlpatterns = [
    path('', portal_views.index, name='portal-index'),
    path('candidates/', portal_views.candidate_search, name='portal-candidate-search'),
    path('candidates/<int:candidate_id>/', portal_views.candidate_detail, name='portal-candidate-detail'),
    path('requisitions/', requisition_views.requisition_list, name='portal-requisition-list'),
    path('requisitions/new/', requisition_views.requisition_create, name='portal-requisition-create'),
    path('requisitions/<int:requisition_id>/', requisition_views.requisition_detail, name='portal-requisition-detail'),
    path('requisitions/<int:requisition_id>/edit/', requisition_views.requisition_edit, name='portal-requisition-edit'),
    path(
        'requisitions/<int:requisition_id>/candidate-search/',
        requisition_views.candidate_search_for_requisition,
        name='portal-requisition-candidate-search',
    ),
    path('matches/create/', pipeline_views.create_match, name='portal-create-match'),
    path('matches/<int:match_id>/update/', pipeline_views.update_match, name='portal-update-match'),
]
