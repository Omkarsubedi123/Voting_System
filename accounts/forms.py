from django import forms
from .models import User, Candidate
from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth import get_user_model

User = get_user_model()

class RegistrationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ['id', 'email', 'dob', 'user_type', 'password']
        widgets = {
            'dob': forms.DateInput(attrs={'type': 'date'}),
        }

class LoginForm(forms.Form):
    userId = forms.CharField(label='User ID', max_length=20)
    password = forms.CharField(widget=forms.PasswordInput())
    user_type = forms.ChoiceField(choices=User.USER_TYPE_CHOICES)

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
        fields = ['name', 'age', 'post', 'description']

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