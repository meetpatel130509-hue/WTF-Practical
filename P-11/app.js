
// FoodExpress - app.js

document.addEventListener("DOMContentLoaded", function () {

    // Cart functionality
    let cartCount = 0;

    const cartCountElement = document.getElementById("cart-count");
    const addToCartButtons = document.querySelectorAll(".add-to-cart");

    addToCartButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            cartCount++;

            if (cartCountElement) {
                cartCountElement.textContent = cartCount;
            }

            alert("Food item added to your cart!");
        });
    });


    // Food category filtering
    const filterButtons = document.querySelectorAll(".filter-btn");
    const foodItems = document.querySelectorAll(".food-item");

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {

            const category = button.getAttribute("data-category");

            filterButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            foodItems.forEach(function (item) {
                const itemCategory = item.getAttribute("data-category");

                if (category === "all" || category === itemCategory) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });
    });


    // Contact form validation
    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const message = document.getElementById("message").value.trim();

            if (name === "" || email === "" || message === "") {
                alert("Please fill in all fields.");
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }

            alert("Thank you, " + name + "! Your message has been submitted.");

            contactForm.reset();
        });
    }

});
