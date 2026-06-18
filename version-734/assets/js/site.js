(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuToggle = document.getElementById("menuToggle");
        var navLinks = document.getElementById("navLinks");
        if (menuToggle && navLinks) {
            menuToggle.addEventListener("click", function () {
                navLinks.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dots button"));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showSlide(i);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        var searchGrid = document.getElementById("searchGrid");
        if (searchGrid) {
            var cards = Array.prototype.slice.call(searchGrid.querySelectorAll(".movie-card"));
            var queryInput = document.getElementById("searchQuery");
            var regionSelect = document.getElementById("regionFilter");
            var typeSelect = document.getElementById("typeFilter");
            var yearSelect = document.getElementById("yearFilter");
            var resultCount = document.getElementById("resultCount");
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";

            if (queryInput && initialQuery) {
                queryInput.value = initialQuery;
            }

            function normalize(value) {
                return (value || "").toString().trim().toLowerCase();
            }

            function filterCards() {
                var query = normalize(queryInput && queryInput.value);
                var region = normalize(regionSelect && regionSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var shown = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(" "));
                    var ok = true;

                    if (query && haystack.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (region && normalize(card.dataset.region).indexOf(region) === -1) {
                        ok = false;
                    }
                    if (type && normalize(card.dataset.type).indexOf(type) === -1) {
                        ok = false;
                    }
                    if (year && normalize(card.dataset.year) !== year) {
                        ok = false;
                    }

                    card.classList.toggle("hidden-card", !ok);
                    if (ok) {
                        shown += 1;
                    }
                });

                if (resultCount) {
                    resultCount.textContent = "已匹配 " + shown + " 部内容";
                }
            }

            [queryInput, regionSelect, typeSelect, yearSelect].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", filterCards);
                    node.addEventListener("change", filterCards);
                }
            });

            filterCards();
        }
    });
})();
