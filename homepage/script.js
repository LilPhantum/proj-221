document.addEventListener("DOMContentLoaded", () => {

  /* ----------------------------------------
     TOP SCROLL PILLS
  ----------------------------------------- */
  const pills = document.querySelectorAll(".top-scroll .pill");

  pills.forEach(pill => {
    pill.addEventListener("click", () => {
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
  const profileAvatar = document.querySelector(".profile-avatar");
  const profilePanel  = document.getElementById("profilePanel");

  if (profileAvatar && profilePanel) {
    profileAvatar.addEventListener("click", e => {
      e.stopPropagation();
      profilePanel.classList.toggle("active");
    });

    document.addEventListener("click", e => {
      if (!profilePanel.contains(e.target) && !profileAvatar.contains(e.target)) {
        profilePanel.classList.remove("active");
      }
    });
  }

  /* ----------------------------------------
     BALANCE OVERLAY
  ----------------------------------------- */
  const reviewerBtn    = document.querySelector('[data-action="reviewerProgram"]');
  const balanceOverlay = document.getElementById("balanceOverlay");
  const balanceBackBtn = document.getElementById("balanceBackBtn");

  if (reviewerBtn && balanceOverlay) {
    reviewerBtn.addEventListener("click", () => {
      profilePanel?.classList.remove("active");
      balanceOverlay.classList.add("open");
      balanceOverlay.setAttribute("aria-hidden", "false");
    });
  }

  if (balanceBackBtn && balanceOverlay) {
    balanceBackBtn.addEventListener("click", () => {
      balanceOverlay.classList.remove("open");
      balanceOverlay.setAttribute("aria-hidden", "true");
    });
  }

  if (balanceOverlay) {
    balanceOverlay.addEventListener("click", e => {
      if (e.target === balanceOverlay) {
        balanceOverlay.classList.remove("open");
        balanceOverlay.setAttribute("aria-hidden", "true");
      }
    });
  }

  /* ----------------------------------------
     REVIEW PANEL
  ----------------------------------------- */
  const reviewBtn   = document.querySelector('[data-action="review"]');
  const reviewPanel = document.getElementById("reviewPanel");

  function openReviewPanel() {
    if (!reviewPanel) return;
    reviewPanel.classList.add("open");
    reviewPanel.style.opacity = "1";
    reviewPanel.style.pointerEvents = "auto";
  }

  function closeReviewPanel() {
    if (!reviewPanel) return;
    reviewPanel.classList.remove("open");
    reviewPanel.style.opacity = "0";
    reviewPanel.style.pointerEvents = "none";
  }

  if (reviewBtn) {
    reviewBtn.addEventListener("click", () => {
      openReviewPanel();
      balanceOverlay?.classList.remove("open");
      balanceOverlay?.setAttribute("aria-hidden", "true");
    });
  }

  if (reviewPanel) {
    reviewPanel.addEventListener("click", e => {
      if (e.target === reviewPanel) closeReviewPanel();
    });

    let startX = 0;
    reviewPanel.addEventListener("touchstart", e => startX = e.touches[0].clientX);
    reviewPanel.addEventListener("touchend", e => {
      const endX = e.changedTouches[0].clientX;
      if (endX > startX + 60) closeReviewPanel();
    });
  }

  /* ----------------------------------------
     BOTTOM NAV — ACTIVE STATE WITH ICON SWAP
  ----------------------------------------- */
  const navItems = document.querySelectorAll(".bottom-nav .nav-item");

  function resetNavItems() {
    navItems.forEach(nav => {
      nav.classList.remove("active");
      nav.style.opacity = "0.7";
      nav.style.color = "rgba(255,255,255,0.55)";
      nav.querySelectorAll(".active").forEach(el => el.style.display = "none");
      nav.querySelectorAll(".inactive").forEach(el => el.style.display = "block");
    });
  }

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      resetNavItems();
      item.classList.add("active");
      item.style.opacity = "1";
      item.style.color = "#ffffff";
      item.querySelectorAll(".inactive").forEach(el => el.style.display = "none");
      item.querySelectorAll(".active").forEach(el => el.style.display = "block");

      // HOME → instant hide review panel
      if (item.classList.contains("nav-home")) closeReviewPanel();
    });
  });

  // Initialize nav items on load
  navItems.forEach(item => {
    if (item.classList.contains("active") || item.getAttribute("aria-current") === "page") {
      item.style.opacity = "1";
      item.style.color = "#ffffff";
      item.querySelectorAll(".inactive").forEach(el => el.style.display = "none");
      item.querySelectorAll(".active").forEach(el => el.style.display = "block");
    }
  });

  /* ----------------------------------------
     DASHBOARD QUICK ACTION
  ----------------------------------------- */
  const dashboardBtn = document.querySelector('.quick-item[data-action="dashboard"]');

  if (dashboardBtn) {
    dashboardBtn.addEventListener("click", () => {
      profilePanel?.classList.remove("active");
      if (window.balanceOverlayAPI?.openOverlay) {
        window.balanceOverlayAPI.openOverlay();
      }
    });
  }

});
