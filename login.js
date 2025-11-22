document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    // Send login request
    const res = await fetch("/login", {
        method: "POST",
        body: formData
    });

    // Read raw response first (for debugging)
    const raw = await res.text();
    console.log("Raw server response:", raw);

    let data;
    try {
        data = JSON.parse(raw);
    } catch (err) {
        console.error("JSON parse error:", err);
        alert("Server returned invalid response.");
        return;
    }

    if (data.error) {
        alert("Login failed: " + data.error);
        return;
    }

    const token = data.token;

    // Extract username from token: token-USERNAME-12345
    const parts = token.split("-");
    const username = parts[1];

    // Decide redirect target
    if (username === "admin") {
        // Admin goes to admin page
        window.location.href = "/admin?token=" + encodeURIComponent(token) + "&username=admin";
    } else {
        // Normal users go to user page
        window.location.href = "/user?token=" + encodeURIComponent(token);
    }
});

