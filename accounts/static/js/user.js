// Global variables
let currentTheme = "light";

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Initialize the application
function initApp() {
  // Set up event handlers
  setupEventListeners();
  
  // Load the dashboard by default
  navigateToPage('dashboard');
}

// Setup event listeners
function setupEventListeners() {
  // Theme toggle functionality
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Navigation links
  const navLinks = document.querySelectorAll('.nav-link');
  for (const link of navLinks) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all links
      for (const navLink of navLinks) {
        navLink.classList.remove('active');
      }
      
      // Add active class to clicked link
      this.classList.add('active');
      
      // Navigate to the page
      const page = this.dataset.page;
      if (page) {
        navigateToPage(page);
      }
    });
  }
  
  // Handle click events for vote buttons and submit button
  document.addEventListener('click', function(e) {
    // Vote buttons
    if (e.target.closest('.vote-button')) {
      const candidateCard = e.target.closest('.candidate-card');
      if (candidateCard) {
        toggleVoteSelection(candidateCard);
      }
    }
    
    // Submit vote button
    if (e.target.closest('.vote-submit-button')) {
      submitVote();
    }
  });
}

// Toggle between light and dark theme
function toggleTheme() {
  const htmlElement = document.documentElement;
  const themeIcon = document.querySelector('.theme-toggle i');
  
  if (currentTheme === "light") {
    htmlElement.setAttribute("data-theme", "dark");
    currentTheme = "dark";
    if (themeIcon) {
      themeIcon.className = "fas fa-sun";
    }
  } else {
    htmlElement.setAttribute("data-theme", "light");
    currentTheme = "light";
    if (themeIcon) {
      themeIcon.className = "fas fa-moon";
    }
  }
}

// Navigate to different pages
function navigateToPage(page) {
  const contentElement = document.querySelector('.content');
  const pageTitleElement = document.querySelector('.page-title');
  
  if (contentElement) {
    // Update the page title
    if (pageTitleElement) {
      switch (page) {
        case 'dashboard':
          pageTitleElement.textContent = 'Dashboard Overview';
          contentElement.innerHTML = getDashboardHTML();
          break;
        case 'vote':
          pageTitleElement.textContent = 'Vote Section';
          contentElement.innerHTML = getVoteSectionHTML();
          break;
        case 'news':
          pageTitleElement.textContent = 'Election News';
          contentElement.innerHTML = getNewsHTML();
          break;
        case 'settings':
          pageTitleElement.textContent = 'Settings';
          contentElement.innerHTML = getSettingsHTML();
          setupSettingsEventListeners();
          break;
      }
    }
  }
}

// Toggle vote selection
function toggleVoteSelection(candidateCard) {
  const radioInput = candidateCard.querySelector('input[type="radio"]');
  if (radioInput) {
    radioInput.checked = true;
    
    // Remove 'voted' class from all vote buttons in this position
    const positionSection = candidateCard.closest('.position-section');
    if (positionSection) {
      const voteButtons = positionSection.querySelectorAll('.vote-button');
      for (const button of voteButtons) {
        button.classList.remove('voted');
        button.innerHTML = '<i class="fas fa-check-circle"></i> Vote';
      }
      
      // Mark this button as voted
      const voteButton = candidateCard.querySelector('.vote-button');
      if (voteButton) {
        voteButton.classList.add('voted');
        voteButton.innerHTML = '<i class="fas fa-check-circle"></i> Voted';
      }
    }
  }
}

// Submit vote
function submitVote() {
  const selectedCandidates = document.querySelectorAll('input[type="radio"]:checked');

  if (selectedCandidates.length < 4) {
    alert('Please select a candidate for each position before submitting.');
    return;
  }

  // Prepare the vote data
  const voteData = {};
  selectedCandidates.forEach(candidate => {
    const position = candidate.name;
    const candidateId = candidate.id.split('-')[1]; // Extract candidate ID
    voteData[position] = candidateId;
  });

  // Send the vote data to the server
  fetch('/submit_vote/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken') // Include CSRF token
    },
    body: JSON.stringify({ candidates: voteData })
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      alert('Thank you! Your vote has been submitted successfully.');
      renderVotingStatistics(data.vote_distribution);
      renderVoteDistribution(data.vote_distribution);
      navigateToPage('dashboard');
    } else {
      alert('Error submitting vote: ' + data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('An error occurred while submitting your vote.');
  });
}

// Function to get CSRF token from cookies
// function getCookie(name) {
//   let cookieValue = null;
//   if (document.cookie && document.cookie !== '') {
//     const cookies = document.cookie.split(';');
//     for (let i = 0; i
