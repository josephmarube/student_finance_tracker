# ◈ Fintrack - Student Finance Tracker 

**Live Demo:** [https://www.youtube.com/watch?v=7fIBA52Turs]

**Deployment:** [https://josephmarube.github.io/student_finance_tracker/]

**Fintrack** is a professional-grade, framework-free personal finance application designed for students. It balances powerful data management with an editorial-inspired design, allowing for full financial tracking across multiple currencies with zero external dependencies.

---

## Key Features

* **State-Driven UI**: Built with pure Vanilla JS using a centralized state management pattern, ensuring a single source of truth for all data.
* **Advanced Data Validation**: Uses robust Regex patterns for data integrity, including a custom-built duplicate word detector for transaction descriptions.
* **Manual Currency Control**: Complete financial autonomy with local exchange rate management for **USD, KES, EUR,** and **GBP**.
* **Dynamic Visualizations**:
* **Spending Carousel**: An interactive 7-month historical spending bar chart.
* **Analysis Suite**: Category split pie charts and smooth-curve trend lines (Cardinal Splines) for long-term tracking.


* **Total Data Ownership**: Export records to a timestamped JSON file or import `seed.json` for instant setup.
* **Inclusive Design**: Full keyboard navigation, ARIA live regions, and high-contrast Light/Dark themes.

---

## Technical Regex Catalog

One of Fintrack's core strengths is its validation layer, ensuring clean and accurate financial records:

### 1. Duplicate Word Detection

* **Pattern**: `/\b(\w+)\s+\1\b/i`
* **Purpose**: Catches accidental double-typed words (e.g., "Food food") using backreferences.

### 2. Currency Amount Validation

* **Pattern**: `/^(0|[1-9]\d*)(\.\d{1,2})?$/`
* **Purpose**: Enforces positive monetary amounts with a maximum of two decimal places and no leading zeros.

---

## Keyboard Navigation & Accessibility

Fintrack is built to be usable by everyone, strictly following **WCAG 2.1 AA** standards:

| Key | Action |
| --- | --- |
| **`Tab`** | Cycle through all interactive elements. |
| **`Enter`** | Activate buttons or submit the transaction form. |
| **`Skip Link`** | A "Skip to content" link appears on the first `Tab` press for fast navigation. |
| **Focus Indicators** | High-visibility 2px accent outlines with a 3px offset. |

---

## Project Architecture (main)

The project is structured as a modular ES application to ensure maintainability:

```text
fintrack/
├── index.html       # Semantic HTML5 shell
├── scripts/         # Modular Logic
│   ├── app.js       # Main Orchestrator
│   ├── state.js     # Global State Management
│   ├── currency.js  # Conversion & Rates
│   ├── stats.js     # Data Processing for Charts
│   └── search.js    # Regex Compiler & Highlighter
└── styles/
    └── main.css     # Theming & CSS Grid Layouts

```

---

## Development & Testing

Fintrack uses modern **ES Modules**, which requires a local server for browser security.

1. **Clone the Repo**: `git clone https://github.com/josephmarube/student_finance_tracker.git`
2. **Run Locally**: Use Python (`python -m http.server 8080`) or VS Code Live Server.
3. **Run Tests**: Navigate to `/tests.html` to view the **17 automated unit tests** covering all validation logic.

---

**Developed by Joseph N. Marube** 

