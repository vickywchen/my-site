(function () {
    var gallery = document.querySelector(".not-work-gallery");
    var source = gallery && gallery.querySelector(".not-work-gallery__list");
    if (!gallery || !source) return;

    var items = Array.prototype.slice.call(source.children);
    var cols = document.createElement("div");
    var land = document.createElement("ul");
    var port = document.createElement("ul");

    cols.className = "not-work-gallery__cols";
    land.className = "not-work-gallery__col not-work-gallery__col--landscape";
    port.className = "not-work-gallery__col not-work-gallery__col--portrait";
    cols.appendChild(land);
    cols.appendChild(port);
    source.replaceWith(cols);

    function isPortrait(img) {
        return img.naturalWidth > 0 && img.naturalWidth / img.naturalHeight < 1;
    }

    function place() {
        var split = window.matchMedia("(min-width: 600px)").matches;
        items.forEach(function (item) {
            var img = item.querySelector("img");
            if (!split || !img || !img.naturalWidth) {
                land.appendChild(item);
                return;
            }
            (isPortrait(img) ? port : land).appendChild(item);
        });
    }

    items.forEach(function (item) {
        var img = item.querySelector("img");
        if (!img) return;
        if (img.complete) return;
        img.addEventListener("load", place);
    });

    window.addEventListener("resize", place);
    place();
})();
