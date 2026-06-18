(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var header = qs('.site-header');
    var toggle = qs('.menu-toggle');
    if (!header || !toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      header.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = qs('.hero');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var form = qs('[data-filter-form]');
    var grid = qs('[data-filter-grid]');
    if (!form || !grid) {
      return;
    }
    var cards = qsa('.movie-card', grid);
    var input = qs('[data-filter-query]', form);
    var category = qs('[data-filter-category]', form);
    var region = qs('[data-filter-region]', form);
    var year = qs('[data-filter-year]', form);

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var q = normalize(input && input.value);
      var selectedCategory = normalize(category && category.value);
      var selectedRegion = normalize(region && region.value);
      var selectedYear = normalize(year && year.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-category'),
          card.getAttribute('data-year')
        ].join(' '));
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (selectedCategory && normalize(card.getAttribute('data-category')) !== selectedCategory) {
          ok = false;
        }
        if (selectedRegion && normalize(card.getAttribute('data-region')) !== selectedRegion) {
          ok = false;
        }
        if (selectedYear && normalize(card.getAttribute('data-year')) !== selectedYear) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
      });
    }

    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });

    var params = new URLSearchParams(window.location.search);
    var preset = params.get('q');
    if (preset && input) {
      input.value = preset;
    }
    apply();
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video[data-stream]', player);
      var stage = qs('.player-stage', player);
      var button = qs('.play-button', player);
      if (!video || !stage) {
        return;
      }

      function bind() {
        var stream = video.getAttribute('data-stream');
        if (!stream) {
          return;
        }
        if (video.getAttribute('data-ready') === '1') {
          video.play().catch(function () {});
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video.hlsPlayer = hls;
        } else {
          video.src = stream;
        }
        video.setAttribute('data-ready', '1');
        video.play().catch(function () {});
      }

      function activate() {
        stage.classList.add('playing');
        bind();
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          activate();
        });
      }
      stage.addEventListener('click', activate);
      video.addEventListener('play', function () {
        stage.classList.add('playing');
      });
    });
  }

  function initImages() {
    qsa('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.remove();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
    initImages();
  });
})();
