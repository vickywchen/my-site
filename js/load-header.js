(function () {
    var mount = document.getElementById("site-header");
    if (!mount) return;

    var headerUrl = new URL("partials/header.html?v=3", document.baseURI).href;

    fetch(headerUrl)
        .then(function (res) {
            if (!res.ok) throw new Error("Header request failed");
            return res.text();
        })
        .then(function (html) {
            mount.innerHTML = html;
        })
        .catch(function () {
            mount.innerHTML =
                '<p class="header-load-error">Header could not load. Use a local server from the project folder: <code>python3 -m http.server 8000</code>, then open <code>http://localhost:8000</code>. If you already are, hard refresh (Cmd+Shift+R).</p>';
        });
})();
