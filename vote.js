const voteSectionNames = ['president', 'vice-president', 'secretary', 'treasurer'];

document.querySelectorAll('.vote-radio').forEach(radio => {
  radio.addEventListener('change', function() {
    // Highlight selected card
    document.querySelectorAll(`.vote-card[data-section="${this.name}"]`).forEach(card => card.classList.remove('selected'));
    this.closest('.vote-card').classList.add('selected');
  });
});

// Vote buttons select the radio for that card
document.querySelectorAll('.vote-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const card = btn.closest('.vote-card');
    const radio = card.querySelector('.vote-radio');
    radio.checked = true;
    radio.dispatchEvent(new Event('change'));
    e.preventDefault();
  });
});

document.getElementById('submit-vote-btn').addEventListener('click', function() {
  let allAnswered = true;
  for (const section of voteSectionNames) {
    if (!document.querySelector(`input[name="${section}"]:checked`)) {
      allAnswered = false;
      break;
    }
  }
  if (!allAnswered) {
    // Show error modal
    document.getElementById('vote-error-modal').style.display = 'flex';
  } else {
    alert('Vote submitted! (Demo)');
  }
});

document.getElementById('close-vote-error').onclick = function() {
  document.getElementById('vote-error-modal').style.display = 'none';
};