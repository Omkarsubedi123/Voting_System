document.addEventListener('DOMContentLoaded', function() {
    // Theme toggling
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const html = document.documentElement;
  
    // themeToggleBtn.addEventListener('click', function() {
    //   html.classList.toggle('light-theme');
  
    //   const icon = themeToggleBtn.querySelector('i');
    //   if (html.classList.contains('light-theme')) {
    //     icon.classList.remove('fa-moon');
    //     icon.classList.add('fa-sun');
    //   } else {
    //     icon.classList.remove('fa-sun');
    //     icon.classList.add('fa-moon');
    //   }
    // });
//     const themeToggleBtn = document.getElementById('themeToggleBtn');
// const html = document.documentElement;

// Load theme on page load
if (localStorage.getItem('theme') === 'light' && themeToggleBtn) {
  html.classList.add('light-theme');
  themeToggleBtn.querySelector('i').classList.replace('fa-moon', 'fa-sun');
} else {
  console.log('themeToggleBtn not found');
}

// Toggle theme and store it
if (themeToggleBtn) {
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
} else {
  console.log('themeToggleBtn not found');
}

  
    // Profile dropdown
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.querySelector('.profile-dropdown');
  
    profileBtn.addEventListener('click', function() {
      profileDropdown.classList.toggle('active');
    });
  
    // Close profile dropdown when clicking outside
    document.addEventListener('click', function(event) {
      if (!profileDropdown.contains(event.target) && !profileBtn.contains(event.target)) {
        profileDropdown.classList.remove('active');
      }
    });
  
    // Navigation (REMOVED)
    // const menuItems = document.querySelectorAll('.menu-item');
    // const pageContents = document.querySelectorAll('.page-content');
    // const pageTitle = document.querySelector('.page-title');

    // menuItems.forEach(item => {
    //   item.addEventListener('click', function(event) {
    //     // Check if the clicked element is a link
    //     if (this.tagName === 'A') {
    //       // Do nothing, let the link handle the navigation
    //       return;
    //     }

    //     const targetPage = this.getAttribute('data-page');

    //     // Update active menu item
    //     menuItems.forEach(mi => mi.classList.remove('active'));
    //     this.classList.add('active');

    //     // Show target page
    //     pageContents.forEach(pc => pc.classList.remove('active'));
    //     document.getElementById(targetPage + '-page').classList.add('active');

    //     // Update page title
    //     switch (targetPage) {
    //       case 'dashboard':
    //         pageTitle.textContent = 'Dashboard Overview';
    //         break;
    //       case 'voters':
    //         pageTitle.textContent = 'Voter Management';
    //         break;
    //       case 'candidates':
    //         pageTitle.textContent = 'Candidate Management';
    //         break;
    //       case 'settings':
    //         pageTitle.textContent = 'Settings';
    //         break;
    //       default:
    //         pageTitle.textContent = 'Dashboard';
    //     }
    //   });
    // });
  
    // Voter pagination
    const paginationButtons = document.querySelectorAll('.pagination-btn');
  
    if (paginationButtons.length > 0) {
      paginationButtons.forEach(button => {
        button.addEventListener('click', function() {
          // If not active already (don't do anything when clicking the current active page)
          if (!this.classList.contains('active')) {
            // Remove active class from all pagination buttons
            paginationButtons.forEach(btn => btn.classList.remove('active'));
  
            // Add active class to clicked button
            this.classList.add('active');
  
            // In a real application, you would fetch the appropriate page of voter data here
            console.log(`Changing page`);
          }
        });
      });
    }
  
    // Candidate modal handling
    const newCandidateBtn = document.getElementById('new-candidate-btn');
    const candidateModal = document.getElementById('candidate-modal');
    const cancelCandidateBtn = document.getElementById('cancel-candidate');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const candidateForm = document.getElementById('candidate-form');
  
    if (newCandidateBtn) {
      newCandidateBtn.addEventListener('click', function() {
        document.getElementById('modal-title').textContent = 'Add New Candidate';
        candidateModal.style.display = 'block';
      });
    }
  
    if (cancelCandidateBtn) {
      cancelCandidateBtn.addEventListener('click', function() {
        candidateModal.style.display = 'none';
      });
    }
  
    closeModalBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        // Find the closest modal parent
        const modal = this.closest('.modal');
        modal.style.display = 'none';
      });
    });
  
    // Close modal when clicking outside the modal content
    document.addEventListener('click', function(event) {
      if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
      }
    });
  
    if (candidateForm) {
      candidateForm.addEventListener('submit', function(e) {
        e.preventDefault();
  
        // Get form values
        const name = document.getElementById('candidate-name').value;
        const age = document.getElementById('candidate-age').value;
        const post = document.getElementById('candidate-post').value;
  
        // Sample implementation to add candidate to table
        const tableBody = document.getElementById('candidates-table-body');
  
        // Remove empty message if it exists
        const emptyMessage = tableBody.querySelector('.empty-table-message');
        if (emptyMessage) {
          tableBody.innerHTML = '';
        }
  
        // Add new row
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
  
        // Close modal and reset form
        candidateModal.style.display = 'none';
        candidateForm.reset();
      });
    }
  
    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    const quickLogoutBtn = document.getElementById('quick-logout');
  
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
  
    if (quickLogoutBtn) {
      quickLogoutBtn.addEventListener('click', handleLogout);
    }
  
    function handleLogout(e) {
      e.preventDefault();
      // In a real app, you would call a logout API endpoint
      alert('You have been logged out successfully.');
      // Redirect to login page
      // window.location.href = 'login.html';
    }
  
    // Delete Account functionality
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const deleteAccountModal = document.getElementById('delete-account-modal');
    const deleteAccountForm = document.getElementById('delete-account-form');
    const closeDeleteAccountBtn = document.querySelector('.close-delete-account-modal');
  
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener('click', function() {
        deleteAccountModal.style.display = 'block';
      });
    }
  
    if (closeDeleteAccountBtn) {
      closeDeleteAccountBtn.addEventListener('click', function() {
        deleteAccountModal.style.display = 'none';
      });
    }
  
    if (deleteAccountForm) {
      deleteAccountForm.addEventListener('submit', function(e) {
        e.preventDefault();
  
        const password = document.getElementById('delete-account-password').value;
  
        // In a real app, you would verify the password with the server
        if (password) {
          alert('Your account has been deleted successfully.');
          // Redirect to login page
          // window.location.href = 'login.html';
        } else {
          alert('Please enter your password to confirm account deletion.');
        }
      });
    }
  function loadPage(pageUrl) {
    fetch(pageUrl)
      .then(response => response.text())
      .then(html => {
        document.querySelector('.main-content').innerHTML = html;
      })
      .catch(error => console.error('Error loading page:', error));
  }
});
