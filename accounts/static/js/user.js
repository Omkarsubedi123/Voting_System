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

// Navigate to the selected page
function navigateToPage(page) {
  console.log(`Navigating to page: ${page}`);
  let content = '';

  if (page === 'dashboard') {
    content = getDashboardHTML();
    document.querySelector('.content').innerHTML = content;
    fetchVoteResults(); // Fetch and render vote results
    return;
  }
  else if (page === 'vote') {
    if (hasVoted) {
      // If user has already voted, show a message
      document.querySelector('.content').innerHTML = '<h2>You have already voted</h2><p>Each user can only vote once in this election. You can view the results on the dashboard.</p>';
      return;
    }
    
    // Show loading message while we fetch candidates
    document.querySelector('.content').innerHTML = '<h2>Loading candidates...</h2>';
    fetchCandidates();
    return; // Exit here, the content will be handled by the fetch function
  } else if (page === 'news') {
    content = '<h2>Election News</h2>';
  } else if (page === 'settings') {
    content = '<h2>Settings</h2>';
  }

  document.querySelector('.content').innerHTML = content;
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

// Render both bar chart and pie chart
function renderVoteCharts(resultsData) {
  renderBarChart(resultsData);
  renderPieChart(resultsData);
}

// Render both bar chart and pie chart
function renderVoteCharts(resultsData) {
    renderBarChart(resultsData);
    renderPieChart(resultsData);
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
            responsive: true
        }
    });
}
""// Render pie chart
function renderPieChart(resultsData) {
  const pieCtx = document.getElementById('pieChart');
  if (!pieCtx) return;

  // Process data for pie chart - we'll show total votes for each candidate per position
  const positions = Object.keys(resultsData);
  const labels = [];
  const datasets = [];

  // Create a dataset for each position
  positions.forEach(position => {
    const candidateNames = resultsData[position].map(candidate => candidate.name);
    const candidateVotes = resultsData[position].map(candidate => candidate.votes);

    datasets.push({
      label: position,
      data: candidateVotes,
      backgroundColor: candidateNames.map(() => getRandomColor())
    });

    // Add candidate names only if they're not already present
    candidateNames.forEach(name => {
      if (!labels.includes(name)) labels.push(name);
    });
  });

  new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      radius: '35%', // Make the pie smaller
      plugins: {
        title: {
          display: true,
          text: 'Votes Distribution by Candidate'
        },
        legend: {
          display: true,
          position: 'top'
        }
      }
    }
  });
}""

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
      hasVoted = true; // Update the voting status
      navigateToPage('dashboard'); // Redirect to dashboard to see results
    } else {
      alert('Failed to submit vote: ' + (data.message || ''));
    }
  })
  .catch(error => {
    console.error('Error submitting vote:', error);
    alert('Error submitting vote. Please try again.');
  });
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
          <canvas id="barChart" width="400" height="250"></canvas>
        </div>
        <div class="chart-wrapper">
          <h4>Distribution by Position (Pie Chart)</h4>
          <canvas id="pieChart" width="400" height="250"></canvas>
        </div>
      </div>
    </div>
  `;
}