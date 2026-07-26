from django.urls import path

from . import views

urlpatterns = [
    path('candidates/', views.submit_candidate, name='submit-candidate'),
    path('employers/', views.submit_employer_request, name='submit-employer-request'),
]
