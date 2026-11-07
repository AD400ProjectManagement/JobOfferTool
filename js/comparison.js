
/* ========================================================
   SAVED JOB OFFERS
   ======================================================== */

// Display all saved job offers
function renderSavedOffers() {
    const savedOffersList = document.getElementById("savedOffersList");

    if (!savedOffersList) return;

    try {
        const savedOffers = JSON.parse(
            localStorage.getItem("savedOffers") || "[]"
        );

        savedOffersList.innerHTML = "";

        if (!Array.isArray(savedOffers) || savedOffers.length === 0) {
            const message = document.createElement("p");
            message.textContent = "No saved job offers yet.";
            savedOffersList.appendChild(message);
            return;
        }

        savedOffers.forEach((offer) => {
            const offerCard = document.createElement("div");
            offerCard.className = "saved-offer-card";

            const company = document.createElement("h3");
            company.textContent = offer.companyName || "Unknown Company";

            const title = document.createElement("p");
            title.textContent = "Job Title: " + (offer.jobTitle || "N/A");

            const salary = document.createElement("p");
            salary.textContent = "Salary: " + formatSalaryCurrency(offer.salary);

            offerCard.appendChild(company);
            offerCard.appendChild(title);
            offerCard.appendChild(salary);

            savedOffersList.appendChild(offerCard);
        });

    } catch (error) {
        console.error("Error displaying saved offers:", error);
        savedOffersList.textContent = "Unable to display saved job offers.";
    }
}


// Load saved job offers into the form
function loadSavedOffers() {
    try {
        const savedOffers = JSON.parse(
            localStorage.getItem("savedOffers") || "[]"
        );

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

                if (field) {
                    field.value = value ?? "";
                }
            });
        });

    } catch (error) {
        console.error("Error loading saved offers:", error);
    }
}


/* ========================================================
   PAGE INITIALIZATION AND EVENT LISTENERS
   ======================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Load and display saved offers when the page opens
    loadSavedOffers();
    renderSavedOffers();

    // Initialize comparison checkboxes
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

                // Update existing offers instead of creating duplicates
                const offersById = new Map(
                    savedOffers.map(offer => [offer.id, offer])
                );

                offers.forEach((offer) => {
                    offersById.set(offer.id, offer);
                });

                const updatedOffers = Array.from(offersById.values());

                localStorage.setItem(
                    "savedOffers",
                    JSON.stringify(updatedOffers)
                );

                saveStatus.textContent = "Offers saved successfully!";

                // Refresh the saved offers list
                renderSavedOffers();

            } catch (error) {
                console.error("Error saving offers:", error);
                saveStatus.textContent = "Sorry, your offers could not be saved.";
            }
        });
    }


    // Form interactions and live updates
    const form = document.getElementById("evaluationForm");

    if (form) {
        form.addEventListener("input", () => {
            refreshOfferCheckboxes();

            // Auto-update evaluation report if it is already open
            const reportSection = document.getElementById("comparisonReport");

            if (reportSection && reportSection.style.display !== "none") {
                runOfferEvaluation();
            }
        });

        form.addEventListener("change", () => {
            refreshOfferCheckboxes();
        });
    }


    // Evaluate button click handler
    const evaluateBtn = document.getElementById("evaluateBtn");

    if (evaluateBtn) {
        evaluateBtn.addEventListener("click", (e) => {
            e.preventDefault();
            runOfferEvaluation();
        });
    }


    // Listen for Add Offer and Remove button clicks
    document.addEventListener("click", (e) => {

        if (
            e.target.id === "addOfferBtn" ||
            e.target.classList.contains("removeOfferBtn")
        ) {
            setTimeout(() => {
                refreshOfferCheckboxes();
            }, 50);
        }
    });
});


/* ========================================================
   GATHER CURRENT JOB OFFERS
   ======================================================== */

function gatherAllCurrentOffers() {
    const offers = [];

    // Grab Offer 1
    const comp1 = document.getElementById("companyName1")?.value;

    if (comp1) {
        offers.push({
            id: "offer1",
            companyName: comp1,
            jobTitle: document.getElementById("jobTitle1")?.value || "N/A",
            salary: document.getElementById("salary1")?.value || 0,
            workMode: document.getElementById("workMode1")?.value || "N/A",
            vacationDays: document.getElementById("vacationDays1")?.value || "",
            healthBenefits: document.getElementById("healthBenefits1")?.value || 0,
            netPay: document.getElementById("netPayAfterRelocation1")?.value || "N/A"
        });
    }


    // Grab Offer 2
    const comp2 = document.getElementById("companyName2")?.value;

    if (comp2) {
        offers.push({
            id: "offer2",
            companyName: comp2,
            jobTitle: document.getElementById("jobTitle2")?.value || "N/A",
            salary: document.getElementById("salary2")?.value || 0,
            workMode: document.getElementById("workMode2")?.value || "N/A",
            vacationDays: document.getElementById("vacationDays2")?.value || "",
            healthBenefits: document.getElementById("healthBenefits2")?.value || 0,
            netPay: document.getElementById("netPayAfterRelocation2")?.value || "N/A"
        });
    }


    // Grab additional dynamically created offer cards
    const dynamicCards = document.querySelectorAll(
        ".offersContainer .offerCard:not(#offer1):not(#offer2)"
    );

    dynamicCards.forEach((card, index) => {
        const compName = card.querySelector(".input-company")?.value;

        if (compName) {
            offers.push({
                id: `dynamicOffer${index + 3}`,
                companyName: compName,
                jobTitle: card.querySelector(".input-title")?.value || "N/A",
                salary: card.querySelector(".input-salary")?.value || 0,
                workMode: card.querySelector(".input-workmode")?.value || "N/A",
                vacationDays: card.querySelector(".input-vacation")?.value || "",
                healthBenefits: card.querySelector(".input-benefits")?.value || 0,
                netPay: card.querySelector(".input-netpay")?.value || "N/A"
            });
        }
    });

    return offers;
}


/* ========================================================
   INITIALIZE COMPARISON TOOL
   ======================================================== */

function initComparisonTool() {
    refreshOfferCheckboxes();
}


/* ========================================================
   MELKAM: SALARY COMPARISON - CURRENCY FORMATTING
   ======================================================== */

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


/* ========================================================
   MELKAM: PTO COMPARISON - MISSING DATA FORMATTING
   ======================================================== */

function formatPtoDays(days) {
    if (
        days === null ||
        days === undefined ||
        String(days).trim() === ""
    ) {
        return "Not provided.";
    }

    return `${days} days`;
}


/* ========================================================
   REFRESH OFFER CHECKBOXES
   ======================================================== */

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
                <input
                    type="checkbox"
                    value="${idx}"
                    class="offer-select-cb"
                    ${isChecked}
                    onchange="handleSelectionChange()"
                >
                <strong>${offer.companyName}</strong> (${offer.jobTitle})
            </label>
        `;
    }).join("");

    handleSelectionChange();
}


/* ========================================================
   HANDLE OFFER SELECTION
   ======================================================== */

function handleSelectionChange() {
    const offers = gatherAllCurrentOffers();

    const checkedBoxes = document.querySelectorAll(
        ".offer-select-cb:checked"
    );

    const selectedIndices = Array.from(checkedBoxes).map(
        cb => parseInt(cb.value)
    );

    renderSideBySideComparison(selectedIndices, offers);
}


/* ========================================================
   RENDER SIDE-BY-SIDE COMPARISON
   ======================================================== */

function renderSideBySideComparison(selectedIndices, offers) {
    const comparisonContainer = document.getElementById("comparisonContainer");

    if (!comparisonContainer) return;

    // Fallback if fewer than two offers are selected
    if (!selectedIndices || selectedIndices.length < 2) {
        comparisonContainer.innerHTML = `
            <div id="comparisonFallback" class="comparison-fallback-card">
                <p>
                    No offers selected for comparison.
                    Please select at least two offers.
                    (Currently selected: ${selectedIndices ? selectedIndices.length : 0})
                </p>
            </div>
        `;

        return;
    }

    // Create a comparison column for each selected offer
    comparisonContainer.innerHTML = selectedIndices.map((offerIndex, pos) => {
        const offer = offers[offerIndex];

        if (!offer) return "";

        const scopedColumnId = `column-${pos + 1}`;

        // Find the highest salary
        const highestSalary = Math.max(
            ...selectedIndices.map(
                index => Number(offers[index]?.salary) || 0
            )
        );

        const salary = Number(offer.salary) || 0;

        const isHighestSalary =
            salary > 0 && salary === highestSalary;

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

                <!-- Melkam: Display Annual Salary and highlight highest salary -->
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

                <!-- Melkam: Display PTO days -->
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
    }).join("");
}


/* ========================================================
   RUN JOB OFFER EVALUATION
   ======================================================== */

function runOfferEvaluation() {
    const offers = gatherAllCurrentOffers();

    if (offers.length === 0) {
        alert("Please enter at least one job offer before evaluating.");
        return;
    }

    // Gather preference criteria weights
    const weights = {
        salary: parseFloat(document.getElementById("salaryWeight")?.value) || 5,
        workMode: parseFloat(document.getElementById("workModeWeight")?.value) || 5,
        benefits: parseFloat(document.getElementById("benefitsWeight")?.value) || 5,
        vacation: parseFloat(document.getElementById("vacationWeight")?.value) || 5
    };


    // Compute weighted scores for each offer
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


    // Find the winning offer
    let highestScore = -1;

    evaluatedOffers.forEach(offer => {
        if (offer.calculatedScore > highestScore) {
            highestScore = offer.calculatedScore;
        }
    });


    // Render the comparison report
    const reportSection = document.getElementById("comparisonReport");
    const tableContainer = document.getElementById("tableContainer");

    if (!reportSection || !tableContainer) return;

    reportSection.style.display = "block";

    tableContainer.innerHTML = `
        <p class="report-subtitle">
            Evaluated based on your custom preference criteria weights.
        </p>

        <div class="report-grid">
            ${evaluatedOffers.map((offer) => {
                const isWinner =
                    offer.calculatedScore === highestScore && highestScore > 0;

                const cardClass = isWinner
                    ? "report-card winning-card"
                    : "report-card";

                return `
                    <div class="${cardClass}"
                        ${isWinner ? 'aria-label="Top ranking winning job offer"' : ""}>

                        ${isWinner
                            ? '<span class="winner-badge">⭐ Top Recommendation ⭐</span>'
                            : ""}

                        <div class="report-score-header">
                            <span>${offer.companyName || "Target Company"}</span>
                            <span class="score-badge">
                                ${offer.calculatedScore} / 10
                            </span>
                        </div>

                        <div class="report-metric-row">
                            <span class="report-metric-label">Job Title:</span>
                            <span>${offer.jobTitle}</span>
                        </div>

                        <div class="report-metric-row">
                            <span class="report-metric-label">Work Mode:</span>
                            <span>${offer.workMode}</span>
                        </div>

                        <!-- Melkam: Display Annual Salary -->
                        <div class="report-metric-row">
                            <span class="report-metric-label">Annual Salary:</span>
                            <span>${formatSalaryCurrency(offer.salary)}</span>
                        </div>

                        <!-- Melkam: Display Net Pay -->
                        <div class="report-metric-row">
                            <span class="report-metric-label">Net Pay:</span>
                            <span>${formatSalaryCurrency(offer.netPay)}</span>
                        </div>

                        <!-- Melkam: Display PTO days -->
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
            }).join("")}
        </div>
    `;

    reportSection.scrollIntoView({ behavior: "smooth" });
}
