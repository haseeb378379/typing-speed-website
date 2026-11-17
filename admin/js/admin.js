
// ==========================================
// TypeMaster Admin Dashboard
// ==========================================

const API_BASE = "http://127.0.0.1:5000";

// HTML Elements
const totalMessages = document.getElementById("totalMessages");
const unreadMessages = document.getElementById("unreadMessages");
const readMessages = document.getElementById("readMessages");

const messagesTableBody = document.getElementById("messagesTableBody");
const adminName = document.getElementById("adminName");

const refreshBtn = document.getElementById("refreshBtn");
const logoutBtn = document.getElementById("logoutBtn");


// API Request Helper
async function apiRequest(endpoint, options = {}) {

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
            ...(options.body ? {
                "Content-Type": "application/json"
            } : {}),
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}


// Check Admin Authentication
async function checkAdmin() {

    try {

        const data = await apiRequest("/api/admin/me");

        adminName.textContent = data.admin.username;

        await loadDashboard();
        await loadMessages();

    } catch (error) {

        alert("Admin session expired. Please login again.");

        window.location.href = "login.html";

    }
}


// Load Dashboard Statistics
async function loadDashboard() {

    try {

        const data = await apiRequest("/api/admin/dashboard");

        const dashboard = data.dashboard;

        totalMessages.textContent = dashboard.total_messages;
        unreadMessages.textContent = dashboard.unread_messages;
        readMessages.textContent = dashboard.read_messages;

        adminName.textContent = dashboard.admin;

    } catch (error) {

        console.error("Dashboard Error:", error.message);

    }
}


// Load All Messages
async function loadMessages() {

    messagesTableBody.innerHTML = `
        <tr>
            <td colspan="7">Loading messages...</td>
        </tr>
    `;

    try {

        const data = await apiRequest("/api/admin/messages");

        messagesTableBody.innerHTML = "";

        if (data.messages.length === 0) {

            messagesTableBody.innerHTML = `
                <tr>
                    <td colspan="7">No messages found.</td>
                </tr>
            `;

            return;
        }

        data.messages.forEach(message => {

            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.textContent = message.name;

            const emailCell = document.createElement("td");
            emailCell.textContent = message.email;

            const subjectCell = document.createElement("td");
            subjectCell.textContent = message.subject;

            // Actual Visitor Message
            const messageCell = document.createElement("td");
            messageCell.textContent = message.message || "No message provided";
            messageCell.style.minWidth = "250px";
            messageCell.style.maxWidth = "350px";
            messageCell.style.whiteSpace = "normal";
            messageCell.style.overflowWrap = "anywhere";

            const statusCell = document.createElement("td");
            statusCell.textContent = message.status;

            const dateCell = document.createElement("td");

            const date = new Date(message.created_at);

            dateCell.textContent = date.toLocaleDateString();

            const actionCell = document.createElement("td");

            const statusButton = document.createElement("button");

            statusButton.textContent =
                message.status === "unread" ? "Mark Read" : "Mark Unread";

            statusButton.addEventListener("click", () => {

                updateMessageStatus(
                    message.id,
                    message.status === "unread" ? "read" : "unread"
                );

            });

            const deleteButton = document.createElement("button");

            deleteButton.textContent = "Delete";
            deleteButton.style.marginLeft = "8px";

            deleteButton.addEventListener("click", () => {

                deleteMessage(message.id);

            });

            actionCell.append(statusButton, deleteButton);

            row.append(
                nameCell,
                emailCell,
                subjectCell,
                messageCell,
                statusCell,
                dateCell,
                actionCell
            );

            messagesTableBody.appendChild(row);

        });

    } catch (error) {

        messagesTableBody.innerHTML = `
            <tr>
                <td colspan="7">Unable to load messages.</td>
            </tr>
        `;

        console.error("Messages Error:", error.message);

    }

}


// Update Message Status
async function updateMessageStatus(messageId, newStatus) {

    try {

        await apiRequest(`/api/admin/messages/${messageId}/status`, {

            method: "PATCH",

            body: JSON.stringify({
                status: newStatus
            })

        });

        await loadDashboard();
        await loadMessages();

    } catch (error) {

        alert(error.message);

    }

}


// Delete Message
async function deleteMessage(messageId) {

    const confirmed = confirm(
        "Are you sure you want to delete this message?"
    );

    if (!confirmed) return;

    try {

        await apiRequest(`/api/admin/messages/${messageId}`, {
            method: "DELETE"
        });

        await loadDashboard();
        await loadMessages();

        alert("Message deleted successfully.");

    } catch (error) {

        alert(error.message);

    }

}


// Refresh Dashboard
refreshBtn.addEventListener("click", async () => {

    await loadDashboard();
    await loadMessages();

});


// Admin Logout
logoutBtn.addEventListener("click", async () => {

    const confirmed = confirm("Are you sure you want to logout?");

    if (!confirmed) return;

    try {

        await apiRequest("/api/admin/logout", {
            method: "POST"
        });

        window.location.href = "login.html";

    } catch (error) {

        alert(error.message);

    }

});


// Start Dashboard
checkAdmin();
