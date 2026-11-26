
const bookForm = document.getElementById("bookForm");
const bookTable = document.getElementById("bookTable");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");

let books = JSON.parse(localStorage.getItem("libraryBooks")) || [];

function saveBooks() {
    localStorage.setItem("libraryBooks", JSON.stringify(books));
}

function showMessage(text, color = "green") {
    message.textContent = text;
    message.style.color = color;
}

function displayBooks(list = books) {
    bookTable.innerHTML = "";

    list.forEach(book => {
        const row = document.createElement("tr");

        const values = [
            book.bookId,
            book.title,
            book.author,
            book.category,
            book.year,
            book.quantity
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.addEventListener("click", () => editBook(book.id));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", () => deleteBook(book.id));

        actionCell.append(editButton, deleteButton);
        row.appendChild(actionCell);

        bookTable.appendChild(row);
    });

    document.getElementById("totalBooks").textContent =
        "Total Book Records: " + books.length;
}

// Add or update a book
bookForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const editId = document.getElementById("editId").value;

    const book = {
        id: editId || Date.now().toString(),
        bookId: document.getElementById("bookId").value.trim(),
        title: document.getElementById("title").value.trim(),
        author: document.getElementById("author").value.trim(),
        category: document.getElementById("category").value,
        year: Number(document.getElementById("year").value),
        quantity: Number(document.getElementById("quantity").value)
    };

    // Validate fields
    if (!book.bookId || !book.title || !book.author ||
        !book.category || !book.year || book.quantity < 1) {
        showMessage("Please enter valid book details.", "red");
        return;
    }

    if (book.year < 1000 || book.year > new Date().getFullYear()) {
        showMessage("Please enter a valid publication year.", "red");
        return;
    }

    // Check duplicate Book ID
    const duplicate = books.some(item =>
        item.bookId.toLowerCase() === book.bookId.toLowerCase() &&
        item.id !== editId
    );

    if (duplicate) {
        showMessage("Book ID already exists!", "red");
        return;
    }

    if (editId) {
        const index = books.findIndex(item => item.id === editId);
        if (index !== -1) {
            books[index] = book;
        }
        showMessage("Book updated successfully!");
    } else {
        books.push(book);
        showMessage("Book added successfully!");
    }

    saveBooks();
    displayBooks();
    resetForm();
});

// Edit book
function editBook(id) {
    const book = books.find(item => item.id === id);

    if (!book) return;

    document.getElementById("editId").value = book.id;
    document.getElementById("bookId").value = book.bookId;
    document.getElementById("title").value = book.title;
    document.getElementById("author").value = book.author;
    document.getElementById("category").value = book.category;
    document.getElementById("year").value = book.year;
    document.getElementById("quantity").value = book.quantity;

    document.getElementById("formTitle").textContent = "Update Book";
    document.getElementById("submitBtn").textContent = "Update Book";
    document.getElementById("cancelBtn").hidden = false;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Delete book
function deleteBook(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this book?"
    );

    if (!confirmDelete) return;

    books = books.filter(book => book.id !== id);

    saveBooks();
    displayBooks();

    showMessage("Book deleted successfully!");
}

// Search books
searchInput.addEventListener("input", function() {
    const searchValue = searchInput.value.toLowerCase().trim();

    const filteredBooks = books.filter(book =>
        book.bookId.toLowerCase().includes(searchValue) ||
        book.title.toLowerCase().includes(searchValue) ||
        book.author.toLowerCase().includes(searchValue) ||
        book.category.toLowerCase().includes(searchValue)
    );

    displayBooks(filteredBooks);
});

// Reset form
function resetForm() {
    bookForm.reset();
    document.getElementById("editId").value = "";
    document.getElementById("formTitle").textContent = "Add New Book";
    document.getElementById("submitBtn").textContent = "Add Book";
    document.getElementById("cancelBtn").hidden = true;
}

document.getElementById("cancelBtn").addEventListener("click", resetForm);

// Display saved records when page loads
displayBooks();
