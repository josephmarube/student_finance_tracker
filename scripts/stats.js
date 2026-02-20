/*
Get spending for the last 6 months + current month (7 total)
Returns array of { month: "Jan 2026", spending: 1234.56, monthKey: "2026-01" }
*/
export function getMonthlySpendLast6Months(data) {
  const now = new Date();
  const months = [];
  
  // Generate last 6 months + current (7 total)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthLabel = `${monthNames[month]} ${year}`;
    
    const spending = data
      .filter(t => {
        const td = new Date(t.date);
        return td.getFullYear() === year && td.getMonth() === month;
      })
      .reduce((s, t) => s + t.amount, 0);
    
    months.push({ month: monthLabel, spending, monthKey });
  }
  
  return months;
}

/*
Group transactions by time period for trend charts.
DASHBOARD: Filters to CURRENT period only.
*/
export function groupTransactions(data, period) {
  const now = new Date();
  const groups = {};

  const filtered = data.filter(t => {
    const txDate = new Date(t.date);
    
    if (period === "day") {
      return txDate.toDateString() === now.toDateString();
    }
    
    if (period === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return txDate >= weekAgo && txDate <= now;
    }
    
    if (period === "month") {
      return txDate.getMonth() === now.getMonth() &&
             txDate.getFullYear() === now.getFullYear();
    }
    
    if (period === "year") {
      return txDate.getFullYear() === now.getFullYear();
    }
    
    return false;
  });

  filtered.forEach(t => {
    const d = new Date(t.date);
    let key;

    if (period === "day") {
      key = `${String(d.getHours()).padStart(2, '0')}:00`;
    } else if (period === "week") {
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      key = days[d.getDay()];
    } else if (period === "month") {
      key = String(d.getDate());
    } else if (period === "year") {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      key = months[d.getMonth()];
    }

    groups[key] = (groups[key] || 0) + t.amount;
  });

  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (period === "day") return a.localeCompare(b);
    if (period === "week") {
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      return days.indexOf(a) - days.indexOf(b);
    }
    if (period === "month") return parseInt(a) - parseInt(b);
    if (period === "year") {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return months.indexOf(a) - months.indexOf(b);
    }
    return 0;
  });

  return sortedKeys.reduce((obj, k) => {
    obj[k] = groups[k];
    return obj;
  }, {});
}

/*
Group transactions for ANALYSIS section (all-time data).
*/
export function groupTransactionsAllTime(data, period) {
  const groups = {};

  data.forEach(t => {
    const d = new Date(t.date);
    let key;

    if (period === "day") {
      key = t.date;
    } else if (period === "week") {
      const day = d.getDay() || 7;
      const mon = new Date(d);
      mon.setDate(d.getDate() - day + 1);
      key = `${mon.getFullYear()}-W${String(getISOWeek(mon)).padStart(2, '0')}`;
    } else if (period === "month") {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    } else if (period === "year") {
      key = `${d.getFullYear()}`;
    }

    groups[key] = (groups[key] || 0) + t.amount;
  });

  return Object.keys(groups).sort().reduce((obj, k) => {
    obj[k] = groups[k];
    return obj;
  }, {});
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/*
Compute summary statistics.
*/
export function calculateStats(data) {
  const total = data.reduce((s, t) => s + t.amount, 0);

  const cutoff7 = new Date();
  cutoff7.setDate(cutoff7.getDate() - 7);
  const last7Total = data
    .filter(t => new Date(t.date) >= cutoff7)
    .reduce((s, t) => s + t.amount, 0);

  const cutoff30 = new Date();
  cutoff30.setDate(cutoff30.getDate() - 30);
  const last30Total = data
    .filter(t => new Date(t.date) >= cutoff30)
    .reduce((s, t) => s + t.amount, 0);

  const categoryTotals = {};
  data.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const thisYear = new Date().getFullYear();
  const monthlyTotals = Array(12).fill(0);
  data
    .filter(t => new Date(t.date).getFullYear() === thisYear)
    .forEach(t => {
      monthlyTotals[new Date(t.date).getMonth()] += t.amount;
    });

  const topCategory = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const avgTransaction = data.length ? total / data.length : 0;

  return {
    count: data.length,
    total,
    last7Total,
    last30Total,
    avgTransaction,
    categoryTotals,
    monthlyTotals,
    topCategory,
  };
}
