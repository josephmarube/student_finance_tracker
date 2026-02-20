export const state = {
    transactions: [],
    cap: 0,
    theme: "light",
    accentColor: "indigo",
    fontSize: "medium",
    currency: {
        base: "USD",
        current: "USD",
        // Fallback rates
        rates: {
            USD: 1.00,
            KES: 129.50,
            EUR: 0.92,
            GBP: 0.78,

        }
    },
    sort: {
        field: "date",
        direction: "desc"
    },
    // Category budgets stored in USD. Shown converted to current currency.
    categoryBudgets: {
        Education: 0,
        Housing: 0,
        Food: 0,
        Transport: 0,
        Entertainment: 0,
        Utilities: 0,
        Health: 0,
        Shopping: 0,
        Travel: 0,
        Other: 0,
    }
};
