
// FOOD EXPRESS JAVASCRIPT

// CART FUNCTIONALITY

let cartCount = 0;

const cartDisplay = document.getElementById("cartCount");

const cartButtons = document.querySelectorAll(".add-cart");

cartButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        cartCount++;

        cartDisplay.textContent = cartCount;

        button.textContent = "Added ✓";

        button.disabled = true;

        setTimeout(function() {
            button.textContent = "Add to Cart";
            button.disabled = false;
        }, 800);

    });

});


// CONTACT FORM VALIDATION

const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = document.getElementById("name").value.trim();

    const email = document.getElementById("email").value.trim();

    const message = document.getElementById("message").value.trim();

    const formMessage = document.getElementById("formMessage");

    if (name === "" || email === "" || message === "") {

        formMessage.textContent = "Please fill all fields.";

        formMessage.style.color = "red";

    } else {

        formMessage.textContent =
            "Thank you! Your message has been submitted.";

        formMessage.style.color = "green";

        contactForm.reset();

    }

});
