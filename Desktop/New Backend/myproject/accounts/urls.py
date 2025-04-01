from django.urls import path
from django.contrib.auth import views as auth_views 
from . import views
from django.urls import include, path

urlpatterns = [
    path('', views.home, name='home'),
    path('register/', views.user_register, name='register'),
    path('login/', views.user_login, name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('admin-page/', views.admin_page, name='admin_page'),
    path('voter-dashboard/', views.voter_dashboard, name='voter_dashboard'),
    path('voters/', views.voters_list, name='voters_list'), # Add URL for voters list
]
