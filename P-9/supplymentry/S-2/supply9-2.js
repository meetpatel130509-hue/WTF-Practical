
const API_URL = "https://www.googleapis.com/books/v1/volumes";

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchType = document.getElementById("searchType");
const bookContainer = document.getElementById("bookContainer");
const message = document.getElementById("message");

// Search books
searchForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const query = searchInput.value.trim();
    const type = searchType.value;

    if (query === "") {
        message.textContent = "Please enter a book name or author.";
        return;
    }

    await searchBooks(query, type);
});

// Fetch books from Google Books API
async function searchBooks(query, type) {
    message.textContent = "Loading books...";
    bookContainer.innerHTML = "";

    document.getElementById("detailsSection").hidden = true;

    let searchQuery = query;

    if (type === "title") {
        searchQuery = "intitle:" + query;
    } else if (type === "author") {
        searchQuery = "inauthor:" + query;
    }

    try {
        const response = await fetch(
            `${API_URL}?q=${encodeURIComponent(searchQuery)}&maxResults=20`
        );

        if (!response.ok) {
            throw new Error("Unable to fetch books.");
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            message.textContent = "No books found. Try another search.";
            return;
        }

        message.textContent =
            "Found " + data.totalItems + " matching books.";

        displayBooks(data.items);

    } catch (error) {
        message.textContent =
            "Something went wrong. Please check your internet connection.";

        console.error(error);
    }
}

// Display book cards
function displayBooks(books) {
    bookContainer.innerHTML = "";

    books.forEach(book => {
        const info = book.volumeInfo || {};

        const card = document.createElement("div");
        card.className = "book-card";

        const image = document.createElement("img");
        image.src = info.imageLinks?.thumbnail ||
            "https://placehold.co/140x190?text=No+Cover";
        image.alt = "Book cover";

        const title = document.createElement("h3");
        title.textContent = info.title || "Unknown Title";

        const author = document.createElement("p");
        author.textContent =
            "Author: " + (info.authors?.join(", ") || "Unknown");

        const publisher = document.createElement("p");
        publisher.textContent =
            "Publisher: " + (info.publisher || "Not available");

        const button = document.createElement("button");
        button.textContent = "View Details";

        button.addEventListener("click", function() {
            showBookDetails(book);
        });

        card.append(image, title, author, publisher, button);
        bookContainer.appendChild(card);
    });
}

// Display complete book details
function showBookDetails(book) {
    const info = book.volumeInfo || {};

    const detailsSection =
        document.getElementById("detailsSection");

    const bookDetails =
        document.getElementById("bookDetails");

    bookDetails.innerHTML = "";

    const content = document.createElement("div");
    content.className = "details-content";

    const image = document.createElement("img");
    image.src = info.imageLinks?.thumbnail ||
        "https://placehold.co/180x250?text=No+Cover";
    image.alt = "Book cover";

    const text = document.createElement("div");
    text.className = "details-text";

    const fields = [
        ["Title", info.title],
        ["Author", info.authors?.join(", ")],
        ["Publisher", info.publisher],
        ["Published Date", info.publishedDate],
        ["Page Count", info.pageCount],
        ["Categories", info.categories?.join(", ")],
        ["Language", info.language],
        ["Description", info.description]
    ];

    fields.forEach(([label, value]) => {
        if (value) {
            const paragraph = document.createElement("p");
            paragraph.textContent = label + ": " + value;
            text.appendChild(paragraph);
        }
    });

    const link = document.createElement("a");
    link.href = info.infoLink || "#";
    link.textContent = "More Information";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    text.appendChild(link);

    content.append(image, text);
    bookDetails.appendChild(content);

    detailsSection.hidden = false;

    detailsSection.scrollIntoView({
        behavior: "smooth"
    });
}
