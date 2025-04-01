# accounts/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .forms import RegistrationForm
from .models import User, Voter
import json

def home(request):
    """Render the home page"""
    return render(request, 'accounts/home.html')

def user_register(request):
    """Handle user registration"""
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Registration successful!')
            return redirect('home')
    else:
        form = RegistrationForm()
    
    return render(request, 'accounts/register.html', {'form': form})

def user_login(request):
    """Handle user login"""
    if request.user.is_authenticated:
        return redirect('home')
    
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f'Welcome back, {user.username}!')
            return redirect('admin_page' if user.is_admin else 'voter_dashboard')
    else:
        form = AuthenticationForm()
    
    return render(request, 'accounts/login.html', {'form': form})

@login_required
def user_logout(request):
    """Handle user logout"""
    logout(request)
    messages.success(request, 'You have been logged out.')
    return redirect('home')

@login_required
def admin_page(request):
    """Admin dashboard view"""
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('home')
    
    return render(request, 'accounts/admin.html')

@login_required
def voter_dashboard(request):
    """Voter dashboard view"""
    if request.user.is_admin:
        return redirect('admin_page')
    
    return render(request, 'accounts/voter_dashboard.html')

@login_required
def voters_list(request):
    """List and manage voters (admin only)"""
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('home')
    
    search_query = request.GET.get('q', '')
    voters = Voter.objects.select_related('user').all()
    
    if search_query:
        voters = voters.filter(
            user__username__icontains=search_query) | voters.filter(
            user__email__icontains=search_query)
    
    paginator = Paginator(voters, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    return render(request, 'accounts/voters.html', {
        'page_obj': page_obj,
        'search_query': search_query
    })

@login_required
def voter_detail(request, voter_id):
    """View voter details"""
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('home')
    
    voter = get_object_or_404(Voter, id=voter_id)
    return render(request, 'accounts/voter_detail.html', {'voter': voter})

@login_required
def add_voter(request):
    """Add new voter"""
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('home')
    
    if request.method == 'POST':
        form = VoterForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Voter added successfully!')
            return redirect('voters_list')
    else:
        form = VoterForm()
    
    return render(request, 'accounts/voter_form.html', {'form': form, 'action': 'Add'})

@login_required
def edit_voter(request, voter_id):
    """Edit existing voter"""
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('home')
    
    voter = get_object_or_404(Voter, id=voter_id)
    
    if request.method == 'POST':
        form = VoterForm(request.POST, instance=voter)
        if form.is_valid():
            form.save()
            messages.success(request, 'Voter updated successfully!')
            return redirect('voters_list')
    else:
        form = VoterForm(instance=voter)
    
    return render(request, 'accounts/voter_form.html', {
        'form': form,
        'action': 'Edit',
        'voter': voter
    })

@login_required
def delete_voter(request, voter_id):
    """Delete voter"""
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('home')
    
    voter = get_object_or_404(Voter, id=voter_id)
    if request.method == 'POST':
        voter.delete()
        messages.success(request, 'Voter deleted successfully!')
        return redirect('voters_list')
    
    return render(request, 'accounts/voter_confirm_delete.html', {'voter': voter})

# AJAX Views
@login_required
@require_http_methods(["GET"])
def ajax_voter_details(request, voter_id):
    """AJAX endpoint for voter details"""
    if not request.user.is_admin:
        return JsonResponse({'error': 'Unauthorized'}, status=403)
    
    voter = get_object_or_404(Voter, id=voter_id)
    data = {
        'username': voter.user.username,
        'email': voter.user.email,
        'date_of_birth': voter.date_of_birth.strftime('%Y-%m-%d'),
        'status': voter.status,
        'registration_date': voter.registration_date.strftime('%Y-%m-%d %H:%M:%S')
    }
    return JsonResponse(data)

@login_required
def toggle_theme(request):
    """Toggle dark/light theme"""
    if request.method == 'POST':
        try:
            request.session['dark_mode'] = not request.session.get('dark_mode', False)
            return JsonResponse({
                'success': True, 
                'dark_mode': request.session['dark_mode']
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})
