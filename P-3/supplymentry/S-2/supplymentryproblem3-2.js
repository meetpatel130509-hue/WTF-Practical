		const DEFAULT_SLABS = [
			{ limit: 100, rate: 2 },
			{ limit: 300, rate: 3.5 },
			{ limit: 500, rate: 5 },
			{ limit: null, rate: 7 }
		];
		const slabsElement = document.querySelector("#slabs");
		const form = document.querySelector("#bill-form");
		const errorElement = document.querySelector("#form-error");
		const billPanel = document.querySelector("#bill-panel");
		let tariffSlabs = DEFAULT_SLABS.map(slab => ({ ...slab }));

		function currency(value) {
			return value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
		}

		function renderSlabs() {
			slabsElement.replaceChildren();
			tariffSlabs.forEach((slab, index) => {
				const row = document.createElement("div");
				row.className = "slab-row";
				if (slab.limit === null) {
					const precedingLimit = tariffSlabs[index - 1].limit;
					row.innerHTML = `<span class="slab-last-label">Above ${precedingLimit} <strong>units</strong></span><input class="slab-rate" type="number" min="0" step="0.01" inputmode="decimal" aria-label="Rate in rupees per unit for final slab" value="${slab.rate}"><button class="slab-remove" type="button" aria-label="Cannot remove final slab" disabled><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M5 7l1 13h12l1-13M9 7V4h6v3"/></svg></button>`;
				} else {
					row.innerHTML = `<input class="slab-limit" type="number" min="1" step="1" aria-label="Upper limit in units for slab ${index + 1}" value="${slab.limit}"><input class="slab-rate" type="number" min="0" step="0.01" inputmode="decimal" aria-label="Rate in rupees per unit for slab ${index + 1}" value="${slab.rate}"><button class="slab-remove" type="button" aria-label="Remove slab ${index + 1}" title="Remove slab"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M5 7l1 13h12l1-13M9 7V4h6v3"/></svg></button>`;
				}
				row.dataset.index = String(index);
				slabsElement.append(row);
			});
			document.querySelector("#add-slab").disabled = tariffSlabs.length >= 8;
		}

		function updateFinalSlabLabel() {
			const label = slabsElement.querySelector(".slab-last-label");
			if (label) label.firstChild.textContent = `Above ${tariffSlabs[tariffSlabs.length - 2].limit} `;
		}

		function readTariff() {
			const rows = [...slabsElement.querySelectorAll(".slab-row")];
			const slabs = rows.map((row, index) => {
				const limitInput = row.querySelector(".slab-limit");
				const rateInput = row.querySelector(".slab-rate");
				return {
					limit: limitInput ? Number(limitInput.value) : null,
					rate: Number(rateInput.value),
					limitInput,
					rateInput,
					index
				};
			});

			for (let index = 0; index < slabs.length; index++) {
				const slab = slabs[index];
				if (!Number.isFinite(slab.rate) || slab.rate < 0 || slab.rateInput.value.trim() === "") {
					return { error: "Enter a valid non-negative rate for every slab.", field: slab.rateInput };
				}
				if (slab.limit !== null && (!Number.isInteger(slab.limit) || slab.limit <= 0 || slab.limitInput.value.trim() === "")) {
					return { error: "Slab limits must be positive whole numbers.", field: slab.limitInput };
				}
				if (index > 0 && slab.limit !== null && slab.limit <= slabs[index - 1].limit) {
					return { error: "Each slab limit must be greater than the previous limit.", field: slab.limitInput };
				}
			}
			return { slabs };
		}

		function calculateProgressiveBill(units, slabs, fixedCharge) {
			let remaining = units;
			let previousLimit = 0;
			const rows = [];
			let energyChargeCents = 0;
			for (const slab of slabs) {
				const capacity = slab.limit === null ? remaining : slab.limit - previousLimit;
				const billedUnits = Math.min(remaining, capacity);
				const chargeCents = Math.round(billedUnits * slab.rate * 100);
				const charge = chargeCents / 100;
				rows.push({ label: slab.limit === null ? `Above ${previousLimit}` : `${previousLimit + 1}–${slab.limit}`, units: billedUnits, rate: slab.rate, charge });
				energyChargeCents += chargeCents;
				remaining -= billedUnits;
				if (slab.limit !== null) previousLimit = slab.limit;
			}
			const energyCharge = energyChargeCents / 100;
			const normalizedFixedCharge = Math.round(fixedCharge * 100) / 100;
			return { rows, energyCharge, fixedCharge: normalizedFixedCharge, total: energyCharge + normalizedFixedCharge };
		}

		function showError(message, field) {
			errorElement.textContent = message;
			form.querySelectorAll("[aria-invalid='true']").forEach(input => input.removeAttribute("aria-invalid"));
			if (field) {
				field.setAttribute("aria-invalid", "true");
				field.focus();
				billPanel.dataset.state = "error";
			}
		}

		function calculate(event) {
			event.preventDefault();
			const unitsInput = document.querySelector("#units");
			const fixedInput = document.querySelector("#fixed-charge");
			const units = Number(unitsInput.value);
			const fixedCharge = Number(fixedInput.value);
			if (unitsInput.value.trim() === "" || !Number.isFinite(units) || units < 0) return showError("Enter a valid consumption amount of zero or more.", unitsInput);
			if (fixedInput.value.trim() === "" || !Number.isFinite(fixedCharge) || fixedCharge < 0) return showError("Fixed charge must be zero or more.", fixedInput);
			const tariff = readTariff();
			if (tariff.error) return showError(tariff.error, tariff.field);

			const result = calculateProgressiveBill(units, tariff.slabs, fixedCharge);
			showError("");
			document.querySelector("#bill-total").textContent = currency(result.total);
			document.querySelector("#bill-caption").textContent = `${units.toLocaleString("en-IN")} kWh · energy ${currency(result.energyCharge)}${fixedCharge ? ` + fixed ${currency(fixedCharge)}` : ""}`;
			const breakdown = document.querySelector("#breakdown-rows");
			breakdown.replaceChildren();
			result.rows.forEach(row => {
				if (row.units === 0) return;
				const line = document.createElement("div");
				line.className = "breakdown-row";
				line.innerHTML = `<span class="tier-name">${row.label} @ ₹${currency(row.rate)}</span><span>${row.units.toLocaleString("en-IN")}</span><strong>₹${currency(row.charge)}</strong>`;
				breakdown.append(line);
			});
			if (fixedCharge > 0) {
				const fixedLine = document.createElement("div");
				fixedLine.className = "breakdown-row fixed-row";
				fixedLine.innerHTML = `<span class="tier-name">Fixed charge</span><span>—</span><strong>₹${currency(fixedCharge)}</strong>`;
				breakdown.append(fixedLine);
			}
			const totalLine = document.createElement("div");
			totalLine.className = "breakdown-row total-row";
			totalLine.innerHTML = `<span class="tier-name">Total bill</span><span></span><strong>₹${currency(result.total)}</strong>`;
			breakdown.append(totalLine);
			billPanel.dataset.state = "calculated";
		}

		slabsElement.addEventListener("input", event => {
			const row = event.target.closest(".slab-row");
			if (!row) return;
			const index = Number(row.dataset.index);
			tariffSlabs[index].rate = row.querySelector(".slab-rate").value;
			if (tariffSlabs[index].limit !== null) tariffSlabs[index].limit = row.querySelector(".slab-limit").value;
			if (event.target.classList.contains("slab-limit") && index === tariffSlabs.length - 2) updateFinalSlabLabel();
			event.target.removeAttribute("aria-invalid");
		});

		slabsElement.addEventListener("click", event => {
			const button = event.target.closest(".slab-remove");
			if (!button || tariffSlabs.length <= 2) return;
			tariffSlabs.splice(Number(button.closest(".slab-row").dataset.index), 1);
			renderSlabs();
		});

		document.querySelector("#add-slab").addEventListener("click", () => {
			if (tariffSlabs.length >= 8) return;
			const previousLimit = tariffSlabs[tariffSlabs.length - 2].limit;
			tariffSlabs.splice(tariffSlabs.length - 1, 0, { limit: Number(previousLimit) + 100, rate: 6 });
			renderSlabs();
		});

		form.addEventListener("submit", calculate);
		form.addEventListener("input", event => {
			event.target.removeAttribute("aria-invalid");
			if (errorElement.textContent) showError("");
		});
		form.addEventListener("reset", () => {
			requestAnimationFrame(() => {
				tariffSlabs = DEFAULT_SLABS.map(slab => ({ ...slab }));
				renderSlabs();
				errorElement.textContent = "";
				document.querySelector("#bill-total").textContent = "0.00";
				document.querySelector("#bill-caption").textContent = "Enter your consumption to calculate.";
				document.querySelector("#breakdown-rows").innerHTML = '<p class="empty-breakdown">Your slab-wise charges will appear here.</p>';
				billPanel.dataset.state = "empty";
			});
		});

		renderSlabs();
