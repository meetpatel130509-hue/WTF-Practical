
const form = document.getElementById("admissionForm");
const message = document.getElementById("message");

const dobInput = document.getElementById("dob");

// Set maximum date of birth to today
dobInput.max = new Date().toISOString().split("T")[0];

form.addEventListener("submit", function(event) {
    event.preventDefault();

    // Get form values
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const dob = dobInput.value;
    const address = document.getElementById("address").value.trim();
    const percentage = Number(
        document.getElementById("percentage").value
    );
    const file = document.getElementById("marksheet").files[0];

    // Name validation
    if (!/^[A-Za-z ]{2,}$/.test(name)) {
        showError("Please enter a valid name.");
        return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        showError("Please enter a valid email address.");
        return;
    }

    // Phone validation
    if (!/^[6-9]\d{9}$/.test(phone)) {
        showError("Enter a valid 10-digit Indian mobile number.");
        return;
    }

    // Date of birth validation
    if (!dob || new Date(dob) >= new Date(
        new Date().toDateString()
    )) {
        showError("Please select a valid date of birth.");
        return;
    }

    // Address validation
    if (address.length < 10) {
        showError("Address must contain at least 10 characters.");
        return;
    }

    // Percentage validation
    if (percentage < 0 || percentage > 100) {
        showError("Percentage must be between 0 and 100.");
        return;
    }

    // Marksheet validation
    if (!file) {
        showError("Please upload your marksheet.");
        return;
    }

    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png"
    ];

    if (!allowedTypes.includes(file.type)) {
        showError("Only PDF, JPG and PNG files are allowed.");
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        showError("File size must not exceed 2 MB.");
        return;
    }

    // Successful submission
    message.style.color = "green";
    message.textContent =
        "Admission application submitted successfully!";

    alert("Thank you! Your admission form has been submitted.");

    form.reset();
});

function showError(text) {
    message.style.color = "red";
    message.textContent = text;
}

// Clear message when form is reset
form.addEventListener("reset", function() {
    message.textContent = "";
});
