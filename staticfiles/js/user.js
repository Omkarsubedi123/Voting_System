// Global variables
let currentTheme = "light";
let hasVoted = false; // Track if the user has voted

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', initApp);

// Initialize the application
function initApp() {
  // Set up event handlers
  setupEventListeners();
  
  // Check if user has already voted
  checkVoteStatus();
  
  // Load the dashboard by default
  navigateToPage('dashboard');
}

// Check if the user has already voted
function checkVoteStatus() {
  fetch('/check_vote_status/', {
    method: 'GET',
    headers: {
      'X-CSRFToken': getCookie('csrftoken')
    }
  })
  .then(response => response.json())
  .then(data => {
    hasVoted = data.hasVoted;
    if (hasVoted) {
      console.log('User has already voted');
    }
  })
  .catch(error => {
    console.error('Error checking vote status:', error);
  });
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
      navLinks.forEach(navLink => navLink.classList.remove('active'));
      
      // Add active class to clicked link
      this.classList.add('active');
      
      // Navigate to the page
      const page = this.dataset.page;
      if (page) {
        navigateToPage(page);
      }
    });
  }

  // If settings form exists in the initial page load, attach event handler
  const settingsForm = document.getElementById('settings-form');
  if (settingsForm) {
    attachSettingsFormHandler(settingsForm);
  }
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

function navigateToPage(page) {
  console.log(`Navigating to page: ${page}`);
  
  // Update page title
  document.querySelector('.page-title').textContent = capitalizeFirstLetter(page);
  
  let content = '';

  if (page === 'dashboard') {
    content = getDashboardHTML();
    document.querySelector('.content').innerHTML = content;
    fetchVoteResults(); // Fetch and render vote results
    return;
  } else if (page === 'vote') {
    if (hasVoted) {
      document.querySelector('.content').innerHTML = `
        <h2>You have already voted</h2>
        <p>Each user can only vote once in this election. You can view the results on the dashboard.</p>
      `;
      return;
    }
    document.querySelector('.content').innerHTML = '<h2>Loading candidates...</h2>';
    fetchCandidates();
    return;
  } else if (page === 'news') {
    content = getNewsHTML();
    document.querySelector('.content').innerHTML = content;
    return;
  } else if (page === 'settings') {
    // For settings page, we'll use the existing HTML structure from the page
    // and make it visible rather than trying to fetch it via AJAX
    const settingsSection = document.querySelector('.settings-section');
    if (settingsSection) {
      // Make settings section visible if it exists in the HTML
      document.querySelector('.content').innerHTML = '';
      document.querySelector('.content').appendChild(settingsSection.cloneNode(true));
      
      // Fetch user data to populate the form
      fetchUserData()
        .then(() => {
          // Attach event handler to the settings form AFTER user data is loaded
          const newSettingsForm = document.querySelector('.content #settings-form');
          if (newSettingsForm) {
            attachSettingsFormHandler(newSettingsForm);
          }
        })
        .catch(error => {
          console.error('Error loading user data:', error);
        });
    } else {
      // Fallback if settings section doesn't exist in HTML
      document.querySelector('.content').innerHTML = `
      <div class="settings-section" style="max-width: 600px; margin: auto; padding: 30px; background-color: #f8f9fa; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <div class="settings-container">
        <form method="post" class="settings-form" id="settings-form" style="padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div class="form-group" style="margin-bottom: 20px;">
            <label for="user-id" style="font-weight: bold; margin-bottom: 5px; display: block;">User ID:</label>
            <input type="text" id="user-id" value="" readonly style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; background-color: #f1f1f1;">
          </div>
          <div class="form-group" style="margin-bottom: 20px;">
            <label for="email" style="font-weight: bold; margin-bottom: 5px; display: block;">Email Address:</label>
            <input type="email" id="email" name="email" value="" required style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; background-color: #fff;">
          </div>
          <div class="form-group" style="margin-bottom: 20px;">
            <label for="dob" style="font-weight: bold; margin-bottom: 5px; display: block;">Date of Birth:</label>
            <input type="date" id="dob" name="dob" value="" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; background-color: #fff;">
          </div>
          <div class="form-group" style="margin-bottom: 20px;">
            <label for="club-id" style="font-weight: bold; margin-bottom: 5px; display: block;">Club ID:</label>
            <input type="text" id="club-id" value="LC-12345" readonly style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; background-color: #f1f1f1;">
          </div>
          <div class="form-actions" style="text-align: center; margin-top: 30px; display: flex; justify-content: space-between;">
            <!-- Save Changes Button -->
            <button type="submit" class="save-button" style="padding: 12px 30px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; width: 48%;">
              <i class="fas fa-save"></i> Save Changes
            </button>

            <form method="POST" action="{% url 'accounts:logout' %}">
            {% csrf_token %}
            <button type="submit" class="logout-button"
            style="padding: 12px 30px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; text-align: center;">
            <i class="fas fa-sign-out-alt"></i> Logout
            </button>
            </form>
    </div>
      `;
      
      // Fetch user data to populate the form
      fetchUserData()
        .then(() => {
          // Attach event handler to the settings form AFTER user data is loaded
          const newSettingsForm = document.querySelector('.content #settings-form');
          if (newSettingsForm) {
            attachSettingsFormHandler(newSettingsForm);
          }
        })
        .catch(error => {
          console.error('Error loading user data:', error);
        });
    }
    return;
  } else {
    content = '<h2>Page not found</h2>';
    document.querySelector('.content').innerHTML = content;
  }
}

// Capitalize the first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Fetch user data to populate settings form
function fetchUserData() {
  return fetch('/user_data/', {
    method: 'GET',
    headers: {
      'X-CSRFToken': getCookie('csrftoken'),
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  .then(response => response.json())
  .then(data => {
    // Populate form fields with user data
    document.getElementById('user-id').value = data.id || '';
    document.getElementById('email').value = data.email || '';
    if (data.dob) {
      document.getElementById('dob').value = data.dob;
    }
    return data; // Return data for chaining
  });
}

// News Section Rendering
function getNewsHTML() {
  return `
    <div class="news-section fade-in">
      <h2>Latest Election News</h2>
      <div class="news-grid">
        <div class="news-card">
          <div class="news-image"><img src="https://i.pinimg.com/736x/5a/6d/4a/5a6d4a56c813530643a928e972bb4012.jpg" alt="" height="180px" width="100%"></div>
          <div class="news-content">
            <div class="news-date">March 15, 2025</div>
            <h3 class="news-headline">District 306 A1 Election Results Announced</h3>
            <p class="news-excerpt">The annual district governor election concluded with record participation from club delegates...</p>
            <div class="news-author">
              <div class="author-name">By John Smith</div>
            </div>
            <a href="#" class="read-more">Read more <i class="fas fa-arrow-right"></i></a>
          </div>
        </div>

        <div class="news-card">
          <div class="news-image"><img src="https://i.pinimg.com/736x/37/a6/3b/37a63b7af7f7d7871d83b3ef2b809a31.jpg" alt="" height="180px" width="100%"></div>
          <div class="news-content">
            <div class="news-date">March 12, 2025</div>
            <h3 class="news-headline">Club Elections Schedule Released</h3>
            <p class="news-excerpt">Multiple Lions Clubs announce their election dates for the upcoming term...</p>
            <div class="news-author">
              <div class="author-name">By Sarah Johnson</div>
            </div>
            <a href="#" class="read-more">Read more <i class="fas fa-arrow-right"></i></a>
          </div>
        </div>

       <div class="news-card">
          <div class="news-image"><img src="https://i.pinimg.com/736x/39/dc/e3/39dce3424f254b2f0cbe75d37bdeadec.jpg" alt="" height="180px" width="100%"></div>
          <div class="news-content">
            <div class="news-date">April 15, 2025</div>
            <h3 class="news-headline">State Representative Elections Underway</h3>
            <p class="news-excerpt">Voters from all districts are casting their ballots to elect state representatives...</p>
            <div class="news-author">
              <div class="author-name">By Michael Smith</div>
            </div>
            <a href="#" class="read-more">Read more <i class="fas fa-arrow-right"></i></a>
          </div>
        </div>

        <div class="news-card">
          <div class="news-image"><img src="https://i.pinimg.com/736x/d3/f9/bf/d3f9bf21323397d48868c4243f42735d.jpg" alt="" height="180px" width="100%"></div>
          <div class="news-content">
            <div class="news-date">April 10, 2025</div>
            <h3 class="news-headline">Highlights from the Mayoral Debate</h3>
            <p class="news-excerpt">The mayoral debate showcased differing visions for the city's future...</p>
            <div class="news-author">
              <div class="author-name">By Emily Clark</div>
            </div>
            <a href="#" class="read-more">Read more <i class="fas fa-arrow-right"></i></a>
          </div>
        </div>

        <div class="news-card">
          <div class="news-image"><img src="https://i.pinimg.com/736x/09/d4/6a/09d46ab0dcd57db2ce16eeb147ea7dd6.jpg" alt="" height="180px" width="100%"></div>
          <div class="news-content">
            <div class="news-date">April 8, 2025</div>
            <h3 class="news-headline">Community Polls Show Strong Support for Education Reforms</h3>
            <p class="news-excerpt">Recent polls indicate strong support for educational changes among local communities...</p>
            <div class="news-author">
              <div class="author-name">By Olivia Martinez</div>
            </div>
            <a href="#" class="read-more">Read more <i class="fas fa-arrow-right"></i></a>
          </div>
        </div>
       
        <div class="news-card">
          <div class="news-image"><img src="https://i.pinimg.com/736x/86/a6/b6/86a6b6726cdc203203977feedf2374cd.jpg" alt="" height="180px" width="100%"></div>
          <div class="news-content">
            <div class="news-date">April 5, 2025</div>
            <h3 class="news-headline">Environmental Policies Take Center Stage in Local Elections</h3>
            <p class="news-excerpt">Candidates focus on environmental issues, promising greener policies if elected...</p>
            <div class="news-author">
              <div class="author-name">By Daniel Nguyen</div>
            </div>
            <a href="#" class="read-more">Read more <i class="fas fa-arrow-right"></i></a>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Fetch vote results and render charts
function fetchVoteResults() {
  fetch('/vote_results/', {
    method: 'GET',
    headers: {
      'X-CSRFToken': getCookie('csrftoken')
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('Vote results data:', data);
    renderVoteCharts(data);
  })
  .catch(error => {
    console.error('Error fetching vote results:', error);
    document.getElementById('vote-results').innerHTML = '<p>Error loading vote results. Please try again later.</p>';
  });
}

// Render bar chart and other charts
function renderVoteCharts(resultsData) {
  renderBarChart(resultsData);
}

// Render bar chart
function renderBarChart(resultsData) {
  const barCtx = document.getElementById('barChart');
  if (!barCtx) return;
  
  // Adjust canvas size for a more compact display
  barCtx.width = 100;   // Reduced width
  barCtx.height = 50;  // Reduced height

  // Process data for chart
  const positions = Object.keys(resultsData);
  const datasets = [];
  const candidateNames = []; // Collect candidate names

  // Check if we have data to display
  if (positions.length === 0) {
    document.getElementById('vote-results').innerHTML += '<p>No voting data available yet.</p>';
    return;
  }

  // Create datasets for each position
  positions.forEach(position => {
    const candidateVotes = [];

    resultsData[position].forEach(candidate => {
      if (!candidateNames.includes(candidate.name)) {
        candidateNames.push(candidate.name); // Ensure unique names
      }
      candidateVotes.push(candidate.votes);
    });

    // Create a dataset for this position
    datasets.push({
      label: position,
      data: candidateVotes,
      backgroundColor: getRandomColor(),
      categoryPercentage: 0.5,
      barPercentage: 0.5
    });
  });

  new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: candidateNames, // Add labels correctly
      datasets: datasets
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          precision: 0
        }
      }
    }
  });
}

// Helper function to generate random colors
function getRandomColor() {
  const colors = [
    '#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', 
    '#3F51B5', '#00BCD4', '#009688', '#FFEB3B', '#795548'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Updated function to fetch candidates with proper URL and debugging
function fetchCandidates() {
  console.log('Fetching candidates...');

  fetch('/candidates_json/', {
    method: 'GET',
    headers: {
      'X-CSRFToken': getCookie('csrftoken')
    }
  })
  .then(response => {
    console.log('Response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Candidate data received:', data);

    if (data.error) {
      throw new Error(data.error);
    }

    // Check if data is empty array
    if (Array.isArray(data) && data.length === 0) {
      document.querySelector('.content').innerHTML = '<h2>No candidates found.</h2>';
      return;
    }

    let candidateHTML = '<h2>Vote Section</h2>';

    // Group candidates by position
    const positions = {};
    data.forEach(candidate => {
      if (!positions[candidate.position]) {
        positions[candidate.position] = [];
      }
      positions[candidate.position].push(candidate);
    });

    // Create HTML for each position
    Object.keys(positions).forEach(position => {
      candidateHTML += `<div class="position-group"><h3>${position}</h3>`;
      
      positions[position].forEach(candidate => {
        candidateHTML += `
          <div class="candidate-card">
            <h4>${candidate.name}</h4>
            <p><strong>Membership:</strong> ${candidate.membership}</p>
            <p><strong>Position:</strong> ${candidate.position}</p>
            ${candidate.description ? `<p><strong>Description:</strong> ${candidate.description}</p>` : ''}
            <div class="vote-option">
              <input type="radio" name="${position}" id="candidate-${candidate.id}" value="${candidate.id}">
              <button class="vote-button" data-candidate-id="${candidate.id}">
                <i class="fas fa-check-circle"></i> Vote
              </button>
            </div>
          </div>
        `;
      });

      candidateHTML += '</div>';
    });

    candidateHTML += `<button class="vote-submit-button">Submit Vote</button>`;
    document.querySelector('.content').innerHTML = candidateHTML;

    // Set up event handlers for the newly created buttons
    setupCandidateEvents();
  })
  .catch(error => {
    console.error('Error fetching candidates:', error);
    document.querySelector('.content').innerHTML = `<h2>Error loading candidates.</h2><p>${error.message}</p>`;
  });
}

// Separate function for setting up candidate-specific events
function setupCandidateEvents() {
  // Handle vote button clicks
  document.querySelectorAll('.vote-button').forEach(button => {
    button.addEventListener('click', function() {
      const candidateCard = this.closest('.candidate-card');
      if (candidateCard) {
        toggleVoteSelection(candidateCard);
      }
    });
  });

  // Handle submit button click
  const submitButton = document.querySelector('.vote-submit-button');
  if (submitButton) {
    submitButton.addEventListener('click', submitVote);
  }
}

// Improved toggleVoteSelection function
function toggleVoteSelection(candidateCard) {
  const radioInput = candidateCard.querySelector('input[type="radio"]');
  if (!radioInput) return;

  // Mark the radio as checked
  radioInput.checked = true;

  // Find all vote buttons within the same position group
  const positionGroup = candidateCard.closest('.position-group');
  positionGroup.querySelectorAll('.vote-button').forEach(btn => {
    btn.classList.remove('voted');
    btn.innerHTML = '<i class="fas fa-check-circle"></i> Vote';
  });

  const voteButton = candidateCard.querySelector('.vote-button');
  if (voteButton) {
    voteButton.classList.add('voted');
    voteButton.innerHTML = '<i class="fas fa-check-circle"></i> Voted';
  }
}

// Improved submitVote function
function submitVote() {
  const selectedCandidates = document.querySelectorAll('input[type="radio"]:checked');
  const voteData = {};

  if (selectedCandidates.length === 0) {
    alert('Please select at least one candidate.');
    return;
  }

  selectedCandidates.forEach(input => {
    const position = input.name;
    voteData[position] = input.value;
  });

  console.log('Submitting votes:', voteData);

  fetch('/submit_vote/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify({ candidates: voteData })
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      alert('Vote submitted successfully!');
      hasVoted = true;
      navigateToPage('vote'); // Redirect to vote page instead of dashboard
    } else {
      alert('Failed to submit vote: ' + (data.message || ''));
    }
  })
  .catch(error => {
    console.error('Error submitting vote:', error);
    alert('Error submitting vote. Please try again.');
  });
}

// Attach event handler to settings form
function attachSettingsFormHandler(form) {
  // Remove any existing event listeners (to prevent duplicates)
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  
  newForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect form data
    const settings = {
      email: document.getElementById('email').value,
      dob: document.getElementById('dob').value,
      club_id: document.getElementById('club-id') ? document.getElementById('club-id').value : 'LC-12345'
    };
    
    console.log('Submitting settings:', settings);
    
    // Send form data via fetch API
    fetch('/api/settings/', {
      method: 'POST',
      body: JSON.stringify(settings),
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const msgDiv = document.getElementById('settings-message');
      msgDiv.innerHTML = '';
      const alert = document.createElement('div');
      alert.className = data.status === 'success' ? 'alert-success' : 'alert-error';
      alert.textContent = data.message;
      msgDiv.appendChild(alert);
      setTimeout(() => alert.remove(), 3000);
    })
    .catch(error => {
      console.error('Error saving settings:', error);
      const msgDiv = document.getElementById('settings-message');
      msgDiv.innerHTML = '<div class="alert-error">Error updating settings. Please try again.</div>';
    });
  });
  
  return newForm; // Return the new form element
}

// Get CSRF Token
function getCookie(name) {
  const cookies = document.cookie.split(';').map(cookie => cookie.trim());
  const csrfToken = cookies.find(cookie => cookie.startsWith(`${name}=`));
  return csrfToken ? csrfToken.split('=')[1] : null;
}

// Updated Dashboard Content
function getDashboardHTML() {
  return `
    <h2>Dashboard Overview</h2>
    <p>Welcome to the VoteTracker dashboard!</p>
    <div id="vote-results">
      <h3>Live Voting Results</h3>
      <div class="chart-container">
        <div class="chart-wrapper">
          <h4>Results by Candidate (Bar Chart)</h4>
          <canvas id="barChart" width="200" height="50"></canvas>
        </div>
      </div>
    </div>
  `;
}