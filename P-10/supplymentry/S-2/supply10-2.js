
const form = document.getElementById("registerForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");

const message = document.getElementById("message");
const submitBtn = document.getElementById("submitBtn");
const showPassword = document.getElementById("showPassword");

// Show and hide password
showPassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        showPassword.textContent = "Hide";
    } else {
        passwordInput.type = "password";
        showPassword.textContent = "Show";
    }
});

// Password validation
function validatePassword(password) {

    const length = password.length >= 12;
    const upper = /[A-Z]/.test(password);
    const lower = /[a-z]/.test(password);
    const number = /[0-9]/.test(password);
    const special = /[^A-Za-z0-9]/.test(password);

    return length && upper && lower && number && special;
}

// SHA-256 hashing demonstration
async function hashPassword(password) {

    const encoder = new TextEncoder();

    // Generate a random salt
    const salt = crypto.getRandomValues(
        new Uint8Array(16)
    );

    // Combine salt and password
    const data = new Uint8Array(
        salt.length + encoder.encode(password).length
    );

    data.set(salt);
    data.set(encoder.encode(password), salt.length);

    // Generate SHA-256 hash
    const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        data
    );

    const hashArray = Array.from(new Uint8Array(hashBuffer));

    const hash = hashArray.map(byte =>
        byte.toString(16).padStart(2, "0")
    ).join("");

    const saltString = Array.from(salt).map(byte =>
        byte.toString(16).padStart(2, "0")
    ).join("");

    return {
        salt: saltString,
        hash: hash
    };
}

// Registration form
form.addEventListener("submit", async function (event) {

    event.preventDefault();

    message.style.color = "red";

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    // Empty field validation
    if (!name || !email || !password || !confirmPassword) {
        message.textContent = "All fields are required!";
        return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        message.textContent = "Enter a valid email address!";
        return;
    }

    // Password validation
    if (!validatePassword(password)) {
        message.textContent =
            "Password must contain 12 characters, uppercase, lowercase, number and special character!";
        return;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match!";
        return;
    }

    // Check browser security support
    if (!window.crypto || !crypto.subtle) {
        message.textContent =
            "Secure hashing is unavailable. Use HTTPS or localhost.";
        return;
    }

    try {

        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";

        // Hash password
        const result = await hashPassword(password);

        console.log("Password Hash:", result.hash);
        console.log("Random Salt:", result.salt);

        message.style.color = "green";

        message.textContent =
            "Registration validation successful! Password hash generated.";

        // Clear form
        form.reset();

    } catch (error) {

        console.error("Registration error:", error);

        message.style.color = "red";
        message.textContent =
            "Something went wrong. Please try again.";

    } finally {

        submitBtn.disabled = false;
        submitBtn.textContent = "Register";

    }

});
