import { extractTokenOnLoad } from "/static/auth.js";

window.addEventListener("pageshow", (event) => {
    const token = extractTokenOnLoad("/user", event);
    console.log("User token:", token);

    document.body.classList.remove("hide-user");
});

