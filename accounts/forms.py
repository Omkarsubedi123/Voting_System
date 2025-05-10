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
    # Changed field name to match the template input name
    id = forms.IntegerField(label='id')
    password = forms.CharField(widget=forms.PasswordInput())
    user_type = forms.ChoiceField(choices=[
        ('user', 'General Voter'),  # Match this with your template option value
        ('admin', 'Admin')
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