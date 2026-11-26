
const form = document.getElementById("eventForm");
const eventSelect = document.getElementById("event");
const amountInput = document.getElementById("amount");
const confirmation = document.getElementById("confirmation");
const dateInput = document.getElementById("date");

// Event prices
const eventPrices = {
    "Technical Workshop": 500,
    "Coding Competition": 300,
    "Web Development Seminar": 400,
    "Project Exhibition": 200
};

// Set minimum event date to today
const today = new Date();
const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

dateInput.min = localToday;

// Automatically update registration amount
eventSelect.addEventListener("change", function() {
    const selectedEvent = this.value;

    if (selectedEvent) {
        amountInput.value = eventPrices[selectedEvent];
    } else {
        amountInput.value = "";
    }
});

// Form validation and submission
form.addEventListener("submit", function(event) {

    event.preventDefault();

    // Get participant details
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const age = Number(document.getElementById("age").value);
    const selectedEvent = eventSelect.value;
    const eventDate = dateInput.value;
    const payment = document.getElementById("payment").value;
    const terms = document.getElementById("terms").checked;

    // Name validation
    if (!/^[A-Za-z ]{2,}$/.test(name)) {
        alert("Please enter a valid full name.");
        return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Mobile validation
    if (!/^[6-9]\d{9}$/.test(mobile)) {
        alert("Enter a valid 10-digit Indian mobile number.");
        return;
    }

    // Age validation
    if (!Number.isInteger(age) || age < 16 || age > 100) {
        alert("Age must be between 16 and 100.");
        return;
    }

    // Event validation
    if (!selectedEvent) {
        alert("Please select an event.");
        return;
    }

    // Date validation
    if (!eventDate || eventDate < localToday) {
        alert("Please select today or a future event date.");
        return;
    }

    // Payment validation
    if (!payment) {
        alert("Please select a payment method.");
        return;
    }

    // Terms validation
    if (!terms) {
        alert("Please accept the terms and conditions.");
        return;
    }

    // Registration confirmation
    const amount = eventPrices[selectedEvent];

    confirmation.style.display = "block";

    confirmation.innerHTML = `
        <h3>Registration Successful!</h3>
        <p>Thank you, <strong>${escapeHTML(name)}</strong>.</p>
        <p>Your event registration details:</p>
        <p><strong>Email:</strong> ${escapeHTML(email)}</p>
        <p><strong>Event:</strong> ${escapeHTML(selectedEvent)}</p>
        <p><strong>Date:</strong> ${escapeHTML(eventDate)}</p>
        <p><strong>Payment Method:</strong> ${escapeHTML(payment)}</p>
        <p><strong>Registration Amount:</strong> ₹${amount}</p>
        <p>Your registration has been submitted successfully.</p>
    `;

    confirmation.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    form.reset();
    amountInput.value = "";
});

// Safely display user-entered text
function escapeHTML(value) {
    return value.replace(/[&<>"']/g, function(character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// Clear confirmation message when form is reset
form.addEventListener("reset", function() {
    confirmation.style.display = "none";
    confirmation.innerHTML = "";
});
