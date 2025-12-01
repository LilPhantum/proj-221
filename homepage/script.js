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

  // Close profile panel when clicking outside
  document.addEventListener('click', (e) => {
    if (!profilePanel.contains(e.target) && !profileAvatar.contains(e.target)) {
      profilePanel.classList.remove('active');
    }
  });


  /* ----------------------------------------
     BALANCE OVERLAY  
     - Close profile panel first
     - Then open overlay
  ----------------------------------------- */
  const reviewerBtn = document.querySelector('[data-action="reviewerProgram"]');
  const balanceOverlay = document.getElementById('balanceOverlay');
  const balanceBackBtn = document.getElementById('balanceBackBtn');

  reviewerBtn.addEventListener('click', () => {

    // Step 1 — force close profile panel
    profilePanel.classList.remove('active');

    // Step 2 — open overlay AFTER it closes (smooth)
    setTimeout(() => {
      balanceOverlay.classList.add('open');
      balanceOverlay.setAttribute('aria-hidden', 'false');
    }, 150);
  });

  // Close overlay
  balanceBackBtn.addEventListener('click', () => {
    balanceOverlay.classList.remove('open');
    balanceOverlay.setAttribute('aria-hidden', 'true');
  });

  // Click outside overlay panel to close
  balanceOverlay.addEventListener('click', (e) => {
    if (e.target === balanceOverlay) {
      balanceOverlay.classList.remove('open');
      balanceOverlay.setAttribute('aria-hidden', 'true');
    }
  });

});
