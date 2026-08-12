(function () {
    function arm(video) {
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute("muted", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        video.loop = true;
        video.autoplay = true;

        var tryPlay = function () {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    /* Autoplay blocked until a gesture; retry on next interaction. */
                });
            }
        };

        if (video.readyState >= 2) tryPlay();
        else video.addEventListener("loadeddata", tryPlay, { once: true });

        if ("IntersectionObserver" in window) {
            var observer = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) tryPlay();
                        else video.pause();
                    });
                },
                { threshold: 0.2 }
            );
            observer.observe(video);
        }

        document.addEventListener(
            "touchstart",
            function onGesture() {
                tryPlay();
                document.removeEventListener("touchstart", onGesture);
            },
            { once: true, passive: true }
        );
        document.addEventListener(
            "click",
            function onGesture() {
                tryPlay();
                document.removeEventListener("click", onGesture);
            },
            { once: true }
        );
    }

    document.querySelectorAll("video[autoplay]").forEach(arm);
})();
