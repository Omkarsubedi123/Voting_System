document.addEventListener('DOMContentLoaded', function () {
  // ========================
  // Theme Toggling
  // ========================
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const html = document.documentElement;

  if (themeToggleBtn) {
    // Load theme from localStorage
    if (localStorage.getItem('theme') === 'light') {
      html.classList.add('light-theme');
      themeToggleBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }

    // Toggle theme and store it
    themeToggleBtn.addEventListener('click', function () {
      html.classList.toggle('light-theme');

      const icon = themeToggleBtn.querySelector('i');
      if (html.classList.contains('light-theme')) {
        icon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'light');
      } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'dark');
      }
    });
  }

  // ========================
  // Profile Dropdown Toggle
  // ========================
  const profileBtn = document.getElementById('profile-btn');
  const profileDropdown = document.querySelector('.profile-dropdown');

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      profileDropdown.classList.toggle('active');
    });

    document.addEventListener('click', function (e) {
      if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
        profileDropdown.classList.remove('active');
      }
    });
  }

  // ========================
  // Pagination Buttons
  // ========================
  const paginationButtons = document.querySelectorAll('.pagination-btn');

  if (paginationButtons.length > 0) {
    paginationButtons.forEach(button => {
      button.addEventListener('click', function () {
        if (!this.classList.contains('active')) {
          paginationButtons.forEach(btn => btn.classList.remove('active'));
          this.classList.add('active');
          console.log('Changing page');
        }
      });
    });
  }

  // ========================
  // Candidate Modal Handling
  // ========================
  const newCandidateBtn = document.getElementById('new-candidate-btn');
  const candidateModal = document.getElementById('candidate-modal');
  const cancelCandidateBtn = document.getElementById('cancel-candidate');
  const closeModalBtns = document.querySelectorAll('.close-modal');
  const candidateForm = document.getElementById('candidate-form');

  if (newCandidateBtn && candidateModal) {
    newCandidateBtn.addEventListener('click', function () {
      document.getElementById('modal-title').textContent = 'Add New Candidate';
      candidateModal.style.display = 'block';
    });
  }

  if (cancelCandidateBtn) {
    cancelCandidateBtn.addEventListener('click', function () {
      candidateModal.style.display = 'none';
    });
  }

  if (closeModalBtns.length > 0) {
    closeModalBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const modal = this.closest('.modal');
        modal.style.display = 'none';
      });
    });
  }

  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('modal')) {
      event.target.style.display = 'none';
    }
  });

  if (candidateForm) {
    candidateForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('candidate-name').value;
      const age = document.getElementById('candidate-age').value;
      const post = document.getElementById('candidate-post').value;
      const tableBody = document.getElementById('candidates-table-body');

      if (tableBody) {
        const emptyMessage = tableBody.querySelector('.empty-table-message');
        if (emptyMessage) {
          tableBody.innerHTML = '';
        }

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
          <td>${name}</td>
          <td>${age}</td>
          <td>${post}</td>
          <td><span class="status-badge active">Active</span></td>
          <td>
            <button class="action-btn edit-candidate-btn" title="Edit"><i class="fas fa-edit"></i></button>
            <button class="action-btn delete-candidate-btn" title="Delete"><i class="fas fa-trash"></i></button>
          </td>
        `;
        tableBody.appendChild(newRow);
      }

      candidateModal.style.display = 'none';
      candidateForm.reset();
    });
  }

  // ========================
  // Logout Functionality
  // ========================
  const logoutBtn = document.getElementById('logout-btn');
  const quickLogoutBtn = document.getElementById('quick-logout');

  function handleLogout(e) {
    e.preventDefault();
    alert('You have been logged out successfully.');
    // window.location.href = 'login.html'; // Uncomment in real app
  }

  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (quickLogoutBtn) quickLogoutBtn.addEventListener('click', handleLogout);

  // ========================
  // Delete Account Modal
  // ========================
  const deleteAccountBtn = document.getElementById('delete-account-btn');
  const deleteAccountModal = document.getElementById('delete-account-modal');
  const deleteAccountForm = document.getElementById('delete-account-form');
  const closeDeleteAccountBtn = document.querySelector('.close-delete-account-modal');

  if (deleteAccountBtn && deleteAccountModal) {
    deleteAccountBtn.addEventListener('click', function () {
      deleteAccountModal.style.display = 'block';
    });
  }

  if (closeDeleteAccountBtn) {
    closeDeleteAccountBtn.addEventListener('click', function () {
      deleteAccountModal.style.display = 'none';
    });
  }

  if (deleteAccountForm) {
    deleteAccountForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const password = document.getElementById('delete-account-password').value;

      if (password) {
        alert('Your account has been deleted successfully.');
        // window.location.href = 'login.html'; // Uncomment in real app
      } else {
        alert('Please enter your password to confirm account deletion.');
      }
    });
  }

  // ========================
  // Load Page (Unused but Kept)
  // ========================
  function loadPage(pageUrl) {
    fetch(pageUrl)
      .then(response => response.text())
      .then(html => {
        document.querySelector('.main-content').innerHTML = html;
      })
      .catch(error => console.error('Error loading page:', error));
  }
});
