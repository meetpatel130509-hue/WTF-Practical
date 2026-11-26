
// Mobile Navigation
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", function() {

    navLinks.classList.toggle("active");

    const isOpen = navLinks.classList.contains("active");

    menuToggle.setAttribute("aria-expanded", isOpen);
});

// Close menu after clicking a navigation link
document.querySelectorAll(".nav-links a").forEach(function(link) {

    link.addEventListener("click", function() {
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
    });

});


// Booking Form
const bookingForm = document.getElementById("bookingForm");
const message = document.getElementById("message");

const checkin = document.getElementById("checkin");
const checkout = document.getElementById("checkout");

// Set today's date as the minimum check-in date
const today = new Date();
const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

checkin.min = localToday;
checkout.min = localToday;

// Update checkout minimum when check-in changes
checkin.addEventListener("change", function() {

    checkout.min = checkin.value;

    if (checkout.value && checkout.value <= checkin.value) {
        checkout.value = "";
    }

});


// Form Submission
bookingForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();

    const email = document.getElementById("email").value.trim();

    const room = document.getElementById("room").value;

    const guests = Number(document.getElementById("guests").value);

    message.style.color = "red";

    // Validate name
    if (name.length < 2) {
        message.textContent = "Please enter a valid name.";
        return;
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        message.textContent = "Please enter a valid email.";
        return;
    }

    // Validate dates
    if (!checkin.value || !checkout.value) {
        message.textContent = "Please select both dates.";
        return;
    }

    if (checkin.value < localToday) {
        message.textContent = "Check-in date cannot be in the past.";
        return;
    }

    if (checkout.value <= checkin.value) {
        message.textContent =
            "Check-out date must be after check-in date.";
        return;
    }

    // Validate room
    if (!room) {
        message.textContent = "Please select a room.";
        return;
    }

    // Validate guests
    if (!Number.isInteger(guests) || guests < 1 || guests > 10) {
        message.textContent = "Guests must be between 1 and 10.";
        return;
    }

    // Calculate number of nights
    const startDate = new Date(checkin.value + "T00:00:00");
    const endDate = new Date(checkout.value + "T00:00:00");

    const nights = Math.round(
        (endDate - startDate) / (1000 * 60 * 60 * 24)
    );

    // Display confirmation
    message.style.color = "green";

    message.textContent =
        "Booking request submitted successfully! " +
        "Thank you, " + name + ". " +
        "Room: " + room +
        " | Guests: " + guests +
        " | Nights: " + nights + ".";

    // Reset form
    bookingForm.reset();

    // Restore minimum dates
    checkin.min = localToday;
    checkout.min = localToday;

});
