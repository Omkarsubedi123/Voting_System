from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from django.http import JsonResponse
from django.db.models import Q
from .models import User, Voter, Candidate
from .forms import RegistrationForm, CandidateForm, VoterForm

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
            # Create the user
            user = User.objects.create_user(
                username=username,
                email=email,
                dob=dob,
                password=password,
                user_type=user_type
            )
            messages.success(request, "Registration successful! Please log in.")
            return redirect('accounts:login')  # Redirect to the login page
        except Exception as e:
            messages.error(request, f"Registration failed: {str(e)}")
            return render(request, 'accounts/register.html')

    return render(request, 'accounts/register.html')

# filepath: c:\Users\Hp\Desktop\New Backend\myproject\accounts\views.py
from django.shortcuts import redirect

def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user_type = request.POST.get('user_type')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            if user.user_type == user_type:  # Check if the user_type matches
                login(request, user)
                if user_type == 'admin':
                    return redirect('accounts:admin_page')  # Redirect to admin page
                else:
                    return redirect('accounts:home')  # Redirect to home page for voters
            else:
                messages.error(request, 'Invalid user type selected.')
        else:
            messages.error(request, 'Invalid username or password.')

    return render(request, 'accounts/login.html')

# filepath: c:\Users\Hp\Desktop\New Backend\myproject\accounts\views.py
# filepath: c:\Users\Hp\Desktop\New Backend\myproject\accounts\views.py
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

@login_required
def admin_page(request):
    return render(request, 'accounts/admin.html')

@login_required
def voters_list(request):
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('accounts:home')
    search_query = request.GET.get('q', '')
    voters = Voter.objects.all()
    if search_query:
        voters = voters.filter(Q(name__icontains=search_query) | Q(email__icontains=search_query))
    paginator = Paginator(voters, 10)
    page_obj = paginator.get_page(request.GET.get('page'))
    return render(request, 'accounts/voters.html', {'page_obj': page_obj, 'search_query': search_query, 'total_entries': voters.count()})

@login_required
def voter_detail(request, voter_id):
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('accounts:home')
    voter = get_object_or_404(Voter, id=voter_id)
    return render(request, 'accounts/voter_detail.html', {'voter': voter})

@login_required
def add_voter(request):
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('accounts:home')
    form = VoterForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        voter = form.save(commit=False)
        if username := form.cleaned_data.get('username'):
            user = User.objects.create(username=username, email=voter.email, dob=form.cleaned_data.get('dob'), user_type='user')
            voter.user = user
        voter.save()
        messages.success(request, 'Voter added successfully!')
        return redirect('accounts:voters_list')
    return render(request, 'accounts/voter_form.html', {'form': form, 'action': 'Add'})

@login_required
def edit_voter(request, voter_id):
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('accounts:home')
    voter = get_object_or_404(Voter, id=voter_id)
    form = VoterForm(request.POST or None, instance=voter)
    if request.method == 'POST' and form.is_valid():
        voter = form.save()
        if voter.user:
            if username := form.cleaned_data.get('username'):
                voter.user.username = username
            if dob := form.cleaned_data.get('dob'):
                voter.user.dob = dob
            voter.user.email = voter.email
            voter.user.save()
        messages.success(request, 'Voter updated successfully!')
        return redirect('accounts:voters_list')
    return render(request, 'accounts/voter_form.html', {'form': form, 'action': 'Edit', 'voter': voter})

@login_required
def delete_voter(request, voter_id):
    if not request.user.is_admin:
        messages.error(request, "Access Denied! Admins Only.")
        return redirect('accounts:home')
    voter = get_object_or_404(Voter, id=voter_id)
    if request.method == 'POST':
        voter.user.delete() if voter.user else None
        voter.delete()
        messages.success(request, 'Voter deleted successfully!')
        return redirect('accounts:voters_list')
    return render(request, 'accounts/confirm_delete.html', {'voter': voter})

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
    candidate = get_object_or_404(Candidate, pk=pk)
    form = CandidateForm(request.POST or None, instance=candidate)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, "Candidate updated successfully.")
        return redirect('accounts:candidate_list')
    return render(request, 'accounts/candidate_form.html', {'form': form})

@login_required
def candidate_delete(request, pk):
    candidate = get_object_or_404(Candidate, pk=pk)
    if request.method == 'POST':
        candidate.delete()
        messages.success(request, "Candidate deleted successfully.")
        return redirect('accounts:candidate_list')
    return render(request, 'accounts/candidate_confirm_delete.html', {'candidate': candidate})

@login_required
def ajax_voter_details(request, voter_id):
    """Return voter details via AJAX"""
    if not request.user.is_admin:
        return JsonResponse({'error': 'Access denied'}, status=403)

    try:
        voter = Voter.objects.get(id=voter_id)
        data = {
            'id': voter.id,
            'name': voter.name,
            'email': voter.email,
            'registered_at': voter.registered_at.strftime('%Y-%m-%d %H:%M:%S'),
        }

        if voter.user:
            data.update({
                'username': voter.user.username,
                'dob': voter.user.dob.strftime('%Y-%m-%d') if voter.user.dob else None,
            })

        return JsonResponse(data)
    except Voter.DoesNotExist:
        return JsonResponse({'error': 'Voter not found'}, status=404)

@login_required
def toggle_theme(request):
    """Toggle between light and dark theme"""
    current_theme = request.session.get('theme', 'light')
    new_theme = 'dark' if current_theme == 'light' else 'light'
    request.session['theme'] = new_theme
    return JsonResponse({'theme': new_theme})

def elections(request): return render(request, 'accounts/elections.html')
def results(request): return render(request, 'accounts/results.html')
def about(request): return render(request, 'accounts/about.html')
def how_it_works(request): return render(request, 'accounts/how_it_works.html')
def security(request): return render(request, 'accounts/security.html')
def faq(request): return render(request, 'accounts/faq.html')
