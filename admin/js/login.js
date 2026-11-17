
const API_BASE = "http://127.0.0.1:5000";

const loginForm = document.getElementById("adminLoginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("loginMessage");
const loginBtn = document.getElementById("loginBtn");

// Check if admin is already logged in
async function checkExistingLogin() {
    try {
        const response = await fetch(`${API_BASE}/api/admin/me`, {
            method: "GET",
            credentials: "include"
        });

        if (response.ok) {
            window.location.href = "dashboard.html";
        }
    } catch (error) {
        console.error("Login check failed:", error);
    }
}

// Admin login
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    loginMessage.textContent = "";
    loginMessage.className = "";

    if (!username || !password) {
        loginMessage.textContent = "Please enter username and password.";
        loginMessage.className = "error";
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Signing in...";

    try {
        const response = await fetch(`${API_BASE}/api/admin/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok || data.status !== "success") {
            throw new Error(data.message || "Invalid username or password.");
        }

        loginMessage.textContent = "Login successful! Redirecting...";
        loginMessage.className = "success";

        window.location.href = "dashboard.html";

    } catch (error) {
        loginMessage.textContent = error.message || "Something went wrong.";
        loginMessage.className = "error";

        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }
});

// Run login check when page loads
checkExistingLogin();
