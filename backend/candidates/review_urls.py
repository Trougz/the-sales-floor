from django.urls import path

from . import review_views

urlpatterns = [
    path('candidates/', review_views.review_queue, name='review-queue'),
    path('candidates/<int:candidate_id>/', review_views.review_detail, name='review-detail'),
]
