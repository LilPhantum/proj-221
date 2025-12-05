document.addEventListener("DOMContentLoaded", () => {

  /* ----------------------------------------
     TOP SCROLL PILLS
  ----------------------------------------- */
  const pills = document.querySelectorAll(".top-scroll .pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {

      // If "All" pill clicked
      if (pill.classList.contains("pill-all")) {
        pill.setAttribute("aria-pressed", "true");
        pills.forEach(x => {
          if (!x.classList.contains("pill-all")) {
            x.classList.remove("selected");
            x.setAttribute("aria-pressed", "false");
          }
        });
        return;
      }

      // Other pills
      pills.forEach(x => {
        if (!x.classList.contains("pill-all")) {
          x.classList.remove("selected");
          x.setAttribute("aria-pressed", "false");
        }
      });

      pill.classList.add("selected");
      pill.setAttribute("aria-pressed", "true");
    });
  });


  /* ----------------------------------------
     PROFILE PANEL
  ----------------------------------------- */
  const profileAvatar = document.querySelector('.profile-avatar');
  const profilePanel = document.getElementById('profilePanel');

  profileAvatar.addEventListener('click', () => {
    profilePanel.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!profilePanel.contains(e.target) && !profileAvatar.contains(e.target)) {
      profilePanel.classList.remove('active');
    }
  });


  /* ----------------------------------------
     BALANCE OVERLAY 
  ----------------------------------------- */
  const reviewerBtn = document.querySelector('[data-action="reviewerProgram"]');
  const balanceOverlay = document.getElementById('balanceOverlay');
  const balanceBackBtn = document.getElementById('balanceBackBtn');

  reviewerBtn.addEventListener('click', () => {
    profilePanel.classList.remove('active');
    setTimeout(() => {
      balanceOverlay.classList.add('open');
      balanceOverlay.setAttribute('aria-hidden', 'false');
    }, 150);
  });

  balanceBackBtn.addEventListener('click', () => {
    balanceOverlay.classList.remove('open');
    balanceOverlay.setAttribute('aria-hidden', 'true');
  });

  balanceOverlay.addEventListener('click', (e) => {
    if (e.target === balanceOverlay) {
      balanceOverlay.classList.remove('open');
      balanceOverlay.setAttribute('aria-hidden', 'true');
    }
  });

});


/* ----------------------------------------
   REVIEW PANEL
----------------------------------------- */

const reviewBtn = document.querySelector('[data-action="review"]');
const reviewPanel = document.getElementById('reviewPanel');

// open panel
reviewBtn.addEventListener('click', () => {
  reviewPanel.classList.add('open');

  // CLOSE balance overlay if open
  const balanceOverlay = document.getElementById('balanceOverlay');
  if (balanceOverlay) {
    balanceOverlay.classList.remove('open');
    balanceOverlay.setAttribute('aria-hidden', 'true');
  }
});

// close when clicking outside
reviewPanel.addEventListener('click', (e) => {
  if (e.target === reviewPanel) {
    reviewPanel.classList.remove('open');
  }
});

// swipe close
let startX = 0;
reviewPanel.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
});
reviewPanel.addEventListener('touchend', e => {
  let endX = e.changedTouches[0].clientX;
  if (endX > startX + 60) {
    reviewPanel.classList.remove('open');
  }
});


/* ----------------------------------------
   BOTTOM NAV — ACTIVE SWITCH + ICON SWAP
----------------------------------------- */

const navItems = document.querySelectorAll(".bottom-nav .nav-item");

navItems.forEach(item => {
  item.addEventListener("click", () => {

    // remove active from all
    navItems.forEach(i => i.classList.remove("active"));

    // add active to clicked
    item.classList.add("active");

    // swap icons inside clicked item
    document.querySelectorAll(".bottom-nav .nav-item").forEach(nav => {
      nav.querySelectorAll(".active").forEach(el => el.style.display = "none");
      nav.querySelectorAll(".inactive").forEach(el => el.style.display = "block");
    });

    item.querySelectorAll(".active").forEach(el => el.style.display = "block");
    item.querySelectorAll(".inactive").forEach(el => el.style.display = "none");

    // If HOME clicked → close review panel
    if (item.classList.contains("nav-home")) {
      reviewPanel.classList.remove("open");
    }
  });
});

// initialize the correct icons on load
navItems.forEach(item => {
  if (item.classList.contains("active") || item.getAttribute("aria-current") === "page") {
    item.querySelectorAll(".active").forEach(el => el.style.display = "block");
    item.querySelectorAll(".inactive").forEach(el => el.style.display = "none");
  }
});


const dashboardBtn = document.querySelector('.quick-item[data-action="dashboard"]');

if (dashboardBtn) {
  dashboardBtn.addEventListener('click', () => {
    // Close Profile Panel if open
    profilePanel.classList.remove('active');

    if (window.balanceOverlayAPI) {
      // Use the exposed function
      window.balanceOverlayAPI.openOverlay();
    }
  });
}


