(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            var open = panel.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    qsa('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = qs('input[name="q"]', form);
            var query = input ? input.value.trim() : '';
            var target = form.getAttribute('action') || './all-movies.html';
            if (query) {
                window.location.href = target + '?q=' + encodeURIComponent(query);
            } else {
                window.location.href = target;
            }
        });
    });

    qsa('[data-hero]').forEach(function (hero) {
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('is-active', idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('is-active', idx === current);
            });
        }

        function start() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });

        show(0);
        start();
    });

    qsa('.filter-section').forEach(function (section) {
        var textInput = qs('[data-filter-input]', section);
        var yearSelect = qs('[data-filter-select]', section);
        var categorySelect = qs('[data-filter-category]', section);
        var cards = qsa('[data-card]', section);
        var empty = qs('[data-empty-state]', section);

        function apply() {
            var query = textInput ? textInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var category = categorySelect ? categorySelect.value : '';
            var shown = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-category') || '',
                    card.getAttribute('data-year') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var cardCategory = card.getAttribute('data-category') || '';
                var visible = true;

                if (query && haystack.indexOf(query) === -1) {
                    visible = false;
                }
                if (year && cardYear !== year) {
                    visible = false;
                }
                if (category && cardCategory !== category) {
                    visible = false;
                }

                card.style.display = visible ? '' : 'none';
                if (visible) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', shown === 0);
            }
        }

        if (textInput) {
            textInput.addEventListener('input', apply);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', apply);
        }
        if (categorySelect) {
            categorySelect.addEventListener('change', apply);
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && textInput) {
            textInput.value = query;
        }
        apply();
    });
})();
