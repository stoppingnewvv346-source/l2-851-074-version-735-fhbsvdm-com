(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = qs('[data-mobile-menu-button]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

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

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupCardFilters() {
    qsa('[data-card-filter]').forEach(function (panel) {
      var section = panel.closest('section') || document;
      var cards = qsa('.movie-card', section);
      var keywordInput = qs('[data-filter-keyword]', panel);
      var regionSelect = qs('[data-filter-region]', panel);
      var yearSelect = qs('[data-filter-year]', panel);
      var categorySelect = qs('[data-filter-category]', panel);
      var resetButton = qs('[data-filter-reset]', panel);
      var empty = qs('[data-filter-empty]', section);

      function apply() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var region = normalize(regionSelect && regionSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var category = normalize(categorySelect && categorySelect.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category')
          ].join(' '));
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (region && normalize(card.getAttribute('data-region')) !== region) {
            ok = false;
          }
          if (year && normalize(card.getAttribute('data-year')) !== year) {
            ok = false;
          }
          if (category && normalize(card.getAttribute('data-category')) !== category) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [keywordInput, regionSelect, yearSelect, categorySelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      if (resetButton) {
        resetButton.addEventListener('click', function () {
          [keywordInput, regionSelect, yearSelect, categorySelect].forEach(function (control) {
            if (control) {
              control.value = '';
            }
          });
          apply();
        });
      }
    });
  }

  function setupGlobalSearch() {
    var roots = qsa('[data-global-search]');
    var data = window.MOVIE_SEARCH_DATA || [];
    roots.forEach(function (root) {
      var input = qs('[data-global-search-input]', root);
      var results = qs('[data-global-search-results]', root);
      if (!input || !results) {
        return;
      }

      function render() {
        var keyword = normalize(input.value);
        if (!keyword) {
          results.innerHTML = '';
          return;
        }
        var matches = data.filter(function (item) {
          var haystack = normalize([
            item.title,
            item.region,
            item.year,
            item.genre,
            item.type,
            item.categoryName,
            item.oneLine,
            (item.tags || []).join(' ')
          ].join(' '));
          return haystack.indexOf(keyword) !== -1;
        }).slice(0, 12);

        if (!matches.length) {
          results.innerHTML = '<div class="search-result-empty">没有找到相关影片</div>';
          return;
        }

        results.innerHTML = matches.map(function (item) {
          return [
            '<a class="search-result-item" href="' + item.url + '">',
            '  <img src="' + item.cover + '" alt="' + item.title + ' 封面" loading="lazy">',
            '  <span>',
            '    <strong>' + item.title + '</strong>',
            '    <em>' + item.genre + ' · ' + item.region + ' · ' + item.year + '年</em>',
            '  </span>',
            '</a>'
          ].join('');
        }).join('');
      }

      input.addEventListener('input', render);
      document.addEventListener('click', function (event) {
        if (!root.contains(event.target)) {
          results.innerHTML = '';
        }
      });
    });
  }

  setupMobileMenu();
  setupHero();
  setupCardFilters();
  setupGlobalSearch();
})();
