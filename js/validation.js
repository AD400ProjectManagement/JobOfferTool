document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("evaluationForm");

  function clearErrors() {
    form.querySelectorAll(".errorMessage").forEach(function (el) { el.remove(); });
    form.querySelectorAll(".invalid").forEach(function (el) {
      el.classList.remove("invalid");
      el.removeAttribute("aria-invalid");
    });
  }

  function showError(input, message) {
    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
    var msg = document.createElement("span");
    msg.className = "errorMessage";
    msg.setAttribute("role", "alert");
    msg.textContent = message;
    input.insertAdjacentElement("afterend", msg);
  }

  function validateForm() {
    var invalidInputs = [];
    clearErrors();

    ["salaryWeight", "workModeWeight", "benefitsWeight", "vacationWeight"].forEach(function (id) {
      var input = document.getElementById(id);
      var value = input.value.trim();
      var num = Number(value);
      if (value === "" || isNaN(num) || num < 1 || num > 10) {
        showError(input, "Enter a weight between 1 and 10.");
        invalidInputs.push(input);
      }
    });

    form.querySelectorAll(".offerCard").forEach(function (card) {
      var company = card.querySelector('[id^="companyName"], .input-company');
      var salary = card.querySelector('[id^="salary"], .input-salary');

      if (company && company.value.trim() === "") {
        showError(company, "Company name is required.");
        invalidInputs.push(company);
      }
      if (salary && (salary.value.trim() === "" || Number(salary.value) <= 0)) {
        showError(salary, "Annual salary must be greater than 0.");
        invalidInputs.push(salary);
      }
    });

    if (invalidInputs.length > 0) {
      invalidInputs[0].focus();
    }
    return invalidInputs.length === 0;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }
    document.dispatchEvent(new CustomEvent("validationPassed"));
  });

