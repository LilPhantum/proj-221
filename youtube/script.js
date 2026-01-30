// script.js

// Panel Navigation
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

// Set home as active by default
document.querySelector('.nav-btn[data-panel="home"]').classList.add('active');

// Shorts Video Play/Pause
const shortsVideo = document.querySelector('.shorts-video');
const playOverlay = document.querySelector('.play-overlay');
const shortsVideoContainer = document.querySelector('.shorts-video-container');

if (shortsVideoContainer && shortsVideo) {
    shortsVideoContainer.addEventListener('click', (e) => {
        // Don't trigger if clicking on buttons or icons
        if (e.target.closest('.shorts-top-icons') || 
            e.target.closest('.shorts-bottom-info') || 
            e.target.closest('.shorts-actions') ||
            e.target.closest('.more-menu')) {
            return;
        }
        
        if (shortsVideo.paused) {
            shortsVideo.play();
            playOverlay.classList.remove('show');
        } else {
            shortsVideo.pause();
            playOverlay.classList.add('show');
        }
    });
}

// More Options Menu
const moreBtn = document.querySelector('.more-btn');
const moreMenu = document.querySelector('.more-menu');
let backdrop = document.createElement('div');
backdrop.classList.add('backdrop');
document.body.appendChild(backdrop);

if (moreBtn) {
    moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        moreMenu.classList.add('show');
        backdrop.classList.add('show');
    });
}

backdrop.addEventListener('click', () => {
    moreMenu.classList.remove('show');
    backdrop.classList.remove('show');
});

// Like Button Toggle
const likeButton = document.querySelector('.like-icon');
if (likeButton) {
    likeButton.addEventListener('click', () => {
        likeButton.classList.toggle('liked');
    });
}

// Auto-play shorts video when on shorts panel
const shortsNavBtn = document.querySelector('.nav-btn[data-panel="shorts"]');
if (shortsNavBtn) {
    shortsNavBtn.addEventListener('click', () => {
        setTimeout(() => {
            if (shortsVideo) {
                shortsVideo.play();
                playOverlay.classList.remove('show');
            }
        }, 100);
    });
}

// Pause video when leaving shorts panel
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const panelName = button.getAttribute('data-panel');
        if (panelName !== 'shorts' && shortsVideo) {
            shortsVideo.pause();
            playOverlay.classList.add('show');
        }
    });
});