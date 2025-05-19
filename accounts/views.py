from collections import defaultdict
from datetime import datetime
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
from django.views.decorators.http import require_POST, require_http_methods
from django.views.decorators.csrf import csrf_protect
from django.db import connection, IntegrityError
from django.contrib.auth.decorators import login_required
import json
import logging
import traceback


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

        if user_type == 'admin' and User.objects.filter(user_type='admin').exists():
            messages.error(request, "An admin already exists. Please delete the existing admin to register a new one.")
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
    return redirect('accounts:home')

# ===== Admin Views =====
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

# @login_required
# def delete_user(request, user_id):
#     user = get_object_or_404(User, id=user_id, user_type='user')
#     if request.method == 'POST':
#         user.delete()
#         return redirect('accounts:users_list')
#     form = UserForm(instance=user)
#     return render(request, 'accounts/delete_user.html', {'form': form, 'user': user})

@login_required
def voter_edit(request, voter_id):
    user = get_object_or_404(User, id=voter_id, user_type='users')
    form = UserForm(request.POST or None, instance=user)
    if request.method == 'POST' and form.is_valid():
        form.save()
        return redirect('accounts:users_list')
    return render(request, 'accounts/voter_edit.html', {'form': form, 'user': user})

@login_required
def voter_delete(request, id):
    if request.method == "POST":
        user = get_object_or_404(User, id=id)
        user.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'success': False}, status=400)

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

# ===== Candidate Management =====
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
        # Get all distinct positions
        positions = People.objects.values_list('post', flat=True).distinct()
        
        result = []
        
        for position in positions:
            # Get candidates for each position
            candidates = People.objects.filter(post=position)
            
            for candidate in candidates:
                result.append({
                    'id': candidate.id,
                    'name': candidate.name,
                    'position': candidate.post,
                    'votes': candidate.vote_set.count(),
                    'description': candidate.description,
                    'membership': candidate.membership
                })
        
        return JsonResponse(result, safe=False)
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

# ===== Voting System =====
@login_required
@require_POST
def submit_vote(request):
    try:
        data = json.loads(request.body)
        candidates = data.get('candidates')
        if not candidates or not isinstance(candidates, dict):
            return JsonResponse({'status': 'error', 'message': 'Missing required fields'}, status=400)

        user = request.user
        already_voted = Vote.objects.filter(name=user).exists()
        if already_voted:
            return JsonResponse({'status': 'error', 'message': 'You have already voted.'}, status=400)

        for position, candidate_id in candidates.items():
            if not candidate_id or not position:
                return JsonResponse({'status': 'error', 'message': 'Missing required fields'}, status=400)
            Vote.objects.create(name=user, candidate_id=candidate_id, position=position)

        return JsonResponse({'status': 'success', 'message': 'Vote submitted successfully.'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@require_http_methods(["GET"])
def vote_results(request):
    try:
    #     with connection.cursor() as cursor:
    #         # Get comparative results for each position
    #         cursor.execute("""
    #             WITH 
    #             candidate_votes AS (
    #                 SELECT 
    #                     v.position,
    #                     c.name_id as name,
    #                     COUNT(*) as votes,
    #                     ROW_NUMBER() OVER (PARTITION BY v.position ORDER BY COUNT(*) DESC) as rank
    #                 FROM voters v
    #                 JOIN voters c ON v.candidate_id = c.id
    #                 GROUP BY v.position, c.name_id
    #             ),
    #             position_totals AS (
    #                 SELECT 
    #                     position,
    #                     SUM(votes) as total_votes
    #                 FROM candidate_votes
    #                 GROUP BY position
    #             )
    #             SELECT 
    #                 cv.position,
    #                 cv.name,
    #                 cv.votes,
    #                 pt.total_votes,
    #                 ROUND((cv.votes * 100.0 / pt.total_votes), 2) as percentage,
    #                 cv.rank
    #             FROM candidate_votes cv
    #             JOIN position_totals pt ON cv.position = pt.position
    #             WHERE cv.rank <= 2
    #             ORDER BY cv.position, cv.rank
    #         """)

    #         rows = cursor.fetchall()

    #         # Reformat results to show comparative data
    #         results = {}
    #         for row in rows:
    #             position, name, votes, total_votes, percentage, rank = row
                
    #             if position not in results:
    #                 results[position] = {
    #                     "total_votes": total_votes,
    #                     "candidates": []
    #                 }
                
    #             results[position]["candidates"].append({
    #                 "name": name,
    #                 "votes": votes,
    #                 "percentage": percentage,
    #                 "rank": rank
    #             })
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM voters;")
            voters = cursor.fetchall()

            cursor.execute("SELECT * FROM candidates.people;")
            people = cursor.fetchall()

            vote_count = defaultdict(int)
            for vote in voters:
                candidate_id = vote[2]
                vote_count[candidate_id] += 1

            position_map = defaultdict(dict)
            for candidate in people:
                candidate_id, name, _, position, _ = candidate
                count = vote_count.get(candidate_id, 0)
                position_map[position][name] = count

            return JsonResponse(position_map)
        # return JsonResponse(results)
        
    except Exception as e:
        print(f"Error fetching vote results: {e}")
        return JsonResponse({"error": str(e)}, status=500)
@login_required
def get_voting_statistics(request):
    """
    Get voting statistics for frontend display.
    Returns JSON with position-based candidate vote counts.
    """
    try:
        # Check if this is an AJAX request
        if request.headers.get('X-Requested-With') != 'XMLHttpRequest':
            return JsonResponse({
                'error': 'Non-AJAX requests are not allowed for this endpoint'
            }, status=400)

        # First, check if the People model exists and has data
        try:
            positions = People.objects.values_list('post', flat=True).distinct()
        except Exception as db_error:
            logging.error(f"Database error querying positions: {str(db_error)}")
            return JsonResponse({
                'error': 'Could not retrieve candidate positions from database',
                'debug_info': str(db_error)
            }, status=500)
            
        if not positions:
            return JsonResponse({
                'message': 'No candidate positions found in database'
            }, status=200)  # Return empty but valid JSON

        results = {}
        
        # Process each position
        for position in positions:
            try:
                # Get candidates for this position with vote counts
                candidates = People.objects.filter(post=position).annotate(
                    vote_count=Count('vote')
                ).order_by('-vote_count')[:2]  # Only fetch top 2
                
                # Handle case where there are no candidates for a position
                if not candidates:
                    results[position] = {
                        'candidates': [],
                        'vote_difference': 0
                    }
                    continue
                
                # Add candidates to results
                results[position] = {
                    'candidates': [
                        {
                            'id': c.id,
                            'name': c.name,
                            'votes': c.vote_count,
                        } for c in candidates
                    ],
                    # Calculate vote difference if there are at least 2 candidates
                    'vote_difference': (
                        candidates[0].vote_count - candidates[1].vote_count
                        if len(candidates) >= 2 else 0
                    )
                }
            except Exception as position_error:
                logging.error(f"Error processing position {position}: {str(position_error)}")
                # Skip this position rather than failing the entire request
                continue
                
        print(results)
        return JsonResponse(results)
    
    except Exception as e:
        # Log the full exception for debugging
        logging.error(f"Error in get_voting_statistics: {str(e)}")
        logging.error(traceback.format_exc())
        
        return JsonResponse({
            'error': 'Error retrieving voting statistics',
            'message': str(e)
        }, status=500)

@login_required
def check_vote_status(request):
    user = request.user
    has_voted = Vote.objects.filter(name=user).exists()
    return JsonResponse({'has_voted': has_voted})

# ===== User Settings =====
@login_required
def settings_view(request):
    return render(request, 'accounts/settings.html', {'user': request.user})

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
def settings_page(request):
    user = request.user
    if request.method == 'POST':
        if request.content_type == 'application/json':
            try:
                data = json.loads(request.body)
                email = data.get('email', user.email)
                dob = data.get('dob', None)
            except Exception:
                return JsonResponse({'status': 'error', 'message': 'Invalid JSON.'}, status=400)
        else:
            email = request.POST.get('email', user.email)
            dob = request.POST.get('dob', None)
        
        user.email = email
        user.dob = dob
        if hasattr(user, 'profile') and dob:
            user.profile.dob = dob
            user.profile.save()
        try:
            user.save()
            return JsonResponse({'status': 'success', 'message': 'Settings updated successfully.'})
        except Exception:
            return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred while updating settings.'}, status=400)

@login_required
def user_data(request):
    user = request.user
    user_data = {
        "id": user.id,
        "email": user.email,
        "dob": user.profile.dob if hasattr(user, 'profile') else user.dob,
    }
    return JsonResponse(user_data)

@login_required
def toggle_theme(request):
    current_theme = request.session.get('theme', 'light')
    request.session['theme'] = 'dark' if current_theme == 'light' else 'light'
    return JsonResponse({'theme': request.session['theme']})

from django.contrib.auth.decorators import login_required

@login_required(login_url='accounts:login')  # Specify the login URL
def user_page(request):
    return render(request, 'accounts/user.html')