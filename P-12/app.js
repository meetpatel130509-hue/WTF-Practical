
const API = "/api";

let authMode = "login";

// HTML elements
const roomList = document.getElementById("roomList");
const roomSelect = document.getElementById("roomSelect");

const authForm = document.getElementById("authForm");
const bookingForm = document.getElementById("bookingForm");

const authMessage = document.getElementById("authMessage");
const bookingMessage = document.getElementById("bookingMessage");

const tokenKey = "hotelToken";


// SAFE HTML DISPLAY
function safeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);

}


// SHOW MESSAGES
function showMessage(element, text, type = "success") {

    element.textContent = "";

    const div = document.createElement("div");

    div.className = `alert alert-${type}`;
    div.textContent = text;

    element.appendChild(div);

}


// AUTHENTICATION
function showAuth(mode) {

    authMode = mode;

    document.getElementById("auth").scrollIntoView({
        behavior: "smooth"
    });

    const nameField = document.getElementById("nameField");

    const title = document.getElementById("authTitle");

    const button = authForm.querySelector("button[type=submit]");

    const switchButton = document.getElementById("authSwitch");

    const authText = document.getElementById("authText");

    nameField.hidden = mode !== "register";

    document.getElementById("userName").required =
        mode === "register";

    title.textContent =
        mode === "register" ? "User Registration" : "User Login";

    button.textContent =
        mode === "register" ? "Register" : "Login";

    authText.textContent =
        mode === "register"
        ? "Already have an account?"
        : "Don't have an account?";

    switchButton.textContent =
        mode === "register" ? "Login" : "Register";

    switchButton.onclick = () => {
        showAuth(mode === "register" ? "login" : "register");
    };

    authMessage.textContent = "";

}


// AUTH FORM SUBMISSION
authForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("userName").value.trim();

    const email = document.getElementById("userEmail").value.trim();

    const password = document.getElementById("userPassword").value;

    const endpoint =
        authMode === "register" ? "/register" : "/login";

    const data = authMode === "register"
        ? { name, email, password }
        : { email, password };

    try {

        const response = await fetch(API + endpoint, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        if (authMode === "register") {

            showMessage(authMessage, result.message);

            showAuth("login");

            authForm.reset();

        } else {

            localStorage.setItem(tokenKey, result.token);

            showMessage(authMessage, "Welcome " + result.name);

            updateLoginStatus();

            authForm.reset();

            loadBookings();

        }

    } catch(error) {

        showMessage(authMessage, error.message, "danger");

    }

});


// UPDATE LOGIN STATUS
function updateLoginStatus() {

    const token = localStorage.getItem(tokenKey);

    document.getElementById("logoutBtn").hidden = !token;

}


// LOGOUT
function logout() {

    localStorage.removeItem(tokenKey);

    updateLoginStatus();

    document.getElementById("bookingHistory").textContent = "";

    const row = document.createElement("tr");

    const cell = document.createElement("td");

    cell.colSpan = 6;
    cell.textContent = "Please login to view your bookings.";

    row.appendChild(cell);

    document.getElementById("bookingHistory").appendChild(row);

    showMessage(bookingMessage, "You have logged out.");

}


// FETCH ROOMS FROM REST API
async function loadRooms() {

    try {

        const response = await fetch(API + "/rooms");

        if (!response.ok) {
            throw new Error("Unable to fetch rooms.");
        }

        const rooms = await response.json();

        roomList.textContent = "";

        roomSelect.innerHTML =
            '<option value="">Select a room</option>';

        rooms.forEach(room => {

            // ROOM CARD
            const column = document.createElement("div");

            column.className = "col-md-4";

            column.innerHTML = `
                <div class="card room-card">

                    <img src="${safeHTML(room.image)}"
                         class="card-img-top"
                         alt="${safeHTML(room.room_name)}">

                    <div class="card-body">

                        <h4>${safeHTML(room.room_name)}</h4>

                        <p>${safeHTML(room.description)}</p>

                        <h5 class="text-primary">
                            ₹${Number(room.price).toLocaleString("en-IN")} / Night
                        </h5>

                        <button class="btn btn-dark w-100 book-room"
                                data-id="${Number(room.id)}">
                            Book Now
                        </button>

                    </div>

                </div>
            `;

            roomList.appendChild(column);

            // ROOM DROPDOWN
            const option = document.createElement("option");

            option.value = room.id;

            option.textContent =
                `${room.room_name} - ₹${Number(room.price).toLocaleString("en-IN")}`;

            roomSelect.appendChild(option);

        });

    } catch(error) {

        roomList.textContent = error.message;

    }

}


// SELECT ROOM
roomList.addEventListener("click", function(event) {

    const button = event.target.closest(".book-room");

    if (!button) return;

    roomSelect.value = button.dataset.id;

    document.getElementById("booking").scrollIntoView({
        behavior: "smooth"
    });

});


// BOOKING FORM
bookingForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const token = localStorage.getItem(tokenKey);

    if (!token) {

        showMessage(
            bookingMessage,
            "Please login before booking a room.",
            "danger"
        );

        showAuth("login");

        return;

    }

    const room_id = Number(roomSelect.value);

    const check_in = document.getElementById("checkin").value;

    const check_out = document.getElementById("checkout").value;

    if (!room_id || !check_in || !check_out ||
        check_out <= check_in) {

        showMessage(
            bookingMessage,
            "Please select a room and valid booking dates.",
            "danger"
        );

        return;

    }

    try {

        const response = await fetch(API + "/bookings", {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                "Authorization": "Bearer " + token

            },

            body: JSON.stringify({
                room_id,
                check_in,
                check_out
            })

        });

        const result = await response.json();

        if (!response.ok) {

            if (response.status === 401) {
                logout();
            }

            throw new Error(result.message);

        }

        showMessage(
            bookingMessage,
            `Booking successful! Booking ID: ${result.booking_id}. Total: ₹${Number(result.total_price).toLocaleString("en-IN")}`
        );

        bookingForm.reset();

        loadBookings();

    } catch(error) {

        showMessage(
            bookingMessage,
            error.message,
            "danger"
        );

    }

});


// FETCH BOOKING HISTORY
async function loadBookings() {

    const token = localStorage.getItem(tokenKey);

    if (!token) {

        showMessage(
            bookingMessage,
            "Please login to view booking history.",
            "warning"
        );

        return;

    }

    const table = document.getElementById("bookingHistory");

    try {

        const response = await fetch(API + "/bookings", {

            headers: {
                "Authorization": "Bearer " + token
            }

        });

        const bookings = await response.json();

        if (!response.ok) {
            throw new Error(bookings.message);
        }

        table.textContent = "";

        if (bookings.length === 0) {

            const row = table.insertRow();

            const cell = row.insertCell();

            cell.colSpan = 6;
            cell.textContent = "No bookings found.";

            return;

        }

        bookings.forEach(booking => {

            const row = table.insertRow();

            const values = [
                booking.id,
                booking.room_name,
                formatDate(booking.check_in),
                formatDate(booking.check_out),
                "₹" + Number(booking.total_price).toLocaleString("en-IN"),
                booking.status
            ];

            values.forEach(value => {

                const cell = row.insertCell();

                cell.textContent = value;

            });

        });

    } catch(error) {

        showMessage(
            bookingMessage,
            error.message,
            "danger"
        );

    }

}


// FORMAT DATE
function formatDate(value) {

    const date = new Date(value);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    });

}


// SET MINIMUM BOOKING DATE
const today = new Date().toISOString().split("T")[0];

document.getElementById("checkin").min = today;

document.getElementById("checkout").min = today;

document.getElementById("checkin").addEventListener("change", function() {

    const checkout = document.getElementById("checkout");

    checkout.min = this.value;

    if (checkout.value && checkout.value <= this.value) {
        checkout.value = "";
    }

});


// INITIALIZE APPLICATION
updateLoginStatus();

loadRooms();
