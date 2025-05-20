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
      hasVoted = data.has_voted;
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
    link.addEventListener('click', function (e) {
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

  // First, toggle the theme in the UI
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

  // Then, update the user preference on the server
  fetch('/toggle_theme/', {
    method: 'GET',
    headers: {
      'X-CSRFToken': getCookie('csrftoken')
    }
  })
    .then(response => response.json())
    .then(data => {
      console.log('Theme updated on server:', data.theme);
    })
    .catch(error => {
      console.error('Error updating theme:', error);
    });
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
        <a href="${homeUrl}" id="logoutButton" class="logout-button" style="padding: 12px 30px; background-color: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; text-decoration: none; display: inline-block; text-align: center; width: 48%;">
              <i class="fas fa-sign-out-alt"></i> Logout
            </a>
      </div>
    </form>
    <div id="settings-message" style="text-align: center; margin-top: 15px; font-size: 14px; color: #28a745;"></div>
    </div>
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

          // Add logout button handler
          const logoutButton = document.getElementById('logoutButton');
          if (logoutButton) {
            logoutButton.addEventListener('click', function (e) {
              e.preventDefault();
              window.location.href = '/logout/';
            });
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
            <h3 class="news-headline">Historic Voter Turnout in Greenwood High's Student Council Elections</h3>
            <p class="news-excerpt">Greenwood High celebrated a record-breaking student turnout during its annual student council elections held this Friday. More than 85% of the student body participated in the vote — a historic milestone in the school's democratic history.</p>
            <div class="news-author">
              <div class="author-image">
                <img src="https://i.pinimg.com/736x/8d/95/03/8d9503a77e4c21ebf0ced6c252819a0e.jpg" alt="" height="30px" width="30px" style="border-radius: 50%;" />
              </div>
              <div class="author-name">By John Smith</div>
            </div>
          </div>
        </div>

        <div class="news-card">
          <div class="news-image"><img src="https://i.pinimg.com/736x/37/a6/3b/37a63b7af7f7d7871d83b3ef2b809a31.jpg" alt="" height="180px" width="100%"></div>
          <div class="news-content">
            <div class="news-date">March 12, 2025</div>
            <h3 class="news-headline">Club Elections Schedule Released</h3>
            <p class="news-excerpt">Tensions are rising at Oakwood Academy following an incident where several campaign posters were vandalized just days before the student government elections. Posters for candidate Rachel Adams were reportedly torn down or defaced in multiple school hallways.</p>
            <div class="news-author">
              <div class="author-image">
                <img src="https://i.pinimg.com/736x/94/3e/46/943e468e2193f42206c4640dfec13ea4.jpg" alt="" height="30px" width="30px" style="border-radius: 50%;" />
              </div>
              <div class="author-name">By Sarah Johnson</div>
            </div>
          </div>
        </div>

        <div class="news-card">
          <div class="news-image"><img src="https://i.pinimg.com/736x/39/dc/e3/39dce3424f254b2f0cbe75d37bdeadec.jpg" alt="" height="180px" width="100%"></div>
          <div class="news-content">
            <div class="news-date">March 10, 2025</div>
            <h3 class="news-headline">Nomination Process Begins for District Offices</h3>
            <p class="news-excerpt">In a first for Westbridge High, students from the computer science club launched a custom-built voting app for the school's elections this year. The app, named "VoteMate," allowed students to cast their votes using school-issued tablets or their personal phones.</p>
            <div class="news-author">
              <div class="author-image">
                <img src="https://i.pinimg.com/736x/cf/d4/13/cfd413c84851920d5dbc820610176e41.jpg" alt="" height="30px" width="30px" style="border-radius: 50%;" />
              </div>
              <div class="author-name">By Mike Wilson</div>
            </div>
          </div>
        </div>

        <div class="news-card">
          <div class="news-image"><img src="https://i.pinimg.com/736x/d3/f9/bf/d3f9bf21323397d48868c4243f42735d.jpg" alt="" height="180px" width="100%"></div>
          <div class="news-content">
            <div class="news-date">March 10, 2025</div>
            <h3 class="news-headline">Twin Sisters Go Head-to-Head for Student President at Ridgeview Secondary</h3>
            <p class="news-excerpt">For the first time in Ridgeview Secondary's history, twin sisters Emma and Emily Walters ran against each other for the position of student body president. The two seniors, known for their leadership in school clubs and sports, drew large crowds to their debates and campaign rallies.</p>
            <div class="news-author">
              <div class="author-image">
                <img src="https://i.pinimg.com/736x/8d/95/03/8d9503a77e4c21ebf0ced6c252819a0e.jpg" alt="" height="30px" width="30px" style="border-radius: 50%;" />
              </div>
              <div class="author-name">By Mike Wilson</div>
            </div>
          </div>
        </div>

        <div class="news-card">
          <div class="news-image"><img src="https://i.pinimg.com/736x/09/d4/6a/09d46ab0dcd57db2ce16eeb147ea7dd6.jpg" alt="" height="180px" width="100%"></div>
          <div class="news-content">
            <div class="news-date">March 10, 2025</div>
            <h3 class="news-headline">Student Journalist Uncovers Campaign Funding Discrepancies at Lincoln Prep</h3>
            <p class="news-excerpt">A student reporter at Lincoln Preparatory School has sparked debate after publishing an article revealing discrepancies in campaign funding among student council candidates. Writing for The Lion's Roar, junior Jamie Chen detailed how some candidates received large donations from student clubs and parents.</p>
            <div class="news-author">
              <div class="author-image">
                <img src="https://i.pinimg.com/736x/47/91/f0/4791f027dcad85f85883359daf191c5d.jpg" alt="" height="30px" width="30px" style="border-radius: 50%;" />
              </div>
              <div class="author-name">By Mike Wilson</div>
            </div>
          </div>
        </div>

        <div class="news-card">
          <div class="news-image"><img src="https://i.pinimg.com/736x/86/a6/b6/86a6b6726cdc203203977feedf2374cd.jpg" alt="" height="180px" width="100%"></div>
          <div class="news-content">
            <div class="news-date">March 10, 2025</div>
            <h3 class="news-headline">Sophomore Surprise: 10th Grader Wins Student Council President at Northdale High</h3>
            <p class="news-excerpt">In an unexpected outcome at Northdale High, sophomore Ethan Monroe won the student body presidency, defeating two seniors and a junior in the running. Known for his role in the environmental club and morning announcements, Monroe built a grassroots campaign focused on sustainability and student wellness.</p>
            <div class="news-author">
              <div class="author-image">
                <img src="https://i.pinimg.com/736x/8d/95/03/8d9503a77e4c21ebf0ced6c252819a0e.jpg" alt="" height="30px" width="30px" style="border-radius: 50%;" />
              </div>
              <div class="author-name">By Mike Wilson</div>
            </div>
          </div>
        </div>
        
        <div class="news-card">
          <div class="news-image"><img src="https://i.pinimg.com/736x/56/a5/ed/56a5eda64fdb2e4aa0f64ca47b33210e.jpg" alt="" height="180px" width="100%"></div>
          <div class="news-content">
            <div class="news-date">March 10, 2025</div>
            <h3 class="news-headline">Debate Night Gets Heated at Brookside School Council Forum</h3>
            <p class="news-excerpt">What was supposed to be a civil exchange of ideas turned intense at Brookside High's student council debate night. Four candidates for president took the stage in front of a packed auditorium, but tensions rose as policies were challenged and personal remarks were exchanged.</p>
            <div class="news-author">
              <div class="author-image">
                <img src="https://i.pinimg.com/736x/20/ec/44/20ec449b3a7074fc5ea89cc8debcb68d.jpg" alt="" height="30px" width="30px" style="border-radius: 50%;" />
              </div>
              <div class="author-name">By Mike Wilson</div>
            </div>
          </div>
        </div>

        <div class="news-card">
          <div class="news-image"><img src="https://i.pinimg.com/736x/38/94/9a/38949a1bd89eeb1c5f1c2647fcea4b0b.jpg" alt="" height="180px" width="100%"></div>
          <div class="news-content">
            <div class="news-date">March 10, 2025</div>
            <h3 class="news-headline">Newcomer Candidate Brings Inclusive Vision to Eastview High Election</h3>
            <p class="news-excerpt">First-time candidate Malik Johnson is gaining traction in Eastview High's student council race, bringing forward a message of inclusion and accessibility. A junior transfer student, Malik has quickly made an impression by proposing initiatives that cater to underrepresented groups on campus.</p>
            <div class="news-author">
              <div class="author-image">
                <img src="https://i.pinimg.com/736x/8d/95/03/8d9503a77e4c21ebf0ced6c252819a0e.jpg" alt="" height="30px" width="30px" style="border-radius: 50%;">
              </div>
              <div class="author-name">By Mike Wilson</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Modal functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get modal elements
  const modal = document.getElementById('news-modal');
  const closeModal = document.querySelector('.close-modal');
  const readMoreLinks = document.querySelectorAll('.read-more');
  
  // Add click event to all "Read more" links
  readMoreLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get the parent news card
      const newsCard = this.closest('.news-card');
      
      // Extract data from the news card
      const imageUrl = newsCard.querySelector('.news-image img').src;
      const headline = newsCard.querySelector('.news-headline').textContent;
      const date = newsCard.querySelector('.news-date').textContent;
      const excerpt = newsCard.querySelector('.news-excerpt').textContent;
      const author = newsCard.querySelector('.author-name').textContent;
      
      // Populate modal with data
      document.getElementById('modal-image').innerHTML = `<img src="${imageUrl}" alt="${headline}" width="100%">`;
      document.getElementById('modal-headline').textContent = headline;
      document.getElementById('modal-date').textContent = date;
      document.getElementById('modal-content').textContent = excerpt;
      document.getElementById('modal-author').textContent = author;
      
      // Show modal
      modal.style.display = 'block';
    });
  });
  
  // Close modal when clicking the X
  if (closeModal) {
    closeModal.addEventListener('click', function() {
      modal.style.display = 'none';
    });
  }
  
  // Close modal when clicking outside the content
  window.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Theme toggle functionality
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const html = document.documentElement;
      if (html.getAttribute('data-theme') === 'light') {
        html.setAttribute('data-theme', 'dark');
        this.innerHTML = '<i class="fas fa-sun"></i>';
      } else {
        html.setAttribute('data-theme', 'light');
        this.innerHTML = '<i class="fas fa-moon"></i>';
      }
    });
  }
});

// Apply active class to current page link
function setActivePage() {
  const navLinks = document.querySelectorAll('.nav-link');
  const currentPage = window.location.pathname.split('/').pop();
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    const linkPage = link.getAttribute('data-page');
    if (currentPage.includes(linkPage) || 
        (currentPage === '' && linkPage === 'dashboard')) {
      link.classList.add('active');
    }
  });
}

// Initialize active page
setActivePage();

function fetchVoteResults() {
  fetch('/vote_results/', {
    method: 'GET',
    headers: {
      'X-CSRFToken': getCookie('csrftoken'),
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Vote results data:', data);
      if (Object.keys(data).length === 0) {
        console.log('No vote data available');
        // Show a message to the user
        document.getElementById('vote-results').innerHTML = '<p>No voting data available yet.</p>';
        return;
      }
      // Render your chart with the data
      renderBarChart(data);
    })
    .catch(error => {
      console.error('Error fetching vote results:', error);
      document.getElementById('vote-results').innerHTML =
        '<p>Error loading vote results. Please try again later.</p>';
    });
}

function renderBarChart(resultsData) {
  const barCtx = document.getElementById('barChart');
  if (!barCtx) return;

  // Destroy previous chart instance if exists
  if (window.barChartInstance) {
    window.barChartInstance.destroy();
  }

  const positions = Object.keys(resultsData);
  const candidateSet = new Set();

  // First collect all unique candidate names for correct mapping
  positions.forEach(position => {
    Object.keys(resultsData[position]).forEach(candidate => {
      candidateSet.add(candidate);
    });
  });

  const allCandidates = Array.from(candidateSet);
  const colors = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#3F51B5'];

  // Initialize datasets for each candidate
  const datasets = allCandidates.map((candidateName, index) => {
    return {
      label: candidateName,
      data: positions.map(position => {
        return resultsData[position][candidateName] || 0;
      }),
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      borderWidth: 1
    };
  });

  // Create chart
  window.barChartInstance = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: positions,
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Election Results by Position'
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.raw} votes`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: false,
          title: {
            display: true,
            text: 'Positions'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Votes'
          }
        }
      }
    }
  });
}

function addCustomLegend(resultsData) {
  const legendContainer = document.getElementById('custom-legend');
  if (!legendContainer) return;

  legendContainer.innerHTML = '';

  const candidates = new Set();
  Object.values(resultsData).flat().forEach(candidate => {
    candidates.add(candidate.name);
  });

  Array.from(candidates).forEach((name, index) => {
    const color = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#3F51B5'][index % 6];
    const item = document.createElement('div');
    item.innerHTML = `<span style="display:inline-block;width:12px;height:12px;background:${color};margin-right:8px;"></span>${name}`;
    legendContainer.appendChild(item);
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

  fetch('/candidate_list_json/', {
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
    button.addEventListener('click', function () {
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
  const candidates = {};

  if (selectedCandidates.length === 0) {
    alert('Please select at least one candidate.');
    return;
  }

  selectedCandidates.forEach(input => {
    const position = input.name;
    candidates[position] = input.value;
  });

  console.log('Submitting votes:', candidates);

  fetch('/submit_vote/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify({ candidates: candidates })
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        alert('Vote submitted successfully!');
        hasVoted = true;
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

// Attach event handler to settings form
function attachSettingsFormHandler(form) {
  // Remove any existing event listeners (to prevent duplicates)
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);

  newForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Collect form data
    const settings = {
      email: document.getElementById('email').value,
      dob: document.getElementById('dob').value
    };

    console.log('Submitting settings:', settings);

    // Send form data via fetch API
    fetch('/settings_page/', {
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