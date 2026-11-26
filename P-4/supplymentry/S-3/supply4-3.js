
document.addEventListener("DOMContentLoaded", function () {

    const taskInput = document.getElementById("taskInput");
    const addButton = document.getElementById("addButton");
    const taskList = document.getElementById("taskList");
    const emptyMessage = document.getElementById("emptyMessage");

    const totalTasks = document.getElementById("totalTasks");
    const completedTasks = document.getElementById("completedTasks");
    const pendingTasks = document.getElementById("pendingTasks");

    const filterButtons = document.querySelectorAll(".filter-btn");

    let tasks = [];
    let currentFilter = "all";
    let nextId = 1;

    // Add a new task
    function addTask() {

        const taskName = taskInput.value.trim();

        if (taskName === "") {
            alert("Please enter a task!");
            return;
        }

        const task = {
            id: nextId++,
            name: taskName,
            completed: false
        };

        tasks.push(task);

        taskInput.value = "";

        displayTasks();
    }

    // Display tasks dynamically
    function displayTasks() {

        taskList.replaceChildren();

        let filteredTasks = tasks;

        if (currentFilter === "pending") {
            filteredTasks = tasks.filter(task => !task.completed);
        }

        if (currentFilter === "completed") {
            filteredTasks = tasks.filter(task => task.completed);
        }

        filteredTasks.forEach(task => {

            const li = document.createElement("li");
            li.className = "task-item";

            // Task content
            const content = document.createElement("div");
            content.className = "task-content";

            // Checkbox
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "task-checkbox";
            checkbox.checked = task.completed;
            checkbox.setAttribute("aria-label", "Mark task as completed");

            checkbox.addEventListener("change", function () {
                toggleTask(task.id);
            });

            // Task name
            const span = document.createElement("span");
            span.className = "task-text";

            if (task.completed) {
                span.classList.add("completed");
            }

            span.textContent = task.name;

            content.append(checkbox, span);

            // Action buttons
            const actions = document.createElement("div");
            actions.className = "task-actions";

            // Edit button
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.className = "edit-btn";

            editButton.addEventListener("click", function () {
                editTask(task.id);
            });

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";

            deleteButton.addEventListener("click", function () {
                deleteTask(task.id);
            });

            actions.append(editButton, deleteButton);

            li.append(content, actions);

            taskList.appendChild(li);
        });

        emptyMessage.style.display =
            filteredTasks.length === 0 ? "block" : "none";

        updateStatistics();
    }

    // Mark task as completed or pending
    function toggleTask(id) {

        const task = tasks.find(task => task.id === id);

        if (task) {
            task.completed = !task.completed;
        }

        displayTasks();
    }

    // Edit task
    function editTask(id) {

        const task = tasks.find(task => task.id === id);

        if (!task) return;

        const newName = prompt("Edit your task:", task.name);

        if (newName === null) return;

        if (newName.trim() === "") {
            alert("Task name cannot be empty!");
            return;
        }

        task.name = newName.trim();

        displayTasks();
    }

    // Delete task
    function deleteTask(id) {

        const confirmDelete = confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmDelete) return;

        tasks = tasks.filter(task => task.id !== id);

        displayTasks();
    }

    // Update task statistics
    function updateStatistics() {

        const total = tasks.length;

        const completed = tasks.filter(
            task => task.completed
        ).length;

        const pending = total - completed;

        totalTasks.textContent = total;
        completedTasks.textContent = completed;
        pendingTasks.textContent = pending;
    }

    // Filter tasks
    filterButtons.forEach(button => {

        button.addEventListener("click", function () {

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            currentFilter = button.dataset.filter;

            displayTasks();
        });
    });

    // Add button event
    addButton.addEventListener("click", addTask);

    // Add task using Enter key
    taskInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            addTask();
        }
    });

    // Initial display
    displayTasks();

});
