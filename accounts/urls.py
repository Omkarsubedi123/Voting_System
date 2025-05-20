from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

app_name = 'accounts'  # Add this line to define the app namespace

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.user_login, name='login'),  
    path('logout/', auth_views.LogoutView.as_view(next_page='accounts:home'), name='logout'),
    path('register/', views.user_register, name='register'),
    
    path('admin-dashboard/', views.admin_page, name='admin_page'),
    path('voters/', views.users_list, name='users_list'),
    path('users/', views.users_list, name='users_list'),
    path('users/<int:user_id>/', views.user_detail, name='user_detail'),
    # path('users/<int:user_id>/ajax/', views.user_detail, name='user_detail_ajax'),
    # path('users/<int:user_id>/edit/', views.edit_user, name='edit_user'),
    # path('users/<int:user_id>/delete/', views.delete_user, name='delete_user'),
    path('voters/<int:voter_id>/edit/', views.voter_edit, name='voter_edit'),
    path('voters/<int:id>/delete/', views.voter_delete, name='voter_delete'),
    path('voters/<int:voter_id>/ajax/', views.ajax_voter_details, name='ajax_voter_details'),
    path('toggle-theme/', views.toggle_theme, name='toggle_theme'),
    path('settings/', views.settings_view, name='settings'),
    path('api/update-profile/', views.update_profile, name='update_profile'),
    path('api/change-password/', views.change_password, name='change_password'),
    path('api/delete-account/', views.delete_profile, name='delete_account'),
    
    path('candidates/', views.candidate_list, name='candidate_list'),
    path('candidates/new/', views.candidate_create, name='candidate_create'),
    path('candidates/<int:pk>/edit/', views.candidate_update, name='candidate_update'),
    path('candidates/<int:pk>/delete/', views.candidate_delete, name='candidate_delete'),
    
    # Candidate list as JSON
    path('candidate_list_json/', views.candidate_list_json, name='candidate_list_json'),
    
    # Additional pages
    path('elections/', views.elections, name='elections'),
    path('news/', views.news, name='news'),
    path('about/', views.about, name='about'),
    path('how-it-works/', views.how_it_works, name='how_it_works'),
    path('security/', views.security, name='security'),
    path('faq/', views.faq, name='faq'),
    path('user/', views.user_page, name='user_page'),
    path('submit_vote/', views.submit_vote, name='submit_vote'),
    path('api/voting_statistics/', views.get_voting_statistics, name='get_voting_statistics'),

    path('vote_results/', views.vote_results, name='vote_results'),
    path('check_vote_status/', views.check_vote_status, name='check_vote_status'),
    path('settings_page/', views.settings_page, name='settings_page'),
    path('user_data/', views.user_data, name='user_data'),
    path('logout_view/', views.logout_view, name='logout_view'),
    path('get_voting_statistics/', views.get_voting_statistics, name='get_voting_statistics'),


]