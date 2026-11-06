
document.addEventListener("DOMContentLoaded", () => {
    // Initialize the comparison tool checkboxes on page load
    initComparisonTool();

    // Form interactions & changes to update selection list and live re-calculate report
    const form = document.getElementById("evaluationForm");
    if (form) {
        form.addEventListener("input", () => {
            refreshOfferCheckboxes();

            // Auto-update evaluation report if it's already open
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

    // Listen for clicks on "Add Offer" or "Remove" buttons to catch DOM updates
    document.addEventListener("click", (e) => {
        if (e.target.id === "addOfferBtn" || e.target.classList.contains("removeOfferBtn")) {
            setTimeout(() => {
                refreshOfferCheckboxes();
            }, 50);
        }
    });
});

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
            vacationDays: document.getElementById("vacationDays1")?.value || 0,
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
            vacationDays: document.getElementById("vacationDays2")?.value || 0,
            healthBenefits: document.getElementById("healthBenefits2")?.value || 0,
            netPay: document.getElementById("netPayAfterRelocation2")?.value || "N/A"
        });
    }

    // Grab any additional dynamically spawned offer cards from templates
    const dynamicCards = document.querySelectorAll(".offersContainer .offerCard:not(#offer1):not(#offer2)");

    dynamicCards.forEach((card, index) => {
        const compName = card.querySelector(".input-company")?.value;
        if (compName) {
            offers.push({
                id: `dynamicOffer${index + 3}`,
                companyName: compName,
                jobTitle: card.querySelector(".input-title")?.value || "N/A",
                salary: card.querySelector(".input-salary")?.value || 0,
                workMode: card.querySelector(".input-workmode")?.value || "N/A",
                vacationDays: card.querySelector(".input-vacation")?.value || 0,
                healthBenefits: card.querySelector(".input-benefits")?.value || 0,
                netPay: card.querySelector(".input-netpay")?.value || "N/A"
            });
        }
    });

    return offers;
}

function initComparisonTool() {
    refreshOfferCheckboxes();
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

function refreshOfferCheckboxes() {
    const offers = gatherAllCurrentOffers();
    const checkboxGroup = document.getElementById("offerSelectionCheckboxes");
    if (!checkboxGroup) return;

    // Retain currently checked states if possible
    const previouslyCheckedValues = Array.from(document.querySelectorAll(".offer-select-cb:checked"))
        .map(cb => cb.value);

    if (offers.length === 0) {
        checkboxGroup.innerHTML = "<p>Fill out at least one job offer above to enable selection.</p>";
        renderSideBySideComparison([], []);
        return;
    }

    checkboxGroup.innerHTML = offers.map((offer, idx) => {
        const isChecked = previouslyCheckedValues.includes(idx.toString()) ? "checked" : "";
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

                <div class="comp-metric-row">
                    <span class="comp-metric-label">PTO Days:</span>
                    <span>${offer.vacationDays ?? "Not provided."}</span>
                </div>

                <div class="comp-metric-row">
                    <span class="comp-metric-label">Health Benefits:</span>
                    <span>${offer.healthBenefits ?? "Not provided."} / 10</span>
                </div>
            </div>
        `;
    }).join('');
}

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
        if (offer.workMode === "Remote") workModeScore = 10;
        else if (offer.workMode === "Hybrid") workModeScore = 7;
        else if (offer.workMode === "On-site") workModeScore = 4;

        const totalWeight = weights.salary + weights.workMode + weights.benefits + weights.vacation;
        const weightedSum =
            (salaryScore * weights.salary) +
            (workModeScore * weights.workMode) +
            (benefitVal * weights.benefits) +
            (ptoScore * weights.vacation);

        const finalScore = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : "0.0";

        return {
            ...offer,
            calculatedScore: parseFloat(finalScore)
        };
    });

    // Find the Winning Offer
    let highestScore = -1;
    evaluatedOffers.forEach(o => {
        if (o.calculatedScore > highestScore) {
            highestScore = o.calculatedScore;
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
                const isWinner = offer.calculatedScore === highestScore && highestScore > 0;
                const cardClass = isWinner ? "report-card winning-card" : "report-card";

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

                        <div class="report-metric-row">
                            <span class="report-metric-label">PTO Days:</span>
                            <span>${offer.vacationDays} days</span>
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
