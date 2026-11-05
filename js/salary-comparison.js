
// Salary Comparison - Melkam's feature

function formatSalaryCurrency(amount) {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return "Not provided";
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
    }).format(value);
}

function compareSalaries() {
    // Use the offers collected by the team's comparison.js
    const offers = gatherAllCurrentOffers();

    const results = document.getElementById("salaryComparisonResults");
    const section = document.getElementById("salaryComparison");

    if (!results || !section) {
        console.error("Salary comparison HTML section not found.");
        return;
    }

    if (!offers || offers.length < 2) {
        results.innerHTML = "<p>Please enter at least two job offers.</p>";
        section.style.display = "block";
        return;
    }

    const highestSalary = Math.max(
        ...offers.map(offer => Number(offer.salary) || 0)
    );

    let tableHTML = `
        <table class="salaryComparison">
            <thead>
                <tr>
                    <th>Salary Information</th>
    `;

    offers.forEach(offer => {
        tableHTML += `<th>${offer.companyName}</th>`;
    });

    tableHTML += `
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>Annual Salary</th>
    `;

    offers.forEach(offer => {
        const salary = Number(offer.salary) || 0;
        const isHighest = salary === highestSalary;

        tableHTML += `
            <td class="${isHighest ? "highestSalary" : ""}">
                ${formatSalaryCurrency(salary)}
                ${isHighest ? "<strong> Highest Salary</strong>" : ""}
            </td>
        `;
    });

    tableHTML += `
                </tr>
                <tr>
                    <th>Estimated Take-Home Pay After Moving Costs</th>
    `;

    offers.forEach(offer => {
        tableHTML += `<td>${formatSalaryCurrency(offer.netPay)}</td>`;
    });

    tableHTML += `
                </tr>
            </tbody>
        </table>
    `;

    results.innerHTML = tableHTML;
    section.style.display = "block";
}

// Connect salary comparison to the Evaluate Offers button
document.addEventListener("DOMContentLoaded", function () {
    const section = document.getElementById("salaryComparison");

    if (section) {
        section.style.display = "none";
    }

    const evaluateBtn = document.getElementById("evaluateBtn");

    if (evaluateBtn) {
        evaluateBtn.addEventListener("click", function () {
            compareSalaries();
        });
    }
});
