import { validateAll } from "./validators.js";
import { sortData } from "./ui.js";

function renderRecords() {
  const re       = compileRegex(searchInput?.value || "");
  let   filtered = state.transactions.filter(t =>
    !re || re.test(t.description) || re.test(t.category)
  );
  filtered = sortData(filtered, state.sort);

  if (filtered.length === 0) {
    recordsBody.innerHTML = `
      <tr><td colspan="5" class="empty-state">
        No transactions yet —
        <a href="#" class="link" data-nav="add">add your first one →</a>
      </td></tr>`;
    return;
  }

  recordsBody.innerHTML = filtered.map(t => `
    <tr>
      <td>${highlight(t.description, re)}</td>
      <td><span class="badge" style="--c:${catColor(t.category)}">${t.category}</span></td>
      <td class="date-cell">${t.date}</td>
      <td class="amount-cell">${formatAmount(t.amount, state)}</td>
      <td class="action-cell">
        <button class="icon-btn edit-btn" data-edit="${t.id}" title="Edit">✎</button>
        <button class="icon-btn del-btn"  data-del="${t.id}"  title="Delete">✕</button>
      </td>
    </tr>`).join("");
}

function catColor(cat) {
  let hash = 0;
  for (const c of cat) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

/* ─── DASHBOARD ──────────────────────────────────────────────────────────── */
function renderDashboard() {
  const stats = calculateStats(state.transactions);

  $("statCount").textContent = stats.count;
  $("statTop").textContent   = stats.topCategory;
  $("statTotal").textContent = formatAmount(stats.total, state);
  $("statLast7").textContent = formatAmount(stats.last7Total, state);

  updateCapDisplay();
  renderDashboardCarousel();
}

function updateCapDisplay() {
  const el = $("capMessage");
  if (!el) return;
  if (!state.cap) { el.textContent = ""; el.className = "cap-msg"; return; }

  const now = new Date();
  const monthSpend = state.transactions
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, t) => s + t.amount, 0);

  const diff = state.cap - monthSpend;
  if (diff < 0) {
    el.textContent = `⚠ Over monthly budget by ${formatAmount(Math.abs(diff), state)}`;
    el.className   = "cap-msg bad";
  } else {
    el.textContent = `✔ ${formatAmount(diff, state)} remaining this month`;
    el.className   = "cap-msg ok";
  }
}

recordsBody.addEventListener("click", e => {
  const editId = e.target.closest("[data-edit]")?.dataset.edit;
  const delId  = e.target.closest("[data-del]")?.dataset.del;
  const navTo  = e.target.closest("[data-nav]")?.dataset.nav;
  if (navTo) { navigateTo(navTo); return; }
  if (editId) {
    const t = state.transactions.find(x => x.id === editId);
    if (!t) return;
    $("description").value = t.description;
    $("amount").value      = t.amount;
    $("category").value    = t.category;
    $("date").value        = t.date;
    transactionForm.dataset.editId = editId;
    $("formTitle").textContent     = "Edit Transaction";
    $("cancelEdit").style.display  = "";
    navigateTo("add");
  }
  if (delId) {
    if (!confirm("Delete this transaction?")) return;
    state.transactions = state.transactions.filter(x => x.id !== delId);
    saveAll(state);
    render();
  }
});

transactionForm.addEventListener("submit", e => {
  e.preventDefault();
  const data = {
    description: $("description").value.trim(),
    amount:      $("amount").value.trim(),
    category:    $("category").value.trim(),
    date:        $("date").value,
  };
  if (validateAll(data)) return;
  const editId = transactionForm.dataset.editId;
  if (editId) {
    const idx = state.transactions.findIndex(t => t.id === editId);
    if (idx !== -1) {
      state.transactions[idx] = {
        ...state.transactions[idx],
        ...data, amount: Number(data.amount), updatedAt: new Date().toISOString()
      };
    }
    delete transactionForm.dataset.editId;
    $("formTitle").textContent    = "Add Transaction";
    $("cancelEdit").style.display = "none";
  } else {
    state.transactions.push({
      id:        crypto.randomUUID(),
      ...data, amount: Number(data.amount),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  saveAll(state);
  transactionForm.reset();
  render();
  navigateTo("records");
});

$("cancelEdit")?.addEventListener("click", () => {
  delete transactionForm.dataset.editId;
  transactionForm.reset();
  $("formTitle").textContent    = "Add Transaction";
  $("cancelEdit").style.display = "none";
  ["descError","amountError","categoryError","dateError"].forEach(id => {
    const el = $(id); if (el) el.textContent = "";
  });
});

$("searchInput")?.addEventListener("input", renderRecords);

$("sortField")?.addEventListener("change", e => {
  state.sort.field = e.target.value;
  saveAll(state); renderRecords();
});

$("sortDir")?.addEventListener("click", () => {
  state.sort.direction = state.sort.direction === "asc" ? "desc" : "asc";
  $("sortDir").dataset.dir = state.sort.direction;
  updateSortDirBtn();
  saveAll(state); renderRecords();
});

function updateSortDirBtn() {
  const btn = $("sortDir");
  if (!btn) return;
  const dir = state.sort.direction;
  btn.textContent = dir === "asc" ? "↑ Asc" : "↓ Desc";
  btn.title = dir === "asc" ? "Currently ascending — click for descending" : "Currently descending — click for ascending";
}