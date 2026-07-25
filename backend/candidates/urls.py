from django.urls import path

from . import views

urlpatterns = [
    path('candidates/', views.submit_candidate, name='submit-candidate'),
]
