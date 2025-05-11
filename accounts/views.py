from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.db.models import Q, Count
from .models import User, People, Vote
from .forms import RegistrationForm, CandidateForm, LoginForm, UserForm
from django.contrib.auth import update_session_auth_hash
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_protect
from django.db import IntegrityError
import json
import logging

# ===== Basic Pages =====

def home(request):
    return render(request, 'accounts/home.html')

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

def news(request): 
    return render(request, 'accounts/news.html')

# ===== User Registration/Login =====

def user_register(request):
    if request.method == 'POST':
        id = request.POST.get('id')
        email = request.POST.get('email')
        dob = request.POST.get('dob')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        user_type = request.POST.get('user_type')

        if not all([id, email, password, confirm_password, user_type]):
            messages.error(request, "All fields are required")
            return render(request, 'accounts/register.html')

        if password != confirm_password:
            messages.error(request, "Passwords do not match")
            return render(request, 'accounts/register.html')

        try:
            if int(id) > 1014:
                messages.error(request, "Registration is limited to IDs up to 1014")
                return render(request, 'accounts/register.html')
        except ValueError:
            messages.error(request, "Invalid user ID format")
            return render(request, 'accounts/register.html')

        if User.objects.filter(id=id).exists():
            messages.error(request, "User ID already exists")
            return render(request, 'accounts/register.html')

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already registered")
            return render(request, 'accounts/register.html')

        try:
            User.objects.create_user(
                id=id,
                email=email,
                dob=dob,
                password=password,
                user_type=user_type
            )
            messages.success(request, "Registration successful! Please login")
            return redirect('accounts:login')
        except Exception as e:
            messages.error(request, f"Registration failed: {str(e)}")
            return render(request, 'accounts/register.html')

    return render(request, 'accounts/register.html')

def user_login(request):
    if request.method == 'POST':
        id = request.POST.get('id')
        password = request.POST.get('password')
        user_type = request.POST.get('user_type')

        if not id:
            messages.error(request, 'Please enter your ID.')
            return render(request, 'accounts/login.html')

        if not id.isdigit():
            messages.error(request, 'Invalid ID format. Please enter a numeric ID.')
            return render(request, 'accounts/login.html')

        try:
            user = User.objects.get(id=id)

            if not user.check_password(password):
                messages.error(request, 'Invalid password.')
                return render(request, 'accounts/login.html')

            if user.user_type != user_type:
                messages.error(request, 'Invalid user type selected.')
                return render(request, 'accounts/login.html')

            login(request, user)
            return redirect('accounts:admin_page' if user_type == 'admin' else 'accounts:user_page')

        except User.DoesNotExist:
            messages.error(request, 'Wrong ID! User does not exist.')

    return render(request, 'accounts/login.html')

@login_required
def logout_view(request):
    logout(request)
    messages.success(request, 'You have been successfully logged out.')
    return redirect('accounts:login')

@login_required
def admin_page(request):
    return render(request, 'accounts/admin.html')

@login_required
def users_list(request):
    users = User.objects.filter(id__lte=1014, id__gte=1001).order_by('-id')
    search_query = request.GET.get('q', '')
    if search_query:
        users = users.filter(Q(id__icontains=search_query) | Q(email__icontains=search_query))
    return render(request, 'accounts/user_list.html', {
        'users': users,
        'total_entries': users.count(),
        'search_query': search_query,
    })

@login_required
def user_detail(request, user_id):
    user = get_object_or_404(User, id=user_id, user_type='user')
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'id': user.id,
            'email': user.email,
            'dob': user.dob.strftime('%Y-%m-%d') if user.dob else None,
        })
    return render(request, 'accounts/user_detail.html', {'user': user})

@login_required
def edit_user(request, user_id):
    user = get_object_or_404(User, id=user_id, user_type='user')
    form = UserForm(request.POST or None, instance=user)
    if request.method == 'POST' and form.is_valid():
        form.save()
        return redirect('accounts:users_list')
    return render(request, 'accounts/edit_user.html', {'form': form, 'user': user})

@login_required
def delete_user(request, user_id):
    user = get_object_or_404(User, id=user_id, user_type='user')
    if request.method == 'POST':
        user.delete()
        return redirect('accounts:users_list')
    form = UserForm(instance=user)
    return render(request, 'accounts/delete_user.html', {'form': form, 'user': user})

@login_required
def voter_edit(request, voter_id):
    user = get_object_or_404(User, id=voter_id, user_type='users')
    form = UserForm(request.POST or None, instance=user)
    if request.method == 'POST' and form.is_valid():
        form.save()
        return redirect('accounts:users_list')
    return render(request, 'accounts/voter_edit.html', {'form': form, 'user': user})

@login_required
def voter_delete(request, voter_id):
    user = get_object_or_404(User, id=voter_id, user_type='users')
    if request.method == 'POST':
        user.delete()
        return redirect('accounts:users_list')
    return render(request, 'accounts/voter_confirm_delete.html', {'user': user})

@login_required
def ajax_voter_details(request, voter_id):
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

@login_required
def settings_view(request):
    return render(request, 'accounts/settings.html')

@login_required
@csrf_protect
def update_profile(request):
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
    try:
        data = json.loads(request.body)
        user = request.user
        if not user.check_password(data.get('current_password', '')):
            return JsonResponse({'status': 'error', 'message': 'Current password is incorrect'}, status=400)
        if data.get('new_password') != data.get('confirm_password'):
            return JsonResponse({'status': 'error', 'message': 'New passwords do not match'}, status=400)
        user.set_password(data['new_password'])
        user.save()
        update_session_auth_hash(request, user)
        return JsonResponse({'status': 'success', 'message': 'Password changed successfully'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@login_required
@csrf_protect
def delete_profile(request):
    try:
        data = json.loads(request.body)
        user = request.user
        if not user.check_password(data.get('password', '')):
            return JsonResponse({'status': 'error', 'message': 'Password is incorrect'}, status=400)
        user.is_active = False
        user.save()
        logout(request)
        return JsonResponse({'status': 'success', 'message': 'Account deactivated successfully'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@login_required
def candidate_list(request):
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('accounts:home')
    candidates = People.objects.using('candidates_db').all()
    return render(request, 'accounts/candidate_list.html', {'candidates': candidates})

@login_required
def candidate_list_json(request):
    try:
        candidates = People.objects.all()
        return JsonResponse([
            {
                'id': c.id,
                'name': c.name,
                'position': c.post,
                'description': c.description,
                'membership': c.membership
            } for c in candidates
        ], safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

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
    candidate = get_object_or_404(People.objects.using('candidates_db'), pk=pk)
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
    candidate = get_object_or_404(People.objects.using('candidates_db'), pk=pk)
    if request.method == 'POST':
        candidate.delete()
        messages.success(request, "Candidate deleted successfully.")
        return redirect('accounts:candidate_list')
    return render(request, 'accounts/candidate_confirm_delete.html', {'people': candidate})

@login_required
def toggle_theme(request):
    current_theme = request.session.get('theme', 'light')
    request.session['theme'] = 'dark' if current_theme == 'light' else 'light'
    return JsonResponse({'theme': request.session['theme']})

from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.db import IntegrityError
import json

@login_required
@require_POST
def submit_vote(request):
    try:
        user = request.user
        data = json.loads(request.body)
        candidates_data = data.get('candidates', {})
        
        if not candidates_data:
            return JsonResponse({'status': 'error', 'message': 'No vote data provided'}, status=400)
        
        # Check if the user has already voted for the same position
        for post, candidate_id in candidates_data.items():  # Use 'post' instead of 'position'
            if Vote.objects.filter(name=user, position=post).exists():  # Use 'post' for filtering
                return JsonResponse({'status': 'error', 'message': f'You have already voted for {post}.'}, status=400)
            
            # Ensure the candidate exists
            candidate = People.objects.get(id=candidate_id)
            
            # Save the vote in the voters table
            Vote.objects.create(name=user, candidate=candidate, position=post)  # Use 'post' here
        
        return JsonResponse({'status': 'success', 'message': 'Vote submitted successfully.'})
    
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON data.'}, status=400)
    except People.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Candidate does not exist.'}, status=400)
    except IntegrityError:
        return JsonResponse({'status': 'error', 'message': 'Duplicate vote.'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
# In views.py
from django.http import JsonResponse
from django.db import connection
from django.views.decorators.http import require_http_methods
import json
import traceback


@require_http_methods(["GET"])  
def vote_results(request):
    try:
        # Debug information
        print("Fetching vote results")
        
        # Using a dictionary to organize data by position
        results = {}
        
        # Using raw SQL with the exact query as provided
        with connection.cursor() as cursor:
            # Get all votes grouped by position and candidate
            cursor.execute("""
                SELECT v.position, c.name_id, COUNT(*) as vote_count
                FROM voters v
                JOIN voters c ON v.candidate_id = c.id
                GROUP BY v.position, c.name_id
                ORDER BY v.position, vote_count DESC
            """)
            
            rows = cursor.fetchall()
            
            # Process the query results
            for row in rows:
                position, candidate_name, vote_count = row
                
                # Initialize the position array if it doesn't exist
                if position not in results:
                    results[position] = []
                
                # Add candidate with vote count
                results[position].append({
                    "name": candidate_name,
                    "votes": vote_count
                })
        
        # Return the results as JSON response
        return JsonResponse(results)
        
    except Exception as e:
        # Log the error and return a proper error response
        print(f"Error fetching vote results: {e}")
        return JsonResponse({"error": str(e)}, status=500)
@login_required
def user_page(request):
    return render(request, 'accounts/user.html')
@login_required
def get_voting_statistics(request):
    """Return the voting statistics grouped by position."""
    try:
        # Get all unique positions
        positions = People.objects.values_list('post', flat=True).distinct()

        results = {}

        for position in positions:
            # Get candidates for this position with vote counts
            candidates_with_votes = People.objects.filter(post=position).annotate(
                vote_count=Count('vote')
            ).values('id', 'name', 'vote_count')

            # Format the results
            position_results = []
            for candidate in candidates_with_votes:
                position_results.append({
                    'id': candidate['id'],
                    'name': candidate['name'],
                    'votes': candidate['vote_count']
                })

            results[position] = position_results

        return JsonResponse(results)

    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error fetching vote results: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': 'Error retrieving vote results'
        }, status=500)
    
@login_required
def check_vote_status(request):
    """Check if the logged-in user has voted."""
    user = request.user
    has_voted = Vote.objects.filter(name=user).exists()  # Use 'name' instead of 'user'
    return JsonResponse({'has_voted': has_voted})
