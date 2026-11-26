
const form = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");
const message = document.getElementById("message");
const searchInput = document.getElementById("searchInput");

let students = JSON.parse(localStorage.getItem("students")) || [];
let editIndex = -1;

// Save records in Local Storage
function saveStudents() {
    localStorage.setItem("students", JSON.stringify(students));
}

// Display student records
function displayStudents(searchText = "") {

    studentTable.innerHTML = "";

    const filteredStudents = students
        .map((student, index) => ({ student, index }))
        .filter(({ student }) =>
            student.name.toLowerCase().includes(searchText.toLowerCase()) ||
            student.enrollment.toLowerCase().includes(searchText.toLowerCase())
        );

    filteredStudents.forEach(({ student, index }) => {

        const row = document.createElement("tr");

        const values = [
            student.enrollment,
            student.name,
            student.email,
            student.mobile,
            student.branch,
            student.semester,
            student.percentage + "%"
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
        editButton.addEventListener("click", () => editStudent(index));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", () => deleteStudent(index));

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        studentTable.appendChild(row);
    });

    document.getElementById("emptyMessage").style.display =
        filteredStudents.length === 0 ? "block" : "none";

    document.getElementById("totalStudents").textContent =
        "Total Students: " + students.length;
}

// Add or update student
form.addEventListener("submit", function(event) {

    event.preventDefault();

    const enrollment = document.getElementById("enrollment").value.trim();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const branch = document.getElementById("branch").value;
    const semester = document.getElementById("semester").value;
    const percentage = Number(document.getElementById("percentage").value);

    // Enrollment validation
    if (!/^[A-Za-z0-9-]{3,20}$/.test(enrollment)) {
        showMessage("Enter a valid enrollment number.", "red");
        return;
    }

    // Name validation
    if (!/^[A-Za-z ]{2,}$/.test(name)) {
        showMessage("Enter a valid student name.", "red");
        return;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage("Enter a valid email address.", "red");
        return;
    }

    // Mobile validation
    if (!/^[6-9]\d{9}$/.test(mobile)) {
        showMessage("Enter a valid 10-digit mobile number.", "red");
        return;
    }

    // Percentage validation
    if (!Number.isFinite(percentage) ||
        percentage < 0 || percentage > 100) {
        showMessage("Percentage must be between 0 and 100.", "red");
        return;
    }

    // Check duplicate enrollment number
    const duplicate = students.some((student, index) =>
        student.enrollment.toLowerCase() === enrollment.toLowerCase() &&
        index !== editIndex
    );

    if (duplicate) {
        showMessage("Enrollment number already exists.", "red");
        return;
    }

    const student = {
        enrollment,
        name,
        email,
        mobile,
        branch,
        semester,
        percentage
    };

    if (editIndex === -1) {
        students.push(student);
        showMessage("Student added successfully!", "green");
    } else {
        students[editIndex] = student;
        showMessage("Student updated successfully!", "green");
        editIndex = -1;
        document.getElementById("submitBtn").textContent = "Add Student";
        document.getElementById("formTitle").textContent = "Add Student";
    }

    saveStudents();
    displayStudents(searchInput.value);
    form.reset();
});

// Edit student
function editStudent(index) {

    const student = students[index];

    document.getElementById("enrollment").value = student.enrollment;
    document.getElementById("name").value = student.name;
    document.getElementById("email").value = student.email;
    document.getElementById("mobile").value = student.mobile;
    document.getElementById("branch").value = student.branch;
    document.getElementById("semester").value = student.semester;
    document.getElementById("percentage").value = student.percentage;

    editIndex = index;

    document.getElementById("submitBtn").textContent = "Update Student";
    document.getElementById("formTitle").textContent = "Edit Student";

    showMessage("Editing student record.", "#174ea6");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Delete student
function deleteStudent(index) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this student?"
    );

    if (confirmDelete) {
        students.splice(index, 1);

        if (editIndex === index) {
            editIndex = -1;
            form.reset();
            document.getElementById("submitBtn").textContent = "Add Student";
            document.getElementById("formTitle").textContent = "Add Student";
        } else if (editIndex > index) {
            editIndex--;
        }

        saveStudents();
        displayStudents(searchInput.value);
        showMessage("Student deleted successfully!", "green");
    }
}

// Search student
searchInput.addEventListener("input", function() {
    displayStudents(this.value.trim());
});

// Display messages
function showMessage(text, color) {
    message.textContent = text;
    message.style.color = color;
}

// Reset form
form.addEventListener("reset", function() {

    editIndex = -1;

    document.getElementById("submitBtn").textContent = "Add Student";
    document.getElementById("formTitle").textContent = "Add Student";

    message.textContent = "";
});

// Initial display
displayStudents();
