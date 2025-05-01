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
  
  alert('Thank you! Your vote has been submitted successfully.');
  navigateToPage('dashboard');
}

// Setup event listeners for settings page
function setupSettingsEventListeners() {
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.addEventListener('change', function() {
      const theme = this.value;
      
      if (theme === 'dark' && currentTheme === 'light') {
        toggleTheme();
      } else if (theme === 'light' && currentTheme === 'dark') {
        toggleTheme();
      }
    });
  }
}

// HTML Templates for each page
function getDashboardHTML() {
  return `
    <div class="fade-in">
      <div class="time-remaining">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Time Remaining</h2>
            <button class="btn btn-primary btn-sm refresh-time" aria-label="Refresh time">
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
          <div class="card-body" style="min-height: 60px; justify-content: flex-start;">
            <h2>48h 30m</h2>
          </div>
        </div>
      </div>
      
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Voting Statistics</h2>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <div class="bar-chart">
                <div class="bar-container">
                  <div class="bar-value">65%</div>
                  <div class="bar" style="height: 130px;"></div>
                  <div class="bar-label">District 1</div>
                </div>
                <div class="bar-container">
                  <div class="bar-value">42%</div>
                  <div class="bar" style="height: 84px;"></div>
                  <div class="bar-label">District 2</div>
                </div>
                <div class="bar-container">
                  <div class="bar-value">78%</div>
                  <div class="bar" style="height: 156px;"></div>
                  <div class="bar-label">District 3</div>
                </div>
                <div class="bar-container">
                  <div class="bar-value">51%</div>
                  <div class="bar" style="height: 102px;"></div>
                  <div class="bar-label">District 4</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Vote Distribution</h2>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <div class="pie-chart"></div>
              <div class="chart-legend">
                <div class="legend-item">
                  <div class="legend-color" style="background-color: var(--primary-color);"></div>
                  <span>Candidate A (25%)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: var(--success-color);"></div>
                  <span>Candidate B (30%)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: var(--warning-color);"></div>
                  <span>Candidate C (20%)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background-color: var(--danger-color);"></div>
                  <span>Candidate D (25%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Latest Election News</h2>
        </div>
        <div class="card-body" style="height: auto;">
          <ul class="news-list">
            <li class="news-item">
              <h3 class="news-title">New Polling Stations Announced</h3>
              <div class="news-meta">
                <span class="news-time">Updated 2 hours ago</span>
              </div>
            </li>
            <li class="news-item">
              <h3 class="news-title">Voter ID Verification Process Changes</h3>
              <div class="news-meta">
                <span class="news-time">Updated 5 hours ago</span>
              </div>
            </li>
            <li class="news-item">
              <h3 class="news-title">Election Date Confirmation</h3>
              <div class="news-meta">
                <span class="news-time">Updated 8 hours ago</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

function getVoteSectionHTML() {
  return `
    <div class="vote-section fade-in">
      <div class="voting-instructions">
        <h2>Lion's Club Elections 2025</h2>
        <p>Please select at least 4 candidates. You can vote for one candidate per position.</p>
      </div>
      
      <div class="position-section">
        <h3 class="position-title">Club President</h3>
        <div class="candidates-grid">
          <div class="candidate-card">
            <div class="candidate-header">
              <div class="candidate-avatar">
                <svg viewBox="0 0 50 50" width="50" height="50">
                  <circle cx="25" cy="20" r="10" fill="#ccc" />
                  <path d="M10,50 V40 C10,35 20,30 25,30 C30,30 40,35 40,40 V50" fill="#ccc" />
                </svg>
              </div>
              <div class="candidate-info">
                <h4 class="candidate-name">Bibidh</h4>
                <div class="candidate-years">15 Years Member</div>
              </div>
              <div class="candidate-radio">
                <input type="radio" name="president" id="president-1">
              </div>
            </div>
            <div class="manifesto">
              <h5 class="manifesto-title">Manifesto:</h5>
              <ul class="manifesto-list">
                <li class="manifesto-item">Expand community outreach</li>
                <li class="manifesto-item">Healthcare initiatives</li>
                <li class="manifesto-item">Youth mentoring programs</li>
              </ul>
            </div>
            <button class="vote-button">
              <i class="fas fa-check-circle"></i> Vote
            </button>
          </div>
          
          <div class="candidate-card">
            <div class="candidate-header">
              <div class="candidate-avatar">
                <svg viewBox="0 0 50 50" width="50" height="50">
                  <circle cx="25" cy="20" r="10" fill="#ccc" />
                  <path d="M10,50 V40 C10,35 20,30 25,30 C30,30 40,35 40,40 V50" fill="#ccc" />
                </svg>
              </div>
              <div class="candidate-info">
                <h4 class="candidate-name">Sikha</h4>
                <div class="candidate-years">12 Years Member</div>
              </div>
              <div class="candidate-radio">
                <input type="radio" name="president" id="president-2">
              </div>
            </div>
            <div class="manifesto">
              <h5 class="manifesto-title">Manifesto:</h5>
              <ul class="manifesto-list">
                <li class="manifesto-item">Global service initiatives</li>
                <li class="manifesto-item">Membership growth</li>
                <li class="manifesto-item">Technology modernization</li>
              </ul>
            </div>
            <button class="vote-button">
              <i class="fas fa-check-circle"></i> Vote
            </button>
          </div>
        </div>
      </div>
      
      <div class="position-section">
        <h3 class="position-title">Club Vice President</h3>
        <div class="candidates-grid">
          <div class="candidate-card">
            <div class="candidate-header">
              <div class="candidate-avatar">
                <svg viewBox="0 0 50 50" width="50" height="50">
                  <circle cx="25" cy="20" r="10" fill="#ccc" />
                  <path d="M10,50 V40 C10,35 20,30 25,30 C30,30 40,35 40,40 V50" fill="#ccc" />
                </svg>
              </div>
              <div class="candidate-info">
                <h4 class="candidate-name">Shirish</h4>
                <div class="candidate-years">10 Years Member</div>
              </div>
              <div class="candidate-radio">
                <input type="radio" name="vicepresident" id="vp-1">
              </div>
            </div>
            <div class="manifesto">
              <h5 class="manifesto-title">Manifesto:</h5>
              <ul class="manifesto-list">
                <li class="manifesto-item">Education support programs</li>
                <li class="manifesto-item">Senior citizen welfare</li>
                <li class="manifesto-item">Community health camps</li>
              </ul>
            </div>
            <button class="vote-button">
              <i class="fas fa-check-circle"></i> Vote
            </button>
          </div>
          
          <div class="candidate-card">
            <div class="candidate-header">
              <div class="candidate-avatar">
                <svg viewBox="0 0 50 50" width="50" height="50">
                  <circle cx="25" cy="20" r="10" fill="#ccc" />
                  <path d="M10,50 V40 C10,35 20,30 25,30 C30,30 40,35 40,40 V50" fill="#ccc" />
                </svg>
              </div>
              <div class="candidate-info">
                <h4 class="candidate-name">Ananta</h4>
                <div class="candidate-years">8 Years Member</div>
              </div>
              <div class="candidate-radio">
                <input type="radio" name="vicepresident" id="vp-2">
              </div>
            </div>
            <div class="manifesto">
              <h5 class="manifesto-title">Manifesto:</h5>
              <ul class="manifesto-list">
                <li class="manifesto-item">Disaster relief programs</li>
                <li class="manifesto-item">Youth leadership development</li>
                <li class="manifesto-item">Local business support</li>
              </ul>
            </div>
            <button class="vote-button">
              <i class="fas fa-check-circle"></i> Vote
            </button>
          </div>
        </div>
      </div>
      
      <div class="position-section">
        <h3 class="position-title">Club Secretary</h3>
        <div class="candidates-grid">
          <div class="candidate-card">
            <div class="candidate-header">
              <div class="candidate-avatar">
                <svg viewBox="0 0 50 50" width="50" height="50">
                  <circle cx="25" cy="20" r="10" fill="#ccc" />
                  <path d="M10,50 V40 C10,35 20,30 25,30 C30,30 40,35 40,40 V50" fill="#ccc" />
                </svg>
              </div>
              <div class="candidate-info">
                <h4 class="candidate-name">Binisha</h4>
                <div class="candidate-years">7 Years Member</div>
              </div>
              <div class="candidate-radio">
                <input type="radio" name="secretary" id="secretary-1">
              </div>
            </div>
            <div class="manifesto">
              <h5 class="manifesto-title">Manifesto:</h5>
              <ul class="manifesto-list">
                <li class="manifesto-item">Digital transformation</li>
                <li class="manifesto-item">Member communication</li>
                <li class="manifesto-item">Documentation efficiency</li>
              </ul>
            </div>
            <button class="vote-button">
              <i class="fas fa-check-circle"></i> Vote
            </button>
          </div>
          
          <div class="candidate-card">
            <div class="candidate-header">
              <div class="candidate-avatar">
                <svg viewBox="0 0 50 50" width="50" height="50">
                  <circle cx="25" cy="20" r="10" fill="#ccc" />
                  <path d="M10,50 V40 C10,35 20,30 25,30 C30,30 40,35 40,40 V50" fill="#ccc" />
                </svg>
              </div>
              <div class="candidate-info">
                <h4 class="candidate-name">Omkar</h4>
                <div class="candidate-years">9 Years Member</div>
              </div>
              <div class="candidate-radio">
                <input type="radio" name="secretary" id="secretary-2">
              </div>
            </div>
            <div class="manifesto">
              <h5 class="manifesto-title">Manifesto:</h5>
              <ul class="manifesto-list">
                <li class="manifesto-item">Streamlined reporting</li>
                <li class="manifesto-item">Project documentation</li>
                <li class="manifesto-item">International coordination</li>
              </ul>
            </div>
            <button class="vote-button">
              <i class="fas fa-check-circle"></i> Vote
            </button>
          </div>
        </div>
      </div>
      
      <div class="position-section">
        <h3 class="position-title">Club Treasurer</h3>
        <div class="candidates-grid">
          <div class="candidate-card">
            <div class="candidate-header">
              <div class="candidate-avatar">
                <svg viewBox="0 0 50 50" width="50" height="50">
                  <circle cx="25" cy="20" r="10" fill="#ccc" />
                  <path d="M10,50 V40 C10,35 20,30 25,30 C30,30 40,35 40,40 V50" fill="#ccc" />
                </svg>
              </div>
              <div class="candidate-info">
                <h4 class="candidate-name">Hero</h4>
                <div class="candidate-years">11 Years Member</div>
              </div>
              <div class="candidate-radio">
                <input type="radio" name="treasurer" id="treasurer-1">
              </div>
            </div>
            <div class="manifesto">
              <h5 class="manifesto-title">Manifesto:</h5>
              <ul class="manifesto-list">
                <li class="manifesto-item">Financial transparency</li>
                <li class="manifesto-item">Fundraising initiatives</li>
                <li class="manifesto-item">Project budgeting</li>
              </ul>
            </div>
            <button class="vote-button">
              <i class="fas fa-check-circle"></i> Vote
            </button>
          </div>
          
          <div class="candidate-card">
            <div class="candidate-header">
              <div class="candidate-avatar">
                <svg viewBox="0 0 50 50" width="50" height="50">
                  <circle cx="25" cy="20" r="10" fill="#ccc" />
                  <path d="M10,50 V40 C10,35 20,30 25,30 C30,30 40,35 40,40 V50" fill="#ccc" />
                </svg>
              </div>
              <div class="candidate-info">
                <h4 class="candidate-name">Zero</h4>
                <div class="candidate-years">6 Years Member</div>
              </div>
              <div class="candidate-radio">
                <input type="radio" name="treasurer" id="treasurer-2">
              </div>
            </div>
            <div class="manifesto">
              <h5 class="manifesto-title">Manifesto:</h5>
              <ul class="manifesto-list">
                <li class="manifesto-item">Digital payment systems</li>
                <li class="manifesto-item">Grant applications</li>
                <li class="manifesto-item">Financial planning</li>
              </ul>
            </div>
            <button class="vote-button">
              <i class="fas fa-check-circle"></i> Vote
            </button>
          </div>
        </div>
      </div>
      
      <button class="vote-submit-button">Submit Vote</button>
    </div>
  `;
}

function getNewsHTML() {
  return `
    <div class="news-section fade-in">
      <h2>Latest Election News</h2>
      
      <div class="news-grid">
        <div class="news-card">
          <div class="news-image">District Election Coverage Image</div>
          <div class="news-content">
            <div class="news-date">March 15, 2025</div>
            <h3 class="news-headline">District 306 A1 Election Results Announced</h3>
            <p class="news-excerpt">The annual district governor election concluded with record participation from club delegates...</p>
            <div class="news-author">
              <div class="author-image"></div>
              <div class="author-name">By John Smith</div>
            </div>
            <a href="#" class="read-more">Read more <i class="fas fa-arrow-right"></i></a>
          </div>
        </div>
        
        <div class="news-card">
          <div class="news-image">Club Elections Image</div>
          <div class="news-content">
            <div class="news-date">March 12, 2025</div>
            <h3 class="news-headline">Club Elections Schedule Released</h3>
            <p class="news-excerpt">Multiple Lions Clubs announce their election dates for the upcoming term...</p>
            <div class="news-author">
              <div class="author-image"></div>
              <div class="author-name">By Sarah Johnson</div>
            </div>
            <a href="#" class="read-more">Read more <i class="fas fa-arrow-right"></i></a>
          </div>
        </div>
        
        <div class="news-card">
          <div class="news-image">Nomination Process Image</div>
          <div class="news-content">
            <div class="news-date">March 10, 2025</div>
            <h3 class="news-headline">Nomination Process Begins for District Offices</h3>
            <p class="news-excerpt">District leadership positions open for nominations with new digital submission system...</p>
            <div class="news-author">
              <div class="author-image"></div>
              <div class="author-name">By Mike Wilson</div>
            </div>
            <a href="#" class="read-more">Read more <i class="fas fa-arrow-right"></i></a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function getSettingsHTML() {
  return `
    <div class="settings-section fade-in">
      <div class="settings-card">
        <div class="settings-header">
          <h2 class="settings-title">Account Settings</h2>
        </div>
        <div class="settings-form">
          <div class="form-group">
            <label class="form-label" for="display-name">Display Name</label>
            <input type="text" id="display-name" class="form-input" value="User">
          </div>
          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input type="email" id="email" class="form-input" value="user@example.com">
          </div>
          <div class="form-group">
            <label class="form-label" for="club-id">Club ID</label>
            <input type="text" id="club-id" class="form-input" value="LC-12345" disabled>
          </div>
        </div>
      </div>
      
      <div class="settings-card">
        <div class="settings-header">
          <h2 class="settings-title">Notification Settings</h2>
        </div>
        <div class="settings-form">
          <div class="form-group" style="flex-direction: row; justify-content: space-between; align-items: center;">
            <label class="form-label">Email Notifications</label>
            <label class="toggle-switch">
              <input type="checkbox" checked>
              <span class="slider"></span>
            </label>
          </div>
          <div class="form-group" style="flex-direction: row; justify-content: space-between; align-items: center;">
            <label class="form-label">Election Reminders</label>
            <label class="toggle-switch">
              <input type="checkbox" checked>
              <span class="slider"></span>
            </label>
          </div>
          <div class="form-group" style="flex-direction: row; justify-content: space-between; align-items: center;">
            <label class="form-label">News Updates</label>
            <label class="toggle-switch">
              <input type="checkbox">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>
      
      <div class="settings-card">
        <div class="settings-header">
          <h2 class="settings-title">Theme Settings</h2>
        </div>
        <div class="settings-form">
          <div class="form-group">
            <label class="form-label" for="theme-select">Theme</label>
            <select id="theme-select" class="form-select">
              <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>Light</option>
              <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>Dark</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="settings-actions">
        <button class="btn btn-primary">Save Changes</button>
      </div>
    </div>
  `;
}