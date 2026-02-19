const KEY = "fintrack:v2";

export function loadAll(state) {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (!saved) return;
    state.transactions      = saved.transactions      || [];
    state.cap               = saved.cap               || 0;
    state.theme             = saved.theme             || "light";
    state.accentColor       = saved.accentColor       || "indigo";
    state.fontSize          = saved.fontSize          || "medium";
    state.currency.current  = saved.currency?.current || "USD";
    state.sort              = saved.sort              || { field: "date", direction: "desc" };
    // Merge saved budgets so user customisations survive updates
    if (saved.categoryBudgets) {
      state.categoryBudgets = { ...state.categoryBudgets, ...saved.categoryBudgets };
    }
  } catch { /* corrupt storage — start fresh */ }
}

export function saveAll(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* storage full — ignore */ }
}
