from django.urls import path

from . import qa_views

urlpatterns = [
    path('candidates/', qa_views.review_queue, name='qa-review-queue'),
    path('candidates/<int:candidate_id>/', qa_views.review_detail, name='qa-review-detail'),
    path('candidates/<int:candidate_id>/send-invite/', qa_views.send_invite, name='qa-send-invite'),
]
