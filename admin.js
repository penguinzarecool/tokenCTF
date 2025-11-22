import { extractTokenOnLoad } from "/static/auth.js";

window.addEventListener("pageshow", (event) => {
    const token = extractTokenOnLoad("/admin", event);
    console.log("Admin token:", token);

    document.body.classList.remove("hide-admin");
});

