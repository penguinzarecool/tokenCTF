// ===== Utility Helpers =====

export function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

export function setSessionCookie(token) {
    document.cookie = "session=" + encodeURIComponent(token) + "; path=/";
}

export function getCookie(name) {
    const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? decodeURIComponent(m.pop()) : null;
}

export function deleteSessionCookie() {
    document.cookie = "session=; path=/; max-age=0";
}

// Reliable reload detector using "pageshow"
export function isReloadOrRestore(event) {
    // event.persisted → true if bfcache restore
    // event.type === "pageshow" AND navigationType = reload/back/forward
    const nav = performance.getEntriesByType("navigation")[0];
    if (!nav) return false;

    return (
        nav.type === "reload" ||
        nav.type === "back_forward" ||
        event.persisted === true
    );
}

// ===== Core Token Logic =====

export function extractTokenOnLoad(pathName, event) {
    const tokenFromUrl = getQueryParam("token");

    // --- Case 1: Token provided via URL (login OR exploit)
    if (tokenFromUrl) {
        setSessionCookie(tokenFromUrl);
        history.replaceState(null, "", pathName);
        return tokenFromUrl;
    }

    // --- Case 2: No token in URL — allow only reloads
    const reload = isReloadOrRestore(event);

    // No token in URL
    // Check cookie FIRST before assuming it's a bad navigation
    const cookieToken = getCookie("session");

    if (cookieToken) {
        // Valid cookie → allow load
        return cookieToken;
    }

    // No cookie, no token, not a reload → block
    if (!isReloadOrRestore(event)) {
        alert("Missing token. Please log in.");
        window.location.href = "/";
        return null;
    }

    // Last fallback (very rare)
    alert("Session expired. Please log in again.");
    window.location.href = "/";
    return null;



    // --- Case 3: Reload → check cookie
    const tokenFromCookie = getCookie("session");
    if (!tokenFromCookie) {
        alert("Session expired. Please log in again.");
        window.location.href = "/";
        return null;
    }

    return tokenFromCookie;
}

