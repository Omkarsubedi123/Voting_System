from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.utils.timezone import now


class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'General User'),
    ]

    # Remove username and replace with user_id
    username = None
    user_id = models.CharField(_('user ID'), max_length=10, unique=True, blank=True, null=True)
    email = models.EmailField(_('email address'), unique=True)
    dob = models.DateField(_('date of birth'), blank=True, null=True)
    user_type = models.CharField(
        _('user type'),
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default='user'
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['user_id', 'dob', 'user_type']

    USERNAME_FIELD = 'user_id'  # This is now the login field
    REQUIRED_FIELDS = ['email', 'dob', 'user_type']

    def __str__(self):
        return self.user_id

    def is_admin(self):
        return self.user_type == 'admin'

    class Meta:
        db_table = 'users'


# class Voter(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='voter_profile', null=True, blank=True)
#     name = models.CharField(max_length=255, default="Unknown")
#     email = models.EmailField(unique=True, default="Unknown")
#     registered_at = models.DateTimeField(auto_now_add=True)

#     def save(self, *args, **kwargs):
#         if not self.registered_at:
#             self.registered_at = now().replace(microsecond=0)
#         super().save(*args, **kwargs)

#     def __str__(self):
#         return self.name

#     class Meta:
#         db_table = 'voters'


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
