import { validateAll } from "./validators.js";
import { sortData } from "./ui.js";
import { compileRegex, highlight } from "./search.js";
import { state } from "./state.js";
import { calculateStats, groupTransactions, groupTransactionsAllTime, getMonthlySpendLast6Months } from "./stats.js";


let dashboardCarouselIndex = 6;

function render() {
    renderRecords();
    renderDashboard();
    renderAnalysis();
    updateSettingsPanel();
}

function renderRecords() {
    const re = compileRegex(searchInput?.value || "");
    let filtered = state.transactions.filter(t =>
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
    $("statTop").textContent = stats.topCategory;
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
        el.className = "cap-msg bad";
    } else {
        el.textContent = `✔ ${formatAmount(diff, state)} remaining this month`;
        el.className = "cap-msg ok";
    }
}

recordsBody.addEventListener("click", e => {
    const editId = e.target.closest("[data-edit]")?.dataset.edit;
    const delId = e.target.closest("[data-del]")?.dataset.del;
    const navTo = e.target.closest("[data-nav]")?.dataset.nav;
    if (navTo) { navigateTo(navTo); return; }
    if (editId) {
        const t = state.transactions.find(x => x.id === editId);
        if (!t) return;
        $("description").value = t.description;
        $("amount").value = t.amount;
        $("category").value = t.category;
        $("date").value = t.date;
        transactionForm.dataset.editId = editId;
        $("formTitle").textContent = "Edit Transaction";
        $("cancelEdit").style.display = "";
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
        amount: $("amount").value.trim(),
        category: $("category").value.trim(),
        date: $("date").value,
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
        $("formTitle").textContent = "Add Transaction";
        $("cancelEdit").style.display = "none";
    } else {
        state.transactions.push({
            id: crypto.randomUUID(),
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
    $("formTitle").textContent = "Add Transaction";
    $("cancelEdit").style.display = "none";
    ["descError", "amountError", "categoryError", "dateError"].forEach(id => {
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

function renderDashboardCarousel() {
    const months = getMonthlySpendLast6Months(state.transactions);
    const current = months[dashboardCarouselIndex];

    const container = $("dashboardChartCarousel");
    if (!container) return;

    // Title + nav
    const header = $("carouselHeader");
    if (header) {
        header.innerHTML = `
      <div class="carousel-title">
        <button class="carousel-nav-btn" id="carouselPrev" ${dashboardCarouselIndex === 0 ? 'disabled' : ''}>‹</button>
        <h3>${current.month}</h3>
        <button class="carousel-nav-btn" id="carouselNext" ${dashboardCarouselIndex === 6 ? 'disabled' : ''}>›</button>
      </div>
      <p class="carousel-subtitle">${formatAmount(current.spending, state)} spent</p>
    `;
    }

    // Filter transactions to this specific month
    const [year, month] = current.monthKey.split('-');
    const monthData = state.transactions.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === parseInt(year) && d.getMonth() === parseInt(month) - 1;
    });

    const stats = calculateStats(monthData);

    // Render chart (bar or line only)
    container.innerHTML = "";
    const chartType = $("dashboardChartType")?.value || "bar";

    if (chartType === "bar") {
        renderBarChartLarge(stats, container);
    } else {
        renderLineChartCurved(monthData, container, current.monthKey);
    }
}

//BAR CHART
function renderBarChartLarge(stats, container) {
    const budgets = state.categoryBudgets;
    const categories = [...new Set([...Object.keys(budgets), ...Object.keys(stats.categoryTotals)])];

    if (!categories.length) {
        container.innerHTML = `<p class="chart-empty">No data for this month.</p>`;
        return;
    }

    const wrap = document.createElement("div");
    wrap.className = "bar-chart-wrap-large"; // LARGER VERSION

    categories.forEach(cat => {
        const budget = budgets[cat] || 0;
        const actual = stats.categoryTotals[cat] || 0;
        const maxVal = Math.max(budget, actual, 1);

        const over = actual > budget && budget > 0;

        const g = document.createElement("div");
        g.className = "bar-group-large";
        g.innerHTML = `
      <div class="bars-large">
        <div class="bar-wrap">
          <span class="tip">${cat}<br/>Budget: ${formatAmount(budget, state)}</span>
          <div class="bar budget-bar chart-animate" style="--final-h:${(budget / maxVal) * 100}%"></div>
        </div>
        <div class="bar-wrap">
          <span class="tip">${cat}<br/>Actual: ${formatAmount(actual, state)}</span>
          <div class="bar actual-bar${over ? " over-budget" : ""} chart-animate" style="--final-h:${(actual / maxVal) * 100}%"></div>
        </div>
      </div>
      <span class="bar-label-large">${cat}</span>`;
        wrap.appendChild(g);
    });

    const legend = document.createElement("div");
    legend.className = "chart-legend";
    legend.innerHTML = `
    <span class="legend-item"><span class="swatch" style="background:var(--border)"></span>Budget</span>
    <span class="legend-item"><span class="swatch" style="background:var(--accent)"></span>Actual</span>
    <span class="legend-item"><span class="swatch" style="background:var(--rose)"></span>Over Budget</span>`;

    container.appendChild(wrap);
    container.appendChild(legend);

    requestAnimationFrame(() => {
        wrap.querySelectorAll('.chart-animate').forEach(el => el.classList.add('animate-in'));
    });
}

//LINE CHART(Cardinal spline)
function renderLineChartCurved(monthData, container, monthKey) {
    if (!monthData.length) {
        container.innerHTML = `<p class="chart-empty">No data for this month.</p>`;
        return;
    }

    // Group by day within the month
    const dayTotals = {};
    monthData.forEach(t => {
        const day = new Date(t.date).getDate();
        dayTotals[day] = (dayTotals[day] || 0) + t.amount;
    });

    const entries = Object.entries(dayTotals).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

    const W = 700, H = 280, PL = 60, PR = 30, PT = 30, PB = 60;
    const IW = W - PL - PR, IH = H - PT - PB;
    const maxVal = Math.max(...entries.map(([, v]) => v), 1);

    const pts = entries.map(([day, v], i) => ({
        x: PL + (i / (Math.max(entries.length - 1, 1))) * IW,
        y: PT + IH - (v / maxVal) * IH,
        day, v
    }));

    // Generate smooth curve using cardinal spline
    const curvePath = cardinalSpline(pts.map(p => [p.x, p.y]), 0.5, true);

    // Area path
    const areaPath = `M ${PL} ${PT + IH} L ${curvePath.slice(2)} L ${pts[pts.length - 1].x} ${PT + IH} Z`;

    const gridLines = [0.25, 0.5, 0.75, 1].map(f => {
        const y = PT + IH - f * IH;
        const lbl = formatAmount(maxVal * f, state);
        return `<line x1="${PL}" y1="${y.toFixed(1)}" x2="${W - PR}" y2="${y.toFixed(1)}"
              stroke="var(--border)" stroke-width="1"/>
            <text x="${PL - 8}" y="${y.toFixed(1)}" text-anchor="end" font-size="11"
              fill="var(--text-muted)" dominant-baseline="middle">${lbl}</text>`;
    }).join("");

    const dots = pts.map((p, i) => `
    <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" class="line-dot"
      fill="var(--accent)" stroke="var(--surface)" stroke-width="2.5">
      <title>Day ${p.day}: ${formatAmount(p.v, state)}</title>
    </circle>`).join("");

    const xLabels = pts.filter((p, i) => i % Math.max(1, Math.floor(pts.length / 10)) === 0).map(p => `
    <text x="${p.x.toFixed(1)}" y="${H - 15}" text-anchor="middle"
      font-size="11" fill="var(--text-muted)">${p.day}</text>`).join("");

    const svg = document.createElement("div");
    svg.style.width = "100%";
    svg.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" class="line-chart-svg" role="img" aria-label="Daily spending">
      <defs>
        <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent)" stop-opacity=".4"/>
          <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${areaPath}" fill="url(#areaGrad2)" class="area-fill"/>
      <path d="${curvePath}" fill="none" stroke="var(--accent)"
        stroke-width="3" stroke-linejoin="round" stroke-linecap="round" class="line-path"/>
      ${dots}
      ${xLabels}
      <text x="${W / 2}" y="${H - 5}" text-anchor="middle" font-size="12" fill="var(--text-muted)" font-weight="600">Day of Month</text>
    </svg>`;
    container.appendChild(svg);
}

//Cardinal spline interpolation for smooth curves
function cardinalSpline(points, tension, close) {
    if (points.length < 2) return "";
    const t = typeof tension === "number" ? tension : 0.5;
    let path = `M ${points[0][0]} ${points[0][1]}`;

    for (let i = 0; i < points.length - 1; i++) {
        const p0 = i === 0 ? points[0] : points[i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = i === points.length - 2 ? p2 : points[i + 2];

        const cp1x = p1[0] + (p2[0] - p0[0]) / 6 * t;
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6 * t;
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6 * t;
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6 * t;

        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
    }

    return path;
}

//CAROUSEL NAV
document.addEventListener("click", e => {
    if (e.target.id === "carouselPrev" && dashboardCarouselIndex > 0) {
        dashboardCarouselIndex--;
        renderDashboardCarousel();
    }
    if (e.target.id === "carouselNext" && dashboardCarouselIndex < 6) {
        dashboardCarouselIndex++;
        renderDashboardCarousel();
    }
});git

$("dashboardChartType")?.addEventListener("change", renderDashboardCarousel);

//ANALYSIS 
function renderAnalysis() {
    const stats = calculateStats(state.transactions);

    
    const pieEl = $("analysisPie");
    if (pieEl) { pieEl.innerHTML = ""; renderPieChart(stats, pieEl); }

    const lineEl = $("analysisLine");
    if (lineEl) {
        lineEl.innerHTML = "";
        renderLineChartAllTimeCurved(lineEl, $("analysisPeriod")?.value || "month");
    }

    const catEl = $("analysisCatBars");
    if (catEl) renderCategoryBars(stats, catEl);

    const monthEl = $("analysisMonthly");
    if (monthEl) { monthEl.innerHTML = ""; renderMonthlyBarLarge(stats, monthEl); }

    if ($("analysisTotal")) $("analysisTotal").textContent = formatAmount(stats.total, state);
    if ($("analysisAvg")) $("analysisAvg").textContent = formatAmount(stats.avgTransaction, state);
    if ($("analysisLast30")) $("analysisLast30").textContent = formatAmount(stats.last30Total, state);
    if ($("analysisCount")) $("analysisCount").textContent = stats.count;
}

function renderPieChart(stats, container) {
    if (!stats.total) { container.innerHTML = `<p class="chart-empty">No data yet.</p>`; return; }

    const entries = Object.entries(stats.categoryTotals).sort((a, b) => b[1] - a[1]);
    let last = 0;
    const gradient = entries.map(([, amt], i) => {
        const pct = (amt / stats.total) * 100;
        const start = last; last += pct;
        return `${PALETTE[i % PALETTE.length]} ${start.toFixed(2)}% ${last.toFixed(2)}%`;
    }).join(",");

    const pie = document.createElement("div");
    pie.className = "chart-pie";
    pie.style.background = `conic-gradient(${gradient})`;
    container.appendChild(pie);

    const legend = document.createElement("div");
    legend.className = "chart-legend pie-legend";
    legend.innerHTML = entries.map(([cat, amt], i) => `
    <span class="legend-item">
      <span class="swatch" style="background:${PALETTE[i % PALETTE.length]}"></span>
      ${cat}: ${formatAmount(amt, state)} (${((amt / stats.total) * 100).toFixed(1)}%)
    </span>`).join("");
    container.appendChild(legend);
}

function renderLineChartAllTimeCurved(container, period) {
    const grouped = groupTransactionsAllTime(state.transactions, period);
    const entries = Object.entries(grouped);

    if (!entries.length) { container.innerHTML = `<p class="chart-empty">No data yet.</p>`; return; }

    const W = 700, H = 280, PL = 60, PR = 30, PT = 30, PB = 60;
    const IW = W - PL - PR, IH = H - PT - PB;
    const maxVal = Math.max(...entries.map(([, v]) => v), 1);

    const pts = entries.map(([lbl, v], i) => ({
        x: PL + (i / (Math.max(entries.length - 1, 1))) * IW,
        y: PT + IH - (v / maxVal) * IH,
        lbl, v
    }));

    const curvePath = cardinalSpline(pts.map(p => [p.x, p.y]), 0.5, false);
    const areaPath = `M ${PL} ${PT + IH} L ${curvePath.slice(2)} L ${pts[pts.length - 1].x} ${PT + IH} Z`;

    const gridLines = [0.25, 0.5, 0.75, 1].map(f => {
        const y = PT + IH - f * IH;
        const lbl = formatAmount(maxVal * f, state);
        return `<line x1="${PL}" y1="${y.toFixed(1)}" x2="${W - PR}" y2="${y.toFixed(1)}"
              stroke="var(--border)" stroke-width="1"/>
            <text x="${PL - 8}" y="${y.toFixed(1)}" text-anchor="end" font-size="11"
              fill="var(--text-muted)" dominant-baseline="middle">${lbl}</text>`;
    }).join("");

    const dots = pts.map((p, i) => `
    <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" class="line-dot"
      fill="var(--accent)" stroke="var(--surface)" stroke-width="2.5">
      <title>${p.lbl}: ${formatAmount(p.v, state)}</title>
    </circle>`).join("");

    const xLabels = pts.filter((p, i) => i % Math.max(1, Math.floor(pts.length / 10)) === 0).map(p => `
    <text x="${p.x.toFixed(1)}" y="${H - 15}" text-anchor="middle"
      font-size="11" fill="var(--text-muted)">${p.lbl}</text>`).join("");

    const svg = document.createElement("div");
    svg.style.width = "100%";
    svg.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" class="line-chart-svg">
      <defs>
        <linearGradient id="areaGrad3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--accent)" stop-opacity=".4"/>
          <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${areaPath}" fill="url(#areaGrad3)" class="area-fill"/>
      <path d="${curvePath}" fill="none" stroke="var(--accent)"
        stroke-width="3" stroke-linejoin="round" stroke-linecap="round" class="line-path"/>
      ${dots}
      ${xLabels}
    </svg>`;
    container.appendChild(svg);
}


function renderCategoryBars(stats, container) {
    const entries = Object.entries(stats.categoryTotals).sort((a, b) => b[1] - a[1]);
    if (!entries.length) {
        container.innerHTML = `<p class="chart-empty">No data yet.</p>`;
        return;
    }
    const maxVal = entries[0][1];

    container.innerHTML = entries.map(([cat, amt], i) => `
    <div class="analysis-bar-row">
      <span class="a-label" title="${cat}">${cat}</span>
      <div class="a-track">
        <div class="a-fill chart-animate" 
             style="width: ${(amt / maxVal) * 100}%; background: ${PALETTE[i % PALETTE.length]}">
        </div>
      </div>
      <span class="a-val">${formatAmount(amt, state)}</span>
    </div>`).join("");
}

function renderMonthlyBarLarge(stats, container) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const maxVal = Math.max(...stats.monthlyTotals, 1);

    const wrap = document.createElement("div");
    wrap.className = "bar-chart-wrap-large";
    wrap.style.gap = ".6rem";

    stats.monthlyTotals.forEach((amt, i) => {
        const pct = (amt / maxVal) * 100;
        const g = document.createElement("div");
        g.className = "bar-group-large";
        g.innerHTML = `
      <div class="bars-large" style="justify-content:flex-end">
        <div class="bar-wrap" style="width:100%">
          <span class="tip">${months[i]}: ${formatAmount(amt, state)}</span>
          <div class="bar actual-bar chart-animate" style="--final-h:${pct}%;background:${PALETTE[i % PALETTE.length]}"></div>
        </div>
      </div>
      <span class="bar-label-large">${months[i]}</span>`;
        wrap.appendChild(g);
    });

    container.appendChild(wrap);

    requestAnimationFrame(() => {
        wrap.querySelectorAll('.chart-animate').forEach(el => el.classList.add('animate-in'));
    });
}
