/**
 * Desktop home gallery: lock page scroll and cycle the strip forever.
 * Wheel / trackpad / touch move the photos; the sequence wraps.
 */
(function () {
    const section = document.querySelector("[data-home-gallery]");
    if (!section) return;

    const pin = section.querySelector(".home-gallery__pin");
    const track = section.querySelector(".home-gallery__list");
    if (!pin || !track) return;

    const desktop = window.matchMedia("(min-width: 1000px)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let offset = 0;
    let loopWidth = 0;
    let ticking = false;
    let cloned = false;
    let active = false;
    let touchX = 0;
    let touchY = 0;
    let idleId = 0;
    let engaged = false;

    function enabled() {
        return desktop.matches && !reduceMotion.matches;
    }

    function wrap(n, period) {
        if (period <= 0) return 0;
        return ((n % period) + period) % period;
    }

    function originals() {
        return Array.prototype.filter.call(track.children, function (el) {
            return !el.hasAttribute("data-clone");
        });
    }

    function clearClones() {
        track.querySelectorAll("[data-clone]").forEach(function (el) {
            el.remove();
        });
        cloned = false;
    }

    function ensureClones() {
        if (cloned) return;
        originals().forEach(function (item) {
            const copy = item.cloneNode(true);
            copy.setAttribute("data-clone", "");
            copy.setAttribute("aria-hidden", "true");
            track.appendChild(copy);
        });
        cloned = true;
    }

    function measureLoop() {
        const items = originals();
        const firstClone = track.querySelector("[data-clone]");
        if (!items.length || !firstClone) {
            loopWidth = 0;
            return;
        }
        loopWidth = firstClone.offsetLeft - items[0].offsetLeft;
    }

    function paint() {
        ticking = false;
        if (!active || loopWidth <= 0) {
            track.style.transform = "";
            return;
        }
        track.style.transform = "translate3d(" + -wrap(offset, loopWidth) + "px,0,0)";
    }

    function requestPaint() {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(paint);
        }
    }

    function stopIdle() {
        if (idleId) {
            cancelAnimationFrame(idleId);
            idleId = 0;
        }
        if (!engaged) {
            engaged = true;
            section.classList.add("is-engaged");
        }
    }

    function startIdle() {
        if (idleId || engaged || !active) return;
        let last = performance.now();
        function tick(now) {
            if (!active || engaged) {
                idleId = 0;
                return;
            }
            const dt = Math.min(32, now - last);
            last = now;
            offset += dt * 0.028;
            requestPaint();
            idleId = requestAnimationFrame(tick);
        }
        idleId = requestAnimationFrame(tick);
    }

    function nudge(delta) {
        if (!active || !delta) return;
        stopIdle();
        offset += delta;
        requestPaint();
    }

    function onWheel(event) {
        if (!active) return;
        event.preventDefault();
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
            ? event.deltaX
            : event.deltaY;
        nudge(delta);
    }

    function onTouchStart(event) {
        if (!active || !event.touches[0]) return;
        touchX = event.touches[0].clientX;
        touchY = event.touches[0].clientY;
    }

    function onTouchMove(event) {
        if (!active || !event.touches[0]) return;
        const x = event.touches[0].clientX;
        const y = event.touches[0].clientY;
        const dx = touchX - x;
        const dy = touchY - y;
        touchX = x;
        touchY = y;
        event.preventDefault();
        nudge(Math.abs(dx) > Math.abs(dy) ? dx : dy);
    }

    function activate() {
        if (active) {
            measureLoop();
            requestPaint();
            return;
        }
        active = true;
        document.documentElement.classList.add("home-cycle-lock");
        document.body.classList.add("home-cycle-lock");
        ensureClones();
        measureLoop();
        requestPaint();
        startIdle();
        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: false });
    }

    function deactivate() {
        if (!active) return;
        active = false;
        document.documentElement.classList.remove("home-cycle-lock");
        document.body.classList.remove("home-cycle-lock");
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        if (idleId) cancelAnimationFrame(idleId);
        idleId = 0;
        engaged = false;
        section.classList.remove("is-engaged");
        clearClones();
        offset = 0;
        loopWidth = 0;
        track.style.transform = "";
    }

    function sync() {
        if (enabled()) activate();
        else deactivate();
    }

    window.addEventListener("resize", sync, { passive: true });
    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", sync, { passive: true });
    }
    desktop.addEventListener("change", sync);
    reduceMotion.addEventListener("change", sync);

    if (document.readyState === "complete") sync();
    else window.addEventListener("load", sync);

    const imgs = track.querySelectorAll("img");
    let pending = imgs.length;
    function maybeSync() {
        if (pending <= 0) sync();
    }
    if (!pending) sync();
    imgs.forEach(function (img) {
        if (img.complete) {
            pending -= 1;
            maybeSync();
            return;
        }
        img.addEventListener("load", function () {
            pending -= 1;
            maybeSync();
        });
        img.addEventListener("error", function () {
            pending -= 1;
            maybeSync();
        });
    });
})();
