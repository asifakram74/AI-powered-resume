// Utility to sync auth state as a cookie for Next.js middleware
// Middleware can only read cookies (not localStorage), so we set a simple
// flag cookie whenever the user logs in or out.

export function setAuthCookie() {
    document.cookie = "logged_in=true; path=/; max-age=31536000; SameSite=Lax"
}

export function removeAuthCookie() {
    document.cookie = "logged_in=; path=/; max-age=0; SameSite=Lax"
}
