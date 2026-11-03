document.addEventListener("DOMContentLoaded", () => {
    // Initialize the comparison feature on page load
    initComparisonTool();

    // Listen for form interactions or changes to update selection list dynamically
    const form = document.getElementById("evaluationForm");
    if (form) {
        form.addEventListener("input", () => {
            refreshOfferCheckboxes();
        });
        form.addEventListener("change", () => {
            refreshOfferCheckboxes();
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

    // Map selected offers into unique scoped columns to prevent DOM ID collisions
    comparisonContainer.innerHTML = selectedIndices.map((offerIndex, pos) => {
        const offer = offers[offerIndex];
        if (!offer) return '';
        
        const scopedColumnId = `column-${pos + 1}`; // e.g., column-1, column-2

        return `
            <div class="comparison-column" id="${scopedColumnId}">
                <h3>${offer.companyName}</h3>
                <div class="comp-metric-row"><span class="comp-metric-label">Job Title:</span> <span>${offer.jobTitle}</span></div>
                <div class="comp-metric-row"><span class="comp-metric-label">Annual Salary:</span> <span>$${Number(offer.salary || 0).toLocaleString()}</span></div>
                <div class="comp-metric-row"><span class="comp-metric-label">Work Mode:</span> <span>${offer.workMode}</span></div>
                <div class="comp-metric-row"><span class="comp-metric-label">PTO Days:</span> <span>${offer.vacationDays}</span></div>
                <div class="comp-metric-row"><span class="comp-metric-label">Health Benefits:</span> <span>${offer.healthBenefits} / 10</span></div>
                <div class="comp-metric-row"><span class="comp-metric-label">Net Pay (Reloc):</span> <span>$${offer.netPay}</span></div>
            </div>
        `;
    }).join('');
}