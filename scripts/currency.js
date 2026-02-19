/**
 * currency.js
 * -----------
 * Live exchange rates via Frankfurter API (https://frankfurter.dev)
 * Base: USD. Rates are fetched fresh on every app load so all users
 * share the same real-world rates without manual updates.
 *
 * Fallback table is used only when the network request fails — it gives
 * a reasonable approximation but should never be relied on for precision.
 */

const FRANKFURTER_URL = "https://api.frankfurter.dev/v1/latest?base=USD";

/**
 * Currency display metadata.
 * symbol  — the short symbol shown inline with amounts
 * name    — full display name shown in the currency selector
 * flag    — emoji flag for visual recognition
 */
export const CURRENCY_META = {
  USD: { symbol: "$",    name: "US Dollar",          flag: "🇺🇸" },
  KES: { symbol: "KSh",  name: "Kenyan Shilling",     flag: "🇰🇪" },
  EUR: { symbol: "€",    name: "Euro",                flag: "🇪🇺" },
  GBP: { symbol: "£",    name: "British Pound",       flag: "🇬🇧" },
  JPY: { symbol: "¥",    name: "Japanese Yen",        flag: "🇯🇵" },
  CAD: { symbol: "C$",   name: "Canadian Dollar",     flag: "🇨🇦" },
  AUD: { symbol: "A$",   name: "Australian Dollar",   flag: "🇦🇺" },
  CHF: { symbol: "Fr",   name: "Swiss Franc",         flag: "🇨🇭" },
  CNY: { symbol: "¥",    name: "Chinese Yuan",        flag: "🇨🇳" },
  INR: { symbol: "₹",    name: "Indian Rupee",        flag: "🇮🇳" },
  MXN: { symbol: "MX$",  name: "Mexican Peso",        flag: "🇲🇽" },
  BRL: { symbol: "R$",   name: "Brazilian Real",      flag: "🇧🇷" },
  ZAR: { symbol: "R",    name: "South African Rand",  flag: "🇿🇦" },
  NGN: { symbol: "₦",    name: "Nigerian Naira",      flag: "🇳🇬" },
  GHS: { symbol: "₵",    name: "Ghanaian Cedi",       flag: "🇬🇭" },
  UGX: { symbol: "USh",  name: "Ugandan Shilling",    flag: "🇺🇬" },
  TZS: { symbol: "TSh",  name: "Tanzanian Shilling",  flag: "🇹🇿" },
  EGP: { symbol: "E£",   name: "Egyptian Pound",      flag: "🇪🇬" },
  AED: { symbol: "د.إ",  name: "UAE Dirham",          flag: "🇦🇪" },
  SAR: { symbol: "﷼",    name: "Saudi Riyal",         flag: "🇸🇦" },
  SGD: { symbol: "S$",   name: "Singapore Dollar",    flag: "🇸🇬" },
  NOK: { symbol: "kr",   name: "Norwegian Krone",     flag: "🇳🇴" },
  SEK: { symbol: "kr",   name: "Swedish Krona",       flag: "🇸🇪" },
  DKK: { symbol: "kr",   name: "Danish Krone",        flag: "🇩🇰" },
};

/**
 * Fetch live rates from Frankfurter and merge into state.currency.rates.
 * The API returns rates for ~30 major currencies. African and some other
 * currencies not covered by Frankfurter keep their fallback values.
 * Returns true on success, false on failure (fallbacks remain active).
 */
export async function getLiveRates(state) {
  try {
    const res  = await fetch(FRANKFURTER_URL);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    // Merge: live rates take priority; fallbacks fill gaps (e.g. KES, NGN)
    state.currency.rates = {
      ...state.currency.rates,  // fallbacks first
      ...data.rates,            // live rates overwrite where available
      USD: 1.00,                // always anchor USD
    };
    return true;
  } catch {
    return false;               // silent fail — fallback rates stay
  }
}

/**
 * Convert an amount from USD base to the currently selected currency.
 * All amounts are stored internally in USD.
 */
export function convert(amountUSD, state) {
  const rate = state.currency.rates[state.currency.current] || 1;
  return amountUSD * rate;
}

/**
 * Convert from the current display currency back to USD base.
 * Used when saving cap values entered by the user in their chosen currency.
 */
export function toBase(amountInCurrent, state) {
  const rate = state.currency.rates[state.currency.current] || 1;
  return amountInCurrent / rate;
}

/**
 * Format a USD-base amount for display in the current currency.
 * e.g. formatAmount(100, state) → "KSh 12,950.00"
 */
export function formatAmount(amountUSD, state) {
  const converted = convert(amountUSD, state);
  const meta      = CURRENCY_META[state.currency.current] || { symbol: state.currency.current };
  return `${meta.symbol} ${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
