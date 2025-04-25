from django import forms
from .models import Voter, User, Candidate

class RegistrationForm(forms.ModelForm):
    """Form for user registration"""
    password = forms.CharField(widget=forms.PasswordInput)  # Add password field manually

    class Meta:
        model = User
        fields = ['username', 'email', 'dob', 'user_type', 'password']
        widgets = {
            'dob': forms.DateInput(attrs={'type': 'date'}),
        }

class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email', 'dob', 'user_type']
        widgets = {
            'dob': forms.DateInput(attrs={'type': 'date'}),
        }

class VoterForm(forms.ModelForm):
    username = forms.CharField(max_length=50, required=False)
    dob = forms.DateField(widget=forms.DateInput(attrs={'type': 'date'}), required=False)

    class Meta:
        model = Voter
        fields = ['name', 'email']
    
    def __init__(self, *args, **kwargs):
        super(VoterForm, self).__init__(*args, **kwargs)
        if self.instance and hasattr(self.instance, 'user') and self.instance.user:
            self.fields['username'].initial = self.instance.user.username
            self.fields['dob'].initial = self.instance.user.dob

class CandidateForm(forms.ModelForm):
    class Meta:
        model = Candidate
        fields = ['name', 'age', 'post', 'description']
