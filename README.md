##Job Offer Evaluation Tool

A robust, lightweight client-side web application designed to help job seekers evaluate, compare, and score multiple competing employment offers based on weighted preference criteria (salary, work mode, benefits, PTO, and relocation costs). Built with modern vanilla web technologies and responsive design principles.

## Authors & Contributors

This project was collaboratively designed and developed by:
* Alexandra Cole
* Melkam Worku
* Patience Kalanga
* Amber Renfroe

## Key Features

* **Weighted Evaluation Engine:** Dynamically score and rank multiple job offers based on custom user-defined priority weights (1-10).
* **Side-by-Side Comparison Matrix:** Select specific saved offers to inspect side-by-side in a responsive grid layout with automatic fallback validation when fewer than two offers are selected.
* **Dynamic Offer Expansion:** Add or remove multiple job offer forms seamlessly using native HTML templates.
* **Responsive Layout Shell:** CSS Grid and Flexbox architecture that scales gracefully from ultra-wide desktop monitors down to mobile and tablet viewports.
* **Zero Framework Bloat:** Developed entirely with clean HTML5, modern CSS3, and vanilla JavaScript for maximum speed and compatibility.

## Project Structure

```text
├── index.html          # Main application UI shell and template container
├── css/
│   └── style.css       # Cohesive design system and responsive grid styles
└── js/
    └── comparison.js   # Side-by-side selection controller and data mapping logic
```

## Getting Started & Installation

1. Clone or Download the project repository to your local machine.
2. Ensure your directory structure matches the layout above (with `css/style.css` and `js/comparison.js` properly nested).
3. Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge) to run the application locally. No build steps, package managers, or backend servers required!

## Usage Guide

1. **Define Weights:** Set your preference criteria weights (1-10) for salary, work mode, benefits, and vacation days at the top of the form.
2. **Enter Offer Details:** Fill out the details for your competing job offers (Company Name, Title, Salary, Work Mode, PTO, Health Ratings, etc.). Click "Add Another Offer" if you have more than two.
3. **Compare Side-by-Side:** Scroll down to the Side-by-Side Offer Comparison section, check the boxes for the offers you wish to evaluate, and view them mapped out dynamically in comparison columns.
4. **Evaluate & Export:** Click "Evaluate Offers" or "Export Report" to generate analytical summaries.