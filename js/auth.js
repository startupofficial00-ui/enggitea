document.addEventListener("DOMContentLoaded", () => {
    setupNavbar();
    setupLogin();
    setupRegister();
});


// ===============================
// NAVBAR
// ===============================
function setupNavbar() {
    const menuBtn = document.querySelector(".menu-btn");
    const navLinks = document.querySelector(".nav-links");

    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => {
            navLinks.classList.toggle("open");
        });
    }

    const authArea = document.querySelector("#authArea");

    if (!authArea) return;

    updateNavbar(authArea);
}


// ===============================
// UPDATE NAVBAR
// ===============================
async function updateNavbar(authArea) {
    try {
        const {
            data: { user }
        } = await supabaseClient.auth.getUser();

        if (user) {
            authArea.innerHTML = `
                <a href="profile.html">Profile</a>
                <button class="btn btn-primary btn-sm" id="logoutBtn">
                    Logout
                </button>
            `;

            document
                .querySelector("#logoutBtn")
                ?.addEventListener("click", logoutUser);
        } else {
            authArea.innerHTML = `
                <a href="login.html">Login</a>
                <a href="register.html" class="btn btn-primary btn-sm">
                    Register
                </a>
            `;
        }

    } catch (error) {
        console.error("Navbar auth error:", error);

        authArea.innerHTML = `
            <a href="login.html">Login</a>
            <a href="register.html" class="btn btn-primary btn-sm">
                Register
            </a>
        `;
    }
}


// ===============================
// LOGIN
// ===============================
function setupLogin() {
    const form = document.querySelector("#loginForm");

    if (!form) return;

    const message = document.querySelector("#loginMessage");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document
            .querySelector("#email")
            .value
            .trim();

        const password = document
            .querySelector("#password")
            .value;

        if (!email || !password) {
            showMessage(
                message,
                "Please fill in all fields.",
                "error"
            );
            return;
        }

        const submitBtn = form.querySelector(
            "button[type='submit']"
        );

        submitBtn.disabled = true;
        submitBtn.textContent = "Logging in...";

        try {
            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) {
                throw error;
            }

            const user = data?.user;

            if (!user) {
                throw new Error("Login failed. Please try again.");
            }

            // Role stored inside user metadata
            const role =
                user.user_metadata?.role ||
                user.user_metadata?.user_type ||
                "student";

            if (role === "admin") {
                window.location.href =
                    "admin/admin-dashboard.html";
            } else {
                window.location.href = "dashboard.html";
            }

        } catch (error) {
            console.error("Login error:", error);

            showMessage(
                message,
                error.message || "Login failed.",
                "error"
            );

            submitBtn.disabled = false;
            submitBtn.textContent = "Login";
        }
    });
}


// ===============================
// REGISTER
// ===============================
function setupRegister() {
    const form = document.querySelector("#registerForm");

    if (!form) return;

    const message = document.querySelector("#registerMessage");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document
            .querySelector("#name")
            .value
            .trim();

        const email = document
            .querySelector("#email")
            .value
            .trim();

        const password =
            document.querySelector("#password").value;

        const confirmPassword =
            document.querySelector("#confirmPassword").value;

        if (!name || !email || !password || !confirmPassword) {
            showMessage(
                message,
                "Please fill in all fields.",
                "error"
            );
            return;
        }

        if (password !== confirmPassword) {
            showMessage(
                message,
                "Passwords do not match.",
                "error"
            );
            return;
        }

        if (password.length < 6) {
            showMessage(
                message,
                "Password must be at least 6 characters.",
                "error"
            );
            return;
        }

        const submitBtn = form.querySelector(
            "button[type='submit']"
        );

        submitBtn.disabled = true;
        submitBtn.textContent = "Creating account...";

        try {
            const { data, error } =
                await supabaseClient.auth.signUp({
                    email,
                    password,

                    options: {
                        data: {
                            name: name,
                            role: "student"
                        }
                    }
                });

            if (error) {
                throw error;
            }

            // Supabase email confirmation enabled
            if (data.user && !data.session) {
                showMessage(
                    message,
                    "Registration successful! Please check your email and verify your account.",
                    "success"
                );

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);

                return;
            }

            // Session exists → directly logged in
            if (data.session) {
                const role =
                    data.user?.user_metadata?.role ||
                    "student";

                if (role === "admin") {
                    window.location.href =
                        "admin/admin-dashboard.html";
                } else {
                    window.location.href = "dashboard.html";
                }

                return;
            }

            showMessage(
                message,
                "Registration successful. Please login.",
                "success"
            );

            submitBtn.disabled = false;
            submitBtn.textContent = "Create Account";

        } catch (error) {
            console.error("Registration error:", error);

            showMessage(
                message,
                error.message || "Registration failed.",
                "error"
            );

            submitBtn.disabled = false;
            submitBtn.textContent = "Create Account";
        }
    });
}


// ===============================
// LOGOUT
// ===============================
async function logoutUser() {
    try {
        const { error } =
            await supabaseClient.auth.signOut();

        if (error) {
            throw error;
        }

        window.location.href = "index.html";

    } catch (error) {
        console.error("Logout error:", error);
        alert("Logout failed. Please try again.");
    }
}


// ===============================
// SHOW MESSAGE
// ===============================
function showMessage(element, text, type = "info") {
    if (!element) return;

    element.className = `alert alert-${type}`;
    element.textContent = text;
    element.style.display = "block";
}