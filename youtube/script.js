// PANEL NAVIGATION
const navButtons = document.querySelectorAll('.nav-btn[data-panel]');
const panels = document.querySelectorAll('.panel');

navButtons.forEach(button => {

    button.addEventListener('click', () => {

        const panelName = button.getAttribute('data-panel');

        // Hide all panels
        panels.forEach(panel => {
            panel.classList.remove('active');
        });

        // Show selected panel
        document.getElementById(`${panelName}-panel`).classList.add('active');

        // Update nav buttons
        navButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        button.classList.add('active');
    });

});

// Set Home Active By Default
document
    .querySelector('.nav-btn[data-panel="home"]')
    .classList.add('active');





// ========================================
// SHORTS FEED SYSTEM
// ========================================

const shortsFeed = document.querySelector('.shorts-feed');

const shortsContainers = document.querySelectorAll('.shorts-video-container');

const shortsVideos = document.querySelectorAll('.shorts-video');

const playOverlays = document.querySelectorAll('.play-overlay');



// Auto play visible video
const shortsObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        const video = entry.target;

        const container = video.closest('.shorts-video-container');

        const overlay = container.querySelector('.play-overlay');

        if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {

            // Pause all other videos
            shortsVideos.forEach(v => {

                if (v !== video) {

                    v.pause();

                    v.currentTime = 0;

                    const otherOverlay =
                        v.closest('.shorts-video-container')
                         .querySelector('.play-overlay');

                    otherOverlay.classList.add('show');

                }

            });

            // Play current
            video.play();

            overlay.classList.remove('show');

        } else {

            video.pause();

            overlay.classList.add('show');

        }

    });

}, {
    threshold: 0.7
});



// Observe all shorts videos
shortsVideos.forEach(video => {
    shortsObserver.observe(video);
});





// ========================================
// TAP TO PLAY / PAUSE
// ========================================

shortsContainers.forEach(container => {

    const video = container.querySelector('.shorts-video');

    const overlay = container.querySelector('.play-overlay');

    container.addEventListener('click', (e) => {

        // Ignore clicks on buttons/icons
        if (
            e.target.closest('.shorts-top-icons') ||
            e.target.closest('.shorts-bottom-info') ||
            e.target.closest('.shorts-actions') ||
            e.target.closest('.more-menu')
        ) {
            return;
        }

        if (video.paused) {

            video.play();

            overlay.classList.remove('show');

        } else {

            video.pause();

            overlay.classList.add('show');

        }

    });

});





// ========================================
// MORE OPTIONS MENU
// ========================================

const moreBtns = document.querySelectorAll('.more-btn');

const moreMenu = document.querySelector('.more-menu');

let backdrop = document.createElement('div');

backdrop.classList.add('backdrop');

document.body.appendChild(backdrop);



// Open menu
moreBtns.forEach(btn => {

    btn.addEventListener('click', (e) => {

        e.stopPropagation();

        moreMenu.classList.add('show');

        backdrop.classList.add('show');

    });

});



// Close menu
backdrop.addEventListener('click', () => {

    moreMenu.classList.remove('show');

    backdrop.classList.remove('show');

});





// ========================================
// LONG PRESS TO OPEN MENU
// ========================================

let longPressTimer = null;

if (shortsFeed) {

    shortsFeed.addEventListener('touchstart', (e) => {

        const touchY = e.touches[0].clientY;

        const screenHeight = window.innerHeight;

        const isBottomArea = touchY > screenHeight * 0.65;

        // Ignore UI buttons
        if (
            e.target.closest('.shorts-actions') ||
            e.target.closest('.shorts-top-icons') ||
            e.target.closest('.shorts-bottom-info') ||
            e.target.closest('.more-menu')
        ) {
            return;
        }

        if (isBottomArea) {

            longPressTimer = setTimeout(() => {

                const activeContainer =
                    document.elementFromPoint(
                        window.innerWidth / 2,
                        window.innerHeight / 2
                    ).closest('.shorts-video-container');

                if (!activeContainer) return;

                const moreBtn =
                    activeContainer.querySelector('.more-btn');

                if (moreBtn) {

                    moreBtn.click();

                }

            }, 650);

        }

    });

}



// Cancel long press
['touchend', 'touchmove', 'touchcancel'].forEach(event => {

    shortsFeed.addEventListener(event, () => {

        clearTimeout(longPressTimer);

    });

});





// ========================================
// LIKE BUTTON TOGGLE
// ========================================

const likeButtons = document.querySelectorAll('.like-icon');

likeButtons.forEach(button => {

    button.addEventListener('click', () => {

        button.classList.toggle('liked');

    });

});





// ========================================
// AUTO PLAY WHEN ENTERING SHORTS PANEL
// ========================================

const shortsNavBtn =
    document.querySelector('.nav-btn[data-panel="shorts"]');

if (shortsNavBtn) {

    shortsNavBtn.addEventListener('click', () => {

        setTimeout(() => {

            const firstVideo =
                document.querySelector('.shorts-video');

            const firstOverlay =
                document.querySelector('.play-overlay');

            if (firstVideo) {

                firstVideo.play();

                firstOverlay.classList.remove('show');

            }

        }, 100);

    });

}





// ========================================
// PAUSE ALL VIDEOS WHEN LEAVING SHORTS
// ========================================

navButtons.forEach(button => {

    button.addEventListener('click', () => {

        const panelName =
            button.getAttribute('data-panel');

        if (panelName !== 'shorts') {

            shortsVideos.forEach(video => {

                video.pause();

            });

            playOverlays.forEach(overlay => {

                overlay.classList.add('show');

            });

        }

    });

});