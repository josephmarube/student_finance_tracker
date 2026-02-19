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
        Education: 1500,
        Housing: 600,
        Food: 200,
        Transport: 80,
        Entertainment: 60,
        Utilities: 80,
        Health: 80,
        Shopping: 150,
        Travel: 300,
        Other: 100,
    }
};
