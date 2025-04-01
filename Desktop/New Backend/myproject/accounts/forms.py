from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import date

class RegistrationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    dob = forms.DateField(
        widget=forms.DateInput(attrs={'type': 'date'}),
        validators=[
            MinValueValidator(date(1900, 1, 1)),
            MaxValueValidator(date.today())
        ]
    )
    user_type = forms.ChoiceField(
        choices=User.USER_TYPE_CHOICES,
        widget=forms.Select(attrs={'class': 'form-control'})
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'dob', 'user_type', 'password1', 'password2']

    def clean_dob(self):
        dob = self.cleaned_data.get('dob')
        if dob and dob > date.today():
            raise forms.ValidationError("Date of birth cannot be in the future")
        return dob

class LoginForm(forms.Form):
    username = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Enter your username'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'placeholder': 'Enter your password'}))
