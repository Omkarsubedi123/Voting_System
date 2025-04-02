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
from django.contrib.auth import authenticate, login
from .models import Candidate
from .forms import CandidateForm


def home(request):
    """Render the home page"""
    return render(request, 'accounts/home.html')

def user_register(request):
    """Handle user registration"""
    if request.user.is_authenticated:
        return redirect('accounts:home')
    
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Registration successful!')
            return redirect('accounts:home')
    else:
        form = RegistrationForm()
    
    return render(request, 'accounts/register.html', {'form': form})

def user_login(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            if user.is_admin():
                return redirect('accounts:admin_page') # Redirect admin to admin page
            else:
                return redirect('accounts:voter_dashboard') # Redirect voter to voter dashboard
        else:
            messages.error(request, "Invalid username or password")
    return render(request, 'accounts/login.html')

@login_required
def user_logout(request):
    """Handle user logout"""
    logout(request)
    messages.success(request, 'You have been logged out.')
    return redirect('accounts:home')

@login_required
def admin_page(request):
    """Admin dashboard view"""
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('accounts:home')
    
    return render(request, 'accounts/admin.html')

@login_required
def voter_dashboard(request):
    """Voter dashboard view"""
    if request.user.is_admin:
        return redirect('accounts:admin_page')
    
    return render(request, 'accounts/voter_dashboard.html')

@login_required
def voters_list(request):
    """List and manage voters (admin only)"""
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('accounts:home')
    
    search_query = request.GET.get('q', '')
    voters = Voter.objects.select_related('users').all()
    
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
        return redirect('accounts:home')
    
    voter = get_object_or_404(Voter, id=voter_id)
    return render(request, 'accounts/voter_detail.html', {'voter': voter})

@login_required
def add_voter(request):
    """Add new voter"""
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('accounts:home')
    
    if request.method == 'POST':
        form = VoterForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Voter added successfully!')
            return redirect('accounts:voters_list')
    else:
        form = Voters()
    
    return render(request, 'accounts/voter_form.html', {'form': form, 'action': 'Add'})

@login_required
def edit_voter(request, voter_id):
    """Edit existing voter"""
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('accounts:home')
    
    voter = get_object_or_404(Voter, id=voter_id)
    
    if request.method == 'POST':
        form = VoterForm(request.POST, instance=voter)
        if form.is_valid():
            form.save()
            messages.success(request, 'Voter updated successfully!')
            return redirect('accounts:voters_list')
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
        return redirect('accounts:home')
    
    voter = get_object_or_404(Voter, id=voter_id)
    if request.method == 'POST':
        voter.delete()
        messages.success(request, 'Voter deleted successfully!')
        return redirect('accounts:voters_list')
    
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

@login_required
def candidate_list(request):
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('accounts:home')
    candidates = Candidate.objects.all()
    return render(request, 'accounts/candidate_list.html', {'candidates': candidates})

@login_required
def candidate_create(request):
    if not request.user.is_authenticated or not request.user.is_admin:
        messages.error(request, "Access Denied! Login as admin required.")
        return redirect('accounts:home')
        
    if request.method == 'POST':
        form = CandidateForm(request.POST)
        if form.is_valid():
            candidate = form.save()
            messages.success(request, f"Candidate '{candidate}' was created successfully.")
            return redirect('accounts:candidate_list')
    else:
        form = CandidateForm()
    return render(request, 'accounts/candidate_form.html', {'form': form})

def candidate_update(request, pk):
    if not request.user.is_authenticated or not request.user.is_admin:
        messages.error(request, "Access Denied! Login as admin required.")
        return redirect('accounts:home')
        
    candidate = get_object_or_404(Candidate, pk=pk)
    if request.method == 'POST':
        form = CandidateForm(request.POST, instance=candidate)
        if form.is_valid():
            form.save()
            messages.success(request, f"Candidate '{candidate}' was updated successfully.")
            return redirect('accounts:candidate_list')
    else:
        form = CandidateForm(instance=candidate)
    return render(request, 'accounts/candidate_form.html', {'form': form})

def candidate_delete(request, pk):
    candidate = get_object_or_404(Candidate, pk=pk)
    if request.method == 'POST':
        candidate.delete()
        return redirect('accounts:candidate_list')
    return render(request, 'accounts/candidate_confirm_delete.html', {'candidate': candidate})


# Simple page views
def elections(request):
    """Elections page"""
    return render(request, 'accounts/elections.html')

def results(request):
    """Results page""" 
    return render(request, 'accounts/results.html')

def about(request):
    """About page"""
    return render(request, 'accounts/about.html')

def how_it_works(request):
    """How it works page"""
    return render(request, 'accounts/how_it_works.html')

def security(request):
    """Security page"""
    return render(request, 'accounts/security.html')

def faq(request):
    """FAQ page"""
    return render(request, 'accounts/faq.html')
