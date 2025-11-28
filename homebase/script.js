// -----------------------------
// SPOTIFY-STYLE REVIEWER JS
// -----------------------------

document.addEventListener("DOMContentLoaded", () => {
    initStarRating();
    initProgress();
    initEarnings();
    generateDynamicBackground();
});

// ----------------------------------------------
// 1. STAR RATING SYSTEM
// ----------------------------------------------
function initStarRating() {
    const stars = document.querySelectorAll(".star");
    const ratingValue = document.getElementById("rating-value");

    stars.forEach((star, index) => {
        star.addEventListener("click", () => {
            const selectedRating = index + 1;
            ratingValue.value = selectedRating;

            updateStars(selectedRating, stars);
        });
    });
}

function updateStars(selected, stars) {
    stars.forEach((star, i) => {
        if (i < selected) {
            star.classList.add("active");
        } else {
            star.classList.remove("active");
        }
    });
}

// ----------------------------------------------
// 2. REVIEW PROGRESS TRACKER
// ----------------------------------------------

let totalReviews = 30;
let completedReviews = 0;

function initProgress() {
    const progressText = document.getElementById("progress-count");

    // Initial display
    progressText.textContent = `${completedReviews} / ${totalReviews}`;
}

function incrementProgress() {
    const progressText = document.getElementById("progress-count");

    if (completedReviews < totalReviews) {
        completedReviews++;
        progressText.textContent = `${completedReviews} / ${totalReviews}`;
    }
}

// ----------------------------------------------
// 3. MONEY EARNINGS TRACKER
// ----------------------------------------------

let totalEarnings = 0.00;

function initEarnings() {
    const earningsDisplay = document.getElementById("earnings-display");
    earningsDisplay.textContent = `₦${totalEarnings.toFixed(2)}`;
}

// Call this every time a review is submitted
function addEarnings(amount) {
    const earningsDisplay = document.getElementById("earnings-display");
    totalEarnings += amount;
    earningsDisplay.textContent = `₦${totalEarnings.toFixed(2)}`;
}

// ----------------------------------------------
// 4. SPOTIFY-STYLE BACKGROUND GRADIENT
// ----------------------------------------------

function generateDynamicBackground() {
    const img = document.getElementById("album-cover");
    const bg = document.getElementById("dynamic-bg");

    // Wait for image to load before sampling colors
    img.addEventListener("load", () => {
        const colorThief = new ColorThief();

        let dominant;
        try {
            dominant = colorThief.getColor(img);
        } catch {
            dominant = [30, 30, 30]; // fallback dark tone
        }

        // Convert to gradient
        bg.style.background = `
            linear-gradient(
                to bottom,
                rgba(${dominant[0]}, ${dominant[1]}, ${dominant[2]}, 0.9),
                #000
            )
        `;
    });
}

// ----------------------------------------------
// 5. SUBMIT REVIEW (connects all functions)
// ----------------------------------------------

function submitReview() {
    const reviewText = document.getElementById("review-text").value.trim();
    const rating = parseInt(document.getElementById("rating-value").value);

    if (!rating) {
        alert("Please select a star rating first.");
        return;
    }

    if (reviewText.length < 5) {
        alert("Please write a slightly longer review.");
        return;
    }

    incrementProgress();
    addEarnings(40); // Example payout

    // Reset review field and stars
    document.getElementById("review-text").value = "";
    updateStars(0, document.querySelectorAll(".star"));
    document.getElementById("rating-value").value = 0;

    alert("Review submitted!");
}

const progressFill = document.querySelector(".progress-fill");
const timeCurrent = document.querySelector(".time-current");
const timeDuration = document.querySelector(".time-duration");

// Total duration in seconds (3:42)
const totalDuration = 3 * 60 + 42; 
let currentTime = 0;
let playing = false;

// Format seconds to mm:ss
function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2,'0')}`;
}

// Update the simulated timeline
function tick() {
    if (!playing) return;
    if (currentTime >= totalDuration) {
        playing = false;
        return;
    }
    currentTime++;
    timeCurrent.textContent = formatTime(currentTime);
    const percent = (currentTime / totalDuration) * 100;
    progressFill.style.width = percent + "%";
}

// Start / pause button simulation
document.querySelector(".ctrl.play").addEventListener("click", () => {
    playing = !playing;
    document.querySelector(".ctrl.play").setAttribute("data-playing", playing);
});

// Tick every second
setInterval(tick, 1000);
