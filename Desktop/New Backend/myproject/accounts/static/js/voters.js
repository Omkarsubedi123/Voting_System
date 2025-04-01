document.addEventListener("DOMContentLoaded", function () {
  fetchVoters();
});

function fetchVoters() {
  fetch("/get-voters/") // Adjust the endpoint based on your Django URL
      .then(response => response.json())
      .then(data => {
          console.log("Fetched voter data:", data); // Log data to console
          populateVotersTable(data.page_obj);
      })
      .catch(error => console.error("Error fetching voter data:", error));
}

function populateVotersTable(voters) {
  const tableBody = document.querySelector("tbody");

  if (!tableBody) {
      console.error("Table body element not found!");
      return;
  }

  tableBody.innerHTML = ""; // Clear existing data

  if (voters.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="3">No voters found.</td></tr>`;
      return;
  }

  voters.forEach(user => {
      console.log("Adding user to table:", user); // Log each user
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${user.dob}</td>
      `;
      tableBody.appendChild(row);
  });
}
