/**
 * Scroll-scrub the exploded render via a preloaded image sequence.
 * Avoids <video> seeking, which breaks across fullscreen viewport changes.
 */
(function () {
    const section = document.querySelector("[data-render-scrub]");
    if (!section) return;

    const sticky = section.querySelector(".recipe-render-scrub__sticky");
    const frameEl = section.querySelector(".recipe-render__frame");
    if (!sticky || !frameEl) return;

    const frameCount = parseInt(section.getAttribute("data-frame-count"), 10) || 0;
    const frameBase = section.getAttribute("data-frame-base") || "";
    if (frameCount < 2 || !frameBase) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const frames = new Array(frameCount);
    let loaded = 0;
    let ready = false;
    let ticking = false;
    let lastIndex = -1;

    function clamp(n, min, max) {
        return Math.min(max, Math.max(min, n));
    }

    function frameUrl(index) {
        const n = index + 1;
        const pad = n < 10 ? "00" + n : n < 100 ? "0" + n : String(n);
        return frameBase + pad + ".jpg";
    }

    function getProgress() {
        const total = section.offsetHeight - window.innerHeight;
        if (total <= 0) return 0;
        return clamp(-section.getBoundingClientRect().top / total, 0, 1);
    }

    function showIndex(index) {
        const i = clamp(index | 0, 0, frameCount - 1);
        if (i === lastIndex) return;
        lastIndex = i;

        const cached = frames[i];
        if (cached && cached.complete && cached.naturalWidth) {
            frameEl.src = cached.src;
            return;
        }
        frameEl.src = frameUrl(i);
    }

    function scrub() {
        ticking = false;
        if (!ready && loaded < 1) return;
        const progress = getProgress();
        showIndex(Math.round(progress * (frameCount - 1)));
    }

    function requestScrub() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(scrub);
        }
    }

    function enableReducedMotionFallback() {
        section.classList.add("recipe-render-scrub--static");
        showIndex(frameCount - 1);
        window.removeEventListener("scroll", requestScrub);
        window.removeEventListener("resize", requestScrub);
    }

    // Preload sequence so src swaps are cache hits while scrolling
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        frames[i] = img;
        img.decoding = "async";
        img.onload = img.onerror = function () {
            loaded += 1;
            if (!ready && loaded >= Math.min(8, frameCount)) {
                ready = true;
                requestScrub();
            }
            if (loaded >= frameCount) {
                ready = true;
                requestScrub();
            }
        };
        img.src = frameUrl(i);
    }

    if (reduceMotion.matches) {
        enableReducedMotionFallback();
        return;
    }

    window.addEventListener("scroll", requestScrub, { passive: true });
    window.addEventListener("resize", requestScrub, { passive: true });
    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", requestScrub, { passive: true });
    }
    document.addEventListener("fullscreenchange", requestScrub);
    document.addEventListener("webkitfullscreenchange", requestScrub);

    reduceMotion.addEventListener("change", function (event) {
        if (event.matches) enableReducedMotionFallback();
    });

    requestScrub();
})();
