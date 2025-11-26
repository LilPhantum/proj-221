(function () {
  // --- DOM refs
  const openBtn = document.getElementById('viewBalanceBtn');
  const overlay = document.getElementById('balanceOverlay');
  const panel = overlay?.querySelector('.balance-panel');
  const backBtn = document.getElementById('balanceBackBtn');
  const pillTrack = overlay?.querySelector('.balance-pill-track');
  const pills = Array.from(overlay?.querySelectorAll('.balance-pill') || []);
  const amountEl = document.getElementById('balanceAmount');
  const yesterdayEl = document.getElementById('balanceYesterday');
  const dateRangeEl = document.getElementById('balanceDateRange');
  const colEstimated = document.getElementById('colEstimated');
  const colQualified = document.getElementById('colQualified');
  const colConversion = document.getElementById('colConversion');
  const canvas = document.getElementById('balanceChart');
  const ctx = canvas?.getContext('2d');

  if (!overlay || !panel || !openBtn || !canvas) {
    console.warn('Balance overlay elements not found. Overlay will not initialize.');
    return;
  }

  // --- External utilities
  const external = {
    formatCurrency: window.formatCurrency || ((n) => '$' + Number(n).toLocaleString()),
    formatDateShort: window.formatDateShort || ((d) => {
      const dt = new Date(d);
      return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    })
  };

  // --- State
  let currentRange = 30;

  // --- Overlay Open/Close
  function openOverlay() {
    overlay.style.display = 'block';
    setTimeout(() => overlay.classList.add('open'), 20);
    setActivePillByRange(currentRange);
    renderBalance(currentRange);
    document.addEventListener('keydown', onKeyDown);
  }

  function closeOverlay() {
    overlay.classList.remove('open');
    document.removeEventListener('keydown', onKeyDown);
    setTimeout(() => overlay.style.display = 'none', 350);
  }

  function onKeyDown(e) { if (e.key === 'Escape') closeOverlay(); }

  openBtn.addEventListener('click', openOverlay);
  backBtn.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });

  // --- Pills
  function moveTrackToPill(pill) {
    if (!pillTrack || !pill) return;
    const rect = pill.getBoundingClientRect();
    const parentRect = pill.parentElement.getBoundingClientRect();
    const left = rect.left - parentRect.left;
    pillTrack.style.width = rect.width + 'px';
    pillTrack.style.transform = `translateX(${left}px)`;
  }

  function setActivePillByRange(range) {
    pills.forEach(p => {
      const val = p.getAttribute('data-range');
      const pressed = (val === String(range) || (val === 'lifetime' && range === 'lifetime'));
      p.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    });
    const active = pills.find(p => p.getAttribute('aria-pressed') === 'true') || pills[0];
    moveTrackToPill(active);
  }

  pills.forEach(p => {
    p.addEventListener('click', () => {
      const val = p.getAttribute('data-range');
      currentRange = val === 'lifetime' ? 'lifetime' : Number(val);
      setActivePillByRange(currentRange);
      renderBalance(currentRange);
    });
  });

  // --- Generate data
  function generateData(rangeDays) {
    const today = new Date();
    let days = rangeDays === 'lifetime' ? 365 : Number(rangeDays);
    days = Math.max(7, Math.min(365, days));

    const dailySongs = 42 / 7;
    const dailyAlbums = 12 / 7;
    const daily = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const songs = Math.max(0, Math.round(Math.random() * dailySongs * 0.5 + dailySongs * 0.75));
      const albums = Math.max(0, Math.round(Math.random() * dailyAlbums * 0.5 + dailyAlbums * 0.75));
      const approvedSongs = Math.round(songs * (0.88 * (Math.random() * 0.1 + 0.95)));
      const approvedAlbums = Math.round(albums * (0.65 * (Math.random() * 0.2 + 0.9)));

      let reward = 0;
      for (let s = 0; s < approvedSongs; s++) reward += Math.random() * 4 + 1;
      for (let a = 0; a < approvedAlbums; a++) reward += Math.random() * 7 + 8;

      daily.push({ date, songs, albums, approvedSongs, approvedAlbums, reward: Math.round(reward) });
    }

    const totals = daily.reduce((acc, d) => {
      acc.songs += d.songs; acc.albums += d.albums;
      acc.approvedSongs += d.approvedSongs; acc.approvedAlbums += d.approvedAlbums;
      acc.reward += d.reward;
      return acc;
    }, { songs: 0, albums: 0, approvedSongs: 0, approvedAlbums: 0, reward: 0 });

    totals.totalReviews = totals.songs + totals.albums;
    totals.approvedReviews = totals.approvedSongs + totals.approvedAlbums;
    totals.rejectedReviews = totals.totalReviews - totals.approvedReviews;

    return { daily, totals };
  }

  // --- Render balance
  function renderBalance(range) {
    const data = generateData(range);
    const daily = data.daily || [];
    const totals = data.totals || {};
    const estReward = totals.reward || 0;
    const yesterday = daily.length >= 2 ? daily[daily.length - 2].reward : 0;

    amountEl.textContent = external.formatCurrency(estReward);
    yesterdayEl.textContent = `Yesterday: ${external.formatCurrency(yesterday)}`;
    dateRangeEl.textContent = daily.length ?
      `${external.formatDateShort(daily[0].date)} — ${external.formatDateShort(daily[daily.length-1].date)}` : '— —';
    colEstimated.textContent = external.formatCurrency(estReward);
    colQualified.textContent = totals.totalReviews.toLocaleString();
    colConversion.textContent = totals.totalReviews ? Math.round((totals.approvedReviews / totals.totalReviews) * 100) + '%' : '—';

    drawGraph(daily.map(d => d.reward), estReward);
  }

  // --- Draw chart with exactly 5 horizontal lines, values left
  function drawGraph(values, maxReward) {
    if (!ctx || !canvas) return;
    const h = 300;
    const w = canvas.clientWidth;
    const step = w / (values.length - 1 || 1);
    const paddingLeft = 0;

    canvas.width = w;
    canvas.height = h + 40;
    ctx.clearRect(0, 0, w, h + 40);

    // --- Horizontal grid lines (5 total)
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const gridCount = 4; // 4 spaces = 5 lines
    for (let i = 0; i <= gridCount; i++) {
      const y = h - (h / gridCount) * i;
      const value = Math.round((maxReward / gridCount) * i);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      ctx.fillText(value, paddingLeft - 6, y);
    }

    // --- Smooth line
    const maxVal = Math.max(...values, 1);
    ctx.beginPath();
    ctx.moveTo(paddingLeft, h - (values[0] / maxVal) * h);
    for (let i = 1; i < values.length; i++) {
      const x = paddingLeft + i * step;
      const y = h - (values[i] / maxVal) * h;
      const prevY = h - (values[i - 1] / maxVal) * h;
      const midX = x - step / 2;
      const midY = (y + prevY) / 2;
      ctx.quadraticCurveTo(midX, prevY, x, y);
    }
    ctx.strokeStyle = '#00ff37ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(0, 87, 22, 0.51)');
    grad.addColorStop(1, 'rgba(95, 228, 101, 0)');
    ctx.lineTo(w, h);
    ctx.lineTo(paddingLeft, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // --- Init
  function init() {
    setTimeout(() => setActivePillByRange(currentRange), 60);
    if (overlay.classList.contains('open')) openOverlay();
  }

  window.renderBalanceOverlay = function(range) {
    currentRange = range==='lifetime' ? 'lifetime' : Number(range || 30);
    setActivePillByRange(currentRange);
    renderBalance(currentRange);
  };

  init();
})();
