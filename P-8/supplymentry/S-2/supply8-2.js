
const express = require("express");
const Database = require("better-sqlite3");
const helmet = require("helmet");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Database connection
const db = new Database("employees.db");

// Create employee table automatically
db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employeeId TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        mobile TEXT NOT NULL,
        department TEXT NOT NULL,
        salary REAL NOT NULL
    )
`);

// Validation function
function validateEmployee(data) {
    const {
        employeeId,
        name,
        email,
        mobile,
        department,
        salary
    } = data;

    if (
        typeof employeeId !== "string" ||
        !/^EMP[0-9]{3,}$/i.test(employeeId.trim())
    ) {
        return "Employee ID must be like EMP101.";
    }

    if (
        typeof name !== "string" ||
        !/^[A-Za-z ]{2,}$/.test(name.trim())
    ) {
        return "Enter a valid employee name.";
    }

    if (
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        return "Enter a valid email address.";
    }

    if (
        typeof mobile !== "string" ||
        !/^[6-9]\d{9}$/.test(mobile.trim())
    ) {
        return "Enter a valid 10-digit Indian mobile number.";
    }

    const departments = [
        "IT",
        "HR",
        "Finance",
        "Marketing",
        "Sales"
    ];

    if (!departments.includes(department)) {
        return "Select a valid department.";
    }

    if (
        salary === "" ||
        salary === null ||
        salary === undefined ||
        !Number.isFinite(Number(salary)) ||
        Number(salary) <= 0 ||
        Number(salary) > 100000000
    ) {
        return "Salary must be greater than zero.";
    }

    return null;
}

// GET: Display all employees
app.get("/api/employees", (req, res) => {
    try {
        const employees = db.prepare(
            "SELECT * FROM employees ORDER BY id DESC"
        ).all();

        res.json(employees);
    } catch (error) {
        res.status(500).json({
            message: "Unable to retrieve employees."
        });
    }
});

// POST: Add employee
app.post("/api/employees", (req, res) => {
    const error = validateEmployee(req.body);

    if (error) {
        return res.status(400).json({ message: error });
    }

    const {
        employeeId,
        name,
        email,
        mobile,
        department,
        salary
    } = req.body;

    try {
        const result = db.prepare(`
            INSERT INTO employees
            (employeeId, name, email, mobile, department, salary)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            employeeId.trim().toUpperCase(),
            name.trim(),
            email.trim().toLowerCase(),
            mobile.trim(),
            department,
            Number(salary)
        );

        const employee = db.prepare(
            "SELECT * FROM employees WHERE id = ?"
        ).get(result.lastInsertRowid);

        res.status(201).json({
            message: "Employee added successfully.",
            employee
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                message: "Employee ID or email already exists."
            });
        }

        res.status(500).json({
            message: "Unable to add employee."
        });
    }
});

// PUT: Update employee
app.put("/api/employees/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid employee record ID."
        });
    }

    const error = validateEmployee(req.body);

    if (error) {
        return res.status(400).json({ message: error });
    }

    const {
        employeeId,
        name,
        email,
        mobile,
        department,
        salary
    } = req.body;

    try {
        const result = db.prepare(`
            UPDATE employees
            SET employeeId = ?,
                name = ?,
                email = ?,
                mobile = ?,
                department = ?,
                salary = ?
            WHERE id = ?
        `).run(
            employeeId.trim().toUpperCase(),
            name.trim(),
            email.trim().toLowerCase(),
            mobile.trim(),
            department,
            Number(salary),
            id
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Employee not found."
            });
        }

        const employee = db.prepare(
            "SELECT * FROM employees WHERE id = ?"
        ).get(id);

        res.json({
            message: "Employee updated successfully.",
            employee
        });

    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                message: "Employee ID or email already exists."
            });
        }

        res.status(500).json({
            message: "Unable to update employee."
        });
    }
});

// DELETE: Delete employee
app.delete("/api/employees/:id", (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            message: "Invalid employee record ID."
        });
    }

    try {
        const result = db.prepare(
            "DELETE FROM employees WHERE id = ?"
        ).run(id);

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Employee not found."
            });
        }

        res.json({
            message: "Employee deleted successfully."
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to delete employee."
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

const form = document.getElementById("employeeForm");
const employeeTable = document.getElementById("employeeTable");
const message = document.getElementById("message");
const searchInput = document.getElementById("searchInput");

let employees = [];
let editId = null;

// Display messages
function showMessage(text, color = "green") {
    message.textContent = text;
    message.style.color = color;
}

// API request helper
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
    }

    return data;
}

// Load employees from database
async function loadEmployees() {
    try {
        employees = await apiRequest("/api/employees");
        displayEmployees(searchInput.value);
    } catch (error) {
        showMessage(error.message, "red");
    }
}

// Display employee records
function displayEmployees(searchText = "") {

    employeeTable.innerHTML = "";

    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchText.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(searchText.toLowerCase())
    );

    filteredEmployees.forEach(employee => {

        const row = document.createElement("tr");

        const values = [
            employee.employeeId,
            employee.name,
            employee.email,
            employee.mobile,
            employee.department,
            "₹" + Number(employee.salary).toLocaleString("en-IN")
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
        editButton.addEventListener("click", () => editEmployee(employee.id));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", () => deleteEmployee(employee.id));

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        employeeTable.appendChild(row);
    });

    document.getElementById("emptyMessage").style.display =
        filteredEmployees.length === 0 ? "block" : "none";

    document.getElementById("totalEmployees").textContent =
        "Total Employees: " + employees.length;
}

// Validate employee form
function validateForm(employee) {

    if (!/^EMP[0-9]{3,}$/i.test(employee.employeeId)) {
        return "Employee ID must be like EMP101.";
    }

    if (!/^[A-Za-z ]{2,}$/.test(employee.name)) {
        return "Enter a valid employee name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
        return "Enter a valid email address.";
    }

    if (!/^[6-9]\d{9}$/.test(employee.mobile)) {
        return "Enter a valid 10-digit mobile number.";
    }

    if (!employee.department) {
        return "Please select a department.";
    }

    if (
        employee.salary === "" ||
        !Number.isFinite(Number(employee.salary)) ||
        Number(employee.salary) <= 0
    ) {
        return "Salary must be greater than zero.";
    }

    return null;
}

// Add or update employee
form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const employee = {
        employeeId: document.getElementById("employeeId").value.trim(),
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        mobile: document.getElementById("mobile").value.trim(),
        department: document.getElementById("department").value,
        salary: document.getElementById("salary").value
    };

    const error = validateForm(employee);

    if (error) {
        showMessage(error, "red");
        return;
    }

    try {
        const isEditing = editId !== null;

        const url = isEditing
            ? `/api/employees/${editId}`
            : "/api/employees";

        const method = isEditing ? "PUT" : "POST";

        const result = await apiRequest(url, {
            method: method,
            body: JSON.stringify(employee)
        });

        showMessage(result.message, "green");

        resetForm();
        await loadEmployees();

    } catch (error) {
        showMessage(error.message, "red");
    }
});

// Edit employee
function editEmployee(id) {

    const employee = employees.find(item => item.id === id);

    if (!employee) {
        showMessage("Employee not found.", "red");
        return;
    }

    document.getElementById("employeeId").value = employee.employeeId;
    document.getElementById("name").value = employee.name;
    document.getElementById("email").value = employee.email;
    document.getElementById("mobile").value = employee.mobile;
    document.getElementById("department").value = employee.department;
    document.getElementById("salary").value = employee.salary;

    editId = id;

    document.getElementById("formTitle").textContent = "Update Employee";
    document.getElementById("submitBtn").textContent = "Update Employee";

    showMessage("Editing employee record.", "#174ea6");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Delete employee
async function deleteEmployee(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const result = await apiRequest(`/api/employees/${id}`, {
            method: "DELETE"
        });

        if (editId === id) {
            resetForm();
        }

        showMessage(result.message, "green");
        await loadEmployees();

    } catch (error) {
        showMessage(error.message, "red");
    }
}

// Search employee
searchInput.addEventListener("input", function() {
    displayEmployees(this.value.trim());
});

// Reset form and editing state
function resetForm() {
    form.reset();
    editId = null;

    document.getElementById("formTitle").textContent = "Add New Employee";
    document.getElementById("submitBtn").textContent = "Add Employee";
}

// Clear form button
form.addEventListener("reset", function() {
    editId = null;

    document.getElementById("formTitle").textContent = "Add New Employee";
    document.getElementById("submitBtn").textContent = "Add Employee";

    message.textContent = "";
});

// Load database records when page opens
loadEmployees();

