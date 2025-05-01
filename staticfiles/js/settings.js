document.addEventListener('DOMContentLoaded', function () {
  console.log('settings.js loaded');
  const htmlElement = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle-btn');

  // Theme Toggle (keep original moon/sun icons)
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      htmlElement.classList.toggle('dark-theme');
      htmlElement.classList.toggle('light-theme');

      const isDark = htmlElement.classList.contains('dark-theme');
      themeToggleBtn.innerHTML = isDark
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';

      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // Load theme on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      htmlElement.classList.toggle('dark-theme', savedTheme === 'dark');
      htmlElement.classList.toggle('light-theme', savedTheme === 'light');
      themeToggleBtn.innerHTML = savedTheme === 'dark'
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';
    }
  }

  // Profile Dropdown
  const profileBtn = document.getElementById('profile-btn');
  const profileMenu = document.querySelector('.profile-menu');

  if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      profileMenu.classList.toggle('active');
    });

    document.addEventListener('click', function (e) {
      if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.classList.remove('active');
      }
    });
  }

  // Modal buttons
  const modals = {
    'update-profile-btn': 'update-profile-modal',
    'delete-account-btn': 'delete-account-modal',
  };

  for (const btnId in modals) {
    const btn = document.getElementById(btnId);
    const modalId = modals[btnId];
    const modal = document.getElementById(modalId);

    if (btn && modal) {
      btn.addEventListener('click', function () {
        if (modalId === 'update-profile-modal') {
          const userInfoValues = document.querySelectorAll('.user-info-value');
          const nameParts = userInfoValues[0].textContent.trim().split(' ');
          document.getElementById('profile-first-name').value = nameParts[0] || '';
          document.getElementById('profile-last-name').value = nameParts[1] || '';
          document.getElementById('profile-email').value = userInfoValues[1].textContent.trim();
          document.getElementById('profile-phone').value = '';
        }
        modal.style.display = 'flex';
      });
    }
  }

  // Close Modals
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', function () {
      this.closest('.modal').style.display = 'none';
    });
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function (e) {
      if (e.target === this) {
        this.style.display = 'none';
      }
    });
  });

  // Close with Cancel Buttons
  const closeDeleteBtn = document.querySelector('.close-delete-account-modal');
  if (closeDeleteBtn) {
    closeDeleteBtn.addEventListener('click', () => {
      document.getElementById('delete-account-modal').style.display = 'none';
    });
  }

  const closeUpdateBtn = document.querySelector('.close-update-profile-modal');
  if (closeUpdateBtn) {
    closeUpdateBtn.addEventListener('click', () => {
      document.getElementById('update-profile-modal').style.display = 'none';
    });
  }

  // Logout button
  const logoutButton = document.getElementById('logoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', function () {
      if (confirm('Are you sure you want to logout?')) {
        const logoutUrl = logoutButton.getAttribute('data-logout-url');
        window.location.href = logoutUrl;
      }
    });
  }

  // CSRF helper
  function getCookie(name) {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(name + '='));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
  }
  const csrftoken = getCookie('csrftoken');

  // Delete account
  const deleteAccountForm = document.getElementById('delete-account-form');
  if (deleteAccountForm) {
    deleteAccountForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const password = document.getElementById('delete-account-password').value;

      fetch('/accounts/api/delete-account/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ password: password }),
      })
        .then(response => response.json())
        .then(data => {
          alert(data.message || 'Something went wrong');
          if (data.status === 'success') {
            window.location.href = '/accounts/login/';
          }
        })
        .catch(error => {
          console.error(error);
          alert('An error occurred. Please try again.');
        });
    });
  }

  // Update profile
  const updateProfileForm = document.getElementById('update-profile-form');
  if (updateProfileForm) {
    updateProfileForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const firstName = document.getElementById('profile-first-name').value;
      const lastName = document.getElementById('profile-last-name').value;
      const email = document.getElementById('profile-email').value;
      const phone = document.getElementById('profile-phone').value;

      fetch('/accounts/api/update-profile/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email: email, phone: phone }),
      })
        .then(response => response.json())
        .then(data => {
          alert(data.message || 'Something went wrong');
          if (data.status === 'success') {
            document.getElementById('update-profile-modal').style.display = 'none';
            const userInfoValues = document.querySelectorAll('.user-info-value');
            userInfoValues[0].textContent = `${firstName} ${lastName}`;
            userInfoValues[1].textContent = email;

            // Update profile avatar (first letter)
            document.querySelectorAll('.profile-avatar').forEach(el => {
              el.textContent = firstName.charAt(0).toUpperCase();
            });

            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        })
        .catch(error => {
          console.error(error);
          alert('An error occurred. Please try again.');
        });
    });
  }
});
