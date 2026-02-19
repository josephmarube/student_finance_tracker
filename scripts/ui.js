/*
Return a sorted copy of the transactions array.
sort.field: "date" | "amount" | "description" | "category"
sort.direction: "asc" | "desc"
 */
export function sortData(data, sort) {
    return [...data].sort((a, b) => {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        const result = typeof aVal === "string"
            ? aVal.localeCompare(bVal, undefined, { sensitivity: "base" })
            : aVal - bVal;
        return sort.direction === "asc" ? result : -result;
    });
}
