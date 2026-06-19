const root = document.documentElement;
const storageKey = "dd-reduce-motion";

const syncHeroVideos = () => {
  const reduced = root.classList.contains("motion-off");
  document.querySelectorAll(".hero-home-video").forEach((video) => {
    if (!(video instanceof HTMLVideoElement)) {
      return;
    }
    if (reduced) {
      video.pause();
      return;
    }
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  });
};

const setMotionState = (enabled) => {
  if (enabled) {
    root.classList.add("motion-off");
  } else {
    root.classList.remove("motion-off");
  }
  syncHeroVideos();
};

const storedPreference = localStorage.getItem(storageKey);
if (storedPreference) {
  setMotionState(storedPreference === "true");
} else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  setMotionState(true);
}

syncHeroVideos();

document.querySelectorAll(".motion-toggle").forEach((button) => {
  const isReduced = root.classList.contains("motion-off");
  button.textContent = isReduced ? "Enable Motion" : "Reduce Motion";
  button.addEventListener("click", () => {
    const enabled = !root.classList.contains("motion-off");
    setMotionState(enabled);
    localStorage.setItem(storageKey, String(enabled));
    button.textContent = enabled ? "Enable Motion" : "Reduce Motion";
  });
});

const header = document.querySelector(".site-header");
if (header) {
  const transparencyThreshold = 120;
  const setHeaderState = () => {
    const isScrolled = window.scrollY > transparencyThreshold;
    header.classList.toggle("scrolled", isScrolled);
    if (isScrolled) {
      header.style.backgroundColor = "";
      header.style.backdropFilter = "";
      header.style.borderColor = "";
    } else {
      header.style.backgroundColor = "transparent";
      header.style.backdropFilter = "none";
      header.style.borderColor = "transparent";
    }
  };
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });
}

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
if (header && navToggle && navLinks) {
  const updateScrollbarOffset = () => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    root.style.setProperty("--scrollbar-width", `${Math.max(scrollbarWidth, 0)}px`);
  };

  const openNav = () => {
    updateScrollbarOffset();
    document.body.classList.add("nav-open");
    header.classList.add("nav-open");
    navToggle.setAttribute("aria-expanded", "true");
  };

  const closeNav = () => {
    document.body.classList.remove("nav-open");
    header.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.contains("nav-open");
    if (isOpen) {
      closeNav();
    } else {
      openNav();
    }
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.closest("a")) {
      closeNav();
    }
  });

  const mediaQuery = window.matchMedia("(max-width: 860px)");
  const handleViewportChange = () => {
    if (!mediaQuery.matches) {
      closeNav();
    }
    updateScrollbarOffset();
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleViewportChange);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handleViewportChange);
  }
}

document.querySelectorAll("[data-release-countdown]").forEach((countdownEl) => {
  const targetIso = countdownEl.dataset.releaseCountdown;
  if (!targetIso) {
    return;
  }

  const target = new Date(targetIso);
  if (Number.isNaN(target.getTime())) {
    return;
  }

  const digits = countdownEl.querySelectorAll("[data-countdown-digit]");
  const launchedEl = countdownEl.querySelector("[data-countdown-launched]");
  const unitsEl = countdownEl.querySelector("[data-countdown-units]");
  const headingEl = countdownEl.querySelector("[data-countdown-heading]");
  const pad2 = (value) => String(Math.max(0, value)).padStart(2, "0");
  const motionReduced = () => root.classList.contains("motion-off");

  const setChar = (char, nextChar) => {
    if (char.textContent === nextChar) {
      return;
    }
    if (!motionReduced()) {
      char.classList.remove("scramble");
      void char.offsetWidth;
      char.classList.add("scramble");
    }
    char.textContent = nextChar;
  };

  const setDigitGroup = (digitEl, value, padLength = 2) => {
    const str = String(Math.max(0, value)).padStart(padLength, "0");
    const chars = digitEl.querySelectorAll("[data-countdown-char]");
    chars.forEach((char, index) => {
      setChar(char, str[index] ?? "0");
    });
  };

  const showLaunched = () => {
    if (unitsEl) {
      unitsEl.hidden = true;
    }
    if (headingEl) {
      headingEl.hidden = true;
    }
    if (launchedEl) {
      launchedEl.hidden = false;
    }
    countdownEl.setAttribute("data-countdown-state", "launched");
  };

  const tick = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) {
      showLaunched();
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    const values = [days, hours, minutes, seconds];

    digits.forEach((digit, index) => {
      const padLength = index === 0 && days >= 100 ? 3 : 2;
      setDigitGroup(digit, values[index], padLength);
    });

    countdownEl.setAttribute(
      "aria-label",
      `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds until release`
    );
  };

  tick();
  window.setInterval(tick, 1000);
});

