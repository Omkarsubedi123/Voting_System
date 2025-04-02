from django.urls import path
from . import views
from .views import candidate_list, candidate_create, candidate_update, candidate_delete

app_name = 'accounts'  # Define the namespace for your app

urlpatterns = [
    # Basic pages
    path('', views.home, name='home'),
    path('register/', views.user_register, name='register'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    
    # Dashboard views
    path('admin-dashboard/', views.admin_page, name='admin_page'),
    path('voters-dashboard/', views.voter_dashboard, name='voter_dashboard'),

    path('candidates/', candidate_list, name='candidate_list'),
    path('candidates/new/', candidate_create, name='candidate_create'),
    path('candidates/<int:pk>/edit/', candidate_update, name='candidate_update'),
    path('candidates/<int:pk>/delete/', candidate_delete, name='candidate_delete'),
    
    # Voter management
    path('voters/', views.voters_list, name='voters_list'),
    path('voters/<int:voter_id>/', views.voter_detail, name='voter_detail'),
    path('voters/add/', views.add_voter, name='add_voter'),
    path('voters/<int:voter_id>/edit/', views.edit_voter, name='edit_voter'),
    path('voters/<int:voter_id>/delete/', views.delete_voter, name='delete_voter'),
    
    # AJAX endpoints
    path('voters/<int:voter_id>/ajax/', views.ajax_voter_details, name='ajax_voter_details'),
    path('toggle-theme/', views.toggle_theme, name='toggle_theme'),
    
    # Additional pages
    path('elections/', views.elections, name='elections'),
    path('results/', views.results, name='results'),
    path('about/', views.about, name='about'),
    path('how-it-works/', views.how_it_works, name='how_it_works'),
    path('security/', views.security, name='security'),
    path('faq/', views.faq, name='faq'),
]
