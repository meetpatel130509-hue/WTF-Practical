
// HOTEL BOOKING FORM

const bookingForm = document.getElementById("bookingForm");

const checkin = document.getElementById("checkin");
const checkout = document.getElementById("checkout");

const message = document.getElementById("bookingMessage");

// Set minimum date to today
const today = new Date().toISOString().split("T")[0];

checkin.min = today;
checkout.min = today;


// Update checkout minimum date
checkin.addEventListener("change", function () {

    checkout.min = checkin.value;

    if (checkout.value && checkout.value <= checkin.value) {
        checkout.value = "";
    }

});


// BOOKING FORM SUBMISSION

bookingForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();

    const email = document.getElementById("email").value.trim();

    const phone = document.getElementById("phone").value.trim();

    const roomPrice = Number(
        document.getElementById("room").value
    );

    const startDate = new Date(checkin.value);

    const endDate = new Date(checkout.value);


    // Validate name
    if (name.length < 3) {

        showMessage("Please enter a valid name.", "danger");
        return;

    }


    // Validate phone
    if (!/^[0-9]{10}$/.test(phone)) {

        showMessage("Enter a valid 10-digit phone number.", "danger");
        return;

    }


    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {

        showMessage("Please enter a valid email address.", "danger");
        return;

    }


    // Validate dates
    if (!checkin.value || !checkout.value ||
        endDate <= startDate) {

        showMessage("Check-out date must be after check-in date.", "danger");
        return;

    }


    // Calculate number of nights
    const nights = Math.ceil(
        (endDate - startDate) / (1000 * 60 * 60 * 24)
    );


    // Calculate total amount
    const totalAmount = nights * roomPrice;


    // Booking confirmation
    message.innerHTML = `
        <div class="alert alert-success">

            <h4>Booking Confirmed!</h4>

            <p>Thank you, ${escapeHTML(name)}!</p>

            <p>Email: ${escapeHTML(email)}</p>

            <p>Number of Nights: ${nights}</p>

            <p>Room Price: ₹${roomPrice.toLocaleString("en-IN")}</p>

            <h5>Total Amount: ₹${totalAmount.toLocaleString("en-IN")}</h5>

            <p>Your booking request has been confirmed
            for this demonstration.</p>

        </div>
    `;

    bookingForm.reset();

    checkin.min = today;
    checkout.min = today;

});


// DISPLAY MESSAGE

function showMessage(text, type) {

    message.innerHTML = `
        <div class="alert alert-${type}">
            ${escapeHTML(text)}
        </div>
    `;

}


// Prevent HTML injection in displayed user input
function escapeHTML(value) {

    return value.replace(/[&<>"']/g, function (char) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[char];

    });

}
