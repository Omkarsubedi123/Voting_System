from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

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


class Voter(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='voter_profile')
    date_of_birth = models.DateField()
    email = models.EmailField()

    def __str__(self):
        return self.user.username

    # Removed explicit db_table to let Django use the default name (accounts_voter)
    # class Meta:
    #     db_table = 'voters'
