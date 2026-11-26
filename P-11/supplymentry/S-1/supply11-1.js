
// Event Filtering
const filterButtons = document.querySelectorAll(".filter-btn");
const eventCards = document.querySelectorAll(".event-card");

filterButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const category = button.getAttribute("data-category");

        // Remove active styling from all buttons
        filterButtons.forEach(function(btn) {
            btn.classList.remove("btn-primary");
            btn.classList.add("btn-outline-primary");
        });

        // Highlight selected button
        button.classList.remove("btn-outline-primary");
        button.classList.add("btn-primary");

        // Filter events
        eventCards.forEach(function(card) {

            const eventCategory = card.getAttribute("data-category");

            if (category === "all" || category === eventCategory) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }

        });

    });

});


// Registration Form
const registrationForm =
    document.getElementById("registrationForm");

const successMessage =
    document.getElementById("successMessage");

const errorMessage =
    document.getElementById("errorMessage");


registrationForm.addEventListener("submit", function(event) {

    event.preventDefault();

    // Get form values
    const name =
        document.getElementById("studentName").value.trim();

    const email =
        document.getElementById("studentEmail").value.trim();

    const college =
        document.getElementById("collegeName").value.trim();

    const selectedEvent =
        document.getElementById("eventName").value;

    const mobile =
        document.getElementById("mobile").value.trim();

    // Hide previous messages
    successMessage.classList.add("d-none");
    errorMessage.classList.add("d-none");

    // Validate empty fields
    if (!name || !email || !college ||
        !selectedEvent || !mobile) {

        showError("Please fill in all fields.");
        return;
    }

    // Validate name
    if (!/^[a-zA-Z ]{2,50}$/.test(name)) {
        showError("Please enter a valid name.");
        return;
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        showError("Please enter a valid email address.");
        return;
    }

    // Validate mobile number
    if (!/^[0-9]{10}$/.test(mobile)) {
        showError("Mobile number must contain exactly 10 digits.");
        return;
    }

    // Display success message
    successMessage.textContent =
        "Registration successful! Welcome " +
        name + ". You are registered for " + selectedEvent + ".";

    successMessage.classList.remove("d-none");

    // Reset form
    registrationForm.reset();

});


// Error Message Function
function showError(message) {

    errorMessage.textContent = message;
    errorMessage.classList.remove("d-none");

}
