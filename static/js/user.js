// Handle navigation menu clicks
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const page = this.getAttribute('data-page');
        
        // Hide all sections
        document.querySelector('.vote-section').style.display = 'none';
        document.querySelector('.settings-section').style.display = 'none';
        
        // Show selected section
        if (page === 'vote') {
            document.querySelector('.vote-section').style.display = 'block';
        } else if (page === 'settings') {
            document.querySelector('.settings-section').style.display = 'block';
        }
        
        // Update active state
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// Handle settings form submission
document.querySelector('.settings-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    
    fetch(window.location.href, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Show success message
            const alert = document.createElement('div');
            alert.className = 'alert alert-success';
            alert.textContent = data.message;
            this.insertBefore(alert, this.firstChild);
            
            // Remove alert after 3 seconds
            setTimeout(() => alert.remove(), 3000);
        } else {
            // Show error message
            const alert = document.createElement('div');
            alert.className = 'alert alert-error';
            alert.textContent = data.message;
            this.insertBefore(alert, this.firstChild);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}); 