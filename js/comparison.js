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

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Edit";
            editButton.className = "edit-offer-btn";
            editButton.dataset.offerId = offer.id;

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-offer-btn";
            deleteButton.dataset.offerId = offer.id;

            offerCard.appendChild(company);
            offerCard.appendChild(title);
            offerCard.appendChild(salary);
            offerCard.appendChild(editButton);
            offerCard.appendChild(deleteButton);

            savedOffersList.appendChild(offerCard);
        });

    } catch (error) {
        console.error("Error displaying saved offers:", error);
        savedOffersList.textContent =
            "Unable to display saved job offers.";
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
                [`retirementPlan${number}`, offer.retirementPlan],
                [`employerMatch${number}`, offer.employerMatch],
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

    // Load and display saved offers
    loadSavedOffers();
    renderSavedOffers();

    // Initialize comparison checkboxes
    initComparisonTool();

    // Handle Edit and Delete buttons
    document.addEventListener("click", (e) => {

        // EDIT BUTTON
        const editButton = e.target.closest(".edit-offer-btn");

        if (editButton) {
            const offerId = editButton.dataset.offerId;

            const savedOffers = JSON.parse(
                localStorage.getItem("savedOffers") || "[]"
            );

            const offer = savedOffers.find(
                item => item.id === offerId
            );

            if (!offer) return;

            // Edit Offer 1 or Offer 2
            const number = offerId === "offer1" ? "1" :
                offerId === "offer2" ? "2" : null;

            if (number) {
                document.getElementById(`companyName${number}`).value =
                    offer.companyName || "";

                document.getElementById(`jobTitle${number}`).value =
                    offer.jobTitle || "";

                document.getElementById(`salary${number}`).value =
                    offer.salary || "";

                document.getElementById(`workMode${number}`).value =
                    offer.workMode || "";

                document.getElementById(`vacationDays${number}`).value =
                    offer.vacationDays || "";

                document.getElementById(`healthBenefits${number}`).value =
                    offer.healthBenefits || "";

                document.getElementById(`retirementPlan${number}`).value =
                    offer.retirementPlan || "";

                document.getElementById(`employerMatch${number}`).value =
                    offer.employerMatch || "";

                document.getElementById(
                    `netPayAfterRelocation${number}`
                ).value = offer.netPay || "";

            } else {
                const dynamicNumber = parseInt(
                    offerId.replace("dynamicOffer", ""),
                    10
                );

                const dynamicCards = document.querySelectorAll(
                    ".offersContainer .offerCard:not(#offer1):not(#offer2)"
                );

                const card = dynamicCards[dynamicNumber - 3];

                if (!card) return;

                card.querySelector(".input-company").value =
                    offer.companyName || "";

                card.querySelector(".input-title").value =
                    offer.jobTitle || "";

                card.querySelector(".input-salary").value =
                    offer.salary || "";

                card.querySelector(".input-workmode").value =
                    offer.workMode || "";

                card.querySelector(".input-vacation").value =
                    offer.vacationDays || "";

                card.querySelector(".input-benefits").value =
                    offer.healthBenefits || "";

                card.querySelector(".input-retirement").value =
                    offer.retirementPlan || "";

                card.querySelector(".input-match").value =
                    offer.employerMatch || "";

                card.querySelector(".input-netpay").value =
                    offer.netPay || "";
            }

            const form = document.getElementById("evaluationForm");

            if (form) {
                form.scrollIntoView({ behavior: "smooth" });
            }

            refreshOfferCheckboxes();

            return;
        }

        // DELETE BUTTON
        const deleteButton = e.target.closest(".delete-offer-btn");

        if (deleteButton) {
            const offerId = deleteButton.dataset.offerId;

            const offerCard = deleteButton.closest(".saved-offer-card");

            if (!offerCard) return;

            // Remove an old confirmation message
            const oldMessage = offerCard.querySelector(
                ".delete-confirmation"
            );

            if (oldMessage) oldMessage.remove();

            // Create confirmation message inside the website
            const message = document.createElement("div");
            message.className = "delete-confirmation";

            const question = document.createElement("p");
            question.textContent =
                "Are you sure you want to delete this job offer?";

            const yesButton = document.createElement("button");
            yesButton.type = "button";
            yesButton.textContent = "Yes, Delete";
            yesButton.className = "confirm-delete-btn";

            const cancelButton = document.createElement("button");
            cancelButton.type = "button";
            cancelButton.textContent = "Cancel";
            cancelButton.className = "cancel-delete-btn";

            message.appendChild(question);
            message.appendChild(yesButton);
            message.appendChild(cancelButton);

            offerCard.appendChild(message);

            // Cancel deletion
            cancelButton.addEventListener("click", () => {
                message.remove();
            });

            // Confirm deletion
            yesButton.addEventListener("click", () => {
                const savedOffers = JSON.parse(
                    localStorage.getItem("savedOffers") || "[]"
                );

                const updatedOffers = savedOffers.filter(
                    offer => offer.id !== offerId
                );

                localStorage.setItem(
                    "savedOffers",
                    JSON.stringify(updatedOffers)
                );

                // Clear matching form fields
                const number = offerId === "offer1" ? "1" :
                    offerId === "offer2" ? "2" : null;

                if (number) {
                    const fieldIds = [
                        `companyName${number}`,
                        `jobTitle${number}`,
                        `salary${number}`,
                        `workMode${number}`,
                        `vacationDays${number}`,
                        `healthBenefits${number}`,
                        `retirementPlan${number}`,
                        `employerMatch${number}`,
                        `netPayAfterRelocation${number}`
                    ];

                    fieldIds.forEach(id => {
                        const field = document.getElementById(id);
                        if (field) field.value = "";
                    });
                }

                renderSavedOffers();
                refreshOfferCheckboxes();

                const saveStatus = document.getElementById("saveStatus");

                if (saveStatus) {
                    saveStatus.textContent =
                        "Job offer deleted successfully!";
                }
            });

            return;
        }
    });

    // SAVE JOB OFFERS
    const saveOfferBtn = document.getElementById("saveOfferBtn");
    const saveStatus = document.getElementById("saveStatus");

    if (saveOfferBtn && saveStatus) {
        saveOfferBtn.addEventListener("click", (e) => {
            e.preventDefault();

            try {
                const offers = gatherAllCurrentOffers();

                if (offers.length === 0) {
                    saveStatus.textContent =
                        "Please enter at least one job offer.";
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

                offers.forEach(offer => {
                    offersById.set(offer.id, offer);
                });

                const updatedOffers = Array.from(
                    offersById.values()
                );

                localStorage.setItem(
                    "savedOffers",
                    JSON.stringify(updatedOffers)
                );

                saveStatus.textContent =
                    "Offers saved successfully!";

                renderSavedOffers();

            } catch (error) {
                console.error("Error saving offers:", error);

                saveStatus.textContent =
                    "Sorry, your offers could not be saved.";
            }
        });
    }

    // Form interactions and live updates
    const form = document.getElementById("evaluationForm");

    if (form) {
        form.addEventListener("input", () => {
            refreshOfferCheckboxes();

            const reportSection =
                document.getElementById("comparisonReport");

            if (
                reportSection &&
                reportSection.style.display !== "none"
            ) {
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
            console.log("Evaluate button clicked!");
            const offers = gatherAllCurrentOffers();
            console.log("Gathered offers:", offers);
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

    // Offer 1
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
            retirementPlan: document.getElementById("retirementPlan1")?.value || "",
            employerMatch: document.getElementById("employerMatch1")?.value || "",
            netPay: document.getElementById("netPayAfterRelocation1")?.value || "N/A"
        });
    }

    // Offer 2
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
            retirementPlan: document.getElementById("retirementPlan2")?.value || "",
            employerMatch: document.getElementById("employerMatch2")?.value || "",
            netPay: document.getElementById("netPayAfterRelocation2")?.value || "N/A"
        });
    }

    // Additional dynamic offers
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
                retirementPlan: card.querySelector(".input-retirement")?.value || "",
                employerMatch: card.querySelector(".input-match")?.value || "",
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
   SALARY CURRENCY FORMATTING
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
   PTO COMPARISON FORMATTING
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

    const checkboxGroup = document.getElementById(
        "offerSelectionCheckboxes"
    );

    if (!checkboxGroup) return;

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
        const isChecked = previouslyCheckedValues.includes(
            idx.toString()
        ) ? "checked" : "";

        return `
            <label class="offer-checkbox-label">
                <input
                    type="checkbox"
                    value="${idx}"
                    class="offer-select-cb"
                    ${isChecked}
                    onchange="handleSelectionChange()"
                >
                <strong>${offer.companyName}</strong>
                (${offer.jobTitle})
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
        cb => parseInt(cb.value, 10)
    );

    renderSideBySideComparison(selectedIndices, offers);
}

/* ========================================================
   RENDER SIDE-BY-SIDE COMPARISON
   ======================================================== */

function renderSideBySideComparison(selectedIndices, offers) {
    const comparisonContainer = document.getElementById(
        "comparisonContainer"
    );

    if (!comparisonContainer) return;

    if (!selectedIndices || selectedIndices.length < 2) {
        comparisonContainer.innerHTML = `
            <div id="comparisonFallback" class="comparison-fallback-card">
                <p>
                    No offers selected for comparison.
                    Please select at least two offers.
                    (Currently selected: ${selectedIndices ? selectedIndices.length : 0
            })
                </p>
            </div>
        `;
        return;
    }

    const formatCurrency = (value) => {
        return formatSalaryCurrency(value);
    };

    const formatTextFallback = (text) => {
        return text && text.trim() !== "" ? text : "Not provided";
    };

    comparisonContainer.innerHTML = selectedIndices.map((offerIndex, pos) => {
        const offer = offers[offerIndex];

        if (!offer) return "";

        const scopedColumnId = `column-${pos + 1}`;

        const highestSalary = Math.max(
            ...selectedIndices.map(
                index => Number(offers[index]?.salary) || 0
            )
        );

        const salary = Number(offer.salary) || 0;

        const isHighestSalary =
            salary > 0 && salary === highestSalary;

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

                <div class="comp-metric-row">
                    <span class="comp-metric-label">Annual Salary:</span>
                    <span>
                        ${formatCurrency(offer.salary)}
                        ${isHighestSalary ? "⭐ Highest Salary" : ""}
                    </span>
                </div>

                <div class="comp-metric-row">
                    <span class="comp-metric-label">Net Pay:</span>
                    <span>${formatCurrency(offer.netPay)}</span>
                </div>

                <div class="comp-metric-row">
                    <span class="comp-metric-label">PTO Days:</span>
                    <span>${formatPtoDays(offer.vacationDays)}</span>
                </div>

                <div class="comp-metric-row">
                    <span class="comp-metric-label">Health Benefits:</span>
                    <span>${offer.healthBenefits ?? "Not provided."} / 10</span>
                </div>

                <div class="comp-metric-row">
                    <span class="comp-metric-label">Retirement Plan:</span>
                    <span>${formatTextFallback(offer.retirementPlan)}</span>
                </div>

                <div class="comp-metric-row">
                    <span class="comp-metric-label">Employer Match:</span>
                    <span>${formatTextFallback(offer.employerMatch)}</span>
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

    const saveStatus = document.getElementById("saveStatus");

    if (offers.length === 0) {
        if (saveStatus) {
            saveStatus.textContent =
                "Please enter at least one job offer before evaluating.";
        }
        return;
    }

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

        const healthVal = parseFloat(offer.healthBenefits) || 5;

        const matchStr = offer.employerMatch || "";
        const matchMatch = matchStr.match(/(\d+(\.\d+)?)/);
        const matchVal = matchMatch ? parseFloat(matchMatch[0]) : 0;
        const retirementScore = Math.min(matchVal * 2, 10) || (offer.retirementPlan ? 7 : 4);

        const combinedBenefitsScore = (healthVal + retirementScore) / 2;

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
            (combinedBenefitsScore * weights.benefits) +
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

        const formatTextFallback = (text) => {
            if (text === null || text === undefined) return "Not provided.";
            const str = String(text).trim();
            return str !== "" ? str : "Not provided.";
        };

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

                        <div class="report-metric-row">
                            <span class="report-metric-label">Annual Salary:</span>
                            <span>${formatSalaryCurrency(offer.salary)}</span>
                        </div>

                        <div class="report-metric-row">
                            <span class="report-metric-label">Net Pay:</span>
                            <span>${formatSalaryCurrency(offer.netPay)}</span>
                        </div>

                        <div class="report-metric-row">
                            <span class="report-metric-label">PTO Days:</span>
                            <span>${formatPtoDays(offer.vacationDays)}</span>
                        </div>

                        <div class="report-metric-row">
                            <span class="report-metric-label">Health Benefits:</span>
                            <span>${offer.healthBenefits} / 10</span>
                        </div>

                        <div class="report-metric-row">
                            <span class="report-metric-label">Retirement Plan:</span>
                            <span>${formatTextFallback(offer.retirementPlan)}</span>
                        </div>

                        <div class="report-metric-row">
                            <span class="report-metric-label">Employer Match:</span>
                            <span>${formatTextFallback(offer.employerMatch)}</span>
                        </div>
                    </div>
                `;
    }).join("")}
        </div>
    `;

    reportSection.scrollIntoView({ behavior: "smooth" });
}