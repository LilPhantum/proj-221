// ===========================
// Constants & Utilities
// ===========================
const ACCENT = '#0003b6';
const UP_COLOR = '#00ff00';   // Green for up
const DOWN_COLOR = '#ff0000'; // Red for down
const NEUTRAL_COLOR = '#ffffff'; // White for neutral

function formatCurrency(n) {
  return '$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function rnd(min, max) { return Math.random() * (max - min) + min; }
function round(n) { return Math.round(n); }

// ===========================
// Date Helpers
// ===========================
function daysBefore(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() - days + 1);
  return d;
}

function formatDateShort(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ===========================
// Data & Rewards Config
// ===========================
const AVERAGES = {
  songs_per_week: 42,
  albums_per_week: 12,
  song_approval_rate: 0.88,
  album_approval_rate: 0.65
};

const REWARD = { song_min: 1, song_max: 5, album_min: 8, album_max: 15 };

// ===========================
// DOM References
// ===========================
const pills = Array.from(document.querySelectorAll('.range-pill'));
const kpiGrid = document.getElementById('kpiGrid');
const chartRangeLabel = document.getElementById('chartRange');
const lastUpdatedEl = document.getElementById('lastUpdated');
const topListEl = document.getElementById('topList');

// ===========================
// KPI Definitions
// ===========================
const KPI_DEFS = [
  { id: 'reviewedSongs', label: 'Reviewed Songs' },
  { id: 'reviewedAlbums', label: 'Reviewed Albums' },
  { id: 'approvedReviews', label: 'Approved Reviews' },
  { id: 'rejectedReviews', label: 'Rejected Reviews' },
  { id: 'estimatedRewards', label: 'Est. Rewards' },
  { id: 'totalReviews', label: 'Total Reviews' }
];

// ===========================
// Build KPI Cards
// ===========================
function buildKPICards() {
  KPI_DEFS.forEach(def => {
    const card = document.createElement('button');
    card.className = 'kpi-card';
    card.setAttribute('data-kpi', def.id);
    card.setAttribute('type', 'button');
    card.setAttribute('aria-pressed', 'false');
    card.innerHTML = `
      <div class="kpi-label">${def.label}</div>
      <div class="kpi-value" id="${def.id}-value">—</div>
      <div class="kpi-change" id="${def.id}-change">—</div>
    `;
    card.addEventListener('click', () => {
      document.querySelectorAll('.kpi-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
    kpiGrid.appendChild(card);
  });
}

// ===========================
// Chart Setup
// ===========================
const ctx = document.getElementById('analyticsChart').getContext('2d');
let analyticsChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Total Reviews',
      data: [],
      borderColor: ACCENT,
      backgroundColor: 'rgba(0,3,182,0.12)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: {
          color: '#fff',
          callback: function(value, index, values) {
            if (index === 0 || index === values.length - 1) return this.getLabelForValue(value);
            return '';
          }
        }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: null, // dynamic space added automatically
        ticks: {
          color: '#fff',
          callback: function(value, index, values) {
            if (index === 0 || index === values.length - 1) return value.toLocaleString();
            return '';
          }
        }
      }
    }
  }
});

// ===========================
// Generate Daily Data
// ===========================
function generateData(rangeDays) {
  const today = new Date();
  let days = rangeDays === 'lifetime' ? 365 : rangeDays;
  days = Math.max(7, Math.min(365, days));

  const dailySongs = AVERAGES.songs_per_week / 7;
  const dailyAlbums = AVERAGES.albums_per_week / 7;

  const labels = [];
  const daily = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = daysBefore(today, i);
    labels.push(formatDateShort(date));

    const songs = Math.max(0, Math.round(rnd(dailySongs*0.75, dailySongs*1.25)));
    const albums = Math.max(0, Math.round(rnd(dailyAlbums*0.75, dailyAlbums*1.25)));

    const approvedSongs = Math.round(songs * rnd(AVERAGES.song_approval_rate*0.95, AVERAGES.song_approval_rate*1.05));
    const approvedAlbums = Math.round(albums * rnd(AVERAGES.album_approval_rate*0.9, AVERAGES.album_approval_rate*1.1));

    let reward = 0;
    for(let s=0; s<approvedSongs; s++) reward += rnd(REWARD.song_min, REWARD.song_max);
    for(let a=0; a<approvedAlbums; a++) reward += rnd(REWARD.album_min, REWARD.album_max);

    daily.push({ date, songs, albums, approvedSongs, approvedAlbums, reward: round(reward) });
  }

  const totals = daily.reduce((acc,d)=>{
    acc.songs+=d.songs; acc.albums+=d.albums; acc.approvedSongs+=d.approvedSongs;
    acc.approvedAlbums+=d.approvedAlbums; acc.reward+=d.reward; return acc;
  }, { songs:0, albums:0, approvedSongs:0, approvedAlbums:0, reward:0 });

  totals.totalReviews = totals.songs + totals.albums;
  totals.approvedReviews = totals.approvedSongs + totals.approvedAlbums;
  totals.rejectedReviews = totals.totalReviews - totals.approvedReviews;

  return { labels, daily, totals };
}

// ===========================
// Compute KPI Percent Changes
// ===========================
function computeChange(currentTotals, range) {
  const prev = generateData(range === 'lifetime' ? 365 : range);
  const changes = {};
  KPI_DEFS.forEach(def => {
    let cur = 0, pr = 0;
    switch(def.id){
      case 'reviewedSongs': cur = currentTotals.songs; pr = prev.totals.songs; break;
      case 'reviewedAlbums': cur = currentTotals.albums; pr = prev.totals.albums; break;
      case 'approvedReviews': cur = currentTotals.approvedReviews; pr = prev.totals.approvedReviews; break;
      case 'rejectedReviews': cur = currentTotals.rejectedReviews; pr = prev.totals.rejectedReviews; break;
      case 'estimatedRewards': cur = currentTotals.reward; pr = prev.totals.reward; break;
      case 'totalReviews': cur = currentTotals.totalReviews; pr = prev.totals.totalReviews; break;
    }
    if (pr > 0) {
      const pct = Math.round(((cur - pr) / pr) * 100);
      changes[def.id] = { pct, up: cur >= pr };
    } else {
      changes[def.id] = { pct: null, up: cur > 0 };
    }
  });
  return changes;
}

// ===========================
// Render KPIs
// ===========================
function renderKPIs(totals, changes) {
  KPI_DEFS.forEach(def => {
    const valEl = document.getElementById(`${def.id}-value`);
    const chEl = document.getElementById(`${def.id}-change`);
    valEl.textContent = def.id === 'estimatedRewards' ? formatCurrency(totals[def.id] ?? 0) : (totals[def.id] ?? 0).toLocaleString();

    const ch = changes[def.id];
    if (!ch.pct) {
      chEl.innerHTML = `<span style="opacity:0.8">${'—'}</span>`;
    } else {
      const color = ch.up ? UP_COLOR : DOWN_COLOR;
      const arrow = ch.up ? '▲' : '▼';
      chEl.innerHTML = `<span style="color:${color};font-weight:700">${arrow} ${Math.abs(ch.pct)}%</span>`;
    }
  });
}

// ===========================
// Render Top Items List
// ===========================
function renderTopItems() {
  topListEl.innerHTML = '';

  const TOP_ITEMS = [
    { title: "Lover", artist: "Taylor Swift", cover: "/images/lover.JPG", per: [1,5] },
    { title: "Feather", artist: "Sabrina Carpenter", cover: "/images/feather.JPG", per: [1,5] },
    { title: "Sky", artist: "Playboi Carti", cover: "/images/whole-lotta-red.JPG", per: [1,5] },
    { title: "Vampire", artist: "Olivia Rodrigo", cover: "/images/vampire.JPG", per: [1,5] },
    { title: "Paint the Town Red", artist: "Doja Cat", cover: "/images/paint-the-town-red.JPG", per: [1,5] },
    { title: "1989 (Taylor’s Version)", artist: "Taylor Swift", cover: "/images/1989-taylor-s-version.PNG", per: [8,15] },
    { title: "Emails I Can’t Send", artist: "Sabrina Carpenter", cover: "/images/feather.JPG", per: [8,15] },
    { title: "Whole Lotta Red", artist: "Playboi Carti", cover: "/images/whole-lotta-red.JPG", per: [8,15] },
    { title: "Scarlet", artist: "Doja Cat", cover: "/images/scarlet.JPG", per: [8,15] },
    { title: "GUTS", artist: "Olivia Rodrigo", cover: "/images/guts.JPG", per: [8,15] }
  ];

  TOP_ITEMS.forEach(item => {
    const amount = Math.round(rnd(item.per[0], item.per[1]));
    const li = document.createElement('li');
    li.className = 'top-item';
    li.innerHTML = `
      <div class="top-item-left">
        <img class="top-cover" src="${item.cover}" alt="${item.title} cover">
        <div class="top-meta">
          <div class="top-title">${item.title}</div>
          <div class="top-sub">${item.artist}</div>
        </div>
      </div>
      <div class="top-amount">${formatCurrency(amount)}</div>
    `;
    topListEl.appendChild(li);
  });
}

// ===========================
// Render Chart Data
// ===========================
function renderChart(labels, daily) {
  analyticsChart.data.labels = labels;
  analyticsChart.data.datasets[0].data = daily.map(d => d.songs + d.albums);
  analyticsChart.update();
}

// ===========================
// Render Everything
// ===========================
function renderAll(range) {
  const data = generateData(range === 'lifetime' ? 'lifetime' : range);
  lastUpdatedEl.textContent = 'Updated: ' + new Date().toLocaleString();

  renderChart(data.labels, data.daily);
  const changes = computeChange(data.totals, range);
  renderKPIs(data.totals, changes);
  renderTopItems();

  const firstDate = new Date(data.daily[0].date);
  const lastDate = new Date(data.daily[data.daily.length - 1].date);
  chartRangeLabel.textContent = `${formatDateShort(firstDate)} — ${formatDateShort(lastDate)}`;
}

// ===========================
// Range Pills Event
// ===========================
pills.forEach(btn => {
  btn.addEventListener('click', () => {
    pills.forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed','false'); });
    btn.classList.add('active'); btn.setAttribute('aria-pressed','true');
    const range = btn.getAttribute('data-range') === 'lifetime' ? 'lifetime' : parseInt(btn.getAttribute('data-range'),10);
    renderAll(range);
  });
});

// ===========================
// Initial Render
// ===========================
buildKPICards();
renderAll(7);
