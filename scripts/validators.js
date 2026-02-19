// Exported so tests.html can import and test it directly
export const duplicateWordRegex = /\b(\w+)\s+\1\b/i;

export function validateAll(data) {
  let hasErrors = false;

  const show  = (id, msg) => { const el = document.getElementById(id); if (el) { el.textContent = msg; } };
  const clear = (id)      => { const el = document.getElementById(id); if (el) { el.textContent = ""; } };

  // Description: no leading/trailing spaces, no duplicate words
  const descPat = /^\S(?:.*\S)?$|^\S$/;
  if (!data.description || !descPat.test(data.description)) {
    show("descError", "!!No leading or trailing spaces.");
    hasErrors = true;
  } else if (duplicateWordRegex.test(data.description)) {
    show("descError", "!!Duplicate words detected.");
    hasErrors = true;
  } else {
    clear("descError");
  }

  // Amount: positive number, up to 2 decimal places
  const amtPat = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
  if (!amtPat.test(String(data.amount))) {
    show("amountError", "!! Enter a valid amount (e.g. 12.50)");
    hasErrors = true;
  } else {
    clear("amountError");
  }

  // Category: letters, spaces, hyphens only
  const catPat = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
  if (!catPat.test(data.category)) {
    show("categoryError", "!! Letters only (hyphens/spaces allowed).");
    hasErrors = true;
  } else {
    clear("categoryError");
  }

  // Date: YYYY-MM-DD
  const datePat = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  if (!datePat.test(data.date)) {
    show("dateError", "!! Date required.");
    hasErrors = true;
  } else {
    clear("dateError");
  }

  return hasErrors;
}
