// frontend/js/auth-handler.js
// Shared authentication handler. Uses the same FagaAPI contract as the rest of FAGA.

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("fagaLoginForm");
    const errorBanner = document.getElementById("loginErrorBanner");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail")?.value.trim();
        const password = document.getElementById("loginPassword")?.value;

        if (!email || !password) {
            if (errorBanner) {
                errorBanner.textContent = "Please enter your email and password.";
                errorBanner.style.display = "block";
            }
            return;
        }

        try {
            const result = await FagaAPI.login(email, password);
            const role = result?.user?.role;
            const currentPath = window.location.pathname;

            if (role === "admin") {
                window.location.href = currentPath.includes("admin-portal")
                    ? "index.html"
                    : "../admin-portal/index.html";
            } else if (currentPath.includes("user-portal")) {
                window.location.href = "dashboard.html";
            } else {
                window.location.href = "../user-portal/dashboard.html";
            }
        } catch (error) {
            console.error("FAGA login error:", error);
            const message =
                error?.data?.message ||
                error?.data?.error ||
                "Login failed. Please check your email and password.";

            if (errorBanner) {
                errorBanner.textContent = message;
                errorBanner.style.display = "block";
            }
        }
    });
});
