
document.addEventListener("DOMContentLoaded", function () {

    const movie = document.getElementById("movie");
    const showDate = document.getElementById("showDate");
    const showTime = document.getElementById("showTime");
    const seatLayout = document.getElementById("seatLayout");

    const summaryMovie = document.getElementById("summaryMovie");
    const summaryDate = document.getElementById("summaryDate");
    const summaryTime = document.getElementById("summaryTime");
    const selectedSeats = document.getElementById("selectedSeats");
    const ticketCount = document.getElementById("ticketCount");
    const totalAmount = document.getElementById("totalAmount");
    const message = document.getElementById("message");
    const bookButton = document.getElementById("bookButton");

    let selected = [];

    // Occupied seats
    const occupiedSeats = [
        "A3", "A4", "B5", "C2", "C6",
        "D4", "E7", "F1", "F5"
    ];

    // Set minimum booking date to today
    const today = new Date();
    const localDate = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    showDate.min = localDate;
    showDate.value = localDate;

    // Generate seats dynamically
    function generateSeats() {

        seatLayout.replaceChildren();
        selected = [];

        const rows = ["A", "B", "C", "D", "E", "F"];
        const columns = 8;

        rows.forEach(row => {

            for (let i = 1; i <= columns; i++) {

                const seatName = row + i;
                const seat = document.createElement("button");

                seat.type = "button";
                seat.textContent = seatName;
                seat.className = "seat-button";

                if (occupiedSeats.includes(seatName)) {
                    seat.classList.add("occupied");
                    seat.disabled = true;
                } else {
                    seat.addEventListener("click", function () {
                        toggleSeat(seatName, seat);
                    });
                }

                seatLayout.appendChild(seat);
            }
        });

        updateSummary();
    }

    // Select or deselect seat
    function toggleSeat(seatName, seatElement) {

        if (selected.includes(seatName)) {

            selected = selected.filter(seat => seat !== seatName);
            seatElement.classList.remove("selected");

        } else {

            if (selected.length >= 8) {
                message.textContent = "Maximum 8 seats can be selected.";
                message.style.color = "red";
                return;
            }

            selected.push(seatName);
            seatElement.classList.add("selected");
        }

        message.textContent = "";
        updateSummary();
    }

    // Update booking summary
    function updateSummary() {

        const movieName = movie.options[movie.selectedIndex].text;
        const ticketPrice = Number(movie.value);

        summaryMovie.textContent = movieName.split(" - ")[0];

        summaryDate.textContent = showDate.value || "Not selected";
        summaryTime.textContent = showTime.value;

        selectedSeats.textContent =
            selected.length > 0 ? selected.join(", ") : "None";

        ticketCount.textContent = selected.length;

        totalAmount.textContent =
            selected.length * ticketPrice;
    }

    // Movie selection change
    movie.addEventListener("change", updateSummary);

    // Date selection change
    showDate.addEventListener("change", function () {
        selected = [];
        generateSeats();
        updateSummary();
    });

    // Show time change
    showTime.addEventListener("change", function () {
        selected = [];
        generateSeats();
        updateSummary();
    });

    // Book tickets
    bookButton.addEventListener("click", function () {

        if (!showDate.value) {
            message.textContent = "Please select a booking date.";
            message.style.color = "red";
            return;
        }

        if (showDate.value < localDate) {
            message.textContent = "Please select a valid future date.";
            message.style.color = "red";
            return;
        }

        if (selected.length === 0) {
            message.textContent = "Please select at least one seat.";
            message.style.color = "red";
            return;
        }

        const bookedSeats = [...selected];
        const bookingAmount = selected.length * Number(movie.value);

        // Mark selected seats as occupied
        bookedSeats.forEach(seatName => {
            occupiedSeats.push(seatName);
        });

        message.textContent =
            "Booking successful! Seats: " +
            bookedSeats.join(", ") +
            " | Total: ₹" + bookingAmount;

        message.style.color = "green";

        selected = [];
        generateSeats();
        updateSummary();
    });

    // Initial page setup
    generateSeats();

});
