/* ═══════════════════════════════════════════════════════════
   FinFlow — Premium Finance Dashboard  |  app.js
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ── DEFAULT SEED DATA ──────────────────────────────────────────
const SEED_DATA = [
  { id:'t001', date:'2026-03-01', desc:'Monthly Salary',        category:'Salary',       type:'income',  amount:5500 },
  { id:'t002', date:'2026-03-03', desc:'Rent Payment',          category:'Housing',      type:'expense', amount:1400 },
  { id:'t003', date:'2026-03-05', desc:'Grocery Shopping',      category:'Food',         type:'expense', amount:230 },
  { id:'t004', date:'2026-03-07', desc:'Freelance Project',     category:'Freelance',    type:'income',  amount:1200 },
  { id:'t005', date:'2026-03-08', desc:'Electric Bill',         category:'Utilities',    type:'expense', amount:110 },
  { id:'t006', date:'2026-03-10', desc:'Netflix Subscription',  category:'Entertainment',type:'expense', amount:18 },
  { id:'t007', date:'2026-03-12', desc:'Fuel & Transport',      category:'Transport',    type:'expense', amount:95 },
  { id:'t008', date:'2026-03-14', desc:'Online Course',         category:'Education',    type:'expense', amount:79 },
  { id:'t009', date:'2026-03-15', desc:'Restaurant Dinner',     category:'Food',         type:'expense', amount:64 },
  { id:'t010', date:'2026-03-18', desc:'Health Insurance',      category:'Health',       type:'expense', amount:180 },
  { id:'t011', date:'2026-03-20', desc:'Dividend Payout',       category:'Investments',  type:'income',  amount:320 },
  { id:'t012', date:'2026-03-22', desc:'Gym Membership',        category:'Health',       type:'expense', amount:45 },
  { id:'t013', date:'2026-03-24', desc:'New Shoes',             category:'Shopping',     type:'expense', amount:120 },
  { id:'t014', date:'2026-03-26', desc:'Consulting Fee',        category:'Freelance',    type:'income',  amount:800 },
  { id:'t015', date:'2026-03-28', desc:'Coffee Shop',           category:'Food',         type:'expense', amount:32 },
  { id:'t016', date:'2026-02-01', desc:'Monthly Salary',        category:'Salary',       type:'income',  amount:5500 },
  { id:'t017', date:'2026-02-04', desc:'Rent Payment',          category:'Housing',      type:'expense', amount:1400 },
  { id:'t018', date:'2026-02-08', desc:'Grocery Shopping',      category:'Food',         type:'expense', amount:195 },
  { id:'t019', date:'2026-02-12', desc:'Car Repair',            category:'Transport',    type:'expense', amount:340 },
  { id:'t020', date:'2026-02-20', desc:'Bonus Payment',         category:'Salary',       type:'income',  amount:600 },
  { id:'t021', date:'2026-02-22', desc:'Internet Bill',         category:'Utilities',    type:'expense', amount:65 },
  { id:'t022', date:'2026-02-25', desc:'Weekend Trip',          category:'Entertainment',type:'expense', amount:290 },
  { id:'t023', date:'2026-01-01', desc:'Monthly Salary',        category:'Salary',       type:'income',  amount:5200 },
  { id:'t024', date:'2026-01-05', desc:'Rent Payment',          category:'Housing',      type:'expense', amount:1400 },
  { id:'t025', date:'2026-01-10', desc:'New Laptop',            category:'Shopping',     type:'expense', amount:1100 },
  { id:'t026', date:'2026-01-15', desc:'Grocery Shopping',      category:'Food',         type:'expense', amount:210 },
  { id:'t027', date:'2026-01-20', desc:'Freelance Project',     category:'Freelance',    type:'income',  amount:950 },
  { id:'t028', date:'2026-01-25', desc:'Doctor Visit',          category:'Health',       type:'expense', amount:75 },
];

const CATEGORIES = ['Salary','Freelance','Investments','Housing','Food','Transport','Utilities','Entertainment','Health','Education','Shopping','Other'];

const CAT_COLORS_LIGHT = {
  Salary:'#4f46e5', Freelance:'#06b6d4', Investments:'#10b981',
  Housing:'#f97316', Food:'#f59e0b',     Transport:'#8b5cf6',
  Utilities:'#ec4899', Entertainment:'#14b8a6', Health:'#ef4444',
  Education:'#6366f1', Shopping:'#e879f9', Other:'#94a3b8'
};

const CAT_COLORS_DARK = {
  Salary:'#818cf8', Freelance:'#00f5ff', Investments:'#00ff94',
  Housing:'#fb923c', Food:'#ffd60a',     Transport:'#c084fc',
  Utilities:'#f472b6', Entertainment:'#2dd4bf', Health:'#ff4d6d',
  Education:'#a5b4fc', Shopping:'#e879f9', Other:'#64748b'
};

// ── STATE ──────────────────────────────────────────────────────
const State = (() => {
  const KEY_TX    = 'finflow_transactions';
  const KEY_ROLE  = 'finflow_role';
  const KEY_THEME = 'finflow_theme';

  let data = {
    transactions: [],
    role: 'admin',
    theme: 'dark',
    sortKey: 'date',
    sortDir: 'desc',
    filterType: 'all',
    filterCat: 'all',
    search: '',
    activeSection: 'dashboard',
  };

  function load() {
    try {
      const saved = localStorage.getItem(KEY_TX);
      data.transactions = saved ? JSON.parse(saved) : [...SEED_DATA];
      data.role  = localStorage.getItem(KEY_ROLE)  || 'admin';
      data.theme = localStorage.getItem(KEY_THEME) || 'dark';
    } catch(e) {
      data.transactions = [...SEED_DATA];
    }
  }

  function save() {
    localStorage.setItem(KEY_TX,    JSON.stringify(data.transactions));
    localStorage.setItem(KEY_ROLE,  data.role);
    localStorage.setItem(KEY_THEME, data.theme);
  }

  function get(k) { return data[k]; }

  function set(k, v) { data[k] = v; if (['transactions','role','theme'].includes(k)) save(); }

  function addTx(tx) {
    data.transactions = [tx, ...data.transactions];
    save();
  }

  function deleteTx(id) {
    data.transactions = data.transactions.filter(t => t.id !== id);
    save();
  }

  function clearNewTransactions() {
    data.transactions = [...SEED_DATA];
    save();
  }

  return { load, save, get, set, addTx, deleteTx, clearNewTransactions };
})();

// ── UTILS ──────────────────────────────────────────────────────
const fmt = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);
const fmtShort = n => {
  if (n >= 1e5) return '₹' + (n/1e5).toFixed(1) + 'L';
  if (n >= 1000) return '₹' + (n/1000).toFixed(1) + 'K';
  return '₹' + n;
};
const uid = () => 't' + Date.now().toString(36) + Math.random().toString(36).slice(2,5);
const today = () => new Date().toISOString().split('T')[0];
const monthKey = d => d.slice(0,7);

function debounce(fn, delay = 250) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function computeTotals(transactions) {
  let income = 0, expenses = 0;
  transactions.forEach(t => {
    if (t.type === 'income')  income   += t.amount;
    if (t.type === 'expense') expenses += t.amount;
  });
  return { income, expenses, balance: income - expenses };
}

function getCatColors() {
  return State.get('theme') === 'dark' ? CAT_COLORS_DARK : CAT_COLORS_LIGHT;
}

// ── TOAST ──────────────────────────────────────────────────────
function toast(msg, type = 'info', icon = '') {
  const icons = { success:'✅', error:'❌', warn:'⚠️', info:'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-icon">${icon || icons[type]}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity 0.3s ease'; el.style.opacity='0'; setTimeout(() => el.remove(), 300); }, 3500);
}

// ── GAUGE ──────────────────────────────────────────────────────
function renderGauge(pct) {
  const svg   = document.getElementById('gauge-svg');
  const fill  = document.getElementById('gauge-fill');
  const pctEl = document.getElementById('gauge-pct');
  const statusEl = document.getElementById('gauge-status');

  const R = 70, CX = 80, CY = 80;
  const startAngle = Math.PI;
  const endAngle   = 2 * Math.PI;
  const angle = startAngle + (Math.min(pct/100, 1)) * Math.PI;

  const x1 = CX + R * Math.cos(startAngle);
  const y1 = CY + R * Math.sin(startAngle);
  const x2 = CX + R * Math.cos(angle);
  const y2 = CY + R * Math.sin(angle);
  const largeArc = angle - startAngle > Math.PI ? 1 : 0;

  const isDark = State.get('theme') === 'dark';

  let color, statusText, statusBg;
  if (pct < 50) {
    color = isDark ? '#00ff94' : '#10b981';
    statusText = '🟢 Healthy';
    statusBg = isDark ? 'rgba(0,255,148,0.12)' : 'rgba(16,185,129,0.12)';
  } else if (pct < 75) {
    color = isDark ? '#ffd60a' : '#f59e0b';
    statusText = '🟡 Caution';
    statusBg = isDark ? 'rgba(255,214,10,0.12)' : 'rgba(245,158,11,0.12)';
  } else {
    color = isDark ? '#ff4d6d' : '#ef4444';
    statusText = '🔴 High Risk';
    statusBg = isDark ? 'rgba(255,77,109,0.12)' : 'rgba(239,68,68,0.12)';
  }

  // Track arc
  const trackX1 = CX + R * Math.cos(startAngle);
  const trackY1 = CY + R * Math.sin(startAngle);
  const trackX2 = CX + R * Math.cos(endAngle);
  const trackY2 = CY + R * Math.sin(endAngle);

  svg.innerHTML = `
    <path d="M ${trackX1} ${trackY1} A ${R} ${R} 0 1 1 ${trackX2} ${trackY2}"
          fill="none" stroke="var(--border)" stroke-width="14" stroke-linecap="round"/>
    <path d="M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}"
          fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"
          style="filter: drop-shadow(0 0 6px ${color})"/>
    <text x="${CX}" y="${CY + 18}" text-anchor="middle" font-size="13" font-weight="700"
          font-family="Inter,sans-serif" fill="${color}">${pct.toFixed(1)}%</text>
    <text x="${CX}" y="${CY + 32}" text-anchor="middle" font-size="9.5" font-weight="500"
          font-family="Inter,sans-serif" fill="var(--text-muted)">of income</text>
  `;

  pctEl.textContent = pct.toFixed(1) + '%';
  pctEl.style.color = color;
  if (isDark) pctEl.style.textShadow = `0 0 20px ${color}`;
  else pctEl.style.textShadow = 'none';

  statusEl.textContent = statusText;
  statusEl.style.background = statusBg;
  statusEl.style.color = color;
}

// ── CHARTS ─────────────────────────────────────────────────────
let chartLine = null;
let chartDonut = null;
let chartMonthly = null;

function renderTrendChart(transactions) {
  const ctx = document.getElementById('chart-trend').getContext('2d');
  const isDark = State.get('theme') === 'dark';

  // Group by month — dynamic last 6 months window
  const allTxDates = transactions.map(t => t.date).sort().reverse();
  const latestDate = allTxDates.length > 0 ? new Date(allTxDates[0] + 'T00:00:00') : new Date();
  const refDate = isNaN(latestDate.getTime()) ? new Date() : new Date(latestDate.getFullYear(), latestDate.getMonth() + 1, 1);
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    months.push(d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'));
  }

  const incByMonth = {};
  const expByMonth = {};
  const sorted = [...transactions].sort((a,b) => a.date.localeCompare(b.date));
  sorted.forEach(t => {
    const mk = monthKey(t.date);
    if (!incByMonth[mk]) incByMonth[mk] = 0;
    if (!expByMonth[mk]) expByMonth[mk] = 0;
    if (t.type === 'income') incByMonth[mk] += t.amount;
    else expByMonth[mk] += t.amount;
  });

  const labels = months.map(m => { const [y,mo] = m.split('-'); return new Date(y,mo-1,1).toLocaleString('default',{month:'short',year:'2-digit'}); });
  const incData = months.map(m => incByMonth[m] || 0);
  const expData = months.map(m => expByMonth[m] || 0);

  const incColor = isDark ? '#00f5ff' : '#0ea5e9'; // Cyan/Blue for income
  const expColor = isDark ? '#ff4d6d' : '#ef4444'; // Red for expense

  if (chartLine) chartLine.destroy();
  chartLine = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incData,
          borderColor: incColor,
          backgroundColor: isDark ? 'rgba(0,245,255,0.1)' : 'rgba(14,165,233,0.1)',
          fill: true,
          tension: 0.45,
          pointBackgroundColor: incColor,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2.5,
        },
        {
          label: 'Expenses',
          data: expData,
          borderColor: expColor,
          backgroundColor: isDark ? 'rgba(255,77,109,0.1)' : 'rgba(239,68,68,0.1)',
          fill: true,
          tension: 0.45,
          pointBackgroundColor: expColor,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2.5,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? '#111827' : '#ffffff',
          titleColor: isDark ? '#e8eaf6' : '#0d1117',
          bodyColor: isDark ? '#8892b0' : '#5a6478',
          borderColor: isDark ? '#1e2d4a' : '#e2e6f0',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          callbacks: {
            label: ctx => ' ' + fmt(ctx.parsed.y)
          }
        }
      },
      scales: {
        x: {
          grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
          ticks: { color: isDark ? '#4a5568' : '#8b92a5', font: { size: 11, family:'Inter' } }
        },
        y: {
          grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
          ticks: { color: isDark ? '#4a5568' : '#8b92a5', font: { size: 11, family:'Inter' }, callback: v => fmtShort(v) }
        }
      }
    }
  });
}

function renderDonutChart(transactions) {
  const ctx = document.getElementById('chart-donut').getContext('2d');
  const isDark = State.get('theme') === 'dark';
  const colors = isDark ? CAT_COLORS_DARK : CAT_COLORS_LIGHT;

  const expenses = transactions.filter(t => t.type === 'expense');
  const catMap = {};
  expenses.forEach(t => { catMap[t.category] = (catMap[t.category]||0) + t.amount; });
  const cats = Object.keys(catMap).sort((a,b) => catMap[b]-catMap[a]);
  const vals = cats.map(c => catMap[c]);
  const cols = cats.map(c => colors[c] || colors.Other);

  if (chartDonut) chartDonut.destroy();

  if (cats.length === 0) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }

  chartDonut = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: cats,
      datasets: [{
        data: vals,
        backgroundColor: cols,
        borderColor: isDark ? '#111827' : '#ffffff',
        borderWidth: 3,
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: isDark ? '#8892b0' : '#5a6478',
            font: { size: 11, family:'Inter' },
            padding: 12,
            boxWidth: 12,
            boxHeight: 12,
            usePointStyle: true,
            pointStyleWidth: 12,
          }
        },
        tooltip: {
          backgroundColor: isDark ? '#111827' : '#ffffff',
          titleColor: isDark ? '#e8eaf6' : '#0d1117',
          bodyColor: isDark ? '#8892b0' : '#5a6478',
          borderColor: isDark ? '#1e2d4a' : '#e2e6f0',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          callbacks: {
            label: ctx => ` ${ctx.label}: ${fmt(ctx.parsed)}`
          }
        }
      }
    }
  });
}

function renderMonthlyChart(transactions) {
  const ctx = document.getElementById('chart-monthly');
  if (!ctx) return;
  const isDark = State.get('theme') === 'dark';

  const allTxDates = transactions.map(t => t.date).sort().reverse();
  const latestDate = allTxDates.length > 0 ? new Date(allTxDates[0] + 'T00:00:00') : new Date();
  const refDate = isNaN(latestDate.getTime()) ? new Date() : new Date(latestDate.getFullYear(), latestDate.getMonth() + 1, 1);
  const months = [];
  for (let i = 3; i >= 0; i--) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth() - i, 1);
    months.push(d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'));
  }
  const labels = months.map(m => { const [y,mo]=m.split('-'); return new Date(y,mo-1,1).toLocaleString('default',{month:'short'}); });

  const incData = months.map(m => transactions.filter(t => t.type==='income' && monthKey(t.date)===m).reduce((s,t)=>s+t.amount,0));
  const expData = months.map(m => transactions.filter(t => t.type==='expense' && monthKey(t.date)===m).reduce((s,t)=>s+t.amount,0));

  if (chartMonthly) chartMonthly.destroy();
  chartMonthly = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incData,
          backgroundColor: isDark ? 'rgba(0,255,148,0.7)' : 'rgba(16,185,129,0.75)',
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: 'Expenses',
          data: expData,
          backgroundColor: isDark ? 'rgba(255,77,109,0.7)' : 'rgba(239,68,68,0.75)',
          borderRadius: 8,
          borderSkipped: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: isDark ? '#8892b0' : '#5a6478',
            font: { size: 11, family:'Inter' },
            boxWidth: 12, boxHeight: 12,
          }
        },
        tooltip: {
          backgroundColor: isDark ? '#111827' : '#ffffff',
          titleColor: isDark ? '#e8eaf6' : '#0d1117',
          bodyColor: isDark ? '#8892b0' : '#5a6478',
          borderColor: isDark ? '#1e2d4a' : '#e2e6f0',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 12,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: isDark ? '#4a5568':'#8b92a5', font: { size:11, family:'Inter' } } },
        y: { grid: { color: isDark ? 'rgba(255,255,255,0.04)':'rgba(0,0,0,0.04)' }, ticks: { color: isDark ? '#4a5568':'#8b92a5', font: { size:11, family:'Inter' }, callback: v => fmtShort(v) } }
      }
    }
  });
}

// ── DASHBOARD RENDER ───────────────────────────────────────────
function renderDashboard() {
  const txs = State.get('transactions');
  const { income, expenses, balance } = computeTotals(txs);
  const pct = income > 0 ? (expenses / income) * 100 : 0;

  // Summary cards
  animateCounter('val-balance',  balance);
  animateCounter('val-income',   income);
  animateCounter('val-expenses', expenses);

  document.getElementById('sub-balance').textContent  = `Savings: ${fmt(balance)}`;
  document.getElementById('sub-income').textContent   = txs.filter(t=>t.type==='income').length + ' income transactions';
  document.getElementById('sub-expenses').textContent = txs.filter(t=>t.type==='expense').length + ' expense transactions';

  // Gauge
  renderGauge(pct);

  // Charts
  renderTrendChart(txs);
  renderDonutChart(txs);

  // Recent transactions widget
  renderRecentTx(txs);

  // Top spending categories on dashboard
  const catMapDash = {};
  txs.filter(t=>t.type==='expense').forEach(t=>{ catMapDash[t.category]=(catMapDash[t.category]||0)+t.amount; });
  renderCatBarsTo('cat-bars-dashboard', catMapDash, 5, txs);

  // Generative Spending DNA SVG Fingerprint
  renderSpendingDNA(txs);
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = 0, duration = 800;
  const startTime = performance.now();
  const update = now => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = fmt(Math.round(start + (target - start) * ease));
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function renderRecentTx(txs) {
  const container = document.getElementById('recent-tx-list');
  if (!container) return;
  const recent = [...txs].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5);
  if (recent.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">💸</div><h3>No Transactions</h3></div>';
    return;
  }
  container.innerHTML = recent.map(t => `
    <div class="alert-item">
      <div class="alert-dot" style="background:${t.type==='income'?'var(--accent-green)':'var(--accent-red)'}; ${State.get('theme')==='dark'?'box-shadow: 0 0 6px ' + (t.type==='income'?'var(--accent-green)':'var(--accent-red)'):''}"></div>
      <div style="flex:1">
        <div class="alert-text">${t.desc}</div>
        <div class="alert-date">${new Date(t.date+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})} · ${t.category}</div>
      </div>
      <div class="alert-amount ${t.type==='income'?'tx-amount-income':'tx-amount-expense'}">${t.type==='income'?'+':'-'}${fmt(t.amount)}</div>
    </div>
  `).join('');
}

// ── TRANSACTIONS RENDER ────────────────────────────────────────
function getFilteredTx() {
  let txs = State.get('transactions');
  const search = State.get('search').toLowerCase();
  const type   = State.get('filterType');
  const cat    = State.get('filterCat');
  const sortK  = State.get('sortKey');
  const sortD  = State.get('sortDir');

  if (search) txs = txs.filter(t => t.desc.toLowerCase().includes(search) || t.category.toLowerCase().includes(search));
  if (type !== 'all') txs = txs.filter(t => t.type === type);
  if (cat  !== 'all') txs = txs.filter(t => t.category === cat);

  txs = [...txs].sort((a,b) => {
    let va = a[sortK], vb = b[sortK];
    if (sortK === 'amount') { va = Number(va); vb = Number(vb); }
    if (va < vb) return sortD === 'asc' ? -1 : 1;
    if (va > vb) return sortD === 'asc' ? 1 : -1;
    return 0;
  });

  return txs;
}

function renderTransactions() {
  const txs    = getFilteredTx();
  const isAdmin = State.get('role') === 'admin';
  const tbody   = document.getElementById('tx-tbody');
  const count   = document.getElementById('tx-count');

  if (count) count.textContent = `${txs.length} transaction${txs.length!==1?'s':''}`;

  if (txs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3>No Transactions Found</h3>
      <p>Try adjusting your filters or search query.</p>
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = txs.map(t => {
    const dateStr = new Date(t.date+'T00:00:00').toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
    const amtClass = t.type === 'income' ? 'tx-amount-income' : 'tx-amount-expense';
    const amtSign  = t.type === 'income' ? '+' : '-';
    return `
    <tr data-id="${t.id}">
      <td>${dateStr}</td>
      <td>${t.desc}</td>
      <td><span class="cat-pill">${t.category}</span></td>
      <td><span class="tx-type-badge type-${t.type}">${t.type==='income'?'⬆':'⬇'} ${t.type}</span></td>
      <td class="${amtClass}">${amtSign}${fmt(t.amount)}</td>
      <td>${isAdmin ? `<button class="btn btn-danger" onclick="deleteTx('${t.id}')">🗑 Delete</button>` : '<span style="color:var(--text-muted);font-size:0.75rem">—</span>'}</td>
    </tr>`;
  }).join('');

  // Update sort arrow indicators
  ['date','amount'].forEach(k => {
    const th = document.querySelector(`th[data-sort="${k}"]`);
    if (!th) return;
    th.classList.toggle('sorted', State.get('sortKey') === k);
    const arrow = th.querySelector('.sort-arrow');
    if (arrow) arrow.textContent = State.get('sortKey')===k ? (State.get('sortDir')==='asc'?'↑':'↓') : '↕';
  });
}

// ── DELETE TRANSACTION ─────────────────────────────────────────
window.deleteTx = function(id) {
  if (State.get('role') !== 'admin') return toast('Only admins can delete transactions.', 'error');
  State.deleteTx(id);
  renderAll();
  toast('Transaction deleted successfully.', 'success');
};

// ── ADD TRANSACTION ────────────────────────────────────────────
function openAddModal() {
  document.getElementById('modal-add').classList.add('open');
  document.getElementById('form-error').classList.remove('show');
  document.getElementById('add-form').reset();
  document.getElementById('add-date').value = today();
  ['add-desc', 'add-amount', 'add-type', 'add-cat', 'add-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('input-invalid');
  });
}

function closeAddModal() {
  document.getElementById('modal-add').classList.remove('open');
}

function submitAddTx(e) {
  e.preventDefault();
  const errEl = document.getElementById('form-error');
  errEl.classList.remove('show');

  const descEl   = document.getElementById('add-desc');
  const amountEl = document.getElementById('add-amount');
  const desc   = descEl.value.trim();
  const amount = parseFloat(amountEl.value);
  const type   = document.getElementById('add-type').value;
  const cat    = document.getElementById('add-cat').value;
  const date   = document.getElementById('add-date').value;

  ['add-desc', 'add-amount', 'add-type', 'add-cat', 'add-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('input-invalid');
  });

  if (!desc) descEl.classList.add('input-invalid');
  if (!amount || isNaN(amount)) amountEl.classList.add('input-invalid');

  if (!desc || !amount || !type || !cat || !date) {
    errEl.textContent = 'All fields are required.';
    errEl.classList.add('show');
    return;
  }

  if (amount <= 0) {
    amountEl.classList.add('input-invalid');
    errEl.textContent = 'Amount must be a positive number.';
    errEl.classList.add('show');
    return;
  }

  // Balance guard: expenses cannot exceed current balance
  if (type === 'expense') {
    const txs = State.get('transactions');
    const { balance } = computeTotals(txs);
    if (amount > balance) {
      errEl.textContent = `❌ Insufficient balance! Available: ${fmt(balance)}. Cannot add expense of ${fmt(amount)}.`;
      errEl.classList.add('show');
      toast(`Rejected: expense exceeds balance (${fmt(balance)})`, 'error');
      return;
    }
  }

  const tx = { id: uid(), date, desc, category: cat, type, amount };
  State.addTx(tx);
  closeAddModal();
  renderAll();
  toast(`Transaction "${desc}" added! ${type==='income'?'💰':'💳'}`, 'success');
}

// ── INSIGHTS RENDER ────────────────────────────────────────────
function renderInsights() {
  const txs = State.get('transactions');
  const { income, expenses, balance } = computeTotals(txs);
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : '0.0';

  // Highest spending category
  const catMap = {};
  txs.filter(t => t.type==='expense').forEach(t => { catMap[t.category] = (catMap[t.category]||0) + t.amount; });
  const topCat  = Object.keys(catMap).sort((a,b) => catMap[b]-catMap[a])[0] || 'N/A';
  const topAmt  = catMap[topCat] || 0;

  document.getElementById('ins-top-cat').textContent  = topCat;
  document.getElementById('ins-top-amt').textContent  = fmt(topAmt);
  document.getElementById('ins-savings-rate').textContent = savingsRate + '%';
  document.getElementById('ins-savings-sub').textContent  = `Saved ${fmt(balance)} of ${fmt(income)} earned`;

  // Monthly comparison (dynamically extracted current vs previous month)
  const allMonths = [...new Set(txs.map(t => monthKey(t.date)))].sort().reverse();
  const curMonth  = allMonths[0] || monthKey(today());
  const prevMonth = allMonths[1] || monthKey(today());
  const curInc  = txs.filter(t=>t.type==='income'  && monthKey(t.date)===curMonth).reduce((s,t)=>s+t.amount,0);
  const curExp  = txs.filter(t=>t.type==='expense' && monthKey(t.date)===curMonth).reduce((s,t)=>s+t.amount,0);
  const prevInc = txs.filter(t=>t.type==='income'  && monthKey(t.date)===prevMonth).reduce((s,t)=>s+t.amount,0);
  const prevExp = txs.filter(t=>t.type==='expense' && monthKey(t.date)===prevMonth).reduce((s,t)=>s+t.amount,0);

  document.getElementById('ins-cur-inc').textContent  = fmt(curInc);
  document.getElementById('ins-cur-exp').textContent  = fmt(curExp);
  document.getElementById('ins-prev-inc').textContent = fmt(prevInc);
  document.getElementById('ins-prev-exp').textContent = fmt(prevExp);

  const expDiff = curExp - prevExp;
  const diffEl  = document.getElementById('ins-exp-diff');
  if (diffEl) {
    diffEl.textContent = (expDiff >= 0 ? '+' : '') + fmt(expDiff) + ' vs last month';
    diffEl.style.color = expDiff > 0 ? 'var(--accent-red)' : 'var(--accent-green)';
  }

  // Category bar chart
  renderCatBars(catMap, txs);

  // Monthly chart
  renderMonthlyChart(txs);

  // Alerts
  renderAlerts(txs);

  // Regret Index & Local Benchmarks
  renderRegretIndexUI(txs);
  renderLocalBenchmarkingUI(txs);
}

function renderCatBars(catMap, txs) {
  renderCatBarsTo('cat-bars', catMap, 6, txs);
}

function renderCatBarsTo(containerId, catMap, maxItems, txs) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const colors = getCatColors();
  const total = Object.values(catMap).reduce((s,v)=>s+v,0);
  const sorted = Object.keys(catMap).sort((a,b)=>catMap[b]-catMap[a]).slice(0, maxItems||6);

  if (sorted.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding:20px"><div class="empty-icon">📊</div><p>No expense data</p></div>';
    return;
  }

  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const oneMonthAgo = d.toISOString().split('T')[0];

  container.innerHTML = sorted.map(cat => {
    const pct = total > 0 ? (catMap[cat]/total)*100 : 0;
    
    let lastMonthAmt = 0;
    if (txs) {
       lastMonthAmt = txs.filter(t => t.category === cat && t.type === 'expense' && t.date >= oneMonthAgo).reduce((s,t)=>s+t.amount,0);
    }

    return `
      <div class="cat-bar-row interactive-bar" onclick="this.classList.toggle('expanded')">
        <div class="cat-bar-top">
          <div class="cat-bar-label">${cat} <span class="cat-expand-icon">▾</span></div>
          <div class="cat-bar-track">
            <div class="cat-bar-fill" style="width:${pct.toFixed(1)}%;background:${colors[cat]||'#94a3b8'}"></div>
          </div>
          <div class="cat-bar-val">${fmtShort(catMap[cat])}</div>
        </div>
        <div class="cat-bar-details">
          <div class="cat-stat"><span>Last 30 days:</span> <strong>${fmt(lastMonthAmt)}</strong></div>
          <div class="cat-stat"><span>Overall:</span> <strong>${fmt(catMap[cat])}</strong></div>
        </div>
      </div>`;
  }).join('');
}

function renderAlerts(txs) {
  const container = document.getElementById('alerts-list');
  if (!container) return;
  const { income } = computeTotals(txs);
  const pct = income > 0 ? (computeTotals(txs).expenses / income) * 100 : 0;
  const large = [...txs].filter(t=>t.type==='expense' && t.amount >= 200).sort((a,b)=>b.amount-a.amount).slice(0,4);

  let html = '';

  if (pct >= 75) html += alertItem('🔴','High spending alert','Your expenses exceed 75% of income!',null,'#ef4444');
  else if (pct >= 50) html += alertItem('🟡','Caution zone','You have crossed 50% of income spent.',null,'#f59e0b');
  else html += alertItem('🟢','Spending healthy','Your spending is within safe limits.',null,'#10b981');

  large.forEach(t => {
    html += alertItem('💸', t.desc, new Date(t.date+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'}), fmt(t.amount), '#8b5cf6');
  });

  if (html === '') html = '<div class="empty-state" style="padding:30px"><div class="empty-icon">✅</div><h3>No Alerts</h3></div>';
  container.innerHTML = html;
}

function alertItem(icon, text, sub, amount, color) {
  return `
    <div class="alert-item">
      <div class="alert-dot" style="background:${color};box-shadow:0 0 5px ${color}"></div>
      <div style="flex:1">
        <div class="alert-text">${icon} ${text}</div>
        ${sub ? `<div class="alert-date">${sub}</div>` : ''}
      </div>
      ${amount ? `<div class="alert-amount" style="color:${color}">${amount}</div>` : ''}
    </div>`;
}

// ── SPENDING DNA SVG GENERATOR ─────────────────────────────────
function renderSpendingDNA(txs) {
  const svg = document.getElementById('dna-svg');
  if (!svg) return;

  const expenses = txs.filter(t => t.type === 'expense');
  const catTotals = {};
  CATEGORIES.forEach(c => catTotals[c] = 0);
  expenses.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });

  const maxExpense = Math.max(...Object.values(catTotals), 1);
  const R_MIN = 25, R_MAX = 80;
  const CX = 100, CY = 100;
  const totalCats = CATEGORIES.length;

  const points = CATEGORIES.map((c, i) => {
    const ratio = catTotals[c] / maxExpense;
    const r = R_MIN + ratio * (R_MAX - R_MIN);
    const angle = (2 * Math.PI * i) / totalCats - Math.PI / 2;
    const x = CX + r * Math.cos(angle);
    const y = CY + r * Math.sin(angle);
    return { x: parseFloat(x.toFixed(1)), y: parseFloat(y.toFixed(1)), category: c, val: catTotals[c] };
  });

  const pathString = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') + ' Z';
  const isDark = State.get('theme') === 'dark';
  const strokeColor = isDark ? '#00f5ff' : '#4f46e5';
  const fillColor = isDark ? 'rgba(0, 245, 255, 0.22)' : 'rgba(79, 70, 229, 0.18)';

  let webRings = '';
  [0.3, 0.65, 1.0].forEach(factor => {
    const ringPoints = points.map((p, i) => {
      const r = R_MIN + factor * (R_MAX - R_MIN);
      const angle = (2 * Math.PI * i) / totalCats - Math.PI / 2;
      return `${(CX + r * Math.cos(angle)).toFixed(1)},${(CY + r * Math.sin(angle)).toFixed(1)}`;
    }).join(' ');
    webRings += `<polygon points="${ringPoints}" fill="none" stroke="var(--border)" stroke-width="1" stroke-dasharray="3 3" opacity="0.6"/>`;
  });

  svg.innerHTML = `
    ${webRings}
    <path d="${pathString}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2.5" style="filter: drop-shadow(0 0 8px ${strokeColor}); transition: all 0.5s ease;"/>
    ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="3.5" fill="${strokeColor}"/>`).join('')}
  `;

  const topCat = Object.entries(catTotals).sort((a,b) => b[1] - a[1])[0];
  const trait = topCat && topCat[1] > 0 ? `${topCat[0]} Focused` : 'Balanced';
  const variance = (Math.hypot(...Object.values(catTotals)) / (expenses.length || 1)).toFixed(1);
  const hash = 'DNA-' + Math.abs(Math.sin((expenses.length + 7) * 1337)).toString(16).slice(2, 8).toUpperCase();

  const traitEl = document.getElementById('dna-trait');
  const varEl = document.getElementById('dna-variance');
  const hashEl = document.getElementById('dna-hash');

  if (traitEl) traitEl.textContent = trait;
  if (varEl) varEl.textContent = variance;
  if (hashEl) hashEl.textContent = hash;
}

// ── REGRET INDEX & BENCHMARKING UI ──────────────────────────────
function renderRegretIndexUI(txs) {
  const expenses = txs.filter(t => t.type === 'expense');
  const scoreEl = document.getElementById('ins-regret-score');
  const subEl = document.getElementById('ins-regret-sub');
  if (!scoreEl || expenses.length === 0) return;

  let totalScore = 0;
  expenses.forEach(t => {
    if (typeof FinBot !== 'undefined' && typeof FinBot.extractSentiment === 'function') {
      totalScore += FinBot.extractSentiment(t.desc).regretScore;
    }
  });

  const avgScore = Math.round(totalScore / expenses.length);
  scoreEl.textContent = avgScore + '%';
  subEl.textContent = avgScore > 40 ? '⚠️ High impulse signals' : '🟢 Mindful spending';
}

function renderLocalBenchmarkingUI(txs) {
  const { income, expenses } = computeTotals(txs);
  const valEl = document.getElementById('ins-benchmark-val');
  const subEl = document.getElementById('ins-benchmark-sub');
  if (!valEl) return;

  const rate = income > 0 ? (expenses / income) * 100 : 50;
  const percentile = Math.min(99, Math.max(1, Math.round(100 - rate)));
  valEl.textContent = `Top ${percentile}%`;
  subEl.textContent = `Beats ${percentile}% of income peers`;
}
function applyRole(role) {
  State.set('role', role);
  const isAdmin = role === 'admin';

  // Show/hide admin-only UI
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });

  // Update sidebar role
  document.getElementById('role-badge-name').textContent  = isAdmin ? 'Administrator' : 'Viewer';
  document.getElementById('role-badge-desc').textContent  = isAdmin ? 'Full access' : 'Read-only';
  document.getElementById('role-dot').style.background = isAdmin ? 'var(--accent-green)' : 'var(--accent-yellow)';
  document.getElementById('role-dot').style.boxShadow  = isAdmin ? '0 0 6px var(--accent-green)' : '0 0 6px var(--accent-yellow)';

  // Update header role select
  document.getElementById('role-select').value = role;

  // Re-render transactions to show/hide delete buttons
  renderTransactions();
}

// ── THEME ──────────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  State.set('theme', theme);
  document.getElementById('theme-btn').textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ── NAV ───────────────────────────────────────────────────────
function navigate(section) {
  State.set('activeSection', section);
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === 'section-' + section));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.section === section));

  // Update header title
  const titles = { dashboard: ['Dashboard', 'Your financial overview at a glance'], transactions: ['Transactions', 'Manage and explore your financial records'], insights: ['Insights', 'Understanding your spending patterns'] };
  const [h, sub] = titles[section] || ['Dashboard', ''];
  document.querySelector('.header-title h1').textContent = h;
  document.querySelector('.header-title span').textContent = sub;

  if (section === 'dashboard')    renderDashboard();
  if (section === 'transactions') renderTransactions();
  if (section === 'insights')     renderInsights();

  // close sidebar on mobile
  if (window.innerWidth <= 768) closeSidebar();
}

// ── SORT ──────────────────────────────────────────────────────
window.sortBy = function(key) {
  if (State.get('sortKey') === key) {
    State.set('sortDir', State.get('sortDir') === 'asc' ? 'desc' : 'asc');
  } else {
    State.set('sortKey', key);
    State.set('sortDir', 'desc');
  }
  renderTransactions();
};

// ── MOBILE SIDEBAR ─────────────────────────────────────────────
function openSidebar()  { document.getElementById('sidebar').classList.add('open'); document.getElementById('overlay-bg').classList.add('open'); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay-bg').classList.remove('open'); }

// ── EXPORT ────────────────────────────────────────────────────
function exportCSV() {
  const txs = State.get('transactions');
  const headers = ['Date','Description','Category','Type','Amount'];
  const rows = txs.map(t => [t.date, `"${t.desc}"`, t.category, t.type, t.amount]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  download('finflow_transactions.csv', csv, 'text/csv');
  toast('Exported as CSV! 📄', 'success');
}

function exportJSON() {
  const txs = State.get('transactions');
  download('finflow_transactions.json', JSON.stringify(txs, null, 2), 'application/json');
  toast('Exported as JSON! 📦', 'success');
}

function download(filename, content, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── RENDER ALL ─────────────────────────────────────────────────
function renderAll() {
  const active = State.get('activeSection');
  if (active === 'dashboard')    renderDashboard();
  if (active === 'transactions') renderTransactions();
  if (active === 'insights')     renderInsights();
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  State.load();

  // Populate category filter
  const catFilter = document.getElementById('filter-cat');
  if (catFilter) {
    CATEGORIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      catFilter.appendChild(opt);
    });
  }

  // Populate add-form category select
  const addCat = document.getElementById('add-cat');
  if (addCat) {
    CATEGORIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      addCat.appendChild(opt);
    });
  }

  // Apply saved state
  applyTheme(State.get('theme'));
  applyRole(State.get('role'));
  navigate(State.get('activeSection'));

  // Navigation
  document.querySelectorAll('.nav-item[data-section]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.section));
  });

  // Role select
  document.getElementById('role-select').addEventListener('change', e => applyRole(e.target.value));

  // Theme toggle
  document.getElementById('theme-btn').addEventListener('click', () => {
    applyTheme(State.get('theme') === 'dark' ? 'light' : 'dark');
    // Destroy charts so they re-render with correct palette
    if (chartLine)    { chartLine.destroy();    chartLine = null; }
    if (chartDonut)   { chartDonut.destroy();   chartDonut = null; }
    if (chartMonthly) { chartMonthly.destroy(); chartMonthly = null; }
    renderAll();
  });

  // Mobile menu
  document.getElementById('menu-toggle').addEventListener('click', openSidebar);
  document.getElementById('overlay-bg').addEventListener('click', closeSidebar);

  // Debounced Search Filter (Prevents DOM thrashing on rapid keystrokes)
  document.getElementById('tx-search').addEventListener('input', debounce(e => {
    State.set('search', e.target.value);
    renderTransactions();
  }, 250));

  // Type filter
  document.getElementById('filter-type').addEventListener('change', e => {
    State.set('filterType', e.target.value);
    renderTransactions();
  });

  // Category filter
  document.getElementById('filter-cat').addEventListener('change', e => {
    State.set('filterCat', e.target.value);
    renderTransactions();
  });

  // Add modal
  document.getElementById('btn-add-tx').addEventListener('click', openAddModal);
  document.getElementById('modal-close').addEventListener('click', closeAddModal);
  document.getElementById('modal-cancel').addEventListener('click', closeAddModal);
  document.getElementById('add-form').addEventListener('submit', submitAddTx);
  document.getElementById('modal-add').addEventListener('click', e => { if (e.target === e.currentTarget) closeAddModal(); });

  // Export menu toggle
  const exportBtn = document.getElementById('btn-export');
  const exportMenu = document.getElementById('export-menu');
  if (exportBtn && exportMenu) {
    exportBtn.addEventListener('click', e => { e.stopPropagation(); exportMenu.classList.toggle('open'); });
    document.addEventListener('click', () => exportMenu.classList.remove('open'));
    document.getElementById('export-csv').addEventListener('click', exportCSV);
    document.getElementById('export-json').addEventListener('click', exportJSON);
  }

  // Sort column headers
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => sortBy(th.dataset.sort));
  });

  // Cross-tab multi-window LocalStorage Synchronization
  window.addEventListener('storage', (e) => {
    if (['finflow_transactions', 'finflow_role', 'finflow_theme'].includes(e.key)) {
      State.load();
      applyTheme(State.get('theme'));
      applyRole(State.get('role'));
      renderAll();
      toast('Data synchronized from another tab 🔄', 'info');
    }
  });
});
