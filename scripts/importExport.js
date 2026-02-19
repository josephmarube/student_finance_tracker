/*
Validate an imported JSON array of transactions.
Required fields: id (string), description (string),
amount (number), category (string), date (string).
*/
export function validateImport(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    return data.every(item =>
        typeof item.id === "string" &&
        typeof item.description === "string" &&
        typeof item.amount === "number" &&
        item.amount >= 0 &&
        typeof item.category === "string" &&
        typeof item.date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(item.date)
    );
}
