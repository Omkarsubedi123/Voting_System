document.addEventListener('DOMContentLoaded', function () {
  const htmlElement = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle-btn');

  // Theme Toggle
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isDark = htmlElement.classList.contains('dark-theme');
      htmlElement.classList.toggle('dark-theme', !isDark);
      htmlElement.classList.toggle('light-theme', isDark);
      themeToggleBtn.innerHTML = isDark
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';
      localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      htmlElement.classList.toggle('dark-theme', savedTheme === 'dark');
      htmlElement.classList.toggle('light-theme', savedTheme === 'light');
      themeToggleBtn.innerHTML =
        savedTheme === 'light'
          ? '<i class="fas fa-sun"></i>'
          : '<i class="fas fa-moon"></i>';
    }
  }

  // Profile Dropdown
  const profileBtn = document.getElementById('profile-btn');
  const profileMenu = document.querySelector('.profile-menu');
  if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', () => {
      profileMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.profile-dropdown')) {
        profileMenu.classList.remove('active');
      }
    });
  }

  // Modal Openers
  const modals = {
    'delete-account-btn': 'delete-account-modal',
    'update-profile-btn': 'update-profile-modal',
  };

  for (let btnId in modals) {
    const btn = document.getElementById(btnId);
    const modalId = modals[btnId];
    const modal = document.getElementById(modalId);
    if (btn && modal) {
      btn.addEventListener('click', () => {
        // Populate the modal with user data
        if (modalId === 'update-profile-modal') {
          document.getElementById('profile-first-name').value = document.querySelector('.user-info-value:nth-child(1)').textContent.split(' ')[0];
          document.getElementById('profile-last-name').value = document.querySelector('.user-info-value:nth-child(1)').textContent.split(' ')[1] || '';
          document.getElementById('profile-email').value = document.querySelector('.user-info-value:nth-child(2)').textContent;
        }
        modal.style.display = 'flex';
      });
    }
  }

  // Close Modals
  document.querySelectorAll('.close-modal').forEach((btn) => {
    btn.addEventListener('click', function () {
      this.closest('.modal').style.display = 'none';
    });
  });

  document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', function (event) {
      if (event.target === this) {
        this.style.display = 'none';
      }
    });
  });

  // Cancel buttons (specific modals)
  const closeDeleteModal = document.querySelector('.close-delete-account-modal');
  if (closeDeleteModal) {
    closeDeleteModal.addEventListener('click', () => {
      document.getElementById('delete-account-modal').style.display = 'none';
    });
  }

  const closeUpdateModal = document.querySelector('.close-update-profile-modal');
  if (closeUpdateModal) {
    closeUpdateModal.addEventListener('click', () => {
      document.getElementById('update-profile-modal').style.display = 'none';
    });
  }

  // Logout functionality - FIXED: removed nested DOMContentLoaded
  const logoutButton = document.getElementById('logoutButton');
  
  if (logoutButton) {
    logoutButton.addEventListener('click', function() {
      if (confirm('Are you sure you want to logout?')) {
        // Hard-coded redirect to the login page
        const logoutUrl = document.getElementById('logoutButton').getAttribute('data-logout-url');
        window.location.href = logoutUrl;
      }
    });
  }

  // Get CSRF token
  function getCookie(name) {
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith(name + '='));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
  }

  const csrftoken = getCookie('csrftoken');

  // Delete Account Form
  const deleteAccountForm = document.getElementById('delete-account-form');
  if (deleteAccountForm) {
    deleteAccountForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = document.getElementById('delete-account-password').value;

      fetch('/accounts/api/delete-account/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ password }),
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.message || 'Something went wrong');
          if (data.status === 'success') {
            window.location.href = '/accounts/login/';
          }
        })
        .catch((err) => {
          console.error(err);
          alert('An error occurred. Please try again.');
        });
    });
  }

  // Update Profile Form
  const updateProfileForm = document.getElementById('update-profile-form');
  if (updateProfileForm) {
    updateProfileForm.addEventListener('submit', (e) => {
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
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, phone }),
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.message || 'Something went wrong');
          if (data.status === 'success') {
            document.getElementById('update-profile-modal').style.display = 'none';
            document.querySelectorAll('.user-info-value')[0].textContent = `${firstName} ${lastName}`;
            document.querySelectorAll('.user-info-value')[1].textContent = email;

            // Update avatar letter
            document.querySelectorAll('.user-avatar-img, .profile-avatar').forEach((el) => {
              el.textContent = firstName.charAt(0);
            });

            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        })
        .catch((err) => {
          console.error(err);
          alert('An error occurred. Please try again.');
        });
    });
  }
});