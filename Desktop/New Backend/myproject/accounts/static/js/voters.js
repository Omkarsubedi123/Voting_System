

document.addEventListener('DOMContentLoaded', function() {
    // Theme toggling functionality
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            fetch('/toggle-theme/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                document.documentElement.classList.toggle('dark-theme', data.theme === 'dark');
            });
        });
    }
    
    // Functions to handle voter details via AJAX (if needed)
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const voterId = this.getAttribute('data-voter-id');
            if (voterId) {
                fetchVoterDetails(voterId);
            }
        });
    });
    
    function fetchVoterDetails(voterId) {
        fetch(`/voters/${voterId}/ajax/`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            // Handle the returned voter data
            // For example, populate a modal
            console.log(data);
        })
        .catch(error => {
            console.error('Error fetching voter details:', error);
        });
    }
    
    // Helper function to get CSRF cookie
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});