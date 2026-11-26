		const itemsList = document.querySelector("#items-list");
		const form = document.querySelector("#bill-form");
		const formError = document.querySelector("#form-error");
		const bill = document.querySelector("#bill");
		const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
		let lastBill = null;

		function addItem(name = "", quantity = "1", price = "") {
			if (itemsList.children.length >= 30) return;
			const row = document.createElement("div");
			row.className = "item-row";
			const nameInput = document.createElement("input");
			nameInput.type = "text";
			nameInput.className = "product-name";
			nameInput.placeholder = "Product name";
			nameInput.maxLength = 80;
			nameInput.setAttribute("aria-label", "Product name");
			nameInput.value = name;
			const quantityInput = document.createElement("input");
			quantityInput.type = "number";
			quantityInput.className = "quantity";
			quantityInput.min = "1";
			quantityInput.max = "9999";
			quantityInput.step = "1";
			quantityInput.inputMode = "numeric";
			quantityInput.setAttribute("aria-label", "Quantity");
			quantityInput.value = quantity;
			const priceInput = document.createElement("input");
			priceInput.type = "number";
			priceInput.className = "unit-price";
			priceInput.min = "0";
			priceInput.step = "0.01";
			priceInput.inputMode = "decimal";
			priceInput.placeholder = "0.00";
			priceInput.setAttribute("aria-label", "Price per unit in rupees");
			priceInput.value = price;
			const remove = document.createElement("button");
			remove.type = "button";
			remove.className = "remove-item";
			remove.title = "Remove item";
			remove.setAttribute("aria-label", "Remove item");
			remove.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M5 7l1 13h12l1-13M9 7V4h6v3"/></svg>';
			row.append(nameInput, quantityInput, priceInput, remove);
			itemsList.append(row);
			updateItemControls();
			return row;
		}

		function updateItemControls() {
			const count = itemsList.children.length;
			document.querySelector("#item-count").textContent = `${count} ${count === 1 ? "item" : "items"}`;
			itemsList.querySelectorAll(".remove-item").forEach(button => { button.disabled = count <= 1; });
			document.querySelector("#add-item").disabled = count >= 30;
		}

		function roundCents(amount) {
			return Math.round((amount + Number.EPSILON) * 100);
		}

		function setError(message, input = null) {
			formError.textContent = message;
			form.querySelectorAll("[aria-invalid='true']").forEach(field => field.removeAttribute("aria-invalid"));
			if (input) {
				input.setAttribute("aria-invalid", "true");
				input.focus();
			}
		}

		function renderBill(result) {
			lastBill = result;
			const receiptItems = document.querySelector("#receipt-items");
			receiptItems.replaceChildren();
			result.items.forEach(item => {
				const row = document.createElement("div");
				row.className = "receipt-item";
				const description = document.createElement("span");
				description.className = "item-description";
				description.textContent = item.name;
				const detail = document.createElement("small");
				detail.textContent = `${item.quantity} × ${money.format(item.unitPriceCents / 100)}`;
				description.append(detail);
				const amount = document.createElement("strong");
				amount.textContent = money.format(item.lineCents / 100);
				row.append(description, amount);
				receiptItems.append(row);
			});
			document.querySelector("#subtotal").textContent = money.format(result.subtotalCents / 100);
			document.querySelector("#discount-label").textContent = `Discount (${result.discountRate}%)`;
			document.querySelector("#discount-amount").textContent = `−${money.format(result.discountCents / 100)}`;
			document.querySelector("#gst-label").textContent = `GST (${result.gstRate}%)`;
			document.querySelector("#gst-amount").textContent = money.format(result.gstCents / 100);
			document.querySelector("#final-total").textContent = money.format(result.totalCents / 100);
			document.querySelector("#payable").textContent = money.format(result.totalCents / 100).replace(/^₹\s?/, "");
			document.querySelector("#bill-state").textContent = `${result.items.length} ${result.items.length === 1 ? "item" : "items"} · ready to pay`;
			document.querySelector("#print-bill").disabled = false;
			bill.dataset.state = "calculated";
		}

		function calculate(event) {
			event.preventDefault();
			const rows = [...itemsList.querySelectorAll(".item-row")];
			const items = [];
			let subtotalCents = 0;
			for (const row of rows) {
				const nameInput = row.querySelector(".product-name");
				const quantityInput = row.querySelector(".quantity");
				const priceInput = row.querySelector(".unit-price");
				const name = nameInput.value.trim();
				const quantity = Number(quantityInput.value);
				const unitPrice = Number(priceInput.value);
				if (!name) return setError("Enter a product name for every item.", nameInput);
				if (quantityInput.value.trim() === "" || !Number.isInteger(quantity) || quantity < 1 || quantity > 9999) return setError("Quantity must be a whole number from 1 to 9,999.", quantityInput);
				if (priceInput.value.trim() === "" || !Number.isFinite(unitPrice) || unitPrice < 0) return setError("Enter a valid price of zero or more.", priceInput);
				const unitPriceCents = roundCents(unitPrice);
				const lineCents = unitPriceCents * quantity;
				subtotalCents += lineCents;
				items.push({ name, quantity, unitPriceCents, lineCents });
			}

			const discountInput = document.querySelector("#discount-rate");
			const gstInput = document.querySelector("#gst-rate");
			const discountRate = Number(discountInput.value);
			const gstRate = Number(gstInput.value);
			if (discountInput.value.trim() === "" || !Number.isFinite(discountRate) || discountRate < 0 || discountRate > 100) return setError("Discount must be between 0% and 100%.", discountInput);
			if (gstInput.value.trim() === "" || !Number.isFinite(gstRate) || gstRate < 0 || gstRate > 100) return setError("GST must be between 0% and 100%.", gstInput);

			const discountCents = Math.round(subtotalCents * discountRate / 100);
			const taxableCents = subtotalCents - discountCents;
			const gstCents = Math.round(taxableCents * gstRate / 100);
			const totalCents = taxableCents + gstCents;
			setError("");
			renderBill({ items, subtotalCents, discountRate, discountCents, gstRate, gstCents, totalCents });
		}

		document.querySelector("#add-item").addEventListener("click", () => {
			const row = addItem();
			if (row) row.querySelector(".product-name").focus();
		});
		itemsList.addEventListener("click", event => {
			const removeButton = event.target.closest(".remove-item");
			if (!removeButton || itemsList.children.length <= 1) return;
			removeButton.closest(".item-row").remove();
			updateItemControls();
		});
		form.addEventListener("submit", calculate);
		form.addEventListener("input", event => {
			event.target.removeAttribute("aria-invalid");
			if (formError.textContent) setError("");
		});
		form.addEventListener("reset", () => {
			requestAnimationFrame(() => {
				itemsList.replaceChildren();
				addItem();
				setError("");
				lastBill = null;
				document.querySelector("#payable").textContent = "0.00";
				document.querySelector("#bill-state").textContent = "Add items to begin.";
				document.querySelector("#receipt-items").innerHTML = '<p class="empty-state">Your purchased items will appear here.</p>';
				document.querySelector("#subtotal").textContent = "₹0.00";
				document.querySelector("#discount-label").textContent = "Discount";
				document.querySelector("#discount-amount").textContent = "−₹0.00";
				document.querySelector("#gst-label").textContent = "GST";
				document.querySelector("#gst-amount").textContent = "₹0.00";
				document.querySelector("#final-total").textContent = "₹0.00";
				document.querySelector("#print-bill").disabled = true;
				bill.dataset.state = "empty";
			});
		});
		document.querySelector("#print-bill").addEventListener("click", () => { if (lastBill) window.print(); });
		document.querySelector("#today").textContent = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date());
		addItem();
