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
  
          // Update page title and welcome text
          const pageName = this.querySelector('span').textContent;
          if (pageId !== 'dashboard-page') {
            document.querySelector('.page-title').textContent = pageName;
            
            // Update welcome text based on page
            let welcomeText = '';
            switch(pageId) {
              case 'voters-page':
                welcomeText = 'Manage registered voters';
                break;
              case 'candidates-page':
                welcomeText = 'Manage election candidates';
                break;
              case 'settings-page':
                welcomeText = 'Manage your account preferences';
                break;
              default:
                welcomeText = 'Welcome back, Admin';
            }
            document.querySelector('.welcome-text').textContent = welcomeText;
          } else {
            document.querySelector('.page-title').textContent = 'Dashboard Overview';
            document.querySelector('.welcome-text').textContent = 'Welcome back, Admin';
          }
        }
      });
    });
  
    // Modal management
    function openModal(modal) {
      if (modal) {
        modal.style.display = 'block';
      }
    }
  
    function closeModal(modal) {
      if (modal) {
        modal.style.display = 'none';
      }
    }
  
    function closeAllModals() {
      const modals = document.querySelectorAll('.modal');
      modals.forEach(modal => {
        modal.style.display = 'none';
      });
    }
  
    // Close modals when clicking the X button
    const closeModalBtns = document.querySelectorAll('.close-modal');
    if (closeModalBtns) {
      closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          const modal = this.closest('.modal');
          closeModal(modal);
        });
      });
    }
  
    // Close modal if clicked outside
    window.addEventListener('click', function(event) {
      if (event.target.classList.contains('modal')) {
        closeAllModals();
      }
    });
  
    // Candidate Management
    const candidatesData = [];
    let currentCandidateId = null;
  
    // Candidate modal elements
    const newCandidateBtn = document.getElementById('new-candidate-btn');
    const candidateModal = document.getElementById('candidate-modal');
    const cancelCandidateBtn = document.getElementById('cancel-candidate');
    const candidateForm = document.getElementById('candidate-form');
  
    // Open modal for new candidate
    if (newCandidateBtn) {
      newCandidateBtn.addEventListener('click', function() {
        openCandidateModal();
      });
    }
  
    // Cancel button for candidate modal
    if (cancelCandidateBtn) {
      cancelCandidateBtn.addEventListener('click', function() {
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
  
    // Candidate form submission
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
    // Modal elements
    const updateProfileBtn = document.getElementById('update-profile-btn');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    
    const updateProfileModal = document.getElementById('update-profile-modal');
    const changePasswordModal = document.getElementById('change-password-modal');
    const deleteAccountModal = document.getElementById('delete-account-modal');
    
    const closeUpdateProfileModalBtn = document.querySelector('.close-update-profile-modal');
    const closeChangePasswordModalBtn = document.querySelector('.close-change-password-modal');
    const closeDeleteAccountModalBtn = document.querySelector('.close-delete-account-modal');
    
    const updateProfileForm = document.getElementById('update-profile-form');
    const changePasswordForm = document.getElementById('change-password-form');
    const deleteAccountForm = document.getElementById('delete-account-form');
  
    // Open Update Profile modal
    if (updateProfileBtn) {
      updateProfileBtn.addEventListener('click', function() {
        openModal(updateProfileModal);
      });
    }
  
    // Open Change Password modal
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener('click', function() {
        openModal(changePasswordModal);
      });
    }
  
    // Open Delete Account modal
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', function() {
        openModal(deleteAccountModal);
      });
    }
  
    // Close specific modal buttons
    if (closeUpdateProfileModalBtn) {
      closeUpdateProfileModalBtn.addEventListener('click', function() {
        closeModal(updateProfileModal);
      });
    }
  
    if (closeChangePasswordModalBtn) {
      closeChangePasswordModalBtn.addEventListener('click', function() {
        closeModal(changePasswordModal);
      });
    }
  
    if (closeDeleteAccountModalBtn) {
      closeDeleteAccountModalBtn.addEventListener('click', function() {
        closeModal(deleteAccountModal);
      });
    }
  
    // Update Profile form submission
    if (updateProfileForm) {
      updateProfileForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('profile-name').value;
        const email = document.getElementById('profile-email').value;
        const phone = document.getElementById('profile-phone').value;
  
        // In a real app, this would call an API to update the profile
        alert('Profile updated successfully.');
  
        // Update displayed info
        document.querySelectorAll('.profile-avatar').forEach(avatar => {
          avatar.textContent = name.charAt(0).toUpperCase();
        });
  
        // Update admin info
        const nameInfoValues = document.querySelectorAll('.admin-info-value');
        if (nameInfoValues.length > 0) {
          nameInfoValues[0].textContent = name;
        }
  
        closeModal(updateProfileModal);
      });
    }
  
    // Change Password form submission
    if (changePasswordForm) {
      changePasswordForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
  
        if (newPassword !== confirmPassword) {
          alert('New passwords do not match.');
          return;
        }
  
        // In a real app, this would validate the current password and update it
        alert('Password updated successfully.');
        changePasswordForm.reset();
        closeModal(changePasswordModal);
      });
    }
  
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