from django import forms
from .models import User, Candidate
from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth import get_user_model

User = get_user_model()

class RegistrationForm(forms.ModelForm):
    """Form for user registration"""
    password = forms.CharField(widget=forms.PasswordInput)  # Add password field manually

    class Meta:
        model = User
        fields = ['user_id', 'email', 'dob', 'user_type', 'password']
        widgets = {
            'dob': forms.DateInput(attrs={'type': 'date'}),
        }

class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['user_id', 'email', 'dob', 'user_type']
        widgets = {
            'dob': forms.DateInput(attrs={'type': 'date'}),
        }

# Voter form completely removed as you mentioned you only need the users table

class CandidateForm(forms.ModelForm):
    class Meta:
        model = Candidate
        fields = ['name', 'age', 'post', 'description']


class UserProfileForm(UserChangeForm):
    """Form for updating user profile information"""

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
            'email': forms.EmailInput(attrs={'placeholder': 'Email'}),
            'phone': forms.TextInput(attrs={'placeholder': 'Phone Number'}),
        }
