# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import User

class CustomUserManager(BaseUserManager):
    def create_user(self, id, email, dob, user_type, password=None, **extra_fields):
        if not id:
            raise ValueError('The ID must be set')
        email = self.normalize_email(email)
        
        user = self.model(id=id, email=email, dob=dob, user_type=user_type, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, id, email, dob, user_type='admin', password=None, **extra_fields):
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

class People(models.Model):
    name = models.CharField(max_length=100)
    membership = models.CharField(max_length=255)
    post = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'people'  # Explicitly set the table name
        managed = True  # Change to True to allow Django to manage the table
        
class Vote(models.Model):
    name = models.ForeignKey(User, on_delete=models.CASCADE)  # This is the user field
    candidate = models.ForeignKey(People, on_delete=models.CASCADE, related_name='votes')  # Add related_name
    position = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('name', 'position')  # Use 'name' instead of 'user'
        db_table = 'voters'  # Explicitly set the table name
        managed = True  # Change to True to allow Django to manage the table

    def __str__(self):
        return f"{self.name.email} voted for {self.candidate.name} as {self.position}"
