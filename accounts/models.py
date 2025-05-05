from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    def create_user(self, user_id, email, dob, user_type, password=None, **extra_fields):
        if not user_id:
            raise ValueError('The User ID must be set')
        email = self.normalize_email(email)
        user = self.model(user_id=user_id, email=email, dob=dob, user_type=user_type, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, user_id, email, dob, user_type='admin', password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(user_id, email, dob, user_type, password, **extra_fields)


class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'General User'),
    ]

    username = None  # Disable default username field
    user_id = models.CharField(max_length=150, unique=True)
    email = models.EmailField(_('Email Address'), unique=True)
    dob = models.DateField(_('Date of Birth'), blank=True, null=True)
    user_type = models.CharField(_('User Type'), max_length=10, choices=USER_TYPE_CHOICES, default='user')

    USERNAME_FIELD = 'user_id'
    REQUIRED_FIELDS = ['email', 'dob', 'user_type']

    objects = CustomUserManager()

    def __str__(self):
        return self.user_id

    def is_admin(self):
        return self.user_type == 'admin'

    class Meta:
        db_table = 'users'


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