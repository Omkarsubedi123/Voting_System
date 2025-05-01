function addUserSuccess(userData) {
    // Create a new row for the table
    const userTable = document.querySelector('#user-table tbody');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td>${userData.username}</td>
        <td>${userData.email}</td>
        <td>${userData.dob}</td>
        <td>
            <button class="btn btn-sm btn-info" onclick="fetchUserDetails(${userData.id})">View</button>
            <a href="/voters/${userData.id}/edit/" class="btn btn-sm btn-warning">Edit</a>
            <a href="/voters/${userData.id}/delete/" class="btn btn-sm btn-danger">Delete</a>
        </td>
    `;

    userTable.insertBefore(newRow, userTable.firstChild);

    // Update the total count
    const countElement = document.querySelector('#total-entries');
    if (countElement) {
        const currentCount = parseInt(countElement.textContent);
        countElement.textContent = currentCount + 1;
    }
}
