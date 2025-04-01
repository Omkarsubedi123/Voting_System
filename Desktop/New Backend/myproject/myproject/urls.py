# filepath: c:\Users\Hp\Desktop\New Backend\myproject\myproject\urls.py
"""
URL configuration for myproject project.
"""

"""
URL configuration for myproject project.
"""

from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from accounts import views  # Import your app's views

urlpatterns = [
    path('admin/', admin.site.urls),
    # Removed duplicate logout path
    path('accounts/', include('accounts.urls')), # Keep accounts URLs under 'accounts/' prefix
    path('', views.home, name='home'), # Add back the root path for the home view
]
