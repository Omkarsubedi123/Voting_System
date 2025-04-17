from django.urls import path
from . import views
from .views import candidate_list, candidate_create, candidate_update, candidate_delete
from django.contrib.auth import views as auth_views

app_name = 'accounts'  # This defines the namespace

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.user_login, name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='accounts:login'), name='logout'),
    path('register/', views.user_register, name='register'),
    
    path('admin-dashboard/', views.admin_page, name='admin_page'),
    path('', views.home, name='home'),
    path('voters/', views.users_list, name='users_list'),
    
    # Voter management
    path('users/', views.users_list, name='users_list'),
    path('users/<int:user_id>/', views.user_detail, name='user_detail'),
    path('users/<int:user_id>/ajax/', views.user_detail, name='user_detail_ajax'),
    path('users/<int:user_id>/edit/', views.edit_user, name='edit_user'),
    path('users/<int:user_id>/delete/', views.delete_user, name='delete_user'),

    # Voter management
    path('voters/<int:voter_id>/edit/', views.voter_edit, name='voter_edit'),
    path('voters/<int:voter_id>/delete/', views.voter_delete, name='voter_delete'),

    # AJAX endpoints
    path('voters/<int:voter_id>/ajax/', views.ajax_voter_details, name='ajax_voter_details'),
    path('toggle-theme/', views.toggle_theme, name='toggle_theme'),

     # Settings related URLs
    path('settings/', views.settings_view, name='settings'),
    path('api/update-profile/', views.update_profile, name='update_profile'),
    path('api/change-password/', views.change_password, name='change_password'),
    path('api/delete-account/', views.delete_profile, name='delete_account'),
    
    # Candidate management
    path('candidates/', candidate_list, name='candidate_list'),
    path('candidates/new/', candidate_create, name='candidate_create'),
    path('candidates/<int:pk>/edit/', candidate_update, name='candidate_update'),
    path('candidates/<int:pk>/delete/', candidate_delete, name='candidate_delete'),
    
    # Additional pages
    path('elections/', views.elections, name='elections'),
    path('results/', views.results, name='results'),
    path('about/', views.about, name='about'),
    path('how-it-works/', views.how_it_works, name='how_it_works'),
    path('security/', views.security, name='security'),
    path('faq/', views.faq, name='faq'),
]
