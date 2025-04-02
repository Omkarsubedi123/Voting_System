document.addEventListener("DOMContentLoaded", function () {
    fetchVoters();
});

function fetchVoters() {
    fetch("/voters/") // Adjust endpoint as per Django URL
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.page_obj || !Array.isArray(data.page_obj)) {
                console.error("Unexpected data format:", data);
                return;
            }
            populateVotersTable(data.page_obj);
        })
        .catch(error => console.error("Error fetching voter data:", error));
}

function populateVotersTable(voters) {
    const tableBody = document.querySelector(".voter-table tbody");

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
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <div class="voter-avatar-name">
                    ${user.avatar ? `<img src="${user.avatar}" alt="Avatar" class="voter-avatar">` : ''}
                    <span>${user.username}</span>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${user.dob}</td>
        `;
        tableBody.appendChild(row);
    });
}
