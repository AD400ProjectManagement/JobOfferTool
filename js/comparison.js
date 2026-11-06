document.addEventListener("DOMContentLoaded", () => {
    // Load saved offers first
    loadSavedOffers();
    renderSavedOffers();

    let editingOfferId = null;

    initComparisonTool();

    // Save job offers to browser localStorage
    const saveOfferBtn = document.getElementById("saveOfferBtn");
    const saveStatus = document.getElementById("saveStatus");

    if (saveOfferBtn && saveStatus) {
        saveOfferBtn.addEventListener("click", () => {
            try {
                const offers = gatherAllCurrentOffers();

                if (offers.length === 0) {
                    saveStatus.textContent = "Please enter at least one job offer.";
                    return;
                }

                const savedOffers = JSON.parse(
                    localStorage.getItem("savedOffers") || "[]"
                );

                if (!Array.isArray(savedOffers)) {
                    throw new Error("Invalid saved offers data.");
                }

                if (editingOfferId !== null) {
                    const updatedOffer = offers[0];
                    updatedOffer.id = editingOfferId;

                    const existingIndex = savedOffers.findIndex(
                        offer => String(offer.id) === String(editingOfferId)
                    );

                    if (existingIndex !== -1) {
                        savedOffers[existingIndex] = updatedOffer;
                    }

                    editingOfferId = null;
                } else {
                    offers.forEach((offer) => {
                        const existingIndex = savedOffers.findIndex(
                            savedOffer => savedOffer.id === offer.id
                        );

                        if (existingIndex !== -1) {
                            savedOffers[existingIndex] = offer;
                        } else {
                            savedOffers.push(offer);
                        }
                    });
                }

                localStorage.setItem(
                    "savedOffers",
                    JSON.stringify(savedOffers)
                );

                saveStatus.textContent = "Offers saved successfully!";
                renderSavedOffers();
            } catch (error) {
                console.error("Error saving offers:", error);
                saveStatus.textContent = "Sorry, your offers could not be saved.";
            }
        });
    }

    // Form interactions and live recalculation
    const form = document.getElementById("evaluationForm");

    if (form) {
        form.addEventListener("input", () => {
            refreshOfferCheckboxes();

            const reportSection = document.getElementById("comparisonReport");

            if (reportSection && reportSection.style.display !== "none") {
                runOfferEvaluation();
            }
        });

        form.addEventListener("change", () => {
            refreshOfferCheckboxes();
        });
    }

    // Evaluate button
    const evaluateBtn = document.getElementById("evaluateBtn");

    if (evaluateBtn) {
        evaluateBtn.addEventListener("click", (e) => {
            e.preventDefault();
            runOfferEvaluation();
        });
    }

    // Handle Edit, Delete, Add, and Remove buttons
    document.addEventListener("click", (e) => {

        // Delete saved offer
        // Delete saved offer
if (e.target.classList.contains("deleteSavedOfferBtn")) {
    const offerId = e.target.dataset.id;

    let savedOffers = JSON.parse(
        localStorage.getItem("savedOffers") || "[]"
    );

    savedOffers = savedOffers.filter(
        offer => String(offer.id) !== String(offerId)
    );

    localStorage.setItem("savedOffers", JSON.stringify(savedOffers));
    renderSavedOffers();

    saveStatus.textContent = "Job offer deleted successfully!";
    return;
}

        // Edit saved offer
        if (e.target.classList.contains("editSavedOfferBtn")) {
            const offerId = e.target.dataset.id;

            const savedOffers = JSON.parse(
                localStorage.getItem("savedOffers") || "[]"
            );

            const offer = savedOffers.find(
                item => String(item.id) === String(offerId)
            );

            if (!offer) return;

            editingOfferId = offer.id;

            document.getElementById("companyName1").value = offer.companyName || "";
            document.getElementById("jobTitle1").value = offer.jobTitle || "";
            document.getElementById("salary1").value = offer.salary || "";
            document.getElementById("workMode1").value = offer.workMode || "";
            document.getElementById("vacationDays1").value = offer.vacationDays || "";
            document.getElementById("healthBenefits1").value = offer.healthBenefits || "";
            document.getElementById("netPayAfterRelocation1").value = offer.netPay || "";

            refreshOfferCheckboxes();

            saveStatus.textContent =
                "Edit your offer below, then click Save Offer.";

            document.getElementById("evaluationForm").scrollIntoView({
                behavior: "smooth"
            });

            return;
        }

        // Remove a job offer
        if (e.target.classList.contains("removeOfferBtn")) {
            const offerCard = e.target.closest(".offerCard");

            if (offerCard) {
                offerCard.remove();
                refreshOfferCheckboxes();
            }

            return;
        }

        // Refresh after adding a job offer
        if (e.target.id === "addOfferBtn") {
            setTimeout(() => {
                refreshOfferCheckboxes();
            }, 50);
        }
    });
}); // Close DOMContentLoaded


// Load saved job offers from browser localStorage
function loadSavedOffers() {
    try {
        const savedOffersData = JSON.parse(
            localStorage.getItem("savedOffers") || "[]"
        );

        const savedOffers = [
            ...new Map(savedOffersData.map(offer => [offer.id, offer])).values()
        ];

        if (!Array.isArray(savedOffers)) {
            throw new Error("Invalid saved offers data.");
        }

        ["offer1", "offer2"].forEach((offerId) => {
            const offer = [...savedOffers]
                .reverse()
                .find(item => item.id === offerId);

            if (!offer) return;

            const number = offerId === "offer1" ? "1" : "2";

            const fields = [
                [`companyName${number}`, offer.companyName],
                [`jobTitle${number}`, offer.jobTitle],
                [`salary${number}`, offer.salary],
                [`workMode${number}`, offer.workMode],
                [`vacationDays${number}`, offer.vacationDays],
                [`healthBenefits${number}`, offer.healthBenefits],
                [`netPayAfterRelocation${number}`, offer.netPay]
            ];

            fields.forEach(([id, value]) => {
                const field = document.getElementById(id);
                if (field) field.value = value ?? "";
            });
        });

    } catch (error) {
        console.error("Error loading saved offers:", error);
    }
}


// Display all saved job offers as cards
function renderSavedOffers() {
    const savedOffersList = document.getElementById("savedOffersList");

    if (!savedOffersList) return;

    try {
        const savedOffers = JSON.parse(
            localStorage.getItem("savedOffers") || "[]"
        );

        savedOffersList.innerHTML = "";

        if (!Array.isArray(savedOffers) || savedOffers.length === 0) {
            savedOffersList.textContent = "No saved job offers yet.";
            return;
        }

        savedOffers.forEach((offer) => {
            const card = document.createElement("div");
            card.className = "saved-offer-card";

            const company = document.createElement("h3");
            company.textContent = offer.companyName || "Unknown Company";

            const details = [
                `Job Title: ${offer.jobTitle || "Not provided"}`,
                `Annual Salary: ${formatSalaryCurrency(offer.salary)}`,
                `Work Mode: ${offer.workMode || "Not provided"}`,
                `Vacation Days: ${formatPtoDays(offer.vacationDays)}`,
                `Health Benefits: ${offer.healthBenefits ?? "Not provided"} / 10`,
                `Net Pay After Relocation: ${formatSalaryCurrency(offer.netPay)}`
            ];

            card.appendChild(company);

            details.forEach((detail) => {
                const paragraph = document.createElement("p");
                paragraph.textContent = detail;
                card.appendChild(paragraph);
            });

            // Edit button
            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Edit";
            editButton.className = "editSavedOfferBtn";
            editButton.dataset.id = offer.id;

            // Delete button
            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.className = "deleteSavedOfferBtn";
            deleteButton.dataset.id = offer.id;

            card.appendChild(editButton);
            card.appendChild(deleteButton);

            savedOffersList.appendChild(card);
        });

    } catch (error) {
        console.error("Error displaying saved offers:", error);
        savedOffersList.textContent = "Unable to display saved job offers.";
    }
}


// Collect all current job offers
function gatherAllCurrentOffers() {
    const offers = [];

    document.querySelectorAll(".offerCard").forEach((card, index) => {
        const id = card.id || `dynamicOffer${index + 1}`;

        const getValue = (selector) => {
            const field = card.querySelector(selector);
            return field ? field.value : "";
        };

        offers.push({
            id: id,
            companyName: getValue(".input-company") || card.querySelector("#companyName" + (index + 1))?.value || "",
            jobTitle: getValue(".input-title") || card.querySelector("#jobTitle" + (index + 1))?.value || "",
            salary: getValue(".input-salary") || card.querySelector("#salary" + (index + 1))?.value || "",
            workMode: getValue(".input-workmode") || "",
            vacationDays: getValue(".input-vacation") || "",
            healthBenefits: getValue(".input-benefits") || "",
            netPay: getValue(".input-netpay") || ""
        });
    });

    return offers;
}


// ========================================================
// Melkam: Salary Comparison Feature - Currency Formatting
// ========================================================
function formatSalaryCurrency(amount) {
    const value = Number(amount);

    if (
        amount === null ||
        amount === undefined ||
        amount === "" ||
        !Number.isFinite(value) ||
        value <= 0
    ) {
        return "Not provided";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    }).format(value);
}


// ========================================================
// Melkam: PTO Comparison Feature - Missing Data Formatting
// ========================================================
function formatPtoDays(days) {
    if (days === null || days === undefined || String(days).trim() === "") {
        return "Not provided.";
    }

    return `${days} days`;
}


function initComparisonTool() {
    refreshOfferCheckboxes();
}


function refreshOfferCheckboxes() {
    const offers = gatherAllCurrentOffers();
    const checkboxGroup = document.getElementById("offerSelectionCheckboxes");

    if (!checkboxGroup) return;

    // Retain currently checked states if possible
    const previouslyCheckedValues = Array.from(
        document.querySelectorAll(".offer-select-cb:checked")
    ).map(cb => cb.value);

    if (offers.length === 0) {
        checkboxGroup.innerHTML =
            "<p>Fill out at least one job offer above to enable selection.</p>";

        renderSideBySideComparison([], []);
        return;
    }

    checkboxGroup.innerHTML = offers.map((offer, idx) => {
        const isChecked = previouslyCheckedValues.includes(idx.toString())
            ? "checked"
            : "";

        return `
            <label class="offer-checkbox-label">
                <input type="checkbox" value="${idx}" class="offer-select-cb" ${isChecked} onchange="handleSelectionChange()">
                <strong>${offer.companyName}</strong> (${offer.jobTitle})
            </label>
        `;
    }).join('');

    handleSelectionChange();
}


function handleSelectionChange() {
    const offers = gatherAllCurrentOffers();
    const checkedBoxes = document.querySelectorAll(".offer-select-cb:checked");
    const selectedIndices = Array.from(checkedBoxes).map(cb => parseInt(cb.value));

    renderSideBySideComparison(selectedIndices, offers);
}


function renderSideBySideComparison(selectedIndices, offers) {
    const comparisonContainer = document.getElementById("comparisonContainer");

    if (!comparisonContainer) return;

    // Fallback state if fewer than 2 offers are selected
    if (!selectedIndices || selectedIndices.length < 2) {
        comparisonContainer.innerHTML = `
            <div id="comparisonFallback" class="comparison-fallback-card">
                <p>No offers selected for comparison. Please select at least two offers. (Currently selected: ${selectedIndices ? selectedIndices.length : 0})</p>
            </div>
        `;
        return;
    }

    // Map selected offers into unique scoped columns
    comparisonContainer.innerHTML = selectedIndices.map((offerIndex, pos) => {
        const offer = offers[offerIndex];

        if (!offer) return '';

        const scopedColumnId = `column-${pos + 1}`;

        /* ========================================================
           TODO (Melkam): Salary and Net Pay Comparison
        ======================================================== */

        const highestSalary = Math.max(
            ...selectedIndices.map(index => Number(offers[index]?.salary) || 0)
        );

        const salary = Number(offer.salary) || 0;
        const isHighestSalary = salary > 0 && salary === highestSalary;

        const formatCurrency = (value) => {
            return formatSalaryCurrency(value);
        };

        return `
            <div class="comparison-column" id="${scopedColumnId}">
                <h3>${offer.companyName}</h3>

                <div class="comp-metric-row">
                    <span class="comp-metric-label">Job Title:</span>
                    <span>${offer.jobTitle}</span>
                </div>

                <div class="comp-metric-row">
                    <span class="comp-metric-label">Work Mode:</span>
                    <span>${offer.workMode}</span>
                </div>

                <!-- Melkam: Display Annual Salary and highlight the highest salary -->
                <div class="comp-metric-row">
                    <span class="comp-metric-label">Annual Salary:</span>
                    <span>
                        ${formatCurrency(offer.salary)}
                        ${isHighestSalary ? "⭐ Highest Salary" : ""}
                    </span>
                </div>

                <!-- Melkam: Display Net Pay -->
                <div class="comp-metric-row">
                    <span class="comp-metric-label">Net Pay:</span>
                    <span>${formatCurrency(offer.netPay)}</span>
                </div>

                <!-- Melkam: Display PTO days with missing-data fallback -->
                <div class="comp-metric-row">
                    <span class="comp-metric-label">PTO Days:</span>
                    <span>${formatPtoDays(offer.vacationDays)}</span>
                </div>

                <div class="comp-metric-row">
                    <span class="comp-metric-label">Health Benefits:</span>
                    <span>${offer.healthBenefits ?? "Not provided."} / 10</span>
                </div>
            </div>
        `;
    }).join('');
}


// Evaluate job offers
function runOfferEvaluation() {
    const offers = gatherAllCurrentOffers();

    if (offers.length === 0) {
        alert("Please enter at least one job offer before evaluating.");
        return;
    }

    // Gather Preference Criteria Weights
    const weights = {
        salary: parseFloat(document.getElementById("salaryWeight")?.value) || 5,
        workMode: parseFloat(document.getElementById("workModeWeight")?.value) || 5,
        benefits: parseFloat(document.getElementById("benefitsWeight")?.value) || 5,
        vacation: parseFloat(document.getElementById("vacationWeight")?.value) || 5
    };

    // Compute Weighted Scores for each offer
    const evaluatedOffers = offers.map(offer => {
        const salaryVal = parseFloat(offer.salary) || 0;
        const salaryScore = (salaryVal / 150000) * 10;

        const ptoVal = parseFloat(offer.vacationDays) || 0;
        const ptoScore = (ptoVal / 25) * 10;

        const benefitVal = parseFloat(offer.healthBenefits) || 5;

        let workModeScore = 5;

        if (offer.workMode === "Remote") {
            workModeScore = 10;
        } else if (offer.workMode === "Hybrid") {
            workModeScore = 7;
        } else if (offer.workMode === "On-site") {
            workModeScore = 4;
        }

        const totalWeight =
            weights.salary +
            weights.workMode +
            weights.benefits +
            weights.vacation;

        const weightedSum =
            (salaryScore * weights.salary) +
            (workModeScore * weights.workMode) +
            (benefitVal * weights.benefits) +
            (ptoScore * weights.vacation);

        const finalScore = totalWeight > 0
            ? (weightedSum / totalWeight).toFixed(1)
            : "0.0";

        return {
            ...offer,
            calculatedScore: parseFloat(finalScore)
        };
    });

    // Find the Winning Offer
    let highestScore = -1;

    evaluatedOffers.forEach(offer => {
        if (offer.calculatedScore > highestScore) {
            highestScore = offer.calculatedScore;
        }
    });

    // Render the Comparison Report Section
    const reportSection = document.getElementById("comparisonReport");
    const tableContainer = document.getElementById("tableContainer");

    if (!reportSection || !tableContainer) return;

    reportSection.style.display = "block";

    tableContainer.innerHTML = `
        <p class="report-subtitle">Evaluated based on your custom preference criteria weights.</p>

        <div class="report-grid">
            ${evaluatedOffers.map((offer) => {
                const isWinner =
                    offer.calculatedScore === highestScore && highestScore > 0;

                const cardClass = isWinner
                    ? "report-card winning-card"
                    : "report-card";

                /* ===================================================
                   TODO (Melkam): Add evaluated salary summary metrics
                =================================================== */

                return `
                    <div class="${cardClass}" ${isWinner ? 'aria-label="Top ranking winning job offer"' : ''}>
                        ${isWinner ? '<span class="winner-badge">⭐ Top Recommendation ⭐</span>' : ''}

                        <div class="report-score-header">
                            <span>${offer.companyName || 'Target Company'}</span>
                            <span class="score-badge">${offer.calculatedScore} / 10</span>
                        </div>

                        <div class="report-metric-row">
                            <span class="report-metric-label">Job Title:</span>
                            <span>${offer.jobTitle}</span>
                        </div>

                        <div class="report-metric-row">
                            <span class="report-metric-label">Work Mode:</span>
                            <span>${offer.workMode}</span>
                        </div>

                        <!-- Melkam: Display Annual Salary in the final report -->
                        <div class="report-metric-row">
                            <span class="report-metric-label">Annual Salary:</span>
                            <span>${formatSalaryCurrency(offer.salary)}</span>
                        </div>

                        <!-- Melkam: Display Net Pay in the final report -->
                        <div class="report-metric-row">
                            <span class="report-metric-label">Net Pay:</span>
                            <span>${formatSalaryCurrency(offer.netPay)}</span>
                        </div>

                        <!-- Melkam: Display PTO days in the final report -->
                        <div class="report-metric-row">
                            <span class="report-metric-label">PTO Days:</span>
                            <span>${formatPtoDays(offer.vacationDays)}</span>
                        </div>

                        <div class="report-metric-row">
                            <span class="report-metric-label">Health Benefits:</span>
                            <span>${offer.healthBenefits} / 10</span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    reportSection.scrollIntoView({ behavior: 'smooth' });
}