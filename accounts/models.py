from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.db import models
from django.utils.timezone import now

class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'General User'),
    ]

    username = models.CharField(_('username'), max_length=50, unique=True)
    email = models.EmailField(_('email address'), unique=True)
    dob = models.DateField(_('date of birth'))
    user_type = models.CharField(
        _('user type'),
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default='user'
    )

    def __str__(self):
        return self.username

    def is_admin(self):
        return self.user_type == 'admin'

    class Meta:
        db_table = 'users'

# filepath: c:\Users\Hp\Desktop\New Backend\myproject\accounts\models.py
class Voter(models.Model):
    name = models.CharField(max_length=255,default="Unknown")
    email = models.EmailField(unique=True,default="Unknown")
    registered_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.registered_at:  
            self.registered_at = now().replace(microsecond=0)  # Remove microseconds
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'voters'  # Explicitly set the table name

# candidates/models.py
from django.db import models

class People(models.Model):
    name = models.CharField(max_length=255)
    age = models.IntegerField(null=True, blank=True)
    post = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name
    
class Candidate(models.Model):
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField()
    post = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.name
    
from django.db import models
