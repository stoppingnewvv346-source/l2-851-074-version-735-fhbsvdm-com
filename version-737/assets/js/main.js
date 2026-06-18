(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function initNavigation() {
        var toggle = document.querySelector(".mobile-toggle");
        var menu = document.querySelector(".mobile-nav");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var opened = menu.classList.toggle("open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function initHero() {
        var shell = document.querySelector("[data-hero]");
        if (!shell) {
            return;
        }
        var slides = Array.prototype.slice.call(shell.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(shell.querySelectorAll(".hero-dots button"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }
        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                play();
            });
        });
        shell.addEventListener("mouseenter", function () {
            clearInterval(timer);
        });
        shell.addEventListener("mouseleave", play);
        show(0);
        play();
    }

    function initCardSearch() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var cards = Array.prototype.slice.call(document.querySelectorAll(panel.getAttribute("data-filter-panel") || "[data-card]"));
            var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-chip]"));
            var chipValue = "";
            function apply() {
                var query = normalize(input ? input.value : "");
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var okQuery = !query || text.indexOf(query) !== -1;
                    var okChip = !chipValue || text.indexOf(chipValue) !== -1;
                    card.classList.toggle("hidden-card", !(okQuery && okChip));
                });
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    chipValue = normalize(chip.getAttribute("data-chip"));
                    chips.forEach(function (item) {
                        item.classList.toggle("active", item === chip && chipValue);
                    });
                    apply();
                });
            });
        });
    }

    window.setupPlayer = function (source) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playOverlay");
        if (!video || !source) {
            return;
        }
        var loaded = false;
        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            video.load();
        }
        function begin() {
            load();
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }
        if (overlay) {
            overlay.addEventListener("click", begin);
        }
        video.addEventListener("click", function () {
            if (!loaded) {
                begin();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
    };

    ready(function () {
        initNavigation();
        initHero();
        initCardSearch();
    });
})();
