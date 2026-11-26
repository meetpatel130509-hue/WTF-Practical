		const form = document.querySelector("#result-form");
		const subjectsList = document.querySelector("#subjects-list");
		const subjectCount = document.querySelector("#subject-count");
		const formError = document.querySelector("#form-error");
		const resultPanel = document.querySelector("#result-panel");

		function escapeAttribute(value) {
			return String(value).replace(/[&"<>']/g, character => ({ "&": "&amp;", "\"": "&quot;", "<": "&lt;", ">": "&gt;", "'": "&#39;" })[character]);
		}

		function createSubjectRow(subjectName = "", marks = "") {
			const row = document.createElement("div");
			row.className = "subject-row";
			row.innerHTML = `<input class="subject-name" type="text" aria-label="Subject name" placeholder="Subject name" maxlength="50" value="${escapeAttribute(subjectName)}">
				<input class="mark-input" type="number" aria-label="Marks out of 100" placeholder="0–100" min="0" max="100" step="0.01" inputmode="decimal" value="${escapeAttribute(marks)}">
				<button class="icon-button remove-subject" type="button" aria-label="Remove subject" title="Remove subject"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M5 7l1 13h12l1-13M9 7V4h6v3"/></svg></button>`;
			subjectsList.append(row);
			updateSubjectControls();
			return row;
		}

		function updateSubjectControls() {
			const count = subjectsList.children.length;
			subjectCount.textContent = `${count} ${count === 1 ? "subject" : "subjects"}`;
			subjectsList.querySelectorAll(".remove-subject").forEach(button => { button.disabled = count <= 1; });
			document.querySelector("#add-subject").disabled = count >= 12;
		}

		function showError(message, field = null) {
			formError.textContent = message;
			form.querySelectorAll("[aria-invalid='true']").forEach(input => input.removeAttribute("aria-invalid"));
			if (field) { field.setAttribute("aria-invalid", "true"); field.focus(); }
		}

		function getGrade(percentage) {
			if (percentage >= 90) return "A+";
			if (percentage >= 80) return "A";
			if (percentage >= 70) return "B";
			if (percentage >= 60) return "C";
			if (percentage >= 50) return "D";
			if (percentage >= 35) return "E";
			return "F";
		}

		function formatNumber(number) {
			return Number.isInteger(number) ? String(number) : number.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
		}

		function calculateResult(event) {
			event.preventDefault();
			const rows = [...subjectsList.querySelectorAll(".subject-row")];
			let total = 0;
			let passed = 0;

			for (const row of rows) {
				const nameField = row.querySelector(".subject-name");
				const markField = row.querySelector(".mark-input");
				const rawMark = markField.value.trim();
				const mark = Number(rawMark);
				if (!nameField.value.trim()) return showError("Enter a name for every subject.", nameField);
				if (rawMark === "" || !Number.isFinite(mark) || mark < 0 || mark > 100) return showError("Enter a mark from 0 to 100 for every subject.", markField);
				total += mark;
				if (mark >= 35) passed++;
			}

			showError("");
			const percentage = total / rows.length;
			const isPassing = passed === rows.length;
			const studentName = document.querySelector("#student-name").value.trim();
			const rollNumber = document.querySelector("#roll-number").value.trim();
			const identity = [studentName || "Student", rollNumber ? `#${rollNumber}` : ""].filter(Boolean).join(" · ");
			document.querySelector("#result-name").textContent = identity;
			document.querySelector("#result-grade").textContent = getGrade(percentage);
			document.querySelector("#result-classification").textContent = isPassing ? "Pass" : "Fail";
			document.querySelector("#result-total").textContent = `${formatNumber(total)} / ${rows.length * 100}`;
			document.querySelector("#result-percentage").textContent = `${formatNumber(percentage)}%`;
			document.querySelector("#result-passed").textContent = `${passed} / ${rows.length}`;
			document.querySelector("#result-note").textContent = isPassing ? "All subjects meet the minimum pass mark of 35." : "A mark below 35 in any subject results in an overall fail.";
			resultPanel.dataset.state = isPassing ? "pass" : "fail";
		}

		document.querySelector("#add-subject").addEventListener("click", () => {
			if (subjectsList.children.length < 12) createSubjectRow().querySelector(".subject-name").focus();
		});
		subjectsList.addEventListener("click", event => {
			const removeButton = event.target.closest(".remove-subject");
			if (!removeButton || subjectsList.children.length <= 1) return;
			removeButton.closest(".subject-row").remove();
			updateSubjectControls();
		});
		form.addEventListener("submit", calculateResult);
		form.addEventListener("input", event => {
			event.target.removeAttribute("aria-invalid");
			if (formError.textContent) showError("");
		});
		form.addEventListener("reset", () => {
			requestAnimationFrame(() => {
				subjectsList.replaceChildren();
				createSubjectRow("Mathematics");
				createSubjectRow("Science");
				createSubjectRow("English");
				showError("");
				document.querySelector("#result-name").textContent = "Awaiting student";
				document.querySelector("#result-grade").textContent = "—";
				document.querySelector("#result-classification").textContent = "Not calculated";
				document.querySelector("#result-total").textContent = "—";
				document.querySelector("#result-percentage").textContent = "—";
				document.querySelector("#result-passed").textContent = "—";
				document.querySelector("#result-note").textContent = "Add marks for each subject, then calculate to see the final result.";
				resultPanel.dataset.state = "empty";
			});
		});

		createSubjectRow("Mathematics");
		createSubjectRow("Science");
		createSubjectRow("English");
