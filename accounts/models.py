# models.py - Fixed user_type consistency
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    def create_user(self, id, email, dob, user_type, password=None, **extra_fields):
        if not id:
            raise ValueError('The ID must be set')
        email = self.normalize_email(email)
        
        user = self.model(id=id, email=email, dob=dob, user_type=user_type, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, id, email, dob, user_type='admins', password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(id, email, dob, user_type, password, **extra_fields)

class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('admin', 'Admin'),
        ('users', 'General User'),  # Keeping 'users' to match existing data
    ]
    
    username = None  # Disable default username field
    # id field is inherited from Model and serves as primary key
    email = models.EmailField(_('Email Address'), unique=True)
    dob = models.DateField(_('Date of Birth'), blank=True, null=True)
    user_type = models.CharField(_('User Type'), max_length=10, choices=USER_TYPE_CHOICES, default='users')
    
    USERNAME_FIELD = 'id'  # Use the primary key id for login
    REQUIRED_FIELDS = ['email', 'dob', 'user_type']

    objects = CustomUserManager()

    def __str__(self):
        return str(self.id)

    def is_admin(self):
        return self.user_type == 'admin'

    class Meta:
        db_table = 'users'

class Candidate(models.Model):
    name = models.CharField(max_length=100)
    membership = models.PositiveIntegerField()
    post = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name

# forms.py - Fixed with consistent field names and choices
from django import forms
from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth import get_user_model
from .models import Candidate

User = get_user_model()

class RegistrationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)
    confirm_password = forms.CharField(widget=forms.PasswordInput)
    
    class Meta:
        model = User
        fields = ['email', 'dob', 'user_type']
        widgets = {
            'dob': forms.DateInput(attrs={'type': 'date'}),
        }
    
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        confirm_password = cleaned_data.get('confirm_password')
        
        if password and confirm_password and password != confirm_password:
            self.add_error('confirm_password', 'Passwords do not match')
        
        return cleaned_data
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        
        if commit:
            user.save()
        return user

class LoginForm(forms.Form):
    id = forms.IntegerField(label='ID')
    password = forms.CharField(widget=forms.PasswordInput())
    user_type = forms.ChoiceField(choices=[
        ('users', 'General User'),  # Changed to match the database value
        ('admins', 'Admin')
    ])

class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['email', 'dob', 'user_type']
        widgets = {
            'dob': forms.DateInput(attrs={'type': 'date'}),
        }

class CandidateForm(forms.ModelForm):
    class Meta:
        model = Candidate
        fields = ['name', 'membership', 'post', 'description']

class UserProfileForm(UserChangeForm):
    first_name = forms.CharField(max_length=30, required=False)
    last_name = forms.CharField(max_length=30, required=False)
    email = forms.EmailField(required=True)
    phone = forms.CharField(max_length=15, required=False)
    
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'phone')
        widgets = {
            'first_name': forms.TextInput(attrs={'placeholder': 'First Name'}),
            'last_name': forms.TextInput(attrs={'placeholder': 'Last Name'}),
            'phone': forms.TextInput(attrs={'placeholder': 'Phone Number'}),
        }

# views.py - Fixed login view
from django.contrib import messages
from django.shortcuts import render, redirect
from django.contrib.auth import login
from .models import User

def user_login(request):
    """Handle user login"""
    if request.method == 'POST':
        id = request.POST.get('id')
        password = request.POST.get('password')
        user_type = request.POST.get('user_type')
        
        # Validate input - ensuring ID is numeric would be good here
        if not id:
            messages.error(request, 'Please enter your ID.')
            return render(request, 'accounts/login.html')
        
        try:
            # Try to find the user by ID (primary key)
            user = User.objects.get(id=id)
            
            # Check password
            if not user.check_password(password):
                messages.error(request, 'Invalid password.')
                return render(request, 'accounts/login.html')
            
            # Check user type matches what's expected
            if user.user_type != user_type:
                messages.error(request, f'Invalid user type selected. Your account is registered as {user.get_user_type_display()}.')
                return render(request, 'accounts/login.html')
            
            # All validations passed
            login(request, user)
            if user_type == 'admins':
                return redirect('accounts:admin_page')
            else:
                return redirect('accounts:user_page')
        
        except User.DoesNotExist:
            messages.error(request, 'Wrong ID! User does not exist.')
    
    return render(request, 'accounts/login.html')