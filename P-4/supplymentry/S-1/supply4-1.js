
document.addEventListener("DOMContentLoaded", function () {

    // Sample student records
    let students = [
        { id: 1, roll: "101", name: "Rahul Patel" },
        { id: 2, roll: "102", name: "Priya Shah" },
        { id: 3, roll: "103", name: "Amit Kumar" },
        { id: 4, roll: "104", name: "Neha Sharma" },
        { id: 5, roll: "105", name: "Karan Mehta" }
    ];

    // Attendance records for each date
    let attendanceRecords = {};

    const attendanceDate = document.getElementById("attendanceDate");
    const attendanceTable = document.getElementById("attendanceTable");
    const searchStudent = document.getElementById("searchStudent");
    const studentForm = document.getElementById("studentForm");
    const message = document.getElementById("message");

    // Set today's date
    attendanceDate.value = new Date().toISOString().split("T")[0];

    function getCurrentRecords() {
        const date = attendanceDate.value;

        if (!attendanceRecords[date]) {
            attendanceRecords[date] = {};
        }

        return attendanceRecords[date];
    }

    // Display student records
    function displayStudents() {
        const records = getCurrentRecords();
        const searchValue = searchStudent.value.toLowerCase();

        attendanceTable.replaceChildren();

        const filteredStudents = students.filter(student =>
            student.name.toLowerCase().includes(searchValue) ||
            student.roll.toLowerCase().includes(searchValue)
        );

        filteredStudents.forEach(student => {

            const status = records[student.id] || "Not Marked";

            const row = document.createElement("tr");

            const rollCell = document.createElement("td");
            rollCell.textContent = student.roll;

            const nameCell = document.createElement("td");
            nameCell.textContent = student.name;

            const statusCell = document.createElement("td");

            const statusLabel = document.createElement("span");
            statusLabel.className = "status " +
                (status === "Present" ? "present" :
                status === "Absent" ? "absent" : "not-marked");

            statusLabel.textContent = status;
            statusCell.appendChild(statusLabel);

            const actionCell = document.createElement("td");

            const presentButton = document.createElement("button");
            presentButton.textContent = "Present";
            presentButton.style.background = "#198754";

            presentButton.addEventListener("click", function () {
                updateAttendance(student.id, "Present");
            });

            const absentButton = document.createElement("button");
            absentButton.textContent = "Absent";
            absentButton.style.background = "#dc3545";
            absentButton.style.marginLeft = "5px";

            absentButton.addEventListener("click", function () {
                updateAttendance(student.id, "Absent");
            });

            actionCell.append(presentButton, absentButton);

            row.append(
                rollCell,
                nameCell,
                statusCell,
                actionCell
            );

            attendanceTable.appendChild(row);
        });

        updateDashboard();
    }

    // Update attendance status
    function updateAttendance(studentId, status) {
        const records = getCurrentRecords();

        records[studentId] = status;

        message.textContent =
            "Attendance updated successfully!";

        displayStudents();
    }

    // Update dashboard summary
    function updateDashboard() {
        const records = getCurrentRecords();

        const total = students.length;

        const present = students.filter(student =>
            records[student.id] === "Present"
        ).length;

        const absent = students.filter(student =>
            records[student.id] === "Absent"
        ).length;

        const percentage = total > 0
            ? ((present / total) * 100).toFixed(1)
            : 0;

        document.getElementById("totalStudents").textContent = total;
        document.getElementById("presentCount").textContent = present;
        document.getElementById("absentCount").textContent = absent;
        document.getElementById("attendancePercentage").textContent =
            percentage + "%";
    }

    // Add new student
    studentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("studentName").value.trim();
        const roll = document.getElementById("rollNumber").value.trim();

        if (!name || !roll) {
            message.textContent = "Please enter all student details.";
            return;
        }

        const duplicate = students.some(student =>
            student.roll.toLowerCase() === roll.toLowerCase()
        );

        if (duplicate) {
            message.textContent = "Roll number already exists.";
            return;
        }

        const newId = students.length > 0
            ? Math.max(...students.map(student => student.id)) + 1
            : 1;

        students.push({
            id: newId,
            roll: roll,
            name: name
        });

        studentForm.reset();

        message.textContent = "Student added successfully!";

        displayStudents();
    });

    // Search students
    searchStudent.addEventListener("input", displayStudents);

    // Change attendance date
    attendanceDate.addEventListener("change", function () {
        message.textContent = "";
        displayStudents();
    });

    // Mark all students present
    document.getElementById("markAllPresent")
        .addEventListener("click", function () {

            const records = getCurrentRecords();

            students.forEach(student => {
                records[student.id] = "Present";
            });

            message.textContent = "All students marked present.";

            displayStudents();
        });

    // Reset attendance
    document.getElementById("resetAttendance")
        .addEventListener("click", function () {

            const records = getCurrentRecords();

            students.forEach(student => {
                delete records[student.id];
            });

            message.textContent = "Attendance has been reset.";

            displayStudents();
        });

    // Initial display
    displayStudents();

});
