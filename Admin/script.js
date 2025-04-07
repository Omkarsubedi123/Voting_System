document.addEventListener('DOMContentLoaded', function() {
  // Theme toggle functionality
  const themeToggleBtn = document.getElementById('theme-toggle-btn');

  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light-theme');
    updateThemeIcon(true);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function() {
      // Toggle theme class
      const isLightTheme = document.documentElement.classList.toggle('light-theme');

      // Save preference
      localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');

      // Update icon
      updateThemeIcon(isLightTheme);
    });
  }

  function updateThemeIcon(isLightTheme) {
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = isLightTheme ?
        '<i class="fas fa-moon"></i>' :
        '<i class="fas fa-sun"></i>';
    }
  }

  // Profile dropdown functionality
  const profileBtn = document.getElementById('profile-btn');
  const profileDropdown = document.querySelector('.profile-dropdown');
  const quickLogoutBtn = document.getElementById('quick-logout');

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      profileDropdown.classList.toggle('active');
    });

    // Close the dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove('active');
      }
    });
  }

  // Quick logout functionality from profile dropdown
  if (quickLogoutBtn) {
    quickLogoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      if (confirm('Are you sure you want to logout?')) {
        alert('You have been logged out successfully.');
        // In a real app, this would redirect to the login page
      }
    });
  }

  // Menu navigation
  const menuItems = document.querySelectorAll('.menu-item');
  const pages = document.querySelectorAll('.page-content');

  menuItems.forEach(item => {
    item.addEventListener('click', function() {
      // Update active menu item
      menuItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');

      // Show corresponding page
      const pageId = this.getAttribute('data-page') + '-page';
      pages.forEach(page => page.classList.remove('active'));
      const targetPage = document.getElementById(pageId);
      if (targetPage) {
        targetPage.classList.add('active');

        // Update page title
        const pageName = this.querySelector('span').textContent;
        if (pageId !== 'dashboard-page') {
          document.querySelector('.page-title').textContent = pageName;
        } else {
          document.querySelector('.page-title').textContent = 'Dashboard Overview';
        }
      }
    });
  });

  // Candidate Management
  const candidatesData = [];
  let currentCandidateId = null;

  // Open modal for new candidate
  const newCandidateBtn = document.getElementById('new-candidate-btn');
  const candidateModal = document.getElementById('candidate-modal');
  const closeModalBtns = document.querySelectorAll('.close-modal');
  const cancelCandidateBtn = document.getElementById('cancel-candidate');
  const candidateForm = document.getElementById('candidate-form');

  if (newCandidateBtn) {
    newCandidateBtn.addEventListener('click', function() {
      openCandidateModal();
    });
  }

  // Close modal handlers
  if (closeModalBtns) {
    closeModalBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        closeAllModals();
      });
    });
  }

  if (cancelCandidateBtn) {
    cancelCandidateBtn.addEventListener('click', function() {
      closeModal(candidateModal);
    });
  }

  // Close modal if clicked outside
  window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
      closeAllModals();
    }
  });

  // Function to close all modals
  function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.style.display = 'none';
    });
  }

  // Function to close specific modal
  function closeModal(modal) {
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Form submission
  if (candidateForm) {
    candidateForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const name = document.getElementById('candidate-name').value;
      const age = document.getElementById('candidate-age').value;
      const post = document.getElementById('candidate-post').value;
      const description = document.getElementById('candidate-description').value;

      if (currentCandidateId === null) {
        // Add new candidate
        const newCandidate = {
          id: candidatesData.length + 1,
          name: name,
          age: age,
          post: post,
          description: description
        };
        candidatesData.push(newCandidate);
      } else {
        // Edit existing candidate
        const candidateIndex = candidatesData.findIndex(c => c.id === currentCandidateId);
        if (candidateIndex !== -1) {
          candidatesData[candidateIndex].name = name;
          candidatesData[candidateIndex].age = age;
          candidatesData[candidateIndex].post = post;
          candidatesData[candidateIndex].description = description;
        }
      }

      renderCandidates();
      closeModal(candidateModal);
    });
  }

  // Function to open candidate modal
  function openCandidateModal(candidate = null) {
    if (candidate) {
      // Edit mode
      document.getElementById('modal-title').textContent = 'Edit Candidate';
      document.getElementById('candidate-name').value = candidate.name;
      document.getElementById('candidate-age').value = candidate.age;
      document.getElementById('candidate-post').value = candidate.post;
      document.getElementById('candidate-description').value = candidate.description;
      currentCandidateId = candidate.id;
    } else {
      // Add mode
      document.getElementById('modal-title').textContent = 'Add New Candidate';
      document.getElementById('candidate-form').reset();
      currentCandidateId = null;
    }
    candidateModal.style.display = 'block';
  }

  // Function to render candidates table
  function renderCandidates() {
    const tableBody = document.getElementById('candidates-table-body');
    if (!tableBody) return;

    if (candidatesData.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="empty-table-message">No candidates available. Click "New Candidate" to add one.</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = '';
    candidatesData.forEach(candidate => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${candidate.name}</td>
        <td>${candidate.age}</td>
        <td>${candidate.post}</td>
        <td>${candidate.description}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  // Settings functionality
  const logoutBtn = document.getElementById('logout-btn');
  const deleteAccountBtn = document.getElementById('delete-account-btn');
  const deleteAccountModal = document.getElementById('delete-account-modal');
  const closeDeleteAccountModalBtn = document.querySelector('.close-delete-account-modal');
  const deleteAccountForm = document.getElementById('delete-account-form');

  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to logout?')) {
        setTimeout(() => {
          alert('You have been logged out successfully.');
          // In a real app, this would redirect to the login page
        }, 1000);
      }
    });
  }

  // Delete account button
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', function() {
      deleteAccountModal.style.display = 'block';
    });
  }

  // Close delete account modal
  if (closeDeleteAccountModalBtn) {
    closeDeleteAccountModalBtn.addEventListener('click', function() {
      closeModal(deleteAccountModal);
    });
  }

  // Delete account form submission
  if (deleteAccountForm) {
    deleteAccountForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const password = document.getElementById('delete-account-password').value;

      if (password.trim() === '') {
        alert('Please enter your password to confirm account deletion.');
        return;
      }

      // In a real app, this would call an API to delete the account
      alert('Your account has been deleted successfully.');
      deleteAccountForm.reset();
      closeModal(deleteAccountModal);
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  // Theme toggle functionality
  const themeToggleBtn = document.getElementById('theme-toggle-btn');

  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light-theme');
    updateThemeIcon(true);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function() {
      // Toggle theme class
      const isLightTheme = document.documentElement.classList.toggle('light-theme');

      // Save preference
      localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');

      // Update icon
      updateThemeIcon(isLightTheme);
    });
  }

  function updateThemeIcon(isLightTheme) {
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = isLightTheme ?
        '<i class="fas fa-moon"></i>' :
        '<i class="fas fa-sun"></i>';
    }
  }

  // Profile dropdown functionality
  const profileBtn = document.getElementById('profile-btn');
  const profileDropdown = document.querySelector('.profile-dropdown');
  const quickLogoutBtn = document.getElementById('quick-logout');

  // ... existing code ... <profile dropdown functionality>

  // Modal references
  const candidateModal = document.getElementById('candidate-modal');
  const passwordModal = document.getElementById('password-modal');
  const emailModal = document.getElementById('email-modal');
  const deleteAccountModal = document.getElementById('delete-account-modal');

  // Modal close buttons
  const closeModalBtns = document.querySelectorAll('.close-modal');
  const closePasswordModalBtn = document.querySelector('.close-password-modal');
  const closeEmailModalBtn = document.querySelector('.close-email-modal');
  const closeDeleteModalBtn = document.querySelector('.close-delete-modal');

  // Settings buttons
  const logoutBtn = document.getElementById('logout-btn');
  const deleteAccountBtn = document.getElementById('delete-account-btn');

  // Forms
  const candidateForm = document.getElementById('candidate-form');
  const passwordForm = document.getElementById('password-form');
  const emailForm = document.getElementById('email-form');
  const deleteAccountForm = document.getElementById('delete-account-form');

  // ... existing code ... <menu navigation and other functionality>

  // Close modal function
  function closeModal(modal) {
    if (modal) {
      modal.style.display = 'none';
    }
  }

  // Close modals when clicking the close button
  if (closeModalBtns.length > 0) {
    closeModalBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        closeModal(modal);
      });
    });
  }

  // Close modals when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
      closeModal(event.target);
    }
  });

  // ... existing code ... <candidate management>

  // Logout button functionality
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to logout?')) {
        addActivity('User logged out', 'fas fa-sign-out-alt', 'warning');
        setTimeout(() => {
          alert('You have been logged out successfully.');
          // In a real app, this would redirect to the login page
        }, 1000);
      }
    });
  }

  // Delete account button functionality
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', function() {
      // Show delete account modal
      if (deleteAccountModal) {
        deleteAccountModal.style.display = 'block';
      }
    });
  }

  // Close delete account modal
  if (closeDeleteModalBtn) {
    closeDeleteModalBtn.addEventListener('click', function() {
      closeModal(deleteAccountModal);
    });
  }

  // Delete account form submission
  if (deleteAccountForm) {
    deleteAccountForm.addEventListener('submit', function(event) {
      event.preventDefault();

      const password = document.getElementById('delete-confirm-password').value;

      // In a real app, this would validate the password and then delete the account
      if (password) {
        addActivity('Account deleted', 'fas fa-user-times', 'warning');
        setTimeout(() => {
          alert('Your account has been deleted successfully.');
          // In a real app, this would redirect to the signup page
        }, 1000);
        deleteAccountForm.reset();
        closeModal(deleteAccountModal);
      } else {
        alert('Please enter your password to confirm account deletion.');
      }
    });
  }

  // ... existing code ... <close modals and form submissions>
});

