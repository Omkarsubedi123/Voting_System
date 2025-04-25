themeToggleBtn.addEventListener('click', function() {
  html.classList.toggle('light-theme');

  const icon = themeToggleBtn.querySelector('i');
  if (html.classList.contains('light-theme')) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
  }
});
document.addEventListener("DOMContentLoaded", function () {
  initTheme();
  fetchCandidates();

  document.getElementById("new-candidate-btn").addEventListener("click", openAddCandidateModal);
  document.getElementById("cancel-candidate").addEventListener("click", closeModal);
  document.querySelector(".close-modal").addEventListener("click", closeModal);
  document.getElementById("candidate-form").addEventListener("submit", saveCandidateData);
  document.getElementById("theme-toggle-btn").addEventListener("click", toggleTheme);
});

function fetchCandidates() {
  fetch("/candidates/api/")
      .then(response => response.json())
      .then(data => renderCandidates(data))
      .catch(error => console.error("Error fetching candidates:", error));
}

function renderCandidates(candidates) {
  const tableBody = document.getElementById("candidates-table-body");
  tableBody.innerHTML = "";

  if (candidates.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5">No candidates available.</td></tr>`;
      return;
  }

  candidates.forEach(candidate => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${candidate.name}</td>
          <td>${candidate.age}</td>
          <td>${candidate.post}</td>
          <td>${candidate.description}</td>
          <td>
              <button onclick="openEditCandidateModal('${candidate.id}')">Edit</button>
              <button onclick="deleteCandidate('${candidate.id}')">Delete</button>
          </td>
      `;
      tableBody.appendChild(row);
  });
}

function openAddCandidateModal() {
  document.getElementById("modal-title").textContent = "Add New Candidate";
  document.getElementById("candidate-form").reset();
  document.getElementById("candidate-modal").style.display = "block";
}

function openEditCandidateModal(candidateId) {
  fetch(`/candidates/api/${candidateId}/`)
      .then(response => response.json())
      .then(candidate => {
          document.getElementById("modal-title").textContent = "Edit Candidate";
          document.getElementById("candidate-name").value = candidate.name;
          document.getElementById("candidate-age").value = candidate.age;
          document.getElementById("candidate-post").value = candidate.post;
          document.getElementById("candidate-description").value = candidate.description;
          document.getElementById("candidate-id").value = candidate.id;
          document.getElementById("candidate-modal").style.display = "block";
      })
      .catch(error => console.error("Error fetching candidate data:", error));
}

function saveCandidateData(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const candidateId = formData.get("candidate-id");
  const url = candidateId ? `/candidates/api/${candidateId}/` : "/candidates/api/";
  const method = candidateId ? "PUT" : "POST";

  fetch(url, {
      method: method,
      body: formData,
  })
  .then(response => response.json())
  .then(() => {
      closeModal();
      fetchCandidates();
  })
  .catch(error => console.error("Error saving candidate:", error));
}

function deleteCandidate(candidateId) {
  if (!confirm("Are you sure you want to delete this candidate?")) return;
  fetch(`/candidates/api/${candidateId}/`, { method: "DELETE" })
      .then(() => fetchCandidates())
      .catch(error => console.error("Error deleting candidate:", error));
}

function closeModal() {
  document.getElementById("candidate-modal").style.display = "none";
}

function toggleTheme() {
  document.documentElement.classList.toggle("light-theme");
  localStorage.setItem("theme", document.documentElement.classList.contains("light-theme") ? "light" : "dark");
}

function initTheme() {
  if (localStorage.getItem("theme") === "light") {
      document.documentElement.classList.add("light-theme");
  }
}
