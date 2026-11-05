
// Compare Job Offer Salaries

// Get a field from each job offer
function getField(card, className, oldId) {
    return card.querySelector(className) ||
        card.querySelector("#" + oldId);
}

// Format numbers as US dollars
function formatCurrency(amount) {
    if (amount === null || Number.isNaN(amount)) {
        return "Not provided";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(amount);
}

// Get information from all job offer cards
function getAllOffers() {
    const cards = document.querySelectorAll(".offerCard");

    return Array.from(cards).map((card, index) => {
        const number = index + 1;

        const company = getField(
            card, ".input-company", "companyName" + number
        );

        const salary = getField(
            card, ".input-salary", "salary" + number
        );

        const netPay = getField(
            card, ".input-netpay",
            "netPayAfterRelocation" + number
        );

        return {
            company: company.value.trim() || "Offer " + number,
            annualSalary: Number(salary.value),
            netPay: netPay.value === ""
                ? null
                : Number(netPay.value)
        };
    });
}

// Add another job offer
let nextOfferNumber = 3;

document.getElementById("addOfferBtn").addEventListener("click", function () {
    const template = document.getElementById("offerTemplate");
    const container = document.querySelector(".offersContainer");

    const newOffer = template.content.cloneNode(true);
    const card = newOffer.querySelector(".offerCard");
    const number = nextOfferNumber;

    card.querySelector(".offerTitle").textContent =
        "Job Offer " + number;

    // Give the new offer unique field IDs
    const fields = [
        ["label-company", "input-company", "companyName"],
        ["label-title", "input-title", "jobTitle"],
        ["label-salary", "input-salary", "salary"],
        ["label-workmode", "input-workmode", "workMode"],
        ["label-vacation", "input-vacation", "vacationDays"],
        ["label-benefits", "input-benefits", "healthBenefits"],
        ["label-netpay", "input-netpay", "netPayAfterRelocation"]
    ];

    fields.forEach(function (field) {
        const label = card.querySelector("." + field[0]);
        const input = card.querySelector("." + field[1]);

        input.id = field[2] + number;
        label.htmlFor = input.id;
    });

    // Give relocation radio buttons unique names and IDs
    const yesRadio = card.querySelector(".radio-yes");
    const noRadio = card.querySelector(".radio-no");

    yesRadio.id = "relocation" + number + "yes";
    noRadio.id = "relocation" + number + "no";

    yesRadio.name = "relocation" + number;
    noRadio.name = "relocation" + number;

    card.querySelector(".label-radio-yes").htmlFor = yesRadio.id;
    card.querySelector(".label-radio-no").htmlFor = noRadio.id;

    // Remove an extra offer when Remove is clicked
    card.querySelector(".removeOfferBtn").addEventListener("click", function () {
        card.remove();
    });

    container.appendChild(card);
    nextOfferNumber++;
});

// Compare and display all job offers
function compareSalaries() {
    const offers = getAllOffers();

    const highestSalary = Math.max(
        ...offers.map(offer => offer.annualSalary)
    );

    let tableHTML = `
        <table class="salaryComparison">
            <thead>
                <tr>
                    <th scope="col">Salary Information</th>
    `;

    offers.forEach(function (offer) {
        tableHTML += `<th scope="col">${escapeHTML(offer.company)}</th>`;
    });

    tableHTML += `
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">Annual Salary</th>
    `;

    offers.forEach(function (offer) {
        const isHighest = offer.annualSalary === highestSalary;

        tableHTML += `
            <td class="${isHighest ? "highestSalary" : ""}">
                ${formatCurrency(offer.annualSalary)}
                ${isHighest ? "<strong> Highest Salary</strong>" : ""}
            </td>
        `;
    });

    tableHTML += `
                </tr>
                <tr>
                    <th scope="row">Net Pay After Relocation</th>
    `;

    offers.forEach(function (offer) {
        tableHTML += `
            <td>${formatCurrency(offer.netPay)}</td>
        `;
    });

    tableHTML += `
                </tr>
            </tbody>
        </table>
    `;

    document.getElementById("tableContainer").innerHTML = tableHTML;
    document.getElementById("comparisonReport").style.display = "block";
}

// Protect company names when adding them to the table
function escapeHTML(value) {
    return value.replace(/[&<>"']/g, function (character) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];
    });
}

// Run the comparison when Evaluate Offers is clicked
document.getElementById("evaluationForm").addEventListener("submit", function (event) {
    event.preventDefault();
    compareSalaries();
});

 // Export the comparison report
document.getElementById("exportBtn").addEventListener("click", function () {
    const table = document.querySelector(".salaryComparison");

    if (!table) {
        alert("Please evaluate the job offers first!");
        return;
    }

    let report = "";

    table.querySelectorAll("tr").forEach(function (row) {
        const cells = row.querySelectorAll("th, td");

        const rowData = Array.from(cells).map(function (cell) {
            return '"' + cell.innerText.trim().replace(/"/g, '""') + '"';
        });

        report += rowData.join(",") + "\n";
    });

    const file = new Blob([report], {
        type: "text/csv"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "job-offer-comparison.csv";
    link.click();

    URL.revokeObjectURL(link.href);
});
