/* scripts/currency.js*/

/*
 Currency display metadata.
*/
export const CURRENCY_META = {
  USD: { symbol: "$",    name: "US Dollar",          flag: "🇺🇸" },
  KES: { symbol: "KSh",  name: "Kenyan Shilling",     flag: "🇰🇪" },
  EUR: { symbol: "€",    name: "Euro",                flag: "🇪🇺" },
  GBP: { symbol: "£",    name: "British Pound",       flag: "🇬🇧" },
  JPY: { symbol: "¥",    name: "Japanese Yen",        flag: "🇯🇵" },
  CAD: { symbol: "C$",   name: "Canadian Dollar",     flag: "🇨🇦" },
  AUD: { symbol: "A$",   name: "Australian Dollar",   flag: "🇦🇺" },
  ZAR: { symbol: "R",    name: "South African Rand",  flag: "🇿🇦" },
  NGN: { symbol: "₦",    name: "Nigerian Naira",      flag: "🇳🇬" },
  UGX: { symbol: "USh",  name: "Ugandan Shilling",    flag: "🇺🇬" },
  TZS: { symbol: "TSh",  name: "Tanzanian Shilling",  flag: "🇹🇿" },
};

/*
Convert an amount from USD base to the currently selected currency.
*/
export function convert(amountUSD, state) {
  const rate = state.currency.rates[state.currency.current] || 1;
  return amountUSD * rate;
}

/*
 Convert from the current display currency back to USD base.
*/
export function toBase(amountInCurrent, state) {
  const rate = state.currency.rates[state.currency.current] || 1;
  return amountInCurrent / rate;
}

/*
Format a USD-base amount for display in the current currency.
*/
export function formatAmount(amountUSD, state) {
  const converted = convert(amountUSD, state);
  const meta      = CURRENCY_META[state.currency.current] || { symbol: state.currency.current };
  return `${meta.symbol} ${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}