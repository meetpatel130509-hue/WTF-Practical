
const loginForm = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");
const message = document.getElementById("message");
const togglePassword = document.getElementById("togglePassword");

// Demo credentials only
const correctUsername = "admin";
const correctPassword = "Admin@123";

let attempts = 0;
const maxAttempts = 3;
let locked = false;

// Show or hide password
togglePassword.addEventListener("click", function () {

    if (password.type === "password") {
        password.type = "text";
        togglePassword.textContent = "Hide";
    } else {
        password.type = "password";
        togglePassword.textContent = "Show";
    }
});

// Login validation
loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    if (locked) {
        message.textContent = "Login temporarily disabled!";
        message.style.color = "red";
        return;
    }

    const user = username.value.trim();
    const pass = password.value;

    if (user === "" || pass === "") {
        message.textContent = "Please enter all details!";
        message.style.color = "red";
        return;
    }

    if (user === correctUsername &&
        pass === correctPassword) {

        message.textContent = "Login Successful!";
        message.style.color = "green";

        attempts = 0;

    } else {

        attempts++;

        if (attempts >= maxAttempts) {
            locked = true;
            message.textContent =
                "Too many attempts! Login disabled.";
            message.style.color = "red";

            loginForm.querySelector(".login-btn").disabled = true;

        } else {
            message.textContent =
                "Invalid username or password! Attempts left: " +
                (maxAttempts - attempts);

            message.style.color = "red";
        }
    }
});
