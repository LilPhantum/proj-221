// script.js

// ===============================
// PANEL NAVIGATION
// ===============================
const navButtons = document.querySelectorAll('.nav-btn[data-panel]');
const panels = document.querySelectorAll('.panel');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const panelName = button.getAttribute('data-panel');

        panels.forEach(panel => {
            panel.classList.remove('active');
        });

        const selectedPanel = document.getElementById(`${panelName}-panel`);

        if (selectedPanel) {
            selectedPanel.classList.add('active');
        }

        navButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        button.classList.add('active');

        if (panelName === 'shorts') {
            playCurrentShort();
        } else {
            pauseAllShorts();
        }
    });
});

const homeBtn = document.querySelector('.nav-btn[data-panel="home"]');

if (homeBtn) {
    homeBtn.classList.add('active');
}





// ===============================
// SHORTS FYP SCROLL SYSTEM
// ===============================
const shortsFeed = document.querySelector('.shorts-feed');
const shortsContainers = document.querySelectorAll('.shorts-video-container');
const shortsVideos = document.querySelectorAll('.shorts-video');

let currentShortIndex = 0;
let touchStartY = 0;
let isChangingShort = false;
let longPressTimer = null;

function pauseAllShorts() {
    shortsVideos.forEach(video => {
        video.pause();

        const overlay = video
            .closest('.shorts-video-container')
            ?.querySelector('.play-overlay');

        if (overlay) {
            overlay.classList.add('show');
        }
    });
}

function playCurrentShort() {
    pauseAllShorts();

    const currentContainer = shortsContainers[currentShortIndex];

    if (!currentContainer) return;

    const video = currentContainer.querySelector('.shorts-video');
    const overlay = currentContainer.querySelector('.play-overlay');

    if (video) {
        video.play();
    }

    if (overlay) {
        overlay.classList.remove('show');
    }
}

function goToShort(index) {
    if (!shortsFeed) return;

    currentShortIndex = Math.max(
        0,
        Math.min(index, shortsContainers.length - 1)
    );

    isChangingShort = true;

    shortsFeed.scrollTo({
        top: shortsContainers[currentShortIndex].offsetTop,
        behavior: 'auto'
    });

    setTimeout(() => {
        isChangingShort = false;
        playCurrentShort();
    }, 80);
}

if (shortsFeed && shortsContainers.length > 0) {
    shortsFeed.addEventListener('touchstart', e => {
        touchStartY = e.touches[0].clientY;

        const touchY = e.touches[0].clientY;
        const screenHeight = window.innerHeight;
        const isBottomArea = touchY > screenHeight * 0.65;

        if (
            isBottomArea &&
            !e.target.closest('.shorts-actions') &&
            !e.target.closest('.shorts-top-icons') &&
            !e.target.closest('.shorts-bottom-info') &&
            !e.target.closest('.more-menu')
        ) {
            longPressTimer = setTimeout(() => {
                const currentContainer = shortsContainers[currentShortIndex];
                const moreBtn = currentContainer?.querySelector('.more-btn');

                if (moreBtn) {
                    moreBtn.click();
                }
            }, 650);
        }
    }, { passive: true });

    shortsFeed.addEventListener('touchend', e => {
        clearTimeout(longPressTimer);

        if (isChangingShort) return;

        const touchEndY = e.changedTouches[0].clientY;
        const swipeDistance = touchStartY - touchEndY;

        if (Math.abs(swipeDistance) < 45) {
            return;
        }

        if (swipeDistance > 0) {
            goToShort(currentShortIndex + 1);
        } else {
            goToShort(currentShortIndex - 1);
        }
    });

    shortsFeed.addEventListener('touchmove', () => {
        clearTimeout(longPressTimer);
    }, { passive: true });

    shortsFeed.addEventListener('touchcancel', () => {
        clearTimeout(longPressTimer);
    });

    shortsFeed.addEventListener('scroll', () => {
        if (isChangingShort) return;

        const index = Math.round(shortsFeed.scrollTop / window.innerHeight);

        currentShortIndex = Math.max(
            0,
            Math.min(index, shortsContainers.length - 1)
        );
    });
}





// ===============================
// TAP SHORT TO PLAY / PAUSE
// ===============================
shortsContainers.forEach((container, index) => {
    const video = container.querySelector('.shorts-video');
    const overlay = container.querySelector('.play-overlay');

    container.addEventListener('click', e => {
        if (
            e.target.closest('.shorts-top-icons') ||
            e.target.closest('.shorts-bottom-info') ||
            e.target.closest('.shorts-actions') ||
            e.target.closest('.more-menu')
        ) {
            return;
        }

        currentShortIndex = index;

        if (!video) return;

        if (video.paused) {
            video.play();

            if (overlay) {
                overlay.classList.remove('show');
            }
        } else {
            video.pause();

            if (overlay) {
                overlay.classList.add('show');
            }
        }
    });
});





// ===============================
// MORE OPTIONS MENU
// ===============================
const moreButtons = document.querySelectorAll('.more-btn');
const moreMenu = document.querySelector('.more-menu');

const backdrop = document.createElement('div');
backdrop.classList.add('backdrop');
document.body.appendChild(backdrop);

moreButtons.forEach(button => {
    button.addEventListener('click', e => {
        e.stopPropagation();

        if (moreMenu) {
            moreMenu.classList.add('show');
        }

        backdrop.classList.add('show');
    });
});

backdrop.addEventListener('click', () => {
    if (moreMenu) {
        moreMenu.classList.remove('show');
    }

    backdrop.classList.remove('show');
});





// ===============================
// LIKE BUTTON TOGGLE
// ===============================
const likeButtons = document.querySelectorAll('.like-icon');

likeButtons.forEach(button => {
    button.addEventListener('click', () => {
        button.classList.toggle('liked');
    });
});