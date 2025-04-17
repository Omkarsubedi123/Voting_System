from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login,authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.db.models import Q
from .models import User, Candidate
from .forms import RegistrationForm, CandidateForm, UserForm, UserProfileForm
from django.contrib.auth import update_session_auth_hash
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_protect


# views.py for the accounts app

from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json
from django.contrib.auth.forms import PasswordChangeForm


def home(request):
    return render(request, 'accounts/home.html')

def user_register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        dob = request.POST.get('dob')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        user_type = request.POST.get('user_type')

        if password != confirm_password:
            messages.error(request, "Passwords do not match.")
            return render(request, 'accounts/register.html')

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                dob=dob,
                password=password,
                user_type=user_type
            )
            messages.success(request, "Registration successful! Please log in.")
            return redirect('accounts:login')
        except Exception as e:
            messages.error(request, f"Registration failed: {str(e)}")
            return render(request, 'accounts/register.html')

    return render(request, 'accounts/register.html')

def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user_type = request.POST.get('user_type')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            if user.user_type == user_type:
                login(request, user)
                if user_type == 'admin':
                    return redirect('accounts:admin_page')
                else:
                    return redirect('accounts:home')
            else:
                messages.error(request, 'Invalid user type selected.')
        else:
            messages.error(request, 'Invalid username or password.')

    return render(request, 'accounts/login.html')

# ===== About and Information Pages =====

def about(request): 
    return render(request, 'accounts/about.html')

def how_it_works(request): 
    return render(request, 'accounts/how_it_works.html')

def security(request): 
    return render(request, 'accounts/security.html')

def faq(request): 
    return render(request, 'accounts/faq.html')

def elections(request): 
    return render(request, 'accounts/elections.html')

def results(request): 
    return render(request, 'accounts/results.html')

# ===== Admin Pages =====

@login_required
def admin_page(request):
    return render(request, 'accounts/admin.html')

# ===== User Management =====

@login_required
def users_list(request):
    # Fetch all users with user_type='user', ordered by newest first
    users = User.objects.filter(user_type='user').order_by('-id')
    
    # Apply search filter if provided
    search_query = request.GET.get('q', '')
    if search_query:
        users = users.filter(
            Q(username__icontains=search_query) | Q(email__icontains=search_query)
        )
    
    # Set up pagination
    paginator = Paginator(users, 10)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)
    
    context = {
        'page_obj': page_obj,
        'total_entries': users.count(),
        'search_query': search_query,
    }
    
    return render(request, 'accounts/user_list.html', context)

@login_required
def user_detail(request, user_id):
    user = get_object_or_404(User, id=user_id, user_type='user')
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'dob': user.dob.strftime('%Y-%m-%d') if user.dob else None,
        }
        return JsonResponse(data)
    
    return render(request, 'accounts/user_detail.html', {'user': user})

def add_user(request):
    if request.method == 'POST':
        form = UserForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, "User added successfully!")
            
            # If AJAX request, return JSON
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                data = {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'dob': user.dob.strftime('%Y-%m-%d') if user.dob else None,
                    'success': True
                }
                return JsonResponse(data)
                
            return redirect(reverse('accounts:users_list') + '?added=true')

@login_required
def edit_user(request, user_id):
    user = get_object_or_404(User, id=user_id, user_type='user')
    
    if request.method == 'POST':
        form = UserForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            return redirect('accounts:users_list')
    else:
        form = UserForm(instance=user)
    
    return render(request, 'accounts/edit_user.html', {'form': form, 'user': user})

@login_required
def delete_user(request, user_id):
    user = get_object_or_404(User, id=user_id, user_type='user')
    
    if request.method == 'POST':
        user.delete()
        return redirect('accounts:users_list')
    
    return render(request, 'accounts/delete_user.html', {'user': user})

@login_required
def voter_edit(request, voter_id):
    user = get_object_or_404(User, id=voter_id, user_type='user')

    if request.method == 'POST':
        form = UserForm(request.POST, instance=user)
        if form.is_valid():
            form.save()
            return redirect('accounts:users_list')
    else:
        form = UserForm(instance=user)

    return render(request, 'accounts/voter_edit.html', {'form': form, 'user': user})


@login_required
def voter_delete(request, voter_id):
    user = get_object_or_404(User, id=voter_id, user_type='user')

    if request.method == 'POST':
        user.delete()
        return redirect('accounts:users_list')

    return render(request, 'accounts/voter_confirm_delete.html', {'user': user})

@login_required
def settings_view(request):
    """
    Display the user settings page
    """
    user = request.user
    context = {
        'user': user,
    }
    return render(request, 'accounts/settings.html', context)

@login_required
def settings_view(request):
    """
    Display user settings page
    """
    return render(request, 'accounts/settings.html')


@login_required
@csrf_protect
@require_POST
def update_profile(request):
    """
    API endpoint to update user profile
    """
    try:
        data = json.loads(request.body)
        user = request.user
        
        # Update user data
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        
        # Handle phone if your User model has this field
        if hasattr(user, 'phone'):
            user.phone = data.get('phone', user.phone)
        
        user.save()
        
        return JsonResponse({
            'status': 'success',
            'message': 'Profile updated successfully'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)


@login_required
@csrf_protect
@require_POST
def change_password(request):
    """
    API endpoint to change user password
    """
    try:
        data = json.loads(request.body)
        user = request.user
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        confirm_password = data.get('confirm_password', '')
        
        # Check if current password is correct
        if not user.check_password(current_password):
            return JsonResponse({
                'status': 'error',
                'message': 'Current password is incorrect'
            }, status=400)
        
        # Check if new passwords match
        if new_password != confirm_password:
            return JsonResponse({
                'status': 'error',
                'message': 'New passwords do not match'
            }, status=400)
        
        # Update password
        user.set_password(new_password)
        user.save()
        
        # Update session to prevent logout
        update_session_auth_hash(request, user)
        
        return JsonResponse({
            'status': 'success',
            'message': 'Password changed successfully'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)


@login_required
@csrf_protect
@require_POST
def delete_profile(request):
    """
    API endpoint to delete/deactivate user profile
    """
    try:
        data = json.loads(request.body)
        user = request.user
        password = data.get('password', '')
        
        # Validate password
        if not user.check_password(password):
            return JsonResponse({
                'status': 'error', 
                'message': 'Password is incorrect'
            }, status=400)
        
        # Deactivate user instead of deleting
        user.is_active = False
        user.save()
        logout(request)
        
        return JsonResponse({
            'status': 'success',
            'message': 'Account deactivated successfully'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=400)


@login_required
def logout_view(request):
    """
    Logout the user and redirect to login page
    """
    logout(request)
    messages.success(request, 'You have been successfully logged out.')
    return redirect('accounts:user_login')
  

# ===== Candidate Management =====

@login_required
def candidate_list(request):
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('accounts:home')
    return render(request, 'accounts/candidate_list.html', {'candidates': Candidate.objects.all()})

@login_required
def candidate_create(request):
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
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('accounts:home')
    candidate = get_object_or_404(Candidate, pk=pk)
    if request.method == 'POST':
        candidate.delete()
        messages.success(request, "Candidate deleted successfully.")
        return redirect('accounts:candidate_list')
    return render(request, 'accounts/candidate_confirm_delete.html', {'candidate': candidate})

# ===== Utility Functions =====

@login_required
def toggle_theme(request):
    current_theme = request.session.get('theme', 'light')
    new_theme = 'dark' if current_theme == 'light' else 'light'
    request.session['theme'] = new_theme
    return JsonResponse({'theme': new_theme})
@login_required
def ajax_voter_details(request, voter_id):
    """Return voter details via AJAX"""
    if not request.user.is_admin:
        return JsonResponse({'error': 'Access denied'}, status=403)

    try:
        # Since we're using User model instead of Voter model in the cleaned code
        user = User.objects.get(id=voter_id, user_type='user')
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'dob': user.dob.strftime('%Y-%m-%d') if user.dob else None,
        }
        return JsonResponse(data)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
