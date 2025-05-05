from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.db.models import Q
from .models import User, Candidate
from .forms import RegistrationForm, CandidateForm, UserForm, UserProfileForm
from django.contrib.auth import update_session_auth_hash
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.forms import PasswordChangeForm
import json
import random
import string

def generate_user_id(length=10):
    """Generate a random string of letters and digits"""
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

# ===== Basic Pages =====

def home(request):
    """Render the home page"""
    return render(request, 'accounts/home.html')

def about(request): 
    """Render the about page"""
    return render(request, 'accounts/about.html')

def how_it_works(request): 
    """Render how it works page"""
    return render(request, 'accounts/how_it_works.html')

def security(request): 
    """Render the security page"""
    return render(request, 'accounts/security.html')

def faq(request): 
    """Render the FAQ page"""
    return render(request, 'accounts/faq.html')

def elections(request): 
    """Render the elections page"""
    return render(request, 'accounts/elections.html')

def results(request): 
    """Render the results page"""
    return render(request, 'accounts/results.html')

# ===== User Registration/Login =====

def user_register(request):
    """Handle user registration"""
    if request.method == 'POST':
        userId = request.POST.get('userId')
        email = request.POST.get('email')
        dob = request.POST.get('dob')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        user_type = request.POST.get('user_type')

        if password != confirm_password:
            messages.error(request, "Passwords do not match.")
            return render(request, 'accounts/register.html')

        if User.objects.filter(user_id=userId).exists():
            messages.error(request, "User with this User ID already exists.")
            return render(request, 'accounts/register.html')

        if User.objects.filter(email=email).exists():
            messages.error(request, "User with this email already exists.")
            return render(request, 'accounts/register.html')

        # Create a new user using the custom manager
        # User.objects.create_user(
        #     user_id=userId,
        #     email=email,
        #     dob=dob,
        #     password=password,
        #     user_type=user_type
        # )

        # messages.success(request, "Registration successful!")
        # return redirect('accounts:login')

    return render(request, 'accounts/register.html')

def user_login(request):
    if request.method == 'POST':
        userId = request.POST.get('userId')
        password = request.POST.get('password')
        user_type = request.POST.get('user_type')

        # Validate ID is numeric
        if not userId.isdigit():
            messages.error(request, 'User ID must be a number.')
            return render(request, 'accounts/login.html')

        try:
            user = User.objects.get(user_id=userId)
            if user.check_password(password):
                if user.user_type == user_type:
                    login(request, user)
                    if user_type == 'admin':
                        return redirect('accounts:admin_page')
                    else:
                        return redirect('accounts:user_page')
                else:
                    messages.error(request, 'Invalid user type selected.')
            else:
                messages.error(request, 'Invalid password.')
        except User.DoesNotExist:
            messages.error(request, 'Wrong ID! User does not exist.')

    return render(request, 'accounts/login.html')


@login_required
def logout_view(request):
    """Log out the user and redirect to login"""
    logout(request)
    messages.success(request, 'You have been successfully logged out.')
    return redirect('accounts:login')

# ===== Admin Dashboard =====

@login_required
def admin_page(request):
    """Admin dashboard page"""
    return render(request, 'accounts/admin.html')

# ===== User Management =====

@login_required
def users_list(request):
    """List of users with pagination and search"""
    users = User.objects.filter(user_type='user').order_by('-id')
    search_query = request.GET.get('q', '')
    if search_query:
        users = users.filter(Q(id__icontains=search_query) | Q(email__icontains=search_query))
    paginator = Paginator(users, 10)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)
    return render(request, 'accounts/user_list.html', {
        'page_obj': page_obj,
        'total_entries': users.count(),
        'search_query': search_query
    })

@login_required
def user_detail(request, user_id):
    """User detail view, supports AJAX"""
    user = get_object_or_404(User, id=user_id, user_type='user')
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'id': user.id,
            'email': user.email,
            'dob': user.dob.strftime('%Y-%m-%d') if user.dob else None,
        })
    return render(request, 'accounts/user_detail.html', {'user': user})

def add_user(request):
    """Add a new user (AJAX supported)"""
    if request.method == 'POST':
        form = UserForm(request.POST)
        if form.is_valid():
            user = form.save()
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'id': user.id,
                    'user_id': user.user_id,
                    'email': user.email,
                    'dob': user.dob.strftime('%Y-%m-%d') if user.dob else None,
                    'success': True
                })
            return redirect(reverse('accounts:users_list') + '?added=true')

@login_required
def edit_user(request, user_id):
    """Edit a user"""
    user = get_object_or_404(User, id=user_id, user_type='user')
    form = UserForm(request.POST or None, instance=user)
    if request.method == 'POST' and form.is_valid():
        form.save()
        return redirect('accounts:users_list')
    return render(request, 'accounts/edit_user.html', {'form': form, 'user': user})

@login_required
def delete_user(request, user_id):
    """Delete a user"""
    user = get_object_or_404(User, id=user_id, user_type='user')
    if request.method == 'POST':
        user.delete()
        return redirect('accounts:users_list')
    return render(request, 'accounts/delete_user.html', {'user': user})

@login_required
def voter_edit(request, voter_id):
    """Edit voter details"""
    user = get_object_or_404(User, id=voter_id, user_type='user')
    form = UserForm(request.POST or None, instance=user)
    if request.method == 'POST' and form.is_valid():
        form.save()
        return redirect('accounts:users_list')
    return render(request, 'accounts/voter_edit.html', {'form': form, 'user': user})

@login_required
def voter_delete(request, voter_id):
    """Delete voter after confirmation"""
    user = get_object_or_404(User, id=voter_id, user_type='user')
    if request.method == 'POST':
        user.delete()
        return redirect('accounts:users_list')
    return render(request, 'accounts/voter_confirm_delete.html', {'user': user})

@login_required
def ajax_voter_details(request, voter_id):
    """Return voter details via AJAX for modals"""
    if not request.user.is_admin:
        return JsonResponse({'error': 'Access denied'}, status=403)
    try:
        user = User.objects.get(id=voter_id, user_type='user')
        return JsonResponse({
            'id': user.id,
            'email': user.email,
            'dob': user.dob.strftime('%Y-%m-%d') if user.dob else None,
        })
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

# ===== User Settings =====

@login_required
def settings_view(request):
    """Render user settings page"""
    return render(request, 'accounts/settings.html')

@login_required
@csrf_protect
@require_POST
def update_profile(request):
    """API endpoint to update user profile"""
    try:
        data = json.loads(request.body)
        user = request.user
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        if hasattr(user, 'phone'):
            user.phone = data.get('phone', user.phone)
        user.save()
        return JsonResponse({'status': 'success', 'message': 'Profile updated successfully'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@login_required
@csrf_protect
@require_POST
def change_password(request):
    """API endpoint to change password"""
    try:
        data = json.loads(request.body)
        user = request.user
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        confirm_password = data.get('confirm_password', '')

        if not user.check_password(current_password):
            return JsonResponse({'status': 'error', 'message': 'Current password is incorrect'}, status=400)
        if new_password != confirm_password:
            return JsonResponse({'status': 'error', 'message': 'New passwords do not match'}, status=400)

        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user)

        return JsonResponse({'status': 'success', 'message': 'Password changed successfully'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@login_required
@csrf_protect
@require_POST
def delete_profile(request):
    """API endpoint to deactivate user profile"""
    try:
        data = json.loads(request.body)
        user = request.user
        password = data.get('password', '')

        if not user.check_password(password):
            return JsonResponse({'status': 'error', 'message': 'Password is incorrect'}, status=400)

        user.is_active = False
        user.save()
        logout(request)

        return JsonResponse({'status': 'success', 'message': 'Account deactivated successfully'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

# ===== Candidate Management (Admin only) =====

@login_required
def candidate_list(request):
    """List all candidates"""
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('accounts:home')
    return render(request, 'accounts/candidate_list.html', {'candidates': Candidate.objects.all()})

@login_required
def candidate_create(request):
    """Create a new candidate"""
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('accounts:home')
    form = CandidateForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, "Candidate created successfully.")
        return redirect('accounts:candidate_list')
    return render(request, 'accounts/candidate_form.html', {'form': form})

@login_required
def candidate_update(request, pk):
    """Update candidate"""
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('accounts:home')
    candidate = get_object_or_404(Candidate, pk=pk)
    form = CandidateForm(request.POST or None, instance=candidate)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, "Candidate updated successfully.")
        return redirect('accounts:candidate_list')
    return render(request, 'accounts/candidate_form.html', {'form': form})

@login_required
def candidate_delete(request, pk):
    """Delete a candidate"""
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('accounts:home')
    candidate = get_object_or_404(Candidate, pk=pk)
    if request.method == 'POST':
        candidate.delete()
        messages.success(request, "Candidate deleted successfully.")
        return redirect('accounts:candidate_list')
    return render(request, 'accounts/candidate_confirm_delete.html', {'candidate': candidate})

# ===== Theme Toggle =====

@login_required
def toggle_theme(request):
    """Toggle between light and dark themes"""
    current_theme = request.session.get('theme', 'light')
    new_theme = 'dark' if current_theme == 'light' else 'light'
    request.session['theme'] = new_theme
    return JsonResponse({'theme': new_theme})

def user_page(request):
    """Render the user page"""
    return render(request, 'accounts/user.html')
