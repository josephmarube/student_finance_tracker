# README: Fintrack — Student Finance Tracker

## Project Overview

**Fintrack** is a lightweight, student-focused finance management application built with vanilla JavaScript. It is designed to help students track essential expenses like tuition, rent, and food while providing visual insights through dynamic charts and multi-currency support. The application operates entirely client-side, using `localStorage` for data persistence, ensuring that financial data remains private and accessible offline.

## Key Features

* **Transaction Management**: Add, edit, and delete financial records with built-in validation for descriptions, amounts, and dates.
* **Manual Currency Conversion**: A custom currency system that allows users to manually set exchange rates in the settings, removing reliance on external APIs.
* **Budget Tracking**: Set a global monthly budget cap and specific category-based budgets to monitor spending against targets.
* **Visual Analytics**:
* **Dashboard**: Displays a monthly spending carousel with "Budget vs. Actual" bar charts and daily trend lines.
* **Analysis Section**: Provides a deep-dive into spending patterns with category split pie charts and all-time spending trends.


* **Data Portability**: Features to export and import transaction data as JSON files for easy backups or transfers.
* **Customizable UI**: Supports light and dark modes, adjustable accent colors, and multiple font sizes.

## Tech Stack

* **HTML5 & CSS3**: Structured with semantic HTML and styled using CSS custom properties for theme management.
* **JavaScript (ES Modules)**: Modular code structure using imports/exports for state management, statistics calculation, and UI rendering.
* **Local Storage API**: Used to save user preferences and transaction history directly in the browser.
* **SVG Rendering**: Custom-built charts using SVG and cardinal spline interpolation for smooth visual trends.

## Project Structure

* `index.html`: The main entry point containing the application layout and view sections.
* `scripts/app.js`: The core logic that orchestrates initialization, event handling, and rendering.
* `scripts/state.js`: Defines the initial application state, including default currency rates and category budgets.
* `scripts/currency.js`: Handles currency formatting and manual conversion logic.
* `scripts/stats.js`: Contains logic for calculating spending statistics and grouping data for charts.
* `scripts/storage.js`: Manages saving and loading data to/from `localStorage`.
* `styles/main.css`: Contains all visual styling, including theme and animation definitions.

## How to Use

1. **Installation**: No installation is required. Simply open `index.html` in any modern web browser.
2. **Adding Expenses**: Navigate to the **Add** tab to log a new transaction. Ensure you fill in the description, amount, category, and date.
3. **Configuring Currencies**: Go to **Settings** to select your preferred display currency and manually update exchange rates relative to USD.
4. **Setting Budgets**: Use the **Settings** tab to define your monthly spending limit and category-specific budgets to enable "Budget vs. Actual" tracking on the dashboard.
5. **Analyzing Data**: Use the **Analysis** tab to view long-term spending trends and category breakdowns.

## Developer

**Joseph N. Marube**

* **Email**: j.marube@alustudent.com