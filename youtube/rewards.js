// YouTube Rewards Panel JavaScript

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Get elements
    const rewardsMenuBtn = document.getElementById('youtubeRewardsBtn');
    const rewardsProgressBlock = document.getElementById('rewardsProgressBlock');
    const balanceOverlay = document.getElementById('balanceOverlay');
    const balanceBackBtn = document.getElementById('balanceBackBtn');
    const moreMenu = document.querySelector('.more-menu');
    const backdrop = document.querySelector('.backdrop');

    // Debug: Check if button is found
    console.log('YouTube Rewards Button:', rewardsMenuBtn);

    // Open Balance Overlay (Analytics)
    function openBalanceOverlay() {

    if (!balanceOverlay) return;

    const balancePageLoader =
        document.getElementById('balancePageLoader');

    const balanceContent =
        document.getElementById('balanceContent');

    balanceOverlay.style.display = 'block';

    balanceOverlay.classList.add('open');

    // SHOW PAGE LOADER
    if (balancePageLoader) {
        balancePageLoader.classList.remove('hide');
    }

    // HIDE REAL CONTENT
    if (balanceContent) {
        balanceContent.classList.remove('show');
    }

    setTimeout(() => {

        // HIDE LOADER
        if (balancePageLoader) {
            balancePageLoader.classList.add('hide');
        }

        // SHOW CONTENT
        if (balanceContent) {
            balanceContent.classList.add('show');
        }

        // RENDER CHART + DATA
        if (window.balanceOverlayAPI) {

            const range =
                window.balanceOverlayAPI.getCurrentRange();

            window.balanceOverlayAPI
                .setActivePillByRange(range);

            window.balanceOverlayAPI
                .renderBalance(range);

        }

    }, 1200);

}

    // Close Balance Overlay
    function closeBalanceOverlay() {
        if (!balanceOverlay) return;
        
        balanceOverlay.classList.remove('open');
        setTimeout(() => balanceOverlay.style.display = 'none', 350);
    }

    // Event Listeners
    if (rewardsMenuBtn) {
    rewardsMenuBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        document.querySelectorAll('.shorts-video').forEach(video => {
            video.pause();

            const overlay = video
                .closest('.shorts-video-container')
                ?.querySelector('.play-overlay');

            if (overlay) overlay.classList.add('show');
        });

        openBalanceOverlay();
    });
}

if (rewardsProgressBlock) {
    rewardsProgressBlock.addEventListener(
        'click',
        openBalanceOverlay
    );
}

if (balanceBackBtn) {
    balanceBackBtn.addEventListener(
        'click',
        closeBalanceOverlay
    );
}

if (balanceOverlay) {
    balanceOverlay.addEventListener('click', (e) => {
        if (e.target === balanceOverlay) {
            closeBalanceOverlay();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (
        e.key === 'Escape' &&
        balanceOverlay &&
        balanceOverlay.classList.contains('open')
    ) {
        closeBalanceOverlay();
    }
});

});

// Balance Overlay JavaScript (modified from your original)
(function () {
    const overlay = document.getElementById('balanceOverlay');
    const panel = overlay?.querySelector('.balance-panel');
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

    if (!overlay || !panel || !canvas) {
        console.warn('Balance overlay init aborted: missing DOM elements.');
        return;
    }

    const external = {
        formatCurrency: n => '$' + Number(n).toLocaleString(),
        rnd: (min, max) => Math.random() * (max - min) + min,
        round: n => Math.round(n),
        formatDateShort: d => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    };

    const AVERAGES = { songs_per_week: 42, albums_per_week: 12, song_approval_rate: 0.88, album_approval_rate: 0.65 };
    const REWARD = { song_min: 1, song_max: 5, album_min: 8, album_max: 15 };

    let currentRange = 30;

    function daysBefore(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() - days + 1);
        return d;
    }

    function generateData(rangeDays) {
        const today = new Date();
        let days = rangeDays === 'lifetime' ? 365 : rangeDays;
        days = Math.max(7, Math.min(365, days));

        const dailySongs = AVERAGES.songs_per_week / 7;
        const dailyAlbums = AVERAGES.albums_per_week / 7;

        const daily = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = daysBefore(today, i);
            const songs = Math.max(0, Math.round(external.rnd(dailySongs * 0.75, dailySongs * 1.25)));
            const albums = Math.max(0, Math.round(external.rnd(dailyAlbums * 0.75, dailyAlbums * 1.25)));
            const approvedSongs = Math.round(songs * external.rnd(AVERAGES.song_approval_rate * 0.95, AVERAGES.song_approval_rate * 1.05));
            const approvedAlbums = Math.round(albums * external.rnd(AVERAGES.album_approval_rate * 0.9, AVERAGES.album_approval_rate * 1.1));

            let reward = 0;
            for (let s = 0; s < approvedSongs; s++) reward += external.rnd(REWARD.song_min, REWARD.song_max);
            for (let a = 0; a < approvedAlbums; a++) reward += external.rnd(REWARD.album_min, REWARD.album_max);

            daily.push({ date, songs, albums, approvedSongs, approvedAlbums, reward: external.round(reward) });
        }

        const totals = daily.reduce((acc, d) => {
            acc.totalReviews += d.songs + d.albums;
            acc.approvedReviews += d.approvedSongs + d.approvedAlbums;
            acc.reward += d.reward;
            return acc;
        }, { totalReviews: 0, approvedReviews: 0, reward: 0 });

        return { daily, totals };
    }

    function renderBalance(range) {
        const data = generateData(range);
        const dailyRewards = data.daily.map(d => d.reward);
        const estReward = data.totals.reward;
        const yesterday = dailyRewards.length >= 2 ? dailyRewards[dailyRewards.length - 2] : 0;

        amountEl.textContent = external.formatCurrency(estReward);
        yesterdayEl.textContent = `Yesterday: ${external.formatCurrency(yesterday)}`;
        dateRangeEl.textContent = dailyRewards.length ?
            `${external.formatDateShort(data.daily[0].date)} — ${external.formatDateShort(data.daily[data.daily.length - 1].date)}` : '— —';
        colEstimated.textContent = external.formatCurrency(estReward);
        colQualified.textContent = data.totals.totalReviews.toLocaleString();
        colConversion.textContent = data.totals.totalReviews ? Math.round((data.totals.approvedReviews / data.totals.totalReviews) * 100) + '%' : '—';

        drawGraph(dailyRewards);
    }

    function drawGraph(values) {
        if (!ctx || !canvas || !values?.length) return;
        const h = 300, w = Math.max(300, canvas.clientWidth);
        canvas.width = w;
        canvas.height = h + 40;
        ctx.clearRect(0, 0, w, h + 40);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillStyle = '#fff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        const maxVal = Math.max(...values, 1);

        for (let i = 0; i <= 4; i++) {
            const y = h - (h / 4) * i;
            const val = Math.round((maxVal / 4) * i);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
            ctx.fillText(val, -6, y);
        }

        ctx.beginPath();
        ctx.moveTo(0, h - (values[0] / maxVal) * h);
        for (let i = 1; i < values.length; i++) {
            const x = i * (w / (values.length - 1));
            const y = h - (values[i] / maxVal) * h;
            const prevY = h - (values[i - 1] / maxVal) * h;
            const midX = x - (w / (values.length - 1)) / 2;
            ctx.quadraticCurveTo(midX, prevY, x, y);
        }
        ctx.strokeStyle = '#0070d1';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'rgba(62, 165, 255, 0.56)');
        grad.addColorStop(1, 'rgba(62, 166, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fill();
    }

    function moveTrackToPill(pill) {
        if (!pillTrack || !pill) return;
        const rect = pill.getBoundingClientRect();
        const parentRect = pill.parentElement.getBoundingClientRect();
        pillTrack.style.width = rect.width + 'px';
        pillTrack.style.transform = `translateX(${rect.left - parentRect.left}px)`;
    }

    function setActivePillByRange(range) {
        pills.forEach(p => {
            const val = p.getAttribute('data-range');
            const pressed = (val === String(range) || (val === 'lifetime' && range === 'lifetime'));
            p.setAttribute('aria-pressed', pressed ? 'true' : 'false');
            if (pressed) moveTrackToPill(p);
        });
    }

    pills.forEach(p => {
        p.addEventListener('click', () => {
            const val = p.getAttribute('data-range');
            currentRange = val === 'lifetime' ? 'lifetime' : Number(val);
            setActivePillByRange(currentRange);
            renderBalance(currentRange);
        });
    });

    function init() {
        setTimeout(() => setActivePillByRange(currentRange), 60);
        if (overlay.classList.contains('open')) renderBalance(currentRange);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose global API
    window.balanceOverlayAPI = {
        renderBalance,
        setActivePillByRange,
        getCurrentRange: () => currentRange
    };

})();