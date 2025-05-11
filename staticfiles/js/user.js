// Global variables
let currentTheme = "light";

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  fetchVoteData();
});

// Initialize the application
function initApp() {
  setupEventListeners();
  navigateToPage('dashboard');
}

// Setup event listeners
function setupEventListeners() {
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  const navLinks = document.querySelectorAll('.nav-link');
  for (const link of navLinks) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      navLinks.forEach(navLink => navLink.classList.remove('active'));
      this.classList.add('active');
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
    if (themeIcon) themeIcon.className = "fas fa-sun";
  } else {
    htmlElement.setAttribute("data-theme", "light");
    currentTheme = "light";
    if (themeIcon) themeIcon.className = "fas fa-moon";
  }
}

// Navigate to the selected page
function navigateToPage(page) {
  console.log(`Navigating to page: ${page}`);
  let content = '';

  if (page === 'dashboard') {
    content = getDashboardHTML(); // Assume this function is defined elsewhere
    document.querySelector('.content').innerHTML = content;
  } else if (page === 'vote') {
    document.querySelector('.content').innerHTML = '<h2>Loading candidates...</h2>';
    fetchCandidates();
  } else if (page === 'news') {
    document.querySelector('.content').innerHTML = '<h2>Election News</h2>';
  } else if (page === 'settings') {
    document.querySelector('.content').innerHTML = '<h2>Settings</h2>';
  }
}

// Fetch candidates and render them
function fetchCandidates() {
  console.log('Fetching candidates...');

  fetch('/candidates_json/', {
    method: 'GET',
    headers: {
      'X-CSRFToken': getCookie('csrftoken')
    }
  })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      if (data.error) throw new Error(data.error);
      if (Array.isArray(data) && data.length === 0) {
        document.querySelector('.content').innerHTML = '<h2>No candidates found.</h2>';
        return;
      }

      let candidateHTML = '<h2>Vote Section</h2>';
      const positions = {};

      data.forEach(candidate => {
        if (!positions[candidate.position]) positions[candidate.position] = [];
        positions[candidate.position].push(candidate);
      });

      Object.keys(positions).forEach(position => {
        candidateHTML += `<div class="position-group"><h3>${position}</h3>`;
        positions[position].forEach(candidate => {
          candidateHTML += `
            <div class="candidate-card">
              <h4>${candidate.name}</h4>
              ${candidate.image ? `<img src="${candidate.image}" alt="${candidate.name}" class="candidate-image">` : ''}
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
      setupCandidateEvents();
    })
    .catch(error => {
      console.error('Error fetching candidates:', error);
      document.querySelector('.content').innerHTML = `<h2>Error loading candidates.</h2><p>${error.message}</p>`;
    });
}

// Set up candidate-specific events
function setupCandidateEvents() {
  const voteButtons = document.querySelectorAll('.vote-button');
  voteButtons.forEach(button => {
    button.addEventListener('click', function () {
      const candidateCard = this.closest('.candidate-card');
      if (candidateCard) toggleVoteSelection(candidateCard);
    });
  });

  const submitButton = document.querySelector('.vote-submit-button');
  if (submitButton) {
    submitButton.addEventListener('click', submitVote);
  }
}

// Toggle vote selection UI
function toggleVoteSelection(candidateCard) {
  const radioInput = candidateCard.querySelector('input[type="radio"]');
  if (!radioInput) return;

  radioInput.checked = true;

  const positionGroup = candidateCard.closest('.position-group');
  const allButtons = positionGroup.querySelectorAll('.vote-button');

  allButtons.forEach(btn => {
    btn.classList.remove('voted');
    btn.innerHTML = '<i class="fas fa-check-circle"></i> Vote';
  });

  const voteButton = candidateCard.querySelector('.vote-button');
  if (voteButton) {
    voteButton.classList.add('voted');
    voteButton.innerHTML = '<i class="fas fa-check-circle"></i> Voted';
  }
}

// Submit selected votes
function submitVote() {
  fetch('/submit_vote/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify({ candidates: getSelectedVotes() })
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        alert('Vote recorded successfully');
        fetchVoteData();
        navigateToPage('dashboard');
      } else {
        alert('Error submitting vote: ' + (data.message || 'Unknown error'));
      }
    })
    .catch(error => alert('An error occurred while submitting your vote.'));
}

// Get selected votes
function getSelectedVotes() {
  const selectedCandidates = document.querySelectorAll('input[type="radio"]:checked');
  const voteData = {};
  selectedCandidates.forEach(input => {
    voteData[input.name] = input.value;
  });
  return voteData;
}

// Get CSRF token
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// React chart imports
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ReactDOM from 'react-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Fetch vote data and render charts
function fetchVoteData() {
  fetch('/get_votes/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
    },
  })
    .then(response => response.json())
    .then(data => {
      renderBarChart(data);
    })
    .catch(error => console.error('Error fetching vote data:', error));
}

// Render charts using React and Recharts
function renderBarChart(resultsData) {
  const pieContainer = document.getElementById('pie-chart');
  const barContainer = document.getElementById('bar-chart');

  Object.keys(resultsData).forEach(position => {
    const voteData = resultsData[position];

    if (!Array.isArray(voteData)) {
      console.error(`Expected an array for position "${position}", but got:`, voteData);
      return;
    }

    const pieChart = (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={voteData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
            {voteData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );

    const barChart = (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={voteData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    );

    if (pieContainer) ReactDOM.render(pieChart, pieContainer);
    if (barContainer) ReactDOM.render(barChart, barContainer);
  });
}
