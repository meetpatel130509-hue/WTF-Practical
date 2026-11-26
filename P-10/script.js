
// Employee Registration
document.getElementById("registerForm")
.addEventListener("submit", async function(e) {

    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const message = document.getElementById("registerMessage");

    // Password validation
    const strongPassword =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (name.length < 2 || name.length > 100) {
        message.textContent = "Enter a valid employee name.";
        return;
    }

    if (!strongPassword.test(password)) {
        message.textContent =
            "Password must contain 8 characters, uppercase, lowercase, number and special character.";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        return;
    }

    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        message.textContent = data.message;

        if (response.ok) {
            document.getElementById("registerForm").reset();
        }

    } catch (error) {
        message.textContent = "Unable to complete registration.";
    }
});


// Employee Login
document.getElementById("loginForm")
.addEventListener("submit", async function(e) {

    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const message = document.getElementById("loginMessage");

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        message.textContent = data.message;

    } catch (error) {
        message.textContent = "Login service unavailable.";
    }
});


// Controlled XSS Demonstration
document.getElementById("testButton")
.addEventListener("click", function() {

    const input = document.getElementById("userInput").value;

    // Safe output encoding using textContent
    document.getElementById("output").textContent = input;

    // Unsafe example: DO NOT USE IN REAL APPLICATIONS.
    // innerHTML interprets HTML instead of treating it as text.
    // Demonstration is kept inert by using a detached element.
    const unsafe = document.getElementById("unsafeOutput");

    const demo = document.createElement("div");
    demo.innerHTML = input;

    // Show the parsed result as text, without executing it.
    unsafe.textContent = demo.innerHTML;
});
